package com.example.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimulationRequest {
    private Long departmentId;
    private int additionalDoctors;
    private double shiftExtensionHours;
}
