package com.procurement.enterpriseApp.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.procurement.enterpriseApp.model.Product;
import com.procurement.enterpriseApp.model.Role;
import com.procurement.enterpriseApp.model.Supplier;
import com.procurement.enterpriseApp.model.SupplierRegistrationRequest;
import com.procurement.enterpriseApp.model.SupplierStatus;
import com.procurement.enterpriseApp.model.User;
import com.procurement.enterpriseApp.repository.ProductRepository;
import com.procurement.enterpriseApp.repository.SupplierRepository;
import com.procurement.enterpriseApp.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;


    // =========================================
    // NORMAL USER / SUPPLIER REGISTRATION
    // =========================================
    //
    // Important:
    // If the email already exists in the supplier table,
    // this registration creates a SUPPLIER login account.
    //
    // This allows suppliers already configured by the
    // administrator to use the existing registration page.
    // =========================================

    public User register(User user) {

        if (user == null ||
            user.getEmail() == null ||
            user.getEmail().trim().isEmpty() ||
            user.getPassword() == null ||
            user.getPassword().isEmpty()) {

            return null;
        }

        String email = user.getEmail().trim();

        if (userRepository.existsByEmail(email)) {
            return null;
        }

        // Check whether an administrator has already
        // configured this email as a supplier.
        Supplier supplier =
                supplierRepository
                        .findByEmailIgnoreCase(email)
                        .orElse(null);

        if (supplier != null) {
            user.setRole(Role.SUPPLIER);
            user.setDesignation("SUPPLIER");
        } else {
            user.setRole(Role.USER);
        }

        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        User savedUser =
                userRepository.save(user);

        try {
            emailService.sendRegistrationMail(
                    savedUser.getEmail()
            );
        } catch (Exception e) {
            System.out.println(
                    "Registration email failed: "
                    + e.getMessage()
            );
        }

        return savedUser;
    }


    // =========================================
    // EXPLICIT SUPPLIER REGISTRATION
    // =========================================

    @Transactional
    public User registerSupplier(
            SupplierRegistrationRequest request) {

        if (request == null ||
            request.getEmail() == null ||
            request.getPassword() == null ||
            request.getName() == null) {

            return null;
        }

        String email = request.getEmail().trim();

        User existingUser =
                userRepository.findByEmail(email)
                        .orElse(null);

        Supplier supplier =
                supplierRepository
                        .findByEmailIgnoreCase(email)
                        .orElse(null);

        // If a normal USER already exists and the same email
        // is configured as a supplier, convert that account
        // into the supplier account instead of creating a
        // duplicate users row.
        if (existingUser != null) {

            if (supplier == null) {
                return null;
            }

            existingUser.setRole(Role.SUPPLIER);
            existingUser.setDesignation("SUPPLIER");

            if (request.getName() != null &&
                !request.getName().trim().isEmpty()) {
                existingUser.setName(request.getName().trim());
            }

            if (request.getPhone() != null) {
                existingUser.setPhoneNumber(
                        request.getPhone().trim()
                );
            }

            // The supplier explicitly supplied a new password
            // through supplier registration, so encode it.
            existingUser.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );

            User savedUser =
                    userRepository.save(existingUser);

            updateSupplierRecord(
                    supplier,
                    request
            );

            return savedUser;
        }


        // If no supplier row exists yet, create one.
        if (supplier == null) {

            supplier = new Supplier();

            supplier.setEmail(email);
            supplier.setStatus(
                    SupplierStatus.ACTIVE
            );
        }


        // =========================================
        // CREATE LOGIN USER
        // =========================================

        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPhoneNumber(request.getPhone());
        user.setDesignation("SUPPLIER");
        user.setRole(Role.SUPPLIER);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        User savedUser =
                userRepository.save(user);


        // =========================================
        // CREATE / UPDATE SUPPLIER RECORD
        // =========================================

        updateSupplierRecord(
                supplier,
                request
        );


        // =========================================
        // EMAIL
        // =========================================

        try {

            emailService.sendRegistrationMail(
                    savedUser.getEmail()
            );

        } catch (Exception e) {

            System.out.println(
                    "Supplier registration email failed: "
                    + e.getMessage()
            );
        }

        return savedUser;
    }


    private void updateSupplierRecord(
            Supplier supplier,
            SupplierRegistrationRequest request) {

        supplier.setName(request.getName().trim());
        supplier.setEmail(request.getEmail().trim());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setGstNumber(request.getGstNumber());

        if (supplier.getStatus() == null) {
            supplier.setStatus(
                    SupplierStatus.ACTIVE
            );
        }

        // If a product was explicitly supplied, assign it.
        if (request.getProductId() != null) {

            Product product =
                    productRepository
                    .findById(request.getProductId())
                    .orElseThrow(() ->
                        new IllegalArgumentException(
                            "Product not found: "
                            + request.getProductId()
                        )
                    );

            supplier.setProduct(product);
        }

        supplierRepository.save(supplier);
    }


    // =========================================
    // NORMAL LOGIN
    // =========================================
    //
    // A supplier may already have been inserted into
    // the supplier table before the user registered.
    // In that case, automatically promote the login
    // account to SUPPLIER.
    // =========================================

    public User login(
            String email,
            String password) {

        if (email == null || password == null) {
            return null;
        }

        String normalizedEmail = email.trim();

        Optional<User> optionalUser =
                userRepository.findByEmail(
                        normalizedEmail
                );

        if (optionalUser.isEmpty()) {
            return null;
        }

        User user =
                optionalUser.get();

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            return null;
        }

        // If this email is configured as a supplier,
        // make sure the login role is SUPPLIER.
        Supplier supplier =
                supplierRepository
                        .findByEmailIgnoreCase(
                                normalizedEmail
                        )
                        .orElse(null);

        if (supplier != null &&
            user.getRole() != Role.SUPPLIER) {

            user.setRole(Role.SUPPLIER);
            user.setDesignation("SUPPLIER");

            user =
                    userRepository.save(user);
        }

        return user;
    }


    // =========================================
    // SUPPLIER LOGIN
    // =========================================

    public User supplierLogin(
            String email,
            String password) {

        if (email == null || password == null) {
            return null;
        }

        String normalizedEmail = email.trim();

        Optional<User> optionalUser =
                userRepository.findByEmail(
                        normalizedEmail
                );

        if (optionalUser.isEmpty()) {
            return null;
        }

        User user =
                optionalUser.get();

        Supplier supplier =
                supplierRepository
                        .findByEmailIgnoreCase(
                                normalizedEmail
                        )
                        .orElse(null);

        // Supplier table is the source of supplier identity.
        if (supplier == null) {
            return null;
        }

        // Automatically repair an older account that was
        // accidentally created as USER.
        if (user.getRole() != Role.SUPPLIER) {

            user.setRole(Role.SUPPLIER);
            user.setDesignation("SUPPLIER");

            user =
                    userRepository.save(user);
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            return null;
        }

        return user;
    }
}
