package com.procurement.enterpriseApp.service;
import com.procurement.enterpriseApp.model.Product;
import com.procurement.enterpriseApp.model.Supplier;
import com.procurement.enterpriseApp.repository.ProductRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.procurement.enterpriseApp.model.Request;
import com.procurement.enterpriseApp.model.RequestStatus;
import com.procurement.enterpriseApp.model.PaymentStatus;
import com.procurement.enterpriseApp.model.Role;
import com.procurement.enterpriseApp.model.User;
import com.procurement.enterpriseApp.repository.RequestRepository;
import com.procurement.enterpriseApp.repository.UserRepository;
import com.procurement.enterpriseApp.repository.SupplierRepository;
import java.time.LocalDateTime;

import com.procurement.enterpriseApp.model.Payment;
import com.procurement.enterpriseApp.model.PaymentStatus;
import com.procurement.enterpriseApp.repository.PaymentRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.procurement.enterpriseApp.model.Shipment;
import com.procurement.enterpriseApp.model.ShippingStatus;
import com.procurement.enterpriseApp.repository.ShipmentRepository;
@Service
public class RequestService {

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ShipmentRepository shipmentRepository;


    // CREATE REQUEST
 // =====================================================
 // CREATE REQUEST
 // =====================================================

 public Request createRequest(
         int userId,
         Request request) {

     // -----------------------------------------
     // Find user
     // -----------------------------------------

     User user =
             userRepository.findById(userId)
                     .orElse(null);

     if (user == null) {

         return null;
     }


     // -----------------------------------------
     // Find product from catalog
     // -----------------------------------------

     Product product =
             productRepository
                     .findByNameIgnoreCase(
                             request.getProductName()
                     )
                     .orElse(null);


     if (product == null) {

         throw new IllegalArgumentException(
                 "Product not found: "
                 + request.getProductName()
         );
     }


     // -----------------------------------------
     // Get ACTUAL price from product catalog
     // -----------------------------------------
     // Never trust the price sent by frontend.
     // -----------------------------------------

     double actualProductPrice =
             product.getPricePerProduct();


     if (actualProductPrice <= 0) {

         throw new IllegalStateException(
                 "The selected product does not have a valid price."
         );
     }


     // -----------------------------------------
     // Validate quantity
     // -----------------------------------------

     if (
             request.getNumberOfQuantities()
             <= 0
     ) {

         throw new IllegalArgumentException(
                 "Quantity must be greater than zero."
         );
     }


     // -----------------------------------------
     // Check available product stock
     // -----------------------------------------

     int availableStock =
             product.getNumberOfQuantities();

     if (availableStock <= 0) {
         throw new IllegalStateException(
                 "Product is currently out of stock: "
                 + product.getName()
         );
     }

     if (request.getNumberOfQuantities() > availableStock) {
         throw new IllegalArgumentException(
                 "Only " + availableStock
                 + " pieces are available for "
                 + product.getName()
         );
     }


     // -----------------------------------------
     // Find supplier
     // -----------------------------------------

     Supplier supplier =
             supplierRepository
                     .findByProduct_ProductId(
                             product.getProductId()
                     )
                     .orElse(null);


     if (supplier == null) {

         throw new IllegalStateException(
                 "No supplier is configured for product: "
                 + product.getName()
         );
     }


     // -----------------------------------------
     // Connect request with user
     // -----------------------------------------

     request.setUser(user);


     // -----------------------------------------
     // Connect request with product
     // -----------------------------------------

     request.setProduct(product);


     // -----------------------------------------
     // Connect request with supplier
     // -----------------------------------------

     request.setSupplier(supplier);


     // -----------------------------------------
     // IMPORTANT:
     // Always use actual product price
     // -----------------------------------------

     request.setPricePerProduct(
             actualProductPrice
     );


     // -----------------------------------------
     // Calculate total using actual price
     // -----------------------------------------

     request.setTotalPrice(
             actualProductPrice
             * request.getNumberOfQuantities()
     );


     // -----------------------------------------
     // Save request
     // -----------------------------------------

     Request savedRequest =
             requestRepository.save(request);


     // -----------------------------------------
     // Send email to USER
     // -----------------------------------------

     if (
             user.getEmail() != null
     ) {

         emailService.sendRequestCreatedToUser(
                 user.getEmail(),
                 savedRequest.getRequestId(),
                 savedRequest.getProductName()
         );
     }


     // -----------------------------------------
     // Find ADMIN
     // -----------------------------------------

     User admin =
             userRepository.findAll()
                     .stream()
                     .filter(
                             u ->
                             u.getRole() == Role.ADMIN
                     )
                     .findFirst()
                     .orElse(null);


     // -----------------------------------------
     // Send email to ADMIN
     // -----------------------------------------

     if (
             admin != null &&
             admin.getEmail() != null
     ) {

         emailService.sendRequestCreatedToAdmin(
                 admin.getEmail(),
                 savedRequest.getRequestId(),
                 user.getEmail(),
                 savedRequest.getProductName()
         );
     }


     // -----------------------------------------
     // Return saved request
     // -----------------------------------------

     return savedRequest;
 }

//=====================================================
//PROCESS PAYMENT
//=====================================================

public Payment processPayment(
        int requestId,
        com.procurement.enterpriseApp.model.PaymentRequest paymentRequest) {

    // -------------------------------------------------
    // 1. Find request
    // -------------------------------------------------

    Request request =
            requestRepository
                    .findById(requestId)
                    .orElse(null);

    if (request == null) {
        return null;
    }

    // -------------------------------------------------
    // 2. Payment is allowed only after approval
    // -------------------------------------------------

    if (request.getStatus() != RequestStatus.APPROVED) {
        return null;
    }

    // -------------------------------------------------
    // 3. Prevent duplicate payment
    // -------------------------------------------------

    if (request.getPaymentStatus() == PaymentStatus.PAID) {
        return null;
    }

    // -------------------------------------------------
    // 4. Validate payment form
    // -------------------------------------------------

    if (paymentRequest == null) {
        throw new IllegalArgumentException(
                "Payment details are required."
        );
    }

    String method = paymentRequest.getPaymentMethod();

    if (method == null || method.trim().isEmpty()) {
        throw new IllegalArgumentException(
                "Please select a payment method."
        );
    }

    method = method.trim().toUpperCase();

    if (!method.equals("UPI")
            && !method.equals("CARD")
            && !method.equals("UPI_QR")) {

        throw new IllegalArgumentException(
                "Invalid payment method."
        );
    }

    String holder =
            paymentRequest.getAccountHolderName();

    if (holder == null || holder.trim().isEmpty()) {
        throw new IllegalArgumentException(
                "Account holder name is required."
        );
    }

    // -------------------------------------------------
    // 5. Demo UPI PIN verification
    //
    // The PIN is NEVER stored in the database.
    // For this project demo, any 4 or 6 digit PIN
    // is accepted and only pinVerified=true is saved.
    // -------------------------------------------------

    boolean pinVerified = false;

    if (method.equals("UPI")) {

        String upiId = paymentRequest.getUpiId();
        String pin = paymentRequest.getUpiPin();

        if (upiId == null || upiId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "UPI ID is required."
            );
        }

        if (pin == null || !pin.matches("\\d{4}|\\d{6}")) {
            throw new IllegalArgumentException(
                    "Enter a demo UPI PIN of 4 or 6 digits."
            );
        }

        pinVerified = true;
    }

