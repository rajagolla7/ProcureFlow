package com.procurement.enterpriseApp.model;


import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "requests")
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int requestId;

    private String productName;

    private double pricePerProduct;

    private int numberOfQuantities;

    private double totalPrice;
    	
    private String description;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    @JsonIgnore
    private Supplier supplier;

    public Request() {
    }

    @PrePersist
    public void onCreate() {
        this.createdDate = LocalDateTime.now();
        this.totalPrice = this.pricePerProduct * this.numberOfQuantities;

        if (this.status == null) {
            this.status = RequestStatus.PENDING;
        }
        
        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.PENDING;
        }
    }

	public int getRequestId() {
		return requestId;
	}

	public void setRequestId(int requestId) {
		this.requestId = requestId;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public double getPricePerProduct() {
		return pricePerProduct;
	}

	public void setPricePerProduct(double pricePerProduct) {
		this.pricePerProduct = pricePerProduct;
	}

	public int getNumberOfQuantities() {
		return numberOfQuantities;
	}

	public void setNumberOfQuantities(int numberOfQuantities) {
		this.numberOfQuantities = numberOfQuantities;
	}

	public double getTotalPrice() {
		return totalPrice;
	}

	public void setTotalPrice(double totalPrice) {
		this.totalPrice = totalPrice;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public RequestStatus getStatus() {
		return status;
	}

	public void setStatus(RequestStatus status) {
		this.status = status;
	}
	public PaymentStatus getPaymentStatus() {
	    return paymentStatus;
	}

	public void setPaymentStatus(PaymentStatus paymentStatus) {
	    this.paymentStatus = paymentStatus;
	}

	public LocalDateTime getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
	public Product getProduct() {
	    return product;
	}

	public void setProduct(Product product) {
	    this.product = product;
	}

	public Supplier getSupplier() {
	    return supplier;
	}

	public void setSupplier(Supplier supplier) {
	    this.supplier = supplier;
	}
}