package com.procurement.enterpriseApp.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.procurement.enterpriseApp.model.ProductRating;
import com.procurement.enterpriseApp.model.RatingRequest;
import com.procurement.enterpriseApp.service.RatingService;

@RestController
@RequestMapping("/api/requests")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping("/{requestId}/rating")
    public ResponseEntity<?> rateProduct(
            @PathVariable int requestId,
            @RequestBody RatingRequest input,
            @RequestParam(required = false) String userEmail,
            Principal principal) {

        String email = userEmail;

        if (email == null || email.trim().isEmpty()) {
            if (principal != null) {
                email = principal.getName();
            }
        }

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("User email is required.");
        }

        ProductRating rating = ratingService.rateProduct(
                requestId,
                email.trim(),
                input
        );

        if (rating == null) {
            return ResponseEntity.badRequest()
                    .body(
                        "Rating is allowed only for the request owner "
                        + "after delivery, and only once."
                    );
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("ratingId", rating.getRatingId());
        response.put("requestId", rating.getRequest() != null ? rating.getRequest().getRequestId() : 0);
        response.put("rating", rating.getRating());
        response.put("feedback", rating.getFeedback());
        response.put("createdDate", rating.getCreatedDate());

        return ResponseEntity.ok(response);
    }

    // Public read-only ratings. No login is required.
    @GetMapping("/api-ratings")
    public ResponseEntity<List<Map<String, Object>>> getPublicRatings() {
        return ResponseEntity.ok(ratingService.getPublicRatings());
    }
}
