package com.procurement.enterpriseApp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurement.enterpriseApp.model.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    Optional<Product> findByNameIgnoreCase(String name);
}