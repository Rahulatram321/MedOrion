package com.example.hospital.controller;

import com.example.hospital.dto.AnomalyResponse;
import com.example.hospital.dto.CostImpactResponse;
import com.example.hospital.dto.ForecastResponse;
import com.example.hospital.dto.SimulationRequest;
import com.example.hospital.dto.SimulationResponse;
import com.example.hospital.dto.StressResponse;
import com.example.hospital.service.AnalyticsService;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/stress")
    public List<StressResponse> getStress() {
        return analyticsService.getStressIndex();
    }

    @GetMapping("/forecast/{departmentId}")
    public Map<String, Object> forecast(
            @PathVariable("departmentId") Long departmentId
    ) {
        ForecastResponse response = analyticsService.getForecast(departmentId);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("departmentId", response.getDepartmentId());
        payload.put("departmentName", response.getDepartmentName());
        payload.put("daysConsidered", response.getDaysConsidered());
        payload.put("predictedLoad", response.getPredictedLoad());
        payload.put("last7DaysData", response.getLast7DaysData());
        payload.put("stabilityIndex", response.getStabilityIndex());
        return payload;
    }

    @PostMapping("/simulate")
    public SimulationResponse simulate(@RequestBody SimulationRequest request) {
        return analyticsService.simulate(request);
    }

    @GetMapping("/anomalies")
    public List<AnomalyResponse> getAnomalies() {
        return analyticsService.getAnomalies();
    }

    @GetMapping("/cost-impact")
    public List<CostImpactResponse> getCostImpact() {
        return analyticsService.getCostImpact();
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        return analyticsService.getSystemSummary();
    }

    @PostMapping("/generate-load")
    public Map<String, Object> generateLoad() {
        return analyticsService.generateLoad();
    }
}
