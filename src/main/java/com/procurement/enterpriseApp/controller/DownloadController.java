package com.procurement.enterpriseApp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.procurement.enterpriseApp.model.Request;
import com.procurement.enterpriseApp.service.RequestService;
import com.procurement.enterpriseApp.model.RequestStatus;

@RestController
@RequestMapping("/api/download")
public class DownloadController {

    @Autowired
    private RequestService requestService;


    // =====================================================
    // GET USER REQUESTS
    // =====================================================

    @GetMapping("/user/{userId}")
    public List<Request> getUserRequests(
            @PathVariable int userId) {

        return requestService.getUserRequests(userId);
    }


    // =====================================================
    // DOWNLOAD USER REQUESTS AS JSON
    // =====================================================

    @GetMapping("/user/{userId}/json")
    public ResponseEntity<List<Request>> downloadUserRequestsJson(
            @PathVariable int userId) {

        List<Request> requests =
                requestService.getUserRequests(userId);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=user-requests.json"
                )
                .contentType(MediaType.APPLICATION_JSON)
                .body(requests);
    }
 // =====================================================
 // DOWNLOAD USER REQUESTS AS CSV
 // =====================================================

 @GetMapping("/user/{userId}/csv")
 public ResponseEntity<byte[]> downloadUserRequestsCsv(
         @PathVariable int userId) {

     List<Request> requests =
             requestService.getUserRequests(userId);

     StringBuilder csv = new StringBuilder();

     // CSV header
     csv.append("Request ID,Product Name,Price Per Product,")
        .append("Quantity,Total Price,Description,Status,")
        .append("Payment Status,Created Date\n");

     // CSV data
     for (Request request : requests) {

         csv.append(request.getRequestId()).append(",")
            .append(escapeCsv(request.getProductName())).append(",")
            .append(request.getPricePerProduct()).append(",")
            .append(request.getNumberOfQuantities()).append(",")
            .append(request.getTotalPrice()).append(",")
            .append(escapeCsv(request.getDescription())).append(",")
            .append(request.getStatus()).append(",")
            .append(request.getPaymentStatus()).append(",")
            .append(request.getCreatedDate())
            .append("\n");
     }

     byte[] csvBytes =
             csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

     return ResponseEntity.ok()
             .header(
                     HttpHeaders.CONTENT_DISPOSITION,
                     "attachment; filename=user-requests.csv"
             )
             .contentType(MediaType.parseMediaType("text/csv"))
             .body(csvBytes);
 }


 // =====================================================
 // ESCAPE CSV VALUES
 // =====================================================

 private String escapeCsv(String value) {

     if (value == null) {
         return "";
     }

     if (value.contains(",")
             || value.contains("\"")
             || value.contains("\n")) {

         return "\"" + value.replace("\"", "\"\"") + "\"";
     }

     return value;
 }
//=====================================================
//DOWNLOAD USER REQUESTS AS XML
//=====================================================

@GetMapping("/user/{userId}/xml")
public ResponseEntity<byte[]> downloadUserRequestsXml(
      @PathVariable int userId) {

  List<Request> requests =
          requestService.getUserRequests(userId);

  StringBuilder xml = new StringBuilder();

  xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
  xml.append("<requests>\n");

  for (Request request : requests) {

      xml.append("    <request>\n");

      xml.append("        <requestId>")
         .append(request.getRequestId())
         .append("</requestId>\n");

      xml.append("        <productName>")
         .append(escapeXml(request.getProductName()))
         .append("</productName>\n");

      xml.append("        <pricePerProduct>")
         .append(request.getPricePerProduct())
         .append("</pricePerProduct>\n");

      xml.append("        <numberOfQuantities>")
         .append(request.getNumberOfQuantities())
         .append("</numberOfQuantities>\n");

      xml.append("        <totalPrice>")
         .append(request.getTotalPrice())
         .append("</totalPrice>\n");

      xml.append("        <description>")
         .append(escapeXml(request.getDescription()))
         .append("</description>\n");

      xml.append("        <status>")
         .append(request.getStatus())
         .append("</status>\n");

      xml.append("        <paymentStatus>")
         .append(request.getPaymentStatus())
         .append("</paymentStatus>\n");

      xml.append("        <createdDate>")
         .append(request.getCreatedDate())
         .append("</createdDate>\n");

      xml.append("    </request>\n");
  }

  xml.append("</requests>");

  byte[] xmlBytes =
          xml.toString()
             .getBytes(java.nio.charset.StandardCharsets.UTF_8);

  return ResponseEntity.ok()
          .header(
                  HttpHeaders.CONTENT_DISPOSITION,
                  "attachment; filename=user-requests.xml"
          )
          .contentType(MediaType.APPLICATION_XML)
          .body(xmlBytes);
}


//=====================================================
//ESCAPE XML VALUES
//=====================================================

