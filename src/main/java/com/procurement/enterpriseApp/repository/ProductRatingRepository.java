package com.procurement.enterpriseApp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurement.enterpriseApp.model.ProductRating;

public interface ProductRatingRepository
        extends JpaRepository<ProductRating, Integer> {

    Optional<ProductRating>
    findByRequest_RequestId(int requestId);
}