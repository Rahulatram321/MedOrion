package com.example.hospital.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnomalyResponse {
    private Long departmentId;
    private String departmentName;
    private LocalDate date;
    private double todayTotalPatients;
    private double weeklyAverage;
    private boolean anomaly;
}
