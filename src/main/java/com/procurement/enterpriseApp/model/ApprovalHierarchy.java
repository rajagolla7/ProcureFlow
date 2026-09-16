package com.procurement.enterpriseApp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "approval_hierarchy")
public class ApprovalHierarchy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int approvalHierarchyId;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    private int level;

    public ApprovalHierarchy() {
    }

    public int getApprovalHierarchyId() {
        return approvalHierarchyId;
    }

    public void setApprovalHierarchyId(int approvalHierarchyId) {
        this.approvalHierarchyId = approvalHierarchyId;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }
}