package com.procurement.enterpriseApp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.procurement.enterpriseApp.model.Category;
import com.procurement.enterpriseApp.model.Department;
import com.procurement.enterpriseApp.repository.CategoryRepository;
import com.procurement.enterpriseApp.repository.DepartmentRepository;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;

    public DepartmentService(
            DepartmentRepository departmentRepository,
            CategoryRepository categoryRepository) {

        this.departmentRepository = departmentRepository;
        this.categoryRepository = categoryRepository;
    }

    // API 1 - Get all departments
    public List<Department> getAllDepartment() {
        return departmentRepository.findAll();
    }

    // API 2 - Get department using department ID
    public Department getDepartmentByDepartmentId(int departmentId) {

        Optional<Department> department =
                departmentRepository.findById(departmentId);

        return department.orElse(null);
    }

    // API 3 - Get categories using department ID
    public List<Category> getCategoryByDepartmentId(int departmentId) {

        return categoryRepository
                .findByDepartmentDepartmentId(departmentId);
    }
}