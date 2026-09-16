package com.procurement.enterpriseApp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurement.enterpriseApp.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    List<Category> findByDepartmentDepartmentId(int departmentId);

}