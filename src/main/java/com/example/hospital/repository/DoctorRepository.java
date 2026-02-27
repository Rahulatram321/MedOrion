package com.example.hospital.repository;

import com.example.hospital.entity.Doctor;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    long countByDepartmentIdAndAvailableTrue(Long departmentId);

    List<Doctor> findByDepartmentId(Long departmentId);
}
