package com.procurement.enterpriseApp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.procurement.enterpriseApp.model.ProductRating;
import com.procurement.enterpriseApp.model.RatingRequest;
import com.procurement.enterpriseApp.model.Request;
import com.procurement.enterpriseApp.model.RequestStatus;
import com.procurement.enterpriseApp.model.Shipment;
import com.procurement.enterpriseApp.model.ShippingStatus;
import com.procurement.enterpriseApp.model.Supplier;
import com.procurement.enterpriseApp.model.User;
import com.procurement.enterpriseApp.repository.ProductRatingRepository;
import com.procurement.enterpriseApp.repository.RequestRepository;
import com.procurement.enterpriseApp.repository.ShipmentRepository;
import com.procurement.enterpriseApp.repository.UserRepository;
import com.procurement.enterpriseApp.repository.SupplierRepository;

@Service
public class RatingService {

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ProductRatingRepository ratingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierRepository supplierRepository;


    public ProductRating rateProduct(
            int requestId,
            String userEmail,
            RatingRequest input) {

        Request request =
                requestRepository
                .findById(requestId)
                .orElse(null);

        User user =
                userRepository
                .findByEmail(userEmail)
                .orElse(null);

        if (request == null ||
            user == null ||
            request.getUser() == null) {

            return null;
        }


        // Only request owner
        if (request.getUser()
                .getUserId()
                != user.getUserId()) {

            return null;
        }


        // Shipment must exist
        Shipment shipment =
                shipmentRepository
                .findByRequest_RequestId(
                        requestId
                )
                .orElse(null);

        if (shipment == null) {
            return null;
        }


        // Product must be delivered
        if (shipment.getStatus()
                != ShippingStatus.DELIVERED) {

            return null;
        }


        // Only one rating
        if (ratingRepository
                .findByRequest_RequestId(
                        requestId
                )
                .isPresent()) {

            return null;
        }


        // Rating 1-5
        if (input.getRating() < 1 ||
            input.getRating() > 5) {

            return null;
        }


        ProductRating rating =
                new ProductRating();

        rating.setRequest(request);
        rating.setUser(user);

        rating.setRating(
                input.getRating()
        );

        rating.setFeedback(
                input.getFeedback()
        );

        return ratingRepository.save(
                rating
        );
    }


    /**
     * Returns only the ratings for the product assigned to the supplied
     * supplier email. Suppliers must never see ratings for other products.
     */
    public List<Map<String, Object>> getSupplierRatings(String supplierEmail) {

        Supplier supplier = supplierRepository
                .findByEmailIgnoreCase(supplierEmail.trim())
                .orElse(null);

        if (supplier == null || supplier.getProduct() == null) {
            return new ArrayList<>();
        }

        int assignedProductId = supplier.getProduct().getProductId();
        List<Map<String, Object>> result = new ArrayList<>();

        for (ProductRating rating : ratingRepository.findAll()) {

            Request request = rating.getRequest();
            User user = rating.getUser();

            if (request == null || request.getProduct() == null) {
                continue;
            }

            if (request.getProduct().getProductId() != assignedProductId) {
                continue;
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("ratingId", rating.getRatingId());
            item.put("requestId", request.getRequestId());
            item.put("productId", assignedProductId);
            item.put("productName", request.getProductName());
            item.put("userName",
                    user != null && user.getName() != null
                            ? user.getName()
                            : "User");
            item.put("rating", rating.getRating());
            item.put("feedback",
                    rating.getFeedback() != null ? rating.getFeedback() : "");
            item.put("createdDate", rating.getCreatedDate());

            result.add(item);
        }

        return result;
    }

    public List<Map<String, Object>> getPublicRatings() {

        List<Map<String, Object>> result = new ArrayList<>();

        for (ProductRating rating : ratingRepository.findAll()) {

            Map<String, Object> item = new LinkedHashMap<>();

            Request request = rating.getRequest();
            User user = rating.getUser();

            item.put("ratingId", rating.getRatingId());
            item.put("requestId",
                    request != null ? request.getRequestId() : 0);
            item.put("productId",
                    request != null && request.getProduct() != null
                            ? request.getProduct().getProductId()
                            : 0);
            item.put("productName",
                    request != null
                            ? request.getProductName()
                            : "Unknown Product");
            item.put("userName",
                    user != null && user.getName() != null
                            ? user.getName()
                            : "User");
            item.put("rating", rating.getRating());
            item.put("feedback",
                    rating.getFeedback() != null
                            ? rating.getFeedback()
                            : "");
            item.put("createdDate", rating.getCreatedDate());

            result.add(item);
        }

        return result;
    }

}