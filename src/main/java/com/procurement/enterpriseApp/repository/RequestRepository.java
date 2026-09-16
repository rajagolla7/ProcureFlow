package com.procurement.enterpriseApp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurement.enterpriseApp.model.Request;

public interface RequestRepository extends JpaRepository<Request, Integer> {

    List<Request> findByUserUserId(int userId);
}