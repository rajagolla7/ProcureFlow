package com.procurement.enterpriseApp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

import com.procurement.enterpriseApp.model.Shipment;
import com.procurement.enterpriseApp.service.ShippingService;

@RestController
@RequestMapping("/api/shipping")
public class ShippingController {

    @Autowired
    private ShippingService shippingService;


    // =========================================
    // ADMIN - VIEW ALL TRACKING
    // =========================================

    @GetMapping("/admin/tracking")
    public ResponseEntity<List<Map<String, Object>>> getAdminTracking() {

        return ResponseEntity.ok(
                shippingService.getAdminTracking()
        );
    }


    // =========================================
    // GET CURRENT SHIPPING
    // =========================================

    @GetMapping("/request/{requestId}")
    public ResponseEntity<?> getShipping(
            @PathVariable int requestId) {

        Shipment shipment =
                shippingService.getShipping(requestId);

        if (shipment == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(shipment);
    }
}