private String escapeXml(String value) {

  if (value == null) {
      return "";
  }

  return value
          .replace("&", "&amp;")
          .replace("<", "&lt;")
          .replace(">", "&gt;")
          .replace("\"", "&quot;")
          .replace("'", "&apos;");
}
//=====================================================
//DOWNLOAD ADMIN APPROVED REQUESTS AS JSON
//=====================================================

@GetMapping("/admin/approved/json")
public ResponseEntity<List<Request>> downloadApprovedRequestsJson() {

 List<Request> allRequests =
         requestService.getAllRequests();

 List<Request> approvedRequests =
         allRequests.stream()
                 .filter(request ->
                         request.getStatus() == RequestStatus.APPROVED)
                 .toList();

 return ResponseEntity.ok()
         .header(
                 HttpHeaders.CONTENT_DISPOSITION,
                 "attachment; filename=admin-approved-requests.json"
         )
         .contentType(MediaType.APPLICATION_JSON)
         .body(approvedRequests);
}
//=====================================================
//DOWNLOAD ADMIN APPROVED REQUESTS AS CSV
//=====================================================

@GetMapping("/admin/approved/csv")
public ResponseEntity<byte[]> downloadApprovedRequestsCsv() {

 List<Request> allRequests =
         requestService.getAllRequests();

 StringBuilder csv = new StringBuilder();

 // CSV header
 csv.append("Request ID,Product Name,Price Per Product,")
    .append("Quantity,Total Price,Description,Status,")
    .append("Payment Status,Created Date,User Email\n");

 // Add only approved requests
 for (Request request : allRequests) {

     if (request.getStatus() == RequestStatus.APPROVED) {

         String userEmail = "";

         if (request.getUser() != null) {
             userEmail = request.getUser().getEmail();
         }

         csv.append(request.getRequestId()).append(",")
            .append(escapeCsv(request.getProductName())).append(",")
            .append(request.getPricePerProduct()).append(",")
            .append(request.getNumberOfQuantities()).append(",")
            .append(request.getTotalPrice()).append(",")
            .append(escapeCsv(request.getDescription())).append(",")
            .append(request.getStatus()).append(",")
            .append(request.getPaymentStatus()).append(",")
            .append(request.getCreatedDate()).append(",")
            .append(escapeCsv(userEmail))
            .append("\n");
     }
 }

 byte[] csvBytes =
         csv.toString()
            .getBytes(java.nio.charset.StandardCharsets.UTF_8);

 return ResponseEntity.ok()
         .header(
                 HttpHeaders.CONTENT_DISPOSITION,
                 "attachment; filename=admin-approved-requests.csv"
         )
         .contentType(MediaType.parseMediaType("text/csv"))
         .body(csvBytes);
}
//=====================================================
//DOWNLOAD ADMIN APPROVED REQUESTS AS XML
//=====================================================

@GetMapping("/admin/approved/xml")
public ResponseEntity<byte[]> downloadApprovedRequestsXml() {

 List<Request> allRequests =
         requestService.getAllRequests();

 StringBuilder xml = new StringBuilder();

 xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
 xml.append("<approvedRequests>\n");

 for (Request request : allRequests) {

     if (request.getStatus() == RequestStatus.APPROVED) {

         xml.append("    <request>\n");

         xml.append("        <requestId>")
            .append(request.getRequestId())
            .append("</requestId>\n");

         xml.append("        <productName>")
            .append(escapeXml(request.getProductName()))
            .append("</productName>\n");

         xml.append("        <pricePerProduct>")
            .append(request.getPricePerProduct())
            .append("</pricePerProduct>\n");

         xml.append("        <numberOfQuantities>")
            .append(request.getNumberOfQuantities())
            .append("</numberOfQuantities>\n");

         xml.append("        <totalPrice>")
            .append(request.getTotalPrice())
            .append("</totalPrice>\n");

         xml.append("        <description>")
            .append(escapeXml(request.getDescription()))
            .append("</description>\n");

         xml.append("        <status>")
            .append(request.getStatus())
            .append("</status>\n");

         xml.append("        <paymentStatus>")
            .append(request.getPaymentStatus())
            .append("</paymentStatus>\n");

         xml.append("        <createdDate>")
            .append(request.getCreatedDate())
            .append("</createdDate>\n");

         if (request.getUser() != null) {

             xml.append("        <userEmail>")
                .append(escapeXml(request.getUser().getEmail()))
                .append("</userEmail>\n");
         }

         xml.append("    </request>\n");
     }
 }

 xml.append("</approvedRequests>");

 byte[] xmlBytes =
         xml.toString()
            .getBytes(java.nio.charset.StandardCharsets.UTF_8);

 return ResponseEntity.ok()
         .header(
                 HttpHeaders.CONTENT_DISPOSITION,
                 "attachment; filename=admin-approved-requests.xml"
         )
         .contentType(MediaType.APPLICATION_XML)
         .body(xmlBytes);
}
}