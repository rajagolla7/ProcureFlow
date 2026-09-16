package com.procurement.enterpriseApp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;


    // =====================================================
    // 1. REGISTRATION EMAIL
    // =====================================================

    public void sendRegistrationMail(String toEmail) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Registration Successful");

        message.setText(
                "Welcome to Procurement Management System.\n\n"
                + "Your account has been created successfully.\n"
                + "You can now login to the system."
        );

        mailSender.send(message);
    }


    // =====================================================
    // 2. NEW REQUEST EMAIL TO USER
    // =====================================================

    public void sendRequestCreatedToUser(
            String userEmail,
            int requestId,
            String productName) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(userEmail);

        message.setSubject("Procurement Request Submitted");

        message.setText(
                "Hello,\n\n"
                + "Your procurement request has been successfully submitted.\n\n"
                + "Request ID: " + requestId + "\n"
                + "Product: " + productName + "\n"
                + "Status: PENDING\n\n"
                + "Your request is now waiting for admin approval.\n\n"
                + "Regards,\n"
                + "Procurement Management System"
        );

        mailSender.send(message);
    }


    // =====================================================
    // 3. NEW REQUEST EMAIL TO ADMIN
    // =====================================================

    public void sendRequestCreatedToAdmin(
            String adminEmail,
            int requestId,
            String userEmail,
            String productName) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(adminEmail);

        message.setSubject("New Procurement Request");

        message.setText(
                "Hello Admin,\n\n"
                + "A new procurement request has been submitted.\n\n"
                + "Request ID: " + requestId + "\n"
                + "User Email: " + userEmail + "\n"
                + "Product: " + productName + "\n"
                + "Status: PENDING\n\n"
                + "Please login to the admin panel to review the request.\n\n"
                + "Regards,\n"
                + "Procurement Management System"
        );

        mailSender.send(message);
    }


   
 // =====================================================
 //4, APPROVED EMAIL TO USER
 // =====================================================

 public void sendRequestApprovedMail(
         String userEmail,
         int requestId,
         String productName,
         String adminName,
         String adminEmail) {

     SimpleMailMessage message =
             new SimpleMailMessage();

     message.setTo(userEmail);

     message.setSubject(
             "Procurement Request Approved"
     );

     message.setText(
             "Hello,\n\n"

             + "Your procurement request has been "
             + "APPROVED by the administrator.\n\n"

             + "Request ID: "
             + requestId + "\n"

             + "Product: "
             + productName + "\n"

             + "Status: APPROVED\n\n"

             + "Approved by:\n"

             + adminName + "\n"

             + adminEmail + "\n\n"

             + "Please login to the Procurement Management System "
             + "for more details.\n\n"

             + "Regards,\n"
             + "Procurement Management System"
     );

     mailSender.send(message);
 }

    // =====================================================
    // 5. REJECTED EMAIL TO USER
    // =====================================================

    public void sendRequestRejectedMail(
            String userEmail,
            int requestId,
            String productName) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(userEmail);

        message.setSubject("Procurement Request Rejected");

        message.setText(
                "Hello,\n\n"
                + "Your procurement request has been REJECTED.\n\n"
                + "Request ID: " + requestId + "\n"
                + "Product: " + productName + "\n"
                + "Status: REJECTED\n\n"
                + "Please login to the Procurement Management System "
                + "for more details.\n\n"
                + "Regards,\n"
                + "Procurement Management System"
        );

        mailSender.send(message);
    }
 // =====================================================
 // 6. PAYMENT COMPLETED EMAIL TO ADMIN
 // =====================================================

 public void sendPaymentCompletedToAdmin(
         String adminEmail,
         int requestId,
         String productName,
         double amount) {

     SimpleMailMessage message = new SimpleMailMessage();

     message.setTo(adminEmail);

     message.setSubject("Payment Completed");

     message.setText(
             "Hello Admin,\n\n"
             + "Payment has been successfully completed for a procurement request.\n\n"
             + "Request ID: " + requestId + "\n"
             + "Product: " + productName + "\n"
             + "Amount Paid: ₹" + amount + "\n"
             + "Payment Status: COMPLETED\n\n"
             + "Regards,\n"
             + "Procurement Management System"
     );

     mailSender.send(message);
 }


 // =====================================================
 // 7. PAYMENT COMPLETED EMAIL TO SUPPLIER
 // =====================================================

 public void sendPaymentCompletedToSupplier(
         String supplierEmail,
         int requestId,
         String productName,
         double amount) {

     SimpleMailMessage message = new SimpleMailMessage();

     message.setTo(supplierEmail);

     message.setSubject(
             "New Paid Procurement Order - Request "
             + requestId
     );

     message.setText(
             "Hello Supplier,\n\n"
             + "A procurement order for your assigned product has been paid by the administrator.\n\n"
             + "Request ID: " + requestId + "\n"
             + "Product: " + productName + "\n"
             + "Amount Paid: ₹" + amount + "\n"
             + "Payment Status: COMPLETED\n\n"
             + "Please login to ProcureFlow to accept/dispatch the order and update shipping status.\n\n"
             + "Regards,\n"
             + "Procurement Management System"
     );

     mailSender.send(message);
 }

 // =====================================================
 // 7. PAYMENT COMPLETED EMAIL TO USER
 // =====================================================

 public void sendPaymentCompletedToUser(
         String userEmail,
         int requestId,
         String productName,
         double amount) {

     SimpleMailMessage message = new SimpleMailMessage();

     message.setTo(userEmail);

     message.setSubject("Payment Completed");

     message.setText(
             "Hello,\n\n"
             + "Payment for your procurement request has been completed by the administrator.\n\n"
             + "Request ID: " + requestId + "\n"
             + "Product: " + productName + "\n"
             + "Amount Paid: ₹" + amount + "\n"
             + "Payment Status: COMPLETED\n\n"
             + "Your procurement request will proceed to the supplier and transportation stage.\n\n"
             + "Regards,\n"
             + "Procurement Management System"
     );

     mailSender.send(message);
 }
 public void sendShippingUpdateToUser(
	        String email,
	        int requestId,
	        String productName,
	        String supplierEmail,
	        String status,
	        String location,
	        String supplierName,
	        String supplierPhone,
	        String supplierAddress) {

	    SimpleMailMessage message =
	            new SimpleMailMessage();

	    message.setTo(email);

        if (supplierEmail != null && !supplierEmail.trim().isEmpty()) {
            message.setReplyTo(supplierEmail.trim());
        }

	    message.setSubject(
	            "Shipping Update - Request "
	            + requestId
	    );

	    message.setText(
	            "Hello,\n\n"
	            + "Your product shipping has been updated.\n\n"

	            + "Request ID: "
	            + requestId + "\n"

	            + "Product: "
	            + productName + "\n"

	            + "Shipping Status: "
	            + status + "\n"

	            + "Current Location: "
	            + location + "\n\n"

	            + "Supplier Details:\n"

	            + "Name: "
	            + supplierName + "\n"

	            + "Phone: "
	            + supplierPhone + "\n"

	            + "Address: "
	            + supplierAddress + "\n\n"

	            + "Regards,\n"
	            + "Procurement Management System"
	    );

	    mailSender.send(message);
	}
 public void sendShippingUpdateToAdmin(
	        String email,
	        int requestId,
	        String productName,
	        String supplierEmail,
	        String status,
	        String location) {

	    SimpleMailMessage message =
	            new SimpleMailMessage();

	    message.setTo(email);

        if (supplierEmail != null && !supplierEmail.trim().isEmpty()) {
            message.setReplyTo(supplierEmail.trim());
        }

	    message.setSubject(
	            "Shipping Update - Request "
	            + requestId
	    );

	    message.setText(
	            "Hello Admin,\n\n"
	            + "Shipping has been updated.\n\n"

	            + "Request ID: "
	            + requestId + "\n"

	            + "Product: "
	            + productName + "\n"

	            + "Shipping Status: "
	            + status + "\n"

	            + "Current Location: "
	            + location + "\n\n"

	            + "Regards,\n"
	            + "Procurement Management System"
	    );

	    mailSender.send(message);
	}
 public void sendShippingUpdateToSupplier(
	        String email,
	        int requestId,
	        String productName,
	        String supplierEmail,
	        String status,
	        String location) {

	    SimpleMailMessage message =
	            new SimpleMailMessage();

	    message.setTo(email);

        if (supplierEmail != null && !supplierEmail.trim().isEmpty()) {
            message.setReplyTo(supplierEmail.trim());
        }

	    message.setSubject(
	            "Shipping Status Recorded - Request "
	            + requestId
	    );

	    message.setText(
	            "Hello Supplier,\n\n"
	            + "The shipping status has been recorded.\n\n"

	            + "Request ID: "
	            + requestId + "\n"

	            + "Product: "
	            + productName + "\n"

	            + "Shipping Status: "
	            + status + "\n"

	            + "Current Location: "
	            + location + "\n\n"

	            + "Regards,\n"
	            + "Procurement Management System"
	    );

	    mailSender.send(message);
	}
}