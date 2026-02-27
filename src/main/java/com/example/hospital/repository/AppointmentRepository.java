package com.example.hospital.repository;

import com.example.hospital.entity.Appointment;
import com.example.hospital.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    long countByDepartmentIdAndStatus(Long departmentId, AppointmentStatus status);
}
