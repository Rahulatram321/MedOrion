package com.example.hospital.dto;

import java.util.List;
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
public class ForecastResponse {
    private Long departmentId;
    private String departmentName;
    private int daysConsidered;
    private double predictedLoad;
    private List<Integer> last7DaysData;
    private double stabilityIndex;
}
