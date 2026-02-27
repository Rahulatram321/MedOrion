package com.example.hospital.service;

import com.example.hospital.dto.AnomalyResponse;
import com.example.hospital.dto.CostImpactResponse;
import com.example.hospital.dto.ForecastResponse;
import com.example.hospital.dto.SimulationRequest;
import com.example.hospital.dto.SimulationResponse;
import com.example.hospital.dto.StressResponse;
import com.example.hospital.entity.Appointment;
import com.example.hospital.entity.DailyStats;
import com.example.hospital.entity.Department;
import com.example.hospital.entity.Doctor;
import com.example.hospital.enums.AppointmentStatus;
import com.example.hospital.repository.AppointmentRepository;
import com.example.hospital.repository.DailyStatsRepository;
import com.example.hospital.repository.DepartmentRepository;
import com.example.hospital.repository.DoctorRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final DailyStatsRepository dailyStatsRepository;

    public AnalyticsService(
            DepartmentRepository departmentRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            DailyStatsRepository dailyStatsRepository
    ) {
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.dailyStatsRepository = dailyStatsRepository;
    }

    public List<StressResponse> getStressIndex() {
        List<StressResponse> responses = new ArrayList<>();
        List<Department> departments = departmentRepository.findAll();
        for (Department department : departments) {
            long availableDoctors = doctorRepository.countByDepartmentIdAndAvailableTrue(department.getId());
            long activePatients = appointmentRepository.countByDepartmentIdAndStatus(
                    department.getId(),
                    AppointmentStatus.ACTIVE
            );
            double stressScore = calculateNormalizedStress(
                    activePatients,
                    department.getAvgHandlingTimeMinutes(),
                    availableDoctors
            );
            responses.add(
                    StressResponse.builder()
                            .departmentId(department.getId())
                            .departmentName(department.getName())
                            .activePatients(activePatients)
                            .availableDoctors(availableDoctors)
                            .stressScore(stressScore)
                            .category(categorizeStress(stressScore))
                            .build()
            );
        }
        responses.sort(Comparator.comparing(StressResponse::getStressScore).reversed());
        return responses;
    }

    public ForecastResponse getForecast(Long departmentId) {
        Department department = getDepartmentOrThrow(departmentId);
        List<DailyStats> recentStats = dailyStatsRepository.findTop7ByDepartmentIdOrderByDateDesc(departmentId);
        int days = recentStats.size();
        List<Integer> last7DaysData = recentStats.stream()
                .map(DailyStats::getTotalPatients)
                .toList();
        double predictedLoad = days == 0
                ? 0.0
                : recentStats.stream()
                .mapToDouble(stats -> (double) stats.getTotalPatients())
                .sum() / days;
        double mean = predictedLoad;
        double variance = days == 0
                ? 0.0
                : recentStats.stream()
                .mapToDouble(stats -> {
                    double diff = stats.getTotalPatients() - mean;
                    return diff * diff;
                })
                .sum() / days;
        double stabilityIndex = Math.sqrt(variance);
        return ForecastResponse.builder()
                .departmentId(department.getId())
                .departmentName(department.getName())
                .daysConsidered(days)
                .predictedLoad(predictedLoad)
                .last7DaysData(last7DaysData)
                .stabilityIndex(stabilityIndex)
                .build();
    }

    public SimulationResponse simulate(SimulationRequest request) {
        if (request == null || request.getDepartmentId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "departmentId is required");
        }
        Department department = getDepartmentOrThrow(request.getDepartmentId());
        long currentAvailableDoctors = doctorRepository.countByDepartmentIdAndAvailableTrue(department.getId());
        long activePatients = appointmentRepository.countByDepartmentIdAndStatus(
                department.getId(),
                AppointmentStatus.ACTIVE
        );
        double oldStress = calculateNormalizedStress(
                activePatients,
                department.getAvgHandlingTimeMinutes(),
                currentAvailableDoctors
        );
        int normalizedAdditionalDoctors = Math.max(0, request.getAdditionalDoctors());
        double normalizedShiftExtension = Math.max(0.0, request.getShiftExtensionHours());
        long newDoctorCount = currentAvailableDoctors + normalizedAdditionalDoctors;
        double adjustedCapacity = newDoctorCount * (60.0 + normalizedShiftExtension * 60.0);
        double effectiveAvailableDoctors = adjustedCapacity / 60.0;
        double newStress = calculateNormalizedStress(
                activePatients,
                department.getAvgHandlingTimeMinutes(),
                effectiveAvailableDoctors
        );
        double improvementPercentage = oldStress == 0.0
                ? 0.0
                : ((oldStress - newStress) / oldStress) * 100.0;
        DailyStats baselineStats = findCurrentOrLatestStats(department.getId(), LocalDate.now());
        double baselineWait = baselineStats == null ? 0.0 : baselineStats.getAvgWaitTime();
        double estimatedWaitTimeReduction = baselineWait * (Math.max(0.0, improvementPercentage) / 100.0);
        String recommendedAction = newStress <= 1.2
                ? "Proposed adjustment stabilizes department load."
                : "Additional staffing or shift expansion required.";
        return SimulationResponse.builder()
                .departmentId(department.getId())
                .departmentName(department.getName())
                .activePatients(activePatients)
                .currentAvailableDoctors(currentAvailableDoctors)
                .newDoctorCount(newDoctorCount)
                .oldStress(oldStress)
                .newStress(newStress)
                .improvementPercentage(improvementPercentage)
                .estimatedWaitTimeReduction(estimatedWaitTimeReduction)
                .adjustedCapacity(adjustedCapacity)
                .recommendedAction(recommendedAction)
                .build();
    }

    public List<AnomalyResponse> getAnomalies() {
        LocalDate today = LocalDate.now();
        List<AnomalyResponse> anomalies = new ArrayList<>();
        List<Department> departments = departmentRepository.findAll();
        AnomalyResponse fallback = null;
        double highestRatio = Double.NEGATIVE_INFINITY;
        for (Department department : departments) {
            List<DailyStats> recentStats = dailyStatsRepository.findTop7ByDepartmentIdOrderByDateDesc(department.getId());
            if (recentStats.isEmpty()) {
                continue;
            }
            double weeklyAverage = recentStats.stream()
                    .mapToDouble(stats -> (double) stats.getTotalPatients())
                    .average()
                    .orElse(0.0);
            DailyStats todayStats = dailyStatsRepository.findByDepartmentIdAndDate(department.getId(), today)
                    .orElse(recentStats.get(0));
            double todayTotalPatients = todayStats.getTotalPatients();
            double ratio = weeklyAverage > 0.0 ? todayTotalPatients / weeklyAverage : 0.0;
            if (todayTotalPatients > 1.25 * weeklyAverage) {
                anomalies.add(
                        AnomalyResponse.builder()
                                .departmentId(department.getId())
                                .departmentName(department.getName())
                                .date(todayStats.getDate())
                                .todayTotalPatients(todayTotalPatients)
                                .weeklyAverage(weeklyAverage)
                                .anomaly(true)
                                .build()
                );
            }
            if (ratio > highestRatio) {
                highestRatio = ratio;
                fallback = AnomalyResponse.builder()
                        .departmentId(department.getId())
                        .departmentName(department.getName())
                        .date(todayStats.getDate())
                        .todayTotalPatients(todayTotalPatients)
                        .weeklyAverage(weeklyAverage)
                        .anomaly(true)
                        .build();
            }
        }
        if (anomalies.isEmpty() && fallback != null) {
            anomalies.add(fallback);
        }
        anomalies.sort(Comparator.comparing(AnomalyResponse::getTodayTotalPatients).reversed());
        return anomalies;
    }

    public List<CostImpactResponse> getCostImpact() {
        List<CostImpactResponse> responses = buildCostImpactResponses(LocalDate.now());
        responses.sort(Comparator.comparing(CostImpactResponse::getDelayCost).reversed());
        return responses;
    }

    public Map<String, Object> getSystemSummary() {
        List<Department> departments = departmentRepository.findAll();
        int totalActivePatients = 0;
        int departmentsCritical = 0;
        String highestStressDepartment = "";
        double highestStressScore = 0.0;
        boolean hasHighest = false;

        for (Department department : departments) {
            long activePatients = appointmentRepository.countByDepartmentIdAndStatus(
                    department.getId(),
                    AppointmentStatus.ACTIVE
            );
            long availableDoctors = doctorRepository.countByDepartmentIdAndAvailableTrue(department.getId());
            double stressScore = calculateNormalizedStress(
                    activePatients,
                    department.getAvgHandlingTimeMinutes(),
                    availableDoctors
            );

            totalActivePatients += (int) activePatients;
            if (stressScore > 1.2) {
                departmentsCritical++;
            }
            if (!hasHighest || stressScore > highestStressScore) {
                hasHighest = true;
                highestStressScore = stressScore;
                highestStressDepartment = department.getName();
            }
        }

        double totalDelayCost = buildCostImpactResponses(LocalDate.now()).stream()
                .mapToDouble(CostImpactResponse::getDelayCost)
                .sum();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalActivePatients", totalActivePatients);
        summary.put("departmentsCritical", departmentsCritical);
        summary.put("highestStressDepartment", highestStressDepartment);
        summary.put("highestStressScore", highestStressScore);
        summary.put("totalDelayCost", totalDelayCost);
        return summary;
    }

    @Transactional
    public Map<String, Object> generateLoad() {
        List<Department> departments = departmentRepository.findAll();
        if (departments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No departments found");
        }

        ThreadLocalRandom random = ThreadLocalRandom.current();
        Department selectedDepartment = departments.get(random.nextInt(departments.size()));
        List<Doctor> availableDoctors = doctorRepository.findByDepartmentId(selectedDepartment.getId()).stream()
                .filter(Doctor::isAvailable)
                .toList();
        if (availableDoctors.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No available doctors found for selected department"
            );
        }

        int addedPatients = random.nextInt(5, 21);
        LocalDateTime now = LocalDateTime.now();
        List<Appointment> newAppointments = new ArrayList<>(addedPatients);
        for (int i = 0; i < addedPatients; i++) {
            Doctor assignedDoctor = availableDoctors.get(random.nextInt(availableDoctors.size()));
            newAppointments.add(
                    Appointment.builder()
                            .department(selectedDepartment)
                            .doctor(assignedDoctor)
                            .appointmentTime(now)
                            .durationMinutes(selectedDepartment.getAvgHandlingTimeMinutes())
                            .status(AppointmentStatus.ACTIVE)
                            .build()
            );
        }
        appointmentRepository.saveAll(newAppointments);

        LocalDate today = LocalDate.now();
        DailyStats todayStats = dailyStatsRepository.findByDepartmentIdAndDate(selectedDepartment.getId(), today)
                .orElseGet(() -> {
                    DailyStats baseline = findCurrentOrLatestStats(selectedDepartment.getId(), today);
                    return DailyStats.builder()
                            .department(selectedDepartment)
                            .date(today)
                            .totalPatients(0)
                            .avgWaitTime(
                                    baseline == null
                                            ? selectedDepartment.getAvgHandlingTimeMinutes()
                                            : baseline.getAvgWaitTime()
                            )
                            .resolvedCases(baseline == null ? 0 : baseline.getResolvedCases())
                            .build();
                });
        todayStats.setTotalPatients(todayStats.getTotalPatients() + addedPatients);
        dailyStatsRepository.save(todayStats);

        long newTotalActive = appointmentRepository.countByDepartmentIdAndStatus(
                selectedDepartment.getId(),
                AppointmentStatus.ACTIVE
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("department", selectedDepartment.getName());
        response.put("addedPatients", addedPatients);
        response.put("newTotalActive", newTotalActive);
        response.put("message", "Patient surge simulated successfully");
        return response;
    }

    private Department getDepartmentOrThrow(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));
    }

    private DailyStats findCurrentOrLatestStats(Long departmentId, LocalDate today) {
        return dailyStatsRepository.findByDepartmentIdAndDate(departmentId, today)
                .orElseGet(() -> {
                    List<DailyStats> recentStats = dailyStatsRepository.findTop7ByDepartmentIdOrderByDateDesc(departmentId);
                    return recentStats.isEmpty() ? null : recentStats.get(0);
                });
    }

    private List<CostImpactResponse> buildCostImpactResponses(LocalDate today) {
        List<CostImpactResponse> responses = new ArrayList<>();
        List<Department> departments = departmentRepository.findAll();
        for (Department department : departments) {
            DailyStats selectedStats = findCurrentOrLatestStats(department.getId(), today);
            if (selectedStats == null) {
                continue;
            }
            double delayCost = selectedStats.getAvgWaitTime()
                    * selectedStats.getTotalPatients()
                    * department.getCostFactor();
            responses.add(
                    CostImpactResponse.builder()
                            .departmentId(department.getId())
                            .departmentName(department.getName())
                            .statsDate(selectedStats.getDate())
                            .totalPatients(selectedStats.getTotalPatients())
                            .avgWaitTime(selectedStats.getAvgWaitTime())
                            .costFactor(department.getCostFactor())
                            .delayCost(delayCost)
                            .build()
            );
        }
        return responses;
    }

    private double calculateNormalizedStress(
            long activePatients,
            double avgHandlingTimeMinutes,
            double availableDoctors
    ) {
        double capacityPerHour = 0.0;
        if (availableDoctors > 0 && avgHandlingTimeMinutes > 0.0) {
            capacityPerHour = availableDoctors * (60.0 / avgHandlingTimeMinutes);
        }
        double stressScore = 0.0;
        if (capacityPerHour > 0.0) {
            stressScore = activePatients / capacityPerHour;
        }
        return stressScore;
    }

    private String categorizeStress(double stressScore) {
        if (stressScore < 0.7) {
            return "Healthy";
        }
        if (stressScore <= 1.2) {
            return "Moderate";
        }
        return "Critical";
    }
}
