package com.procurement.enterpriseApp.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "product")
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private int productId;

    public int getProductId() {
		return productId;
	}

	public void setProductId(int productId) {
		this.productId = productId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
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

	public Department getDepartment() {
		return department;
	}

	public void setDepartment(Department department) {
		this.department = department;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public ProductStatus getStatus() {
		return status;
	}

	public void setStatus(ProductStatus status) {
		this.status = status;
	}

	public LocalDateTime getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}

	public LocalDateTime getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(LocalDateTime updateDate) {
		this.updateDate = updateDate;
	}

	private String name;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private double pricePerProduct;

    private int numberOfQuantities;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    private String description;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    private LocalDateTime createdDate;

    private LocalDateTime updateDate;

    public Product() {
    }

    @PrePersist
    public void onCreate() {
        createdDate = LocalDateTime.now();
        updateDate = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updateDate = LocalDateTime.now();
    }

    // Generate getters and setters in Eclipse
}