package com.procurement.enterpriseApp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.procurement.enterpriseApp.model.Product;
import com.procurement.enterpriseApp.repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {

        Product savedProduct = productRepository.save(product);

        return ResponseEntity.ok(savedProduct);
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts() {

        return ResponseEntity.ok(productRepository.findAll());
    }
}