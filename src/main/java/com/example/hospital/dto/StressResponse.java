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
public class StressResponse {
    private Long departmentId;
    private String departmentName;
    private long activePatients;
    private long availableDoctors;
    private double stressScore;
    private String category;
}
