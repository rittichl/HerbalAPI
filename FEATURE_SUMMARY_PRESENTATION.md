---
marp: true
theme: default
paginate: true
header: 'Herbal Delight API - Feature Summary'
footer: 'Feature Summary - 2024'
style: |
  section {
    font-family: 'Arial', sans-serif;
    font-size: 0.9em;
  }
  h1 {
    color: #2c3e50;
    border-bottom: 3px solid #3498db;
    padding-bottom: 10px;
    font-size: 1.8em;
  }
  h2 {
    color: #34495e;
    font-size: 1.4em;
  }
  h3 {
    font-size: 1.2em;
  }
  ul, ol {
    font-size: 0.95em;
    line-height: 1.4;
  }
  li {
    margin: 0.3em 0;
  }
---

<!-- _class: lead -->
# Herbal Delight API
## Feature Summary

**Comprehensive Feature Overview**

Version 1.0.0 | December 2024

---

## Quick Statistics

**Total API Endpoints:** 106

**Total Features:** 103

**Route Modules:** 12

**Controllers:** 25+

**Database Models:** 20+

**Status:** Production Ready

---

## Module 1: Authentication & Authorization

**2 Features**

- User Login
- User Logout

---

## Module 2: User Management

**7 Features**

- Create User Group
- Get All User Groups
- Update User Group
- User Registration
- Get All Users
- Update User
- Delete User
- Change Password

---

## Module 3: Category Management

**5 Features**

- Create Category
- Get All Categories
- Get Category by ID
- Update Category
- Delete Category

---

## Module 4: Product Management

**9 Features**

- Create Product
- Get All Products
- Get Product by ID
- Update Product
- Delete Product
- Create Product Formula
- Get All Formulas
- Get Formula by ID
- Update Formula
- Delete Formula

---

## Module 5: Material Management

**7 Features**

- Get Material Types
- Get Material Units
- Get User Roles
- Create Material
- Get All Materials
- Get Material by ID
- Update Material
- Delete Material

---

## Module 6: Vendor & Payment Management

**9 Features**

- Create Vendor
- Get All Vendors
- Get Vendor by ID
- Update Vendor
- Delete Vendor
- Create Payment Type
- Get All Payment Types
- Get Payment Type by ID
- Update Payment Type
- Delete Payment Type

---

## Module 7: Order Management

**8 Features**

- Create Order
- Get All Orders
- Get Order by ID
- Update Order Vendor
- Add Material to Order
- Update Order Material
- Update Order Materials (Bulk)
- Remove Material from Order
- Delete Order

---

## Module 8: Quality Control (Part 1)

**20 Features Total**

**Audit Status (5)**
- Create Audit Status
- Get All Audit Statuses
- Get Audit Status by ID
- Update Audit Status
- Delete Audit Status

**Quarantine (5)**
- Create Quarantine
- Get All Quarantines
- Get Quarantine by ID
- Update Quarantine
- Delete Quarantine

---

## Module 8: Quality Control (Part 2)

**Inspection Topics (5)**
- Create Inspection Topic
- Get All Inspection Topics
- Get Inspection Topic by ID
- Update Inspection Topic
- Delete Inspection Topic

**Material Inspections (4)**
- Create Material Inspection
- Get All Material Inspections
- Get Inspections by Material ID
- Get Inspections by Topic ID
- Delete Material Inspection

**Inspection Results (1)**
- Update Inspection Results

---

## Module 9: Label Template & QR Codes

**10 Features**

- Create Label Template
- Get All Templates
- Get Template by ID
- Update Label Template
- Approve Template
- Get QR Codes for Template
- Get QR Code Statistics
- Get QR Code Detail
- Search QR Code (Public)
- Update QR Code
- Generate Composite Sheet
- Get Composite Capacity

---

## Module 10: Document Management

**9 Features**

- Generate Document from Template
- Download Generated Document
- Download Template File
- List Available Templates
- Upload Template Document
- Delete Template
- Get Template Information
- Upload Image for Document
- Get Image as Base64

---

## Module 11: Image Management

**7 Features**

- List All Images
- Get Image Information
- Upload Image
- Serve Image File (Public)
- Get Image as Base64
- Delete Image
- Delete Multiple Images

---

## Module 12: System & Utilities

**2 Features**

- Health Check Endpoint
- Image Upload Endpoint

---

## Core System Features: Security

**Security Features**

- JWT Authentication
- API Key Validation
- Password Hashing (bcrypt)
- Role-Based Access Control
- Input Validation

---

## Core System Features: Logging & Monitoring

**Logging & Monitoring**

- Transaction ID Tracking (UUID)
- Request/Response Logging
- File-Based Logging with Rotation
- Multiple Log Levels
- Automatic Log Cleanup

---

## Core System Features: Documentation & Traceability

**Document Generation**

- Word Document Generation
- Image Embedding Support
- Template Management
- Batch Manufacturing Records
- Multi-language Support (EN/TH)

**Traceability**

- QR Code Generation
- QR Code Tracking & Search
- Composite Label Sheets
- Public QR Code Lookup

---

## Core System Features: Quality & Supply Chain

**Quality Control**

- Quarantine System
- Inspection Management
- Result Recording
- Audit Trail
- Material Inspection Mapping

**Supply Chain**

- Vendor Management
- Order Processing
- Material Tracking
- Delivery Management
- Payment Type Management

---

## Technology Stack

**Backend**
- Node.js + Express.js + TypeScript

**Database**
- PostgreSQL + Sequelize ORM

**Authentication**
- JWT + bcrypt

**Document Processing**
- docxtemplater, PizZip

**Image Processing**
- Canvas, Jimp

**QR Codes**
- qrcode library

**File Upload**
- Multer

**Deployment**
- Docker support

---

## Feature Summary by Module

| Module | Features |
|--------|----------|
| Quality Control | 20 |
| Label & QR Codes | 10 |
| Product Management | 9 |
| Document Management | 9 |
| Vendor & Payment | 9 |
| Order Management | 8 |
| Material Management | 7 |
| User Management | 7 |
| Image Management | 7 |
| Category Management | 5 |
| Authentication | 2 |
| System Utilities | 2 |
| **TOTAL** | **103** |

---

## Summary

**Total Features:** 103

**Total API Endpoints:** 106

**Modules:** 12

**Status:** Production Ready

This system provides comprehensive management for herbal/pharmaceutical manufacturing operations with full traceability, quality control, and automated documentation capabilities.

---

<!-- _class: lead -->
# Thank You

## Questions & Discussion

**Herbal Delight API - Feature Summary**

Version 1.0.0 | Production Ready

---

