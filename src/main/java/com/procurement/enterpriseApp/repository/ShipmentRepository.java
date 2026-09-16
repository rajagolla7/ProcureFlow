package com.procurement.enterpriseApp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurement.enterpriseApp.model.Shipment;

public interface ShipmentRepository extends JpaRepository<Shipment, Integer> {

    Optional<Shipment> findByRequest_RequestId(int requestId);

}