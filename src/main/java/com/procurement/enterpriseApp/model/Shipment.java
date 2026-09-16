package com.procurement.enterpriseApp.model;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int shipmentId;

    @OneToOne
    @JoinColumn(
        name = "request_id",
        unique = true,
        nullable = false
    )
    @JsonIgnore
    private Request request;

    @ManyToOne
    @JoinColumn(
        name = "supplier_id",
        nullable = false
    )
    @JsonIgnore
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    private ShippingStatus status;

    private String currentLocation;

    private String trackingNumber;

    private LocalDateTime lastUpdated;

    public Shipment() {
    }

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {

        lastUpdated = LocalDateTime.now();
    }

    public int getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(int shipmentId) {
        this.shipmentId = shipmentId;
    }

    public Request getRequest() {
        return request;
    }

    public void setRequest(Request request) {
        this.request = request;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public ShippingStatus getStatus() {
        return status;
    }

    public void setStatus(ShippingStatus status) {
        this.status = status;
    }

    public String getCurrentLocation() {
        return currentLocation;
    }

    public void setCurrentLocation(String currentLocation) {
        this.currentLocation = currentLocation;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public Map<String, Object> getSupplierDetails() {

        Map<String, Object> details = new HashMap<>();

        details.put(
                "supplierId",
                supplier.getSupplierId()
        );

        details.put(
                "name",
                supplier.getName()
        );

        details.put(
                "phone",
                supplier.getPhone()
        );

        details.put(
                "address",
                supplier.getAddress()
        );

        details.put(
                "email",
                supplier.getEmail()
        );

        return details;
    }
}