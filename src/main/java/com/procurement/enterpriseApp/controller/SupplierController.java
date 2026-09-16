package com.procurement.enterpriseApp.controller;

import java.security.Principal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.procurement.enterpriseApp.model.PaymentStatus;
import com.procurement.enterpriseApp.model.Request;
import com.procurement.enterpriseApp.model.Role;
import com.procurement.enterpriseApp.model.Shipment;
import com.procurement.enterpriseApp.model.ShippingStatus;
import com.procurement.enterpriseApp.model.Supplier;
import com.procurement.enterpriseApp.model.User;
import com.procurement.enterpriseApp.repository.RequestRepository;
import com.procurement.enterpriseApp.repository.ShipmentRepository;
import com.procurement.enterpriseApp.repository.ProductRepository;
import com.procurement.enterpriseApp.repository.SupplierRepository;
import com.procurement.enterpriseApp.service.ShippingService;
import com.procurement.enterpriseApp.service.RatingService;

@RestController
@RequestMapping("/api/supplier")
public class SupplierController {

    @Autowired
    private ShippingService shippingService;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RatingService ratingService;


    // =====================================================
    // SUPPLIER DASHBOARD
    // =====================================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(
            @RequestParam String email) {

        Supplier supplier =
                supplierRepository
                        .findByEmailIgnoreCase(email.trim())
                        .orElse(null);

        if (supplier == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Supplier account not found.");
        }

        List<Map<String, Object>> orders =
                new ArrayList<>();

        int newOrders = 0;
        int dispatched = 0;
        int inTransit = 0;
        int outForDelivery = 0;
        int delivered = 0;

        List<Request> requests =
                requestRepository.findAll();

        for (Request request : requests) {

            // Backfill the supplier on older requests created
            // before supplier assignment was added to Request.
            // New requests already have request.supplier set.
            if (request.getSupplier() == null &&
                request.getProduct() != null) {

                Supplier productSupplier =
                        supplierRepository
                        .findByProduct_ProductId(
                                request.getProduct().getProductId()
                        )
                        .orElse(null);

                if (productSupplier != null) {
                    request.setSupplier(productSupplier);
                    requestRepository.save(request);
                }
            }

            // Only paid requests belonging to this supplier
            if (request.getPaymentStatus()
                    != PaymentStatus.PAID) {
                continue;
            }

            if (request.getSupplier() == null) {
                continue;
            }

            if (request.getSupplier()
                    .getSupplierId()
                    != supplier.getSupplierId()) {
                continue;
            }

            Shipment shipment =
                    shipmentRepository
                            .findByRequest_RequestId(
                                    request.getRequestId()
                            )
                            .orElse(null);

            String shippingStatus = "NEW_ORDER";
            String currentLocation =
                    "Awaiting supplier processing";
            String trackingNumber = "-";
            Object lastUpdated = null;

            if (shipment != null) {

                if (shipment.getStatus() != null) {
                    shippingStatus =
                            shipment.getStatus().name();
                }

                if (shipment.getCurrentLocation() != null
                        && !shipment.getCurrentLocation()
                                .trim().isEmpty()) {

                    currentLocation =
                            shipment.getCurrentLocation();
                }

                if (shipment.getTrackingNumber() != null
                        && !shipment.getTrackingNumber()
                                .trim().isEmpty()) {

                    trackingNumber =
                            shipment.getTrackingNumber();
                }

                lastUpdated =
                        shipment.getLastUpdated();
            }

            // Count current shipping stage
            if ("NEW_ORDER".equals(shippingStatus)) {
                newOrders++;
            } else if ("ORDER_DISPATCHED"
                    .equals(shippingStatus)) {
                dispatched++;
            } else if ("IN_TRANSIT"
                    .equals(shippingStatus)) {
                inTransit++;
            } else if ("OUT_FOR_DELIVERY"
                    .equals(shippingStatus)) {
                outForDelivery++;
            } else if ("DELIVERED"
                    .equals(shippingStatus)) {
                delivered++;
            }

            Map<String, Object> order =
                    new LinkedHashMap<>();

            order.put(
                    "requestId",
                    request.getRequestId()
            );

            order.put(
                    "userName",
                    getUserName(request.getUser())
            );

            order.put(
                    "productName",
                    request.getProductName()
            );

            order.put(
                    "quantity",
                    request.getNumberOfQuantities()
            );

            order.put(
                    "pricePerProduct",
                    request.getPricePerProduct()
            );

            order.put(
                    "totalPrice",
                    request.getTotalPrice()
            );

            order.put(
                    "paymentStatus",
                    request.getPaymentStatus() != null
                            ? request.getPaymentStatus().name()
                            : "UNKNOWN"
            );

            order.put(
                    "shippingStatus",
                    shippingStatus
            );

            order.put(
                    "currentLocation",
                    currentLocation
            );

            order.put(
                    "trackingNumber",
                    trackingNumber
            );

            order.put(
                    "lastUpdated",
                    lastUpdated
            );

            order.put(
                    "createdDate",
                    request.getCreatedDate()
            );

            orders.add(order);
        }

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "supplierName",
                supplier.getName()
        );

        response.put(
                "assignedProduct",
                supplier.getProduct() != null
                        ? supplier.getProduct().getName()
                        : "No product assigned"
        );

        response.put(
                "availableStock",
                supplier.getProduct() != null
                        ? supplier.getProduct().getNumberOfQuantities()
                        : 0
        );

        response.put(
                "assignedProductId",
                supplier.getProduct() != null
                        ? supplier.getProduct().getProductId()
                        : 0
        );

        response.put(
                "totalOrders",
                orders.size()
        );

        response.put(
                "newOrders",
                newOrders
        );

        response.put(
                "dispatched",
                dispatched
        );

        response.put(
                "inTransit",
                inTransit
        );

        response.put(
                "outForDelivery",
                outForDelivery
        );

        response.put(
                "delivered",
                delivered
        );

        response.put(
                "orders",
                orders
        );

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // SUPPLIER PROFILE
    // =====================================================

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @RequestParam String email) {

        Supplier supplier =
                supplierRepository
                        .findByEmailIgnoreCase(email.trim())
                        .orElse(null);

        if (supplier == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Supplier account not found.");
        }

        Map<String, Object> profile =
                new LinkedHashMap<>();

        profile.put(
                "supplierId",
                supplier.getSupplierId()
        );

        profile.put(
                "name",
                supplier.getName()
        );

        profile.put(
                "email",
                supplier.getEmail()
        );

        profile.put(
                "phone",
                supplier.getPhone()
        );

        profile.put(
                "address",
                supplier.getAddress()
        );

        profile.put(
                "gstNumber",
                supplier.getGstNumber()
        );

        profile.put(
                "status",
                supplier.getStatus() != null
                        ? supplier.getStatus().name()
                        : "UNKNOWN"
        );

        if (supplier.getProduct() != null) {

            Map<String, Object> product =
                    new LinkedHashMap<>();

            product.put(
                    "productId",
                    supplier.getProduct().getProductId()
            );

            product.put(
                    "name",
                    supplier.getProduct().getName()
            );

            product.put(
                    "availableStock",
                    supplier.getProduct().getNumberOfQuantities()
            );

            profile.put(
                    "assignedProduct",
                    product
            );

        } else {

            profile.put(
                    "assignedProduct",
                    null
            );
        }

        return ResponseEntity.ok(profile);
    }



    // =====================================================
    // SUPPLIER RATINGS
    // =====================================================

    @GetMapping("/ratings")
    public ResponseEntity<?> getSupplierRatings(
            @RequestParam String email) {

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Supplier email is required.");
        }

        Supplier supplier = supplierRepository
                .findByEmailIgnoreCase(email.trim())
                .orElse(null);

        if (supplier == null) {
            return ResponseEntity.badRequest()
                    .body("Supplier account not found.");
        }

        return ResponseEntity.ok(
                ratingService.getSupplierRatings(email.trim())
        );
    }

    // =====================================================
    // SUPPLIER INVENTORY
    // =====================================================

    @PutMapping("/inventory")
    public ResponseEntity<?> updateInventory(
            @RequestParam String email,
            @RequestParam int quantity) {

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Supplier email is required.");
        }

        if (quantity < 0) {
            return ResponseEntity.badRequest()
                    .body("Stock quantity cannot be negative.");
        }

        Supplier supplier = supplierRepository
                .findByEmailIgnoreCase(email.trim())
                .orElse(null);

        if (supplier == null) {
            return ResponseEntity.badRequest()
                    .body("Supplier account not found.");
        }

        if (supplier.getProduct() == null) {
            return ResponseEntity.badRequest()
                    .body("No product is assigned to this supplier.");
        }

        supplier.getProduct().setNumberOfQuantities(quantity);
        productRepository.save(supplier.getProduct());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("productId", supplier.getProduct().getProductId());
        response.put("productName", supplier.getProduct().getName());
        response.put("availableStock",
                supplier.getProduct().getNumberOfQuantities());

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // SUPPLIER ACCEPTS / DISPATCHES ORDER
    // =====================================================

    @PutMapping("/requests/{requestId}/ship")
    public ResponseEntity<?> startShipping(
            @PathVariable int requestId,
            @RequestParam(required = false) String supplierEmail,
            Principal principal) {

        String email =
                resolveSupplierEmail(
                        supplierEmail,
                        principal
                );

        if (email == null) {
            return ResponseEntity
                    .badRequest()
                    .body(
                        "Supplier email is required."
                    );
        }

        Shipment shipment =
                shippingService.startShipping(
                        requestId,
                        email
                );

        if (shipment == null) {
            return ResponseEntity
                    .badRequest()
                    .body(
                        "Order cannot be accepted. "
                        + "Check payment and assigned supplier."
                    );
        }

        return ResponseEntity.ok(shipment);
    }


    // =====================================================
    // SUPPLIER UPDATES SHIPPING
    // =====================================================

    @PutMapping("/requests/{requestId}/shipping")
    public ResponseEntity<?> updateShipping(
            @PathVariable int requestId,
            @RequestParam ShippingStatus status,
            @RequestParam String location,
            @RequestParam(required = false) String supplierEmail,
            Principal principal) {

        String email =
                resolveSupplierEmail(
                        supplierEmail,
                        principal
                );

        if (email == null) {
            return ResponseEntity
                    .badRequest()
                    .body(
                        "Supplier email is required."
                    );
        }

        Shipment shipment =
                shippingService.updateShipping(
                        requestId,
                        status,
                        location,
                        email
                );

        if (shipment == null) {
            return ResponseEntity
                    .badRequest()
                    .body(
                        "Shipping update cannot be processed. "
                        + "Check the supplier, payment, shipment "
                        + "and shipping status transition."
                    );
        }

        return ResponseEntity.ok(shipment);
    }


    // =====================================================
    // RESOLVE SUPPLIER EMAIL
    // =====================================================

    private String resolveSupplierEmail(
            String supplierEmail,
            Principal principal) {

        if (supplierEmail != null
                && !supplierEmail.trim().isEmpty()) {

            return supplierEmail.trim();
        }

        if (principal != null
                && principal.getName() != null
                && !principal.getName().trim().isEmpty()) {

            return principal.getName().trim();
        }

        return null;
    }


    // =====================================================
    // SAFE USER NAME
    // =====================================================

    private String getUserName(User user) {

        if (user == null) {
            return "-";
        }

        if (user.getName() == null
                || user.getName().trim().isEmpty()) {

            return user.getEmail() != null
                    ? user.getEmail()
                    : "-";
        }

        return user.getName();
    }
}
