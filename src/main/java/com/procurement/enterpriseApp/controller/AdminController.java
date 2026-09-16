package com.procurement.enterpriseApp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.procurement.enterpriseApp.model.Payment;
import com.procurement.enterpriseApp.model.PaymentRequest;
import com.procurement.enterpriseApp.model.Request;
import com.procurement.enterpriseApp.model.RequestStatus;
import com.procurement.enterpriseApp.service.RequestService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private RequestService requestService;


    // =====================================================
    // GET ALL REQUESTS
    // =====================================================

    @GetMapping("/requests")
    public List<Request> getAllRequests() {

        return requestService.getAllRequests();
    }


    // =====================================================
    // APPROVE REQUEST
    // =====================================================

    @PutMapping("/requests/{requestId}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable int requestId) {

        try {

            Request request =
                    requestService.updateRequestStatus(
                            requestId,
                            RequestStatus.APPROVED
                    );

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .body("Request not found.");
            }

            return ResponseEntity.ok(request);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                        "Unable to approve request: "
                        + e.getMessage()
                    );
        }
    }


    // =====================================================
    // REJECT REQUEST
    // =====================================================

    @PutMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable int requestId) {

        try {

            Request request =
                    requestService.updateRequestStatus(
                            requestId,
                            RequestStatus.REJECTED
                    );

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .body("Request not found.");
            }

            return ResponseEntity.ok(request);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                        "Unable to reject request: "
                        + e.getMessage()
                    );
        }
    }


    // =====================================================
    // PAYMENT
    // =====================================================

    @PostMapping("/requests/{requestId}/pay")
    public ResponseEntity<?> processPayment(
            @PathVariable int requestId,
            @RequestBody PaymentRequest paymentRequest) {

        try {

            Payment payment =
                    requestService.processPayment(
                            requestId,
                            paymentRequest
                    );

            if (payment == null) {
                return ResponseEntity
                        .badRequest()
                        .body(
                            "Payment cannot be processed. "
                            + "The request must be approved, "
                            + "unpaid, and a valid admin account must exist."
                        );
            }

            return ResponseEntity.ok(payment);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                        "Payment failed: "
                        + e.getMessage()
                    );
        }
    }
}