package com.example.hospital.dto;

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
public class SimulationResponse {
    private Long departmentId;
    private String departmentName;
    private long activePatients;
    private long currentAvailableDoctors;
    private long newDoctorCount;
    private double oldStress;
    private double newStress;
    private double improvementPercentage;
    private double estimatedWaitTimeReduction;
    private double adjustedCapacity;
    private String recommendedAction;
}
