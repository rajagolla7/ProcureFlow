package com.procurement.enterpriseApp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurement.enterpriseApp.model.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    List<Supplier> findByProduct_Name(String productName);

    Optional<Supplier> findByEmail(String email);

    Optional<Supplier> findByEmailIgnoreCase(String email);

    Optional<Supplier> findByProduct_ProductId(int productId);

    boolean existsByEmail(String email);
}
