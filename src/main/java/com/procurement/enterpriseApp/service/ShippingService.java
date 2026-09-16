package com.procurement.enterpriseApp.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.procurement.enterpriseApp.model.PaymentStatus;
import com.procurement.enterpriseApp.model.Request;
import com.procurement.enterpriseApp.model.Role;
import com.procurement.enterpriseApp.model.Shipment;
import com.procurement.enterpriseApp.model.ShippingStatus;
import com.procurement.enterpriseApp.model.Supplier;
import com.procurement.enterpriseApp.repository.RequestRepository;
import com.procurement.enterpriseApp.repository.ShipmentRepository;
import com.procurement.enterpriseApp.repository.SupplierRepository;
import com.procurement.enterpriseApp.repository.UserRepository;

@Service
public class ShippingService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;


    // =========================================
    // ADMIN TRACKING - ALL USER REQUESTS
    // =========================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAdminTracking() {

        List<Request> requests = requestRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Request request : requests) {

            Map<String, Object> row = new HashMap<>();

            row.put("requestId", request.getRequestId());
            row.put("productName", request.getProductName());
            row.put("quantity", request.getNumberOfQuantities());
            row.put("paymentStatus",
                    request.getPaymentStatus() != null
                            ? request.getPaymentStatus().name()
                            : "PENDING");
            row.put("requestStatus",
                    request.getStatus() != null
                            ? request.getStatus().name()
                            : "PENDING");

            if (request.getUser() != null) {
                row.put("userName", request.getUser().getName());
                row.put("userEmail", request.getUser().getEmail());
            } else {
                row.put("userName", "-");
                row.put("userEmail", "-");
            }

            Shipment shipment =
                    shipmentRepository
                            .findByRequest_RequestId(request.getRequestId())
                            .orElse(null);

            if (shipment != null) {

                row.put("shippingStatus",
                        shipment.getStatus() != null
                                ? shipment.getStatus().name()
                                : "UNKNOWN");

                row.put("currentLocation",
                        shipment.getCurrentLocation() != null
                                ? shipment.getCurrentLocation()
                                : "-");

                row.put("trackingNumber",
                        shipment.getTrackingNumber() != null
                                ? shipment.getTrackingNumber()
                                : "Not assigned");

                row.put("lastUpdated", shipment.getLastUpdated());

                Supplier shipmentSupplier = shipment.getSupplier();

                if (shipmentSupplier != null) {
                    row.put("supplierName",
                            shipmentSupplier.getName());
                    row.put("supplierEmail",
                            shipmentSupplier.getEmail());
                } else {
                    row.put("supplierName", "-");
                    row.put("supplierEmail", "-");
                }

            } else {

                row.put("shippingStatus", "NOT_DISPATCHED");
                row.put("currentLocation", "Waiting for shipment");
                row.put("trackingNumber", "Not assigned");
                row.put("lastUpdated", null);

                Supplier requestSupplier = request.getSupplier();

                if (requestSupplier != null) {
                    row.put("supplierName",
                            requestSupplier.getName());
                    row.put("supplierEmail",
                            requestSupplier.getEmail());
                } else {
                    row.put("supplierName", "-");
                    row.put("supplierEmail", "-");
                }
            }

            result.add(row);
        }

        return result;
    }


    // =========================================
    // GET CURRENT SHIPPING
    // =========================================

    public Shipment getShipping(int requestId) {

        return shipmentRepository
                .findByRequest_RequestId(requestId)
                .orElse(null);
    }


    // =========================================
    // SUPPLIER STARTS SHIPPING
    // =========================================

    public Shipment startShipping(
            int requestId,
            String supplierEmail) {

        Request request =
                requestRepository
                .findById(requestId)
                .orElse(null);

        Supplier supplier =
                supplierRepository
                .findByEmailIgnoreCase(supplierEmail)
                .orElse(null);

        // Backward compatibility: if an older request does not
        // yet have a supplier assigned, resolve it from the
        // ordered product.
        if (request != null &&
            request.getSupplier() == null &&
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


        // Supplier or request missing
        if (request == null ||
            supplier == null ||
            request.getSupplier() == null) {

            return null;
        }


        // Supplier must match request supplier
        if (request.getSupplier()
                .getSupplierId()
                != supplier.getSupplierId()) {

            return null;
        }


        // Payment must be completed
        if (request.getPaymentStatus()
                != PaymentStatus.PAID) {

            return null;
        }


        // =========================================
        // DO NOT RESET AN EXISTING SHIPMENT
        // =========================================

        Shipment existingShipment =
                shipmentRepository
                .findByRequest_RequestId(requestId)
                .orElse(null);

        if (existingShipment != null) {

            return existingShipment;
        }


        // =========================================
        // CREATE SHIPMENT
        // =========================================

        Shipment shipment =
                new Shipment();

        shipment.setRequest(request);
        shipment.setSupplier(supplier);

        shipment.setStatus(
                ShippingStatus.ORDER_DISPATCHED
        );

        shipment.setCurrentLocation(
                "Dispatched from supplier"
        );

        Shipment saved =
                shipmentRepository.save(shipment);


        sendShippingNotificationsSafely(
                request,
                supplier,
                saved
        );

        return saved;
    }


    // =========================================
    // UPDATE SHIPPING
    // =========================================

    public Shipment updateShipping(
            int requestId,
            ShippingStatus status,
            String location,
            String supplierEmail) {

        Request request =
                requestRepository
                .findById(requestId)
                .orElse(null);

        Supplier supplier =
                supplierRepository
                .findByEmailIgnoreCase(supplierEmail)
                .orElse(null);

        // Backward compatibility: if an older request does not
        // yet have a supplier assigned, resolve it from the
        // ordered product.
        if (request != null &&
            request.getSupplier() == null &&
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


        // =========================================
        // BASIC VALIDATION
        // =========================================

        if (request == null ||
            supplier == null ||
            request.getSupplier() == null) {

            return null;
        }


        // Supplier must belong to request
        if (request.getSupplier()
                .getSupplierId()
                != supplier.getSupplierId()) {

            return null;
        }


        // Payment must be completed
        if (request.getPaymentStatus()
                != PaymentStatus.PAID) {

            return null;
        }


        // Status required
        if (status == null) {
            return null;
        }


        // Location required
        if (location == null ||
            location.trim().isEmpty()) {

            return null;
        }


        // =========================================
        // FIND SHIPMENT
        // =========================================

        Shipment shipment =
                shipmentRepository
                .findByRequest_RequestId(requestId)
                .orElse(null);

        if (shipment == null) {
            return null;
        }


        // =========================================
        // CHECK STATUS TRANSITION
        // =========================================

        ShippingStatus currentStatus =
                shipment.getStatus();

        boolean validTransition = false;


        // ORDER_DISPATCHED -> IN_TRANSIT
        if (currentStatus ==
                ShippingStatus.ORDER_DISPATCHED
                &&
            status ==
                ShippingStatus.IN_TRANSIT) {

            validTransition = true;
        }


        // IN_TRANSIT -> OUT_FOR_DELIVERY
        else if (currentStatus ==
                    ShippingStatus.IN_TRANSIT
                    &&
                 status ==
                    ShippingStatus.OUT_FOR_DELIVERY) {

            validTransition = true;
        }


        // OUT_FOR_DELIVERY -> DELIVERED
        else if (currentStatus ==
                    ShippingStatus.OUT_FOR_DELIVERY
                    &&
                 status ==
                    ShippingStatus.DELIVERED) {

            validTransition = true;
        }


        // =========================================
        // SAME STATUS = ALLOW LOCATION UPDATE
        // =========================================

        else if (currentStatus == status) {

            validTransition = true;
        }


        if (!validTransition) {

            return null;
        }


        // =========================================
        // SAVE UPDATE
        // =========================================

        shipment.setStatus(status);

        shipment.setCurrentLocation(
                location.trim()
        );

        Shipment saved =
                shipmentRepository.save(shipment);


        sendShippingNotificationsSafely(
                request,
                supplier,
                saved
        );

        return saved;
    }


    // =========================================
    // SAFE EMAIL NOTIFICATIONS
    // =========================================

    private void sendShippingNotificationsSafely(
            Request request,
            Supplier supplier,
            Shipment shipment) {

        try {

            sendShippingNotifications(
                    request,
                    supplier,
                    shipment
            );

        } catch (Exception e) {

            System.out.println(
                    "Shipping notification failed: "
                    + e.getMessage()
            );
        }
    }


    // =========================================
    // NOTIFICATIONS
    // =========================================

    private void sendShippingNotifications(
            Request request,
            Supplier supplier,
            Shipment shipment) {

        String status =
                shipment.getStatus().name();

        String location =
                shipment.getCurrentLocation();


        // USER
        if (request.getUser() != null &&
            request.getUser().getEmail() != null) {

            emailService.sendShippingUpdateToUser(

                    request.getUser().getEmail(),

                    request.getRequestId(),

                    request.getProductName(),

                    supplier.getEmail(),

                    status,

                    location,

                    supplier.getName(),

                    supplier.getPhone(),

                    supplier.getAddress()
            );
        }


        // ADMIN
     // =========================================
     // ADMIN SHIPPING NOTIFICATION
     // =========================================

     userRepository.findAll()
             .stream()
             .filter(user ->
                     user.getRole() == Role.ADMIN
                     && user.getEmail() != null
                     && !user.getEmail().trim().isEmpty())
             .forEach(admin -> {

                 try {

                     emailService.sendShippingUpdateToAdmin(

                             admin.getEmail().trim(),

                             request.getRequestId(),

                             request.getProductName(),

                             supplier.getEmail(),

                             status,

                             location
                     );

                 } catch (Exception e) {

                     System.out.println(
                             "Unable to send shipping update to admin: "
                             + admin.getEmail()
                     );

                     System.out.println(
                             "Email error: "
                             + e.getMessage()
                     );
                 }
             });

        // SUPPLIER
        if (supplier.getEmail() != null) {

            emailService.sendShippingUpdateToSupplier(

                    supplier.getEmail(),

                    request.getRequestId(),

                    request.getProductName(),

                    supplier.getEmail(),

                    status,

                    location
            );
        }
    }
}