package com.procurement.enterpriseApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurement.enterpriseApp.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
}