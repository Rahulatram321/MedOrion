package com.example.hospital.repository;

import com.example.hospital.entity.DailyStats;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyStatsRepository extends JpaRepository<DailyStats, Long> {

    List<DailyStats> findTop7ByDepartmentIdOrderByDateDesc(Long departmentId);

    Optional<DailyStats> findByDepartmentIdAndDate(Long departmentId, LocalDate date);
}
