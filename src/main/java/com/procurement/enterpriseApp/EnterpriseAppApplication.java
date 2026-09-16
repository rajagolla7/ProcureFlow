package com.procurement.enterpriseApp;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.procurement.enterpriseApp.model.Role;
import com.procurement.enterpriseApp.model.User;
import com.procurement.enterpriseApp.repository.UserRepository;

@SpringBootApplication
public class EnterpriseAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(EnterpriseAppApplication.class, args);
    }

    @Bean
    CommandLineRunner createAdmin(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder) {

        return args -> {

            String adminEmail = "rajagolla07@gmail.com";

            // Check whether admin already exists
            if (!userRepository.existsByEmail(adminEmail)) {

                User admin = new User();

                admin.setName("System Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setPhoneNumber("9999999999");
                admin.setDesignation("Administrator");
                admin.setRole(Role.ADMIN);

                userRepository.save(admin);

                System.out.println("=================================");
                System.out.println("ADMIN ACCOUNT CREATED");
                System.out.println("Email: rajagolla07@gmail.com");
                System.out.println("Password: Admin@123");
                System.out.println("Role: ADMIN");
                System.out.println("=================================");

            } else {

                System.out.println("=================================");
                System.out.println("ADMIN ACCOUNT ALREADY EXISTS");
                System.out.println("Email: admin@procurement.com");
                System.out.println("=================================");
            }
        };
    }
}