    if (method.equals("UPI_QR")) {

        if (!paymentRequest.isQrScanned()) {
            throw new IllegalArgumentException(
                    "Please confirm that the demo QR was scanned."
            );
        }

        pinVerified = true;
    }

    if (method.equals("CARD")) {

        String last4 = paymentRequest.getCardLast4();

        if (last4 == null || !last4.matches("\\d{4}")) {
            throw new IllegalArgumentException(
                    "Enter a valid 16 digit demo card number."
            );
        }
    }

    // -------------------------------------------------
    // 6. Find ADMIN from database
    // -------------------------------------------------

    User admin =
            userRepository
                    .findAll()
                    .stream()
                    .filter(user ->
                            user.getRole() == Role.ADMIN)
                    .findFirst()
                    .orElse(null);

    if (admin == null) {
        return null;
    }

    String adminEmail = admin.getEmail();

    if (adminEmail == null ||
        adminEmail.trim().isEmpty()) {
        return null;
    }

    // -------------------------------------------------
    // 7. Create payment using the request's REAL total
    //
    // Amount is NEVER accepted from the frontend.
    // It comes from request.totalPrice, which is already
    // calculated from product price × requested quantity.
    // -------------------------------------------------

    Payment payment = new Payment();

    payment.setRequest(request);
    payment.setAmount(request.getTotalPrice());
    payment.setStatus(PaymentStatus.PAID);
    payment.setPaymentDate(LocalDateTime.now());
    payment.setPaidByAdminEmail(adminEmail);

