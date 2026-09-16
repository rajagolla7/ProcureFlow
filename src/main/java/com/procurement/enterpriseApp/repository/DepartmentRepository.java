package com.procurement.enterpriseApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurement.enterpriseApp.model.Department;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {

}