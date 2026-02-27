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
public class CostImpactResponse {
    private Long departmentId;
    private String departmentName;
    private LocalDate statsDate;
    private int totalPatients;
    private double avgWaitTime;
    private double costFactor;
    private double delayCost;
}
