package com.procurement.enterpriseApp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.procurement.enterpriseApp.model.Category;
import com.procurement.enterpriseApp.model.Department;
import com.procurement.enterpriseApp.service.DepartmentService;

@RestController
@RequestMapping("/api")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;


    // API 1
    @GetMapping("/departments")
    public List<Department> getAllDepartment() {

        return departmentService.getAllDepartment();
    }


    // API 2
    @GetMapping("/departments/{departmentId}")
    public Department getDepartmentByDepartmentId(
            @PathVariable int departmentId) {

        return departmentService
                .getDepartmentByDepartmentId(departmentId);
    }


    // API 3
    @GetMapping("/departments/{departmentId}/categories")
    public List<Category> getCategoryByDepartmentId(
            @PathVariable int departmentId) {

        return departmentService
                .getCategoryByDepartmentId(departmentId);
    }


	public DepartmentService getDepartmentService() {
		return departmentService;
	}


	public void setDepartmentService(DepartmentService departmentService) {
		this.departmentService = departmentService;
	}
}