    payment.setPaymentMethod(method);
    payment.setAccountHolderName(holder.trim());
    payment.setBankName(paymentRequest.getBankName());
    payment.setIfsc(paymentRequest.getIfsc());
    payment.setPinVerified(pinVerified);

    String accountNumber =
            paymentRequest.getDemoAccountNumber();

    if (accountNumber != null &&
        !accountNumber.trim().isEmpty()) {

        String cleanAccount =
                accountNumber.replaceAll("\\s+", "");

        if (!cleanAccount.matches("\\d{8,16}")) {
            throw new IllegalArgumentException(
                    "Demo account number must contain 8 to 16 digits."
            );
        }

        payment.setAccountLast4(
                cleanAccount.substring(
                        cleanAccount.length() - 4
                )
        );
    }

    if (paymentRequest.getUpiId() != null) {
        payment.setUpiId(
                paymentRequest.getUpiId().trim()
        );
    }

    payment.setTransactionReference(
            "PF-DEMO-" + System.currentTimeMillis()
    );

    // -------------------------------------------------
    // 8. Save payment
    // -------------------------------------------------

    Payment savedPayment =
            paymentRepository.save(payment);

    // -------------------------------------------------
    // 9. Update request payment status
    // -------------------------------------------------

    request.setPaymentStatus(PaymentStatus.PAID);
    requestRepository.save(request);

    // -------------------------------------------------
    // 10. Notify the USER who created the request
    // -------------------------------------------------

    User user = request.getUser();

    if (user != null &&
        user.getEmail() != null &&
        !user.getEmail().trim().isEmpty()) {

        emailService.sendPaymentCompletedToUser(
                user.getEmail(),
                request.getRequestId(),
                request.getProductName(),
                request.getTotalPrice()
        );
    }

    // -------------------------------------------------
    // 11. Notify ADMIN
    // -------------------------------------------------

    emailService.sendPaymentCompletedToAdmin(
            adminEmail,
            request.getRequestId(),
            request.getProductName(),
            request.getTotalPrice()
    );

    // -------------------------------------------------
    // 12. NOTIFY THE CORRECT SUPPLIER
    // -------------------------------------------------
    // The supplier is determined from the product ordered.
    // Therefore only the supplier handling that product is
    // notified about this paid order.

    Supplier supplier = request.getSupplier();

    // Backward compatibility for older requests that may not
    // have request.supplier populated yet.
    if (supplier == null && request.getProduct() != null) {

        supplier = supplierRepository
                .findByProduct_ProductId(
                        request.getProduct().getProductId()
                )
                .orElse(null);

        if (supplier != null) {
            request.setSupplier(supplier);
            requestRepository.save(request);
        }
    }

