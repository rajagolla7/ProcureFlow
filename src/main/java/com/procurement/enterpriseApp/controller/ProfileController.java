package com.procurement.enterpriseApp.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.procurement.enterpriseApp.model.User;
import com.procurement.enterpriseApp.repository.UserRepository;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    // =========================================
    // GET USER PROFILE
    // =========================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProfile(
            @PathVariable int userId) {

        Optional<User> optionalUser =
                userRepository.findById(userId);

        if (optionalUser.isEmpty()) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                optionalUser.get()
        );
    }


    // =========================================
    // UPDATE USER PROFILE
    // =========================================

    @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable int userId,
            @RequestBody User profileData) {

        Optional<User> optionalUser =
                userRepository.findById(userId);

        if (optionalUser.isEmpty()) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        User existingUser =
                optionalUser.get();


        // =========================================
        // CHECK EMAIL
        // =========================================

        String newEmail =
                profileData.getEmail();

        if (newEmail == null ||
            newEmail.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email cannot be empty.");
        }

        newEmail =
                newEmail.trim();


        // =========================================
        // CHECK IF EMAIL IS USED BY ANOTHER USER
        // =========================================

        Optional<User> userWithEmail =
                userRepository.findByEmail(newEmail);

        if (userWithEmail.isPresent() &&
            userWithEmail.get().getUserId()
                    != existingUser.getUserId()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email is already registered.");
        }


        // =========================================
        // NAME
        // =========================================

        if (profileData.getName() == null ||
            profileData.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Name cannot be empty.");
        }

        existingUser.setName(
                profileData.getName().trim()
        );


        // =========================================
        // EMAIL
        // =========================================

        existingUser.setEmail(
                newEmail
        );


        // =========================================
        // PHONE
        // =========================================

        existingUser.setPhoneNumber(
                profileData.getPhoneNumber()
        );


        // =========================================
        // DESIGNATION
        // =========================================

        existingUser.setDesignation(
                profileData.getDesignation()
        );


        // =========================================
        // IMPORTANT
        // =========================================
        // DO NOT update:
        //
        // password
        // role
        // department
        //
        // These remain unchanged.
        // =========================================


        User savedUser =
                userRepository.save(existingUser);

        return ResponseEntity.ok(
                savedUser
        );
    }
}