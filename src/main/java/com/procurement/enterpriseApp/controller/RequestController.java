package com.procurement.enterpriseApp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.procurement.enterpriseApp.model.Request;
import com.procurement.enterpriseApp.service.RequestService;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    @Autowired
    private RequestService requestService;


    // =========================================
    // CREATE REQUEST
    // =========================================

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createRequest(
            @PathVariable int userId,
            @RequestBody Request request) {

        try {

            Request savedRequest =
                    requestService.createRequest(
                            userId,
                            request
                    );

            if (savedRequest == null) {

                return ResponseEntity
                        .badRequest()
                        .body("User not found");
            }

            return ResponseEntity.ok(
                    savedRequest
            );

        } catch (IllegalArgumentException |
                 IllegalStateException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================
    // GET USER REQUESTS
    // =========================================

    @GetMapping("/user/{userId}")
    public List<Request> getUserRequests(
            @PathVariable int userId) {

        return requestService.getUserRequests(
                userId
        );
    }


    // =========================================
    // GET DELIVERED REQUESTS FOR USER
    // =========================================

    @GetMapping("/user/{userId}/delivered")
    public ResponseEntity<?> getDeliveredRequests(
            @PathVariable int userId) {

        try {

            return ResponseEntity.ok(
                    requestService.getDeliveredRequests(
                            userId
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                        "Unable to load delivered products: "
                        + e.getMessage()
                    );
        }
    }
  }