    if (supplier != null &&
        supplier.getEmail() != null &&
        !supplier.getEmail().trim().isEmpty()) {

        try {
            emailService.sendPaymentCompletedToSupplier(
                    supplier.getEmail(),
                    request.getRequestId(),
                    request.getProductName(),
                    request.getTotalPrice()
            );
        } catch (Exception e) {
            System.out.println(
                    "Supplier payment notification failed: "
                    + e.getMessage()
            );
        }
    }

    return savedPayment;
}

    // GET USER REQUESTS
    public List<Request> getUserRequests(int userId) {

        return requestRepository.findByUserUserId(userId);
    }
 // =========================================
 // GET DELIVERED REQUESTS FOR USER
 // =========================================

 public List<Map<String, Object>> getDeliveredRequests(
         int userId) {

     List<Map<String, Object>> deliveredProducts =
             new ArrayList<>();

     List<Request> requests =
             requestRepository.findByUserUserId(userId);

     for (Request request : requests) {

         Shipment shipment =
                 shipmentRepository
                 .findByRequest_RequestId(
                         request.getRequestId()
                 )
                 .orElse(null);

         if (shipment == null) {
             continue;
         }

         if (shipment.getStatus()
                 != ShippingStatus.DELIVERED) {

             continue;
         }

         Map<String, Object> product =
                 new HashMap<>();

         product.put(
                 "requestId",
                 request.getRequestId()
         );

         product.put(
                 "productName",
                 request.getProductName()
         );

         product.put(
                 "deliveredDate",
                 shipment.getLastUpdated()
         );

         product.put(
                 "status",
                 "DELIVERED"
         );

         deliveredProducts.add(product);
     }

     return deliveredProducts;
 }


    // GET ALL REQUESTS - ADMIN
    public List<Request> getAllRequests() {

        return requestRepository.findAll();
    }


    // UPDATE REQUEST STATUS
    public Request updateRequestStatus(
            int requestId,
            RequestStatus status) {

        Request request = requestRepository
                .findById(requestId)
                .orElse(null);

        if (request == null) {
            return null;
        }

        request.setStatus(status);

         	

        // APPROVED EMAIL

        if (status == RequestStatus.APPROVED) {

            // Payment becomes available after approval
            request.setPaymentStatus(
                    PaymentStatus.PENDING
            );

            // Find the administrator who approved it
            User admin =
                    userRepository
                            .findAll()
                            .stream()
                            .filter(user ->
                                    user.getRole() == Role.ADMIN)
                            .findFirst()
                            .orElse(null);

            // Find the user who created the request
            User user = request.getUser();

            if (user != null &&
                user.getEmail() != null &&
                admin != null &&
                admin.getEmail() != null) {

                String adminName = admin.getName();

                if (adminName == null ||
                    adminName.trim().isEmpty()) {

                    adminName = "System Administrator";
                }

                emailService.sendRequestApprovedMail(
                        user.getEmail(),
                        request.getRequestId(),
                        request.getProductName(),
                        adminName,
                        admin.getEmail()
                );
            }
        }

        // REJECTED EMAIL

        if (status == RequestStatus.REJECTED) {

            User user = request.getUser();

            if (user != null && user.getEmail() != null) {

                emailService.sendRequestRejectedMail(
                        user.getEmail(),
                        request.getRequestId(),
                        request.getProductName()
                );
            }
        }


        return requestRepository.save(request);
    }


    public RequestRepository getRequestRepository() {

        return requestRepository;
    }


    public void setRequestRepository(
            RequestRepository requestRepository) {

        this.requestRepository = requestRepository;
    }


    public UserRepository getUserRepository() {

        return userRepository;
    }


    public void setUserRepository(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }


    public EmailService getEmailService() {

        return emailService;
    }


    public void setEmailService(
            EmailService emailService) {

        this.emailService = emailService;
    }
}