# ProcureFlow -- Smart Procurement Management System

## Overview

**ProcureFlow** is a web-based procurement management system designed to
digitize and simplify the complete procurement lifecycle.

The system connects three main roles:

-   **User** -- creates procurement requests, views requests and
    products, tracks orders, downloads documents, manages profile
    information, and submits ratings.
-   **Admin** -- monitors procurement operations, reviews requests,
    manages products and payments, and monitors procurement activity.
-   **Supplier** -- views assigned paid orders, manages shipping
    updates, manages inventory, views ratings, and manages supplier
    profile information.

The procurement flow is:

**Request → Approval → Payment → Supplier → Shipping → Tracking →
Delivery → Rating**

## Main Features

### User Module

-   User registration and login
-   User dashboard with procurement statistics
-   Create procurement requests
-   View personal requests
-   View product catalog
-   View product price and available quantity
-   View product department, category, and status
-   Track procurement orders
-   View shipment status and current location
-   View/download procurement documents
-   Manage user profile
-   Submit ratings after delivery

### Admin Module

-   Admin login and dashboard
-   View procurement statistics
-   Review submitted requests
-   Approve or reject requests
-   Process approved payments
-   View and manage the product catalog
-   View procurement operations
-   View customer ratings
-   Monitor shipment/tracking information

### Supplier Module

-   Supplier login and dashboard
-   View assigned paid orders
-   Accept and dispatch orders
-   Update shipment status
-   Update current shipment location
-   Track shipment progress
-   Manage inventory
-   View ratings
-   Manage supplier profile

## Shipment Tracking

ProcureFlow supports the shipment lifecycle:

1.  **ORDER DISPATCHED**
2.  **IN TRANSIT**
3.  **OUT FOR DELIVERY**
4.  **DELIVERED**

Shipment information includes the request, supplier, status, current
location, tracking number, and last updated time.

## Notifications

ProcureFlow includes email notifications for important procurement
events.

Notifications are handled through the application's `EmailService` using
Spring Boot's `JavaMailSender` and SMTP.

Notification events include:

-   User registration
-   Procurement request creation
-   Request approval
-   Request rejection
-   Payment completion
-   Shipping status updates

Notification flow:

``` text
Controller
    ↓
Service
    ↓
EmailService
    ↓
JavaMailSender
    ↓
SMTP Server
    ↓
Recipient Email
```

## Security

The application uses Spring Security as part of its security
configuration.

### Password Protection

Passwords are protected using **BCrypt**.

``` text
Plain Password
      ↓
BCrypt Password Encoder
      ↓
Hashed Password
      ↓
Database
```

During login, the entered password is compared with the stored BCrypt
hash.

The frontend also maintains the logged-in user's session information
using browser `sessionStorage`.

### JWT

JWT (JSON Web Token) is a token-based authentication approach. It can be
used to issue a signed token after successful authentication and send
that token with subsequent API requests.

**Note:** The current ProcureFlow implementation does not use JWT
authentication. The current implementation uses BCrypt password hashing
and frontend session state.

## Technology Stack

### Frontend

-   HTML5
-   CSS3
-   JavaScript
-   Responsive dashboard UI
-   REST API integration using JavaScript `fetch`

### Backend

-   Java
-   Spring Boot
-   Spring Web
-   Spring Data JPA
-   Spring Security
-   BCrypt Password Encoder
-   JavaMailSender

### Database

-   MySQL
-   MySQL Workbench

### Build Tool

-   Apache Maven

## System Architecture

``` text
┌───────────────────────────────────────┐
│              Frontend                 │
│       HTML + CSS + JavaScript         │
└───────────────────┬───────────────────┘
                    │
                    │ REST API
                    ▼
┌───────────────────────────────────────┐
│          Spring Boot Backend          │
│                                       │
│ Controllers                           │
│ Services                              │
│ Repositories                          │
│ Models / Entities                     │
│ Spring Security                       │
│ Email Service                         │
└───────────────────┬───────────────────┘
                    │
                    │ JPA
                    ▼
┌───────────────────────────────────────┐
│               MySQL                   │
│                                       │
│ Users                                 │
│ Products                              │
│ Departments / Categories              │
│ Requests                              │
│ Payments                              │
│ Shipments                             │
│ Ratings                               │
│ Suppliers                             │
└───────────────────────────────────────┘
```

## Project Structure

``` text
EnterpriseApp/
│
├── frontend/
│   ├── admin-dashboard.html
│   ├── supplier-dashboard.html
│   ├── user-dashboard.html
│   ├── login.html
│   ├── register.html
│   ├── role-selection.html
│   ├── new-request.html
│   ├── payment.html
│   ├── css/
│   └── js/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/procurement/enterpriseApp/
│       │       ├── config/
│       │       ├── controller/
│       │       ├── model/
│       │       ├── repository/
│       │       └── service/
│       │
│       └── resources/
│
├── pom.xml
├── mvnw
├── mvnw.cmd
└── .gitignore
```

## Core Procurement Workflow

``` text
User
 │
 │ Create Request
 ▼
Procurement Request
 │
 ▼
Admin Review
 │
 ├───────────────┐
 │               │
 ▼               ▼
Approved       Rejected
 │
 ▼
Payment
 │
 ▼
Supplier
 │
 ▼
Order Dispatch
 │
 ▼
In Transit
 │
 ▼
Out for Delivery
 │
 ▼
Delivered
 │
 ▼
User Rating
```

## Database Relationships

Important relationships include:

-   A **User** can create procurement requests.
-   A **Product** can be associated with a **Department** and
    **Category**.
-   A **Supplier** can be associated with products and procurement
    orders.
-   A **Request** is associated with a user and product.
-   A **Payment** is associated with a procurement request.
-   A **Shipment** is associated with a request and supplier.
-   A **Product Rating** is associated with a completed procurement
    request and user.

## Getting Started

### Prerequisites

Install:

-   Java JDK
-   MySQL Server
-   MySQL Workbench
-   Apache Maven, or use the included Maven wrapper
-   A modern web browser
-   Eclipse or Visual Studio Code

### 1. Clone the Repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd EnterpriseApp
```

### 2. Create the Database

Create the MySQL database required by the application.

Example:

``` sql
CREATE DATABASE procurementsystem;
```

Use your local database configuration.

### 3. Configure Local Properties

Create your local:

``` text
src/main/resources/application.properties
```

Add your local database and email configuration.

**Do not commit passwords, email credentials, API keys, or other secrets
to GitHub.**

Use `application-example.properties` as a reference if it is included in
the repository.

### 4. Start the Backend

Using Maven:

``` bash
mvn spring-boot:run
```

On Windows, you can use:

``` bash
mvnw.cmd spring-boot:run
```

### 5. Open the Application

After the backend starts, open:

``` text
http://localhost:8081/login.html
```

if port `8081` is configured in your local application properties.

## Security Note

Never commit the following to a public repository:

``` text
Database passwords
Gmail passwords / app passwords
API keys
JWT secrets
Private keys
Production credentials
Confidential personal information
```

Keep local secrets in ignored configuration files or environment
variables.

## Future Enhancements

Possible improvements include:

-   AI-based supplier recommendation
-   Procurement analytics dashboard
-   Demand forecasting
-   Advanced notification center
-   Mobile application
-   Cloud deployment
-   ERP integration
-   Advanced role-based API authorization
-   JWT-based authentication
-   Audit logs and advanced security monitoring

## Project Objective

The objective of ProcureFlow is to provide a centralized platform that
improves procurement visibility and communication by connecting users,
administrators, and suppliers through one digital workflow.

**ProcureFlow -- Procurement, Connected.**

## Authors

Developed as an academic/project implementation.

**Project:** ProcureFlow\
**Domain:** Procurement Management System\
**Backend:** Java + Spring Boot\
**Frontend:** HTML + CSS + JavaScript\
**Database:** MySQL
