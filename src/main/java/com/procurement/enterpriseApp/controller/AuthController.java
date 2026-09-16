package com.procurement.enterpriseApp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.procurement.enterpriseApp.model.LoginRequest;
import com.procurement.enterpriseApp.model.SupplierRegistrationRequest;
import com.procurement.enterpriseApp.model.User;
import com.procurement.enterpriseApp.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;


    // =========================================
    // REGISTER USER
    // =========================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user) {

        User registeredUser =
                authService.register(user);

        if (registeredUser == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Email already registered");
        }

        return ResponseEntity.ok(
                registeredUser
        );
    }


    // =========================================
    // REGISTER SUPPLIER
    // =========================================

    @PostMapping("/supplier/register")
    public ResponseEntity<?> registerSupplier(
            @RequestBody SupplierRegistrationRequest request) {

        try {

            User registeredSupplier =
                    authService.registerSupplier(request);

            if (registeredSupplier == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                            "Supplier email already registered "
                            + "or required fields are missing."
                        );
            }

            return ResponseEntity.ok(
                    registeredSupplier
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================
    // NORMAL LOGIN
    // =========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest) {

        User user =
                authService.login(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                );

        if (user == null) {

            return ResponseEntity
                    .status(401)
                    .body(
                        "Invalid email or password"
                    );
        }

        return ResponseEntity.ok(user);
    }


    // =========================================
    // SUPPLIER LOGIN
    // =========================================

    @PostMapping("/supplier/login")
    public ResponseEntity<?> supplierLogin(
            @RequestBody LoginRequest loginRequest) {

        User supplier =
                authService.supplierLogin(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                );

        if (supplier == null) {

            return ResponseEntity
                    .status(401)
                    .body(
                        "Invalid supplier email/password "
                        + "or supplier account not configured."
                    );
        }

        return ResponseEntity.ok(supplier);
    }
}