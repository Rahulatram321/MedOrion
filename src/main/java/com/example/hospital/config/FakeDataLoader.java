package com.example.hospital.config;

import com.example.hospital.entity.Appointment;
import com.example.hospital.entity.DailyStats;
import com.example.hospital.entity.Department;
import com.example.hospital.entity.Doctor;
import com.example.hospital.enums.AppointmentStatus;
import com.example.hospital.repository.AppointmentRepository;
import com.example.hospital.repository.DailyStatsRepository;
import com.example.hospital.repository.DepartmentRepository;
import com.example.hospital.repository.DoctorRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FakeDataLoader {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final DailyStatsRepository dailyStatsRepository;

    public FakeDataLoader(
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

    @Bean
    CommandLineRunner seedHospitalData() {
        return args -> seedInitialData();
    }

    public synchronized void seedInitialData() {
        if (departmentRepository.count() > 0) {
            return;
        }

        Random random = new Random(2026);
        LocalDate today = LocalDate.now();

        List<DepartmentSeed> seeds = List.of(
                new DepartmentSeed("Cardiology", 5, 30.0, 1500.0),
                new DepartmentSeed("Neurology", 4, 40.0, 1800.0),
                new DepartmentSeed("Orthopedics", 6, 25.0, 1200.0),
                new DepartmentSeed("General Medicine", 8, 20.0, 900.0),
                new DepartmentSeed("Pediatrics", 4, 30.0, 1100.0)
        );

        for (DepartmentSeed seed : seeds) {
            Department department = departmentRepository.save(
                    Department.builder()
                            .name(seed.name())
                            .totalDoctors(seed.totalDoctors())
                            .avgHandlingTimeMinutes(seed.avgHandlingTimeMinutes())
                            .costFactor(seed.costFactor())
                            .build()
            );

            List<Doctor> doctors = createDoctors(seed, department, random);
            doctorRepository.saveAll(doctors);

            List<Appointment> appointments = createAppointments(department, doctors, random, today);
            appointmentRepository.saveAll(appointments);

            List<DailyStats> dailyStats = createDailyStats(
                    department,
                    random,
                    today
            );
            List<DailyStats> savedDailyStats = dailyStatsRepository.saveAll(dailyStats);
            forceNeurologyAnomaly(savedDailyStats, department.getName());
        }
    }

    private List<Doctor> createDoctors(DepartmentSeed seed, Department department, Random random) {
        List<Doctor> doctors = new ArrayList<>();
        for (int i = 1; i <= seed.totalDoctors(); i++) {
            boolean available = random.nextDouble() >= 0.25;
            double efficiencyFactor = 0.75 + (random.nextDouble() * 0.5);
            doctors.add(
                    Doctor.builder()
                            .name(seed.name() + " Specialist " + i)
                            .department(department)
                            .efficiencyFactor(efficiencyFactor)
                            .available(available)
                            .build()
            );
        }
        return doctors;
    }

    private List<Appointment> createAppointments(
            Department department,
            List<Doctor> doctors,
            Random random,
            LocalDate today
    ) {
        int appointmentCount = 40 + random.nextInt(81);
        List<Appointment> appointments = new ArrayList<>();
        for (int i = 0; i < appointmentCount; i++) {
            Doctor doctor = doctors.get(random.nextInt(doctors.size()));
            LocalDate date = today.minusDays(random.nextInt(2));
            int hour = pickAppointmentHour(random);
            int minute = random.nextInt(4) * 15;
            LocalDateTime appointmentTime = date.atTime(hour, minute);
            double durationMinutes = pickDuration(random);
            AppointmentStatus status = random.nextDouble() < 0.35
                    ? AppointmentStatus.ACTIVE
                    : AppointmentStatus.COMPLETED;
            appointments.add(
                    Appointment.builder()
                            .department(department)
                            .doctor(doctor)
                            .appointmentTime(appointmentTime)
                            .durationMinutes(durationMinutes)
                            .status(status)
                            .build()
            );
        }
        return appointments;
    }

    private List<DailyStats> createDailyStats(
            Department department,
            Random random,
            LocalDate today
    ) {
        int dayCount = 7 + random.nextInt(4);
        List<DailyStats> stats = new ArrayList<>();
        for (int offset = dayCount - 1; offset >= 0; offset--) {
            LocalDate date = today.minusDays(offset);
            double basePatients = getBasePatients(department.getName());
            if (date.getDayOfWeek() == DayOfWeek.MONDAY) {
                basePatients *= 1.2;
            }
            int totalPatients = Math.max(20, (int) Math.round(basePatients + random.nextInt(21) - 10));

            double avgWaitTime = getBaseWait(department.getName()) + random.nextDouble() * 12.0;
            if (date.getDayOfWeek() == DayOfWeek.MONDAY) {
                avgWaitTime += 5.0;
            }

            int resolvedCases = Math.min(
                    totalPatients,
                    (int) Math.round(totalPatients * (0.75 + random.nextDouble() * 0.2))
            );
            stats.add(
                    DailyStats.builder()
                            .department(department)
                            .date(date)
                            .totalPatients(totalPatients)
                            .avgWaitTime(avgWaitTime)
                            .resolvedCases(resolvedCases)
                            .build()
            );
        }
        return stats;
    }

    private void forceNeurologyAnomaly(List<DailyStats> statsList, String departmentName) {
        if (!"Neurology".equals(departmentName) || statsList.isEmpty()) {
            return;
        }
        DailyStats todayStats = statsList.get(statsList.size() - 1);
        int weeklyAverage = statsList.stream()
                .mapToInt(DailyStats::getTotalPatients)
                .sum() / statsList.size();
        int spike = (int) (weeklyAverage * 1.5);
        todayStats.setTotalPatients(spike);
        dailyStatsRepository.save(todayStats);
    }

    private int pickAppointmentHour(Random random) {
        double bucket = random.nextDouble();
        if (bucket < 0.6) {
            return 9 + random.nextInt(4);
        }
        if (bucket < 0.85) {
            return 13 + random.nextInt(3);
        }
        return 8 + random.nextInt(10);
    }

    private double pickDuration(Random random) {
        int[] durations = {15, 20, 25, 30, 40, 45};
        return durations[random.nextInt(durations.length)];
    }

    private double getBasePatients(String departmentName) {
        return switch (departmentName) {
            case "Cardiology" -> 80.0;
            case "Neurology" -> 60.0;
            case "Orthopedics" -> 90.0;
            case "General Medicine" -> 110.0;
            case "Pediatrics" -> 70.0;
            default -> 75.0;
        };
    }

    private double getBaseWait(String departmentName) {
        return switch (departmentName) {
            case "Cardiology" -> 32.0;
            case "Neurology" -> 36.0;
            case "Orthopedics" -> 24.0;
            case "General Medicine" -> 28.0;
            case "Pediatrics" -> 26.0;
            default -> 30.0;
        };
    }

    private record DepartmentSeed(
            String name,
            int totalDoctors,
            double avgHandlingTimeMinutes,
            double costFactor
    ) {
    }
}
