package com.procurement.enterpriseApp.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "product_ratings")
public class ProductRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int ratingId;

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
        name = "user_id",
        nullable = false
    )
    @JsonIgnore
    private User user;

    private int rating;

    private String feedback;

    private LocalDateTime createdDate;

    public ProductRating() {
    }

    @PrePersist
    public void onCreate() {
        createdDate =
                LocalDateTime.now();
    }

    public int getRatingId() {
        return ratingId;
    }

    public void setRatingId(int ratingId) {
        this.ratingId = ratingId;
    }

    public Request getRequest() {
        return request;
    }

    public void setRequest(Request request) {
        this.request = request;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(
            LocalDateTime createdDate) {

        this.createdDate = createdDate;
    }
}