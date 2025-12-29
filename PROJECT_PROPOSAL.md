# Herbal Delight Manufacturing & Quality Management System
## Project Proposal Document

---

## 1. Executive Summary

**Project Name:** Herbal Delight API (delight-api)  
**Version:** 1.0.0  
**Project Type:** Manufacturing Execution System (MES) / Quality Management System (QMS)  
**Target Industry:** Herbal/Pharmaceutical Manufacturing  
**Technology Stack:** Node.js, Express.js, TypeScript, PostgreSQL, Sequelize ORM

### 1.1 Project Overview

The Herbal Delight API is a comprehensive backend system designed to manage the complete lifecycle of herbal/pharmaceutical product manufacturing, from raw material procurement through quality control to finished product labeling and documentation. The system ensures compliance with manufacturing standards, provides full traceability through QR code integration, and automates document generation for production records.

### 1.2 Business Objectives

- **Streamline Manufacturing Operations:** Centralized management of products, materials, formulas, and production processes
- **Ensure Quality Compliance:** Comprehensive quality control system with inspection tracking and audit trails
- **Enable Full Traceability:** QR code-based tracking system for products and materials
- **Automate Documentation:** Automated generation of production documents and batch manufacturing records
- **Optimize Supply Chain:** Efficient vendor and order management with delivery tracking
- **Maintain Regulatory Compliance:** Audit status tracking and inspection result documentation

---

## 2. System Architecture

### 2.1 Technology Stack

**Backend Framework:**
- Node.js with Express.js
- TypeScript for type safety
- RESTful API architecture

**Database:**
- PostgreSQL (relational database)
- Sequelize ORM for database operations
- Database migrations support

**Core Libraries:**
- **Authentication:** JWT (JSON Web Tokens), bcrypt for password hashing
- **Document Processing:** docxtemplater, PizZip for Word document generation
- **Image Processing:** Canvas, Jimp for image manipulation
- **QR Code Generation:** qrcode library
- **File Upload:** Multer for multipart/form-data handling
- **Logging:** Custom logging system with transaction ID tracking

**Infrastructure:**
- Docker containerization support
- CORS-enabled for cross-origin requests
- Static file serving for uploads, templates, and generated documents

### 2.2 System Components

1. **API Layer:** RESTful endpoints organized by domain
2. **Business Logic Layer:** Controllers handling business rules
3. **Data Access Layer:** Sequelize models and database operations
4. **Middleware Layer:** Authentication, validation, logging, transaction tracking
5. **File Management:** Upload, storage, and retrieval of images and documents

---

## 3. Feature Catalog

### 3.1 Feature Summary

**Total API Endpoints: 95+**  
**Total Feature Modules: 12**

### 3.2 Detailed Feature Breakdown

#### **Module Overview Diagram**

The following diagram provides a visual overview of all 12 modules organized by functional area:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              HERBAL DELIGHT API - MODULE OVERVIEW DIAGRAM                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                         CORE SYSTEM MODULES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐ │
│  │ Module 1:             │  │ Module 2:             │  │ Module 3:       │ │
│  │ Authentication        │  │ User Management       │  │ Category        │ │
│  │ 2 Features            │  │ 7 Features           │  │ Management      │ │
│  │ • Login/Logout        │  │ • User Groups         │  │ 5 Features      │ │
│  │ • JWT Auth            │  │ • User Registration  │  │ • CRUD Ops      │ │
│  └──────────────────────┘  └──────────────────────┘  └─────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRODUCT & MATERIAL MODULES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │ Module 4:             │  │ Module 5:             │                        │
│  │ Product Management     │  │ Material Management   │                        │
│  │ 9 Features             │  │ 7 Features            │                        │
│  │ • Products CRUD        │  │ • Materials CRUD      │                        │
│  │ • Product Formulas     │  │ • Data Types          │                        │
│  │ • Multi-language       │  │ • Stock Tracking      │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPPLY CHAIN MODULES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │ Module 6:             │  │ Module 7:             │                        │
│  │ Vendor & Payment      │  │ Order Management     │                        │
│  │ 9 Features            │  │ 8 Features           │                        │
│  │ • Vendor Management   │  │ • Order Creation      │                        │
│  │ • Payment Types       │  │ • Material Tracking   │                        │
│  │ • Contact Management  │  │ • Delivery Tracking   │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      QUALITY CONTROL MODULE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    ┌──────────────────────────────┐                         │
│                    │ Module 8:                    │                         │
│                    │ Quality Control               │                         │
│                    │ 20 Features                   │                         │
│                    │ • Audit Status (5)           │                         │
│                    │ • Quarantine System (5)      │                         │
│                    │ • Inspection Topics (5)      │                         │
│                    │ • Material Inspections (4)    │                         │
│                    │ • Inspection Results (1)      │                         │
│                    └──────────────────────────────┘                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              DOCUMENTATION & TRACEABILITY MODULES                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐ │
│  │ Module 9:             │  │ Module 10:            │  │ Module 11:      │ │
│  │ Label & QR Codes      │  │ Document Management   │  │ Image Management│ │
│  │ 10 Features           │  │ 9 Features            │  │ 7 Features      │ │
│  │ • Label Templates     │  │ • Document Generation │  │ • Image Upload  │ │
│  │ • QR Code Generation  │  │ • Template Management │  │ • Image Serving │ │
│  │ • Composite Sheets    │  │ • BMR Generation      │  │ • Base64 Support│ │
│  └──────────────────────┘  └──────────────────────┘  └─────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM MODULE                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    ┌──────────────────────────────┐                         │
│                    │ Module 12:                   │                         │
│                    │ System Utilities             │                         │
│                    │ 2 Features                   │                         │
│                    │ • Health Check              │                         │
│                    │ • Image Upload              │                         │
│                    └──────────────────────────────┘                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════╗
║  SUMMARY: 12 Modules | 103 Features | 106 API Endpoints | Production Ready  ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

#### **Module 1: Authentication & Authorization** (2 endpoints)
- User login with API key validation
- User logout
- JWT-based authentication
- Role-based access control (Admin/User)
- API key validation middleware

#### **Module 2: User Management** (8 endpoints)
- **User Groups:**
  - Create user group
  - Get all user groups
  - Update user group
- **Users:**
  - User registration
  - Get all users
  - Get user by ID
  - Update user profile
  - Delete user (Admin only)
  - Change password
  - User test endpoint

#### **Module 3: Category Management** (5 endpoints)
- Create category (Admin only)
- Get all categories
- Get category by ID
- Update category (Admin only)
- Delete category (Admin only)

#### **Module 4: Product Management** (9 endpoints)
- **Products:**
  - Create product (Admin only)
  - Get all products
  - Get product by ID
  - Update product (Admin only)
  - Delete product (Admin only)
- **Product Formulas:**
  - Create product formula (Admin only)
  - Get all formulas
  - Get formula by ID
  - Update formula (Admin only)
  - Delete formula (Admin only)

#### **Module 5: Material Management** (7 endpoints)
- **Data Types:**
  - Get material types
  - Get material units
  - Get user roles
- **Materials:**
  - Create material (Admin only)
  - Get all materials
  - Get material by ID
  - Update material (Admin only)
  - Delete material (Admin only)

#### **Module 6: Vendor & Payment Management** (9 endpoints)
- **Vendors:**
  - Create vendor (Admin only)
  - Get all vendors
  - Get vendor by ID
  - Update vendor (Admin only)
  - Delete vendor (Admin only)
- **Payment Types:**
  - Create payment type (Admin only)
  - Get all payment types
  - Get payment type by ID
  - Update payment type (Admin only)
  - Delete payment type (Admin only)

#### **Module 7: Order Management** (8 endpoints)
- Create order (Admin only)
- Get all orders
- Get order by ID
- Update order vendor information (Admin only)
- Add material to order (Admin only)
- Update order material (Admin only)
- Update order materials (bulk) (Admin only)
- Remove material from order (Admin only)
- Delete order (Admin only)

#### **Module 8: Quality Control & Inspection** (20 endpoints)
- **Audit Status:**
  - Create audit status (Admin only)
  - Get all audit statuses
  - Get audit status by ID
  - Update audit status (Admin only)
  - Delete audit status (Admin only)
- **Quarantine Management:**
  - Create quarantine entry
  - Get all quarantines
  - Get quarantine by ID
  - Update quarantine (Admin only)
  - Delete quarantine (Admin only)
- **Inspection Topics:**
  - Create inspection topic (Admin only)
  - Get all inspection topics
  - Get inspection topic by ID
  - Update inspection topic (Admin only)
  - Delete inspection topic (Admin only)
- **Material Inspections:**
  - Create material inspection (Admin only)
  - Get all material inspections
  - Get inspections by material ID
  - Get inspections by topic ID
  - Delete material inspection (Admin only)
- **Inspection Results:**
  - Update inspection results for quarantine (Admin only)

#### **Module 9: Label Template & QR Code Management** (10 endpoints)
- **Label Templates:**
  - Create label template with image upload
  - Get all templates
  - Get template by ID
  - Update label template
  - Approve template
- **QR Codes:**
  - Get QR codes for template
  - Get QR code statistics
  - Get QR code detail by ID
  - Search QR code (public API key access)
  - Update QR code
- **Composite Sheets:**
  - Generate composite label sheet
  - Get composite capacity

#### **Module 10: Document Management** (9 endpoints)
- Generate document from template
- Download generated document
- Download template file
- List available templates
- Upload template document
- Delete template
- Get template information
- Upload image for document
- Get image as base64

#### **Module 11: Image Management** (7 endpoints)
- List all images
- Get image information
- Upload image
- Serve image file (public access)
- Get image as base64
- Delete image
- Delete multiple images

#### **Module 12: System & Utilities** (2 endpoints)
- Health check endpoint
- Image upload endpoint

---

## 4. Key Features & Capabilities

### 4.1 Security Features
- **JWT Authentication:** Secure token-based authentication
- **API Key Validation:** Additional layer of security for public endpoints
- **Password Hashing:** bcrypt encryption for user passwords
- **Role-Based Access Control:** Admin and regular user roles with permission checks
- **Input Validation:** Data validation middleware for all POST/PATCH requests
- **CORS Support:** Configurable cross-origin resource sharing

### 4.2 Logging & Monitoring
- **Transaction ID Tracking:** Unique UUID for each request for full traceability
- **Comprehensive Logging:** Request/response logging with transaction IDs
- **File-Based Logging:** Daily log rotation with automatic cleanup
- **Log Levels:** INFO, WARN, ERROR, DEBUG levels
- **Request Tracking:** Method, path, IP, user agent, response time tracking

### 4.3 Document Generation
- **Template-Based Generation:** Word document generation from templates
- **Image Embedding:** Support for embedding images in documents
- **Template Management:** Upload, download, list, and delete templates
- **Batch Manufacturing Records:** Support for BMR document generation
- **Multi-language Support:** English and Thai language support

### 4.4 Traceability & QR Codes
- **QR Code Generation:** Automatic QR code generation for labels
- **QR Code Tracking:** Search and statistics for QR codes
- **Composite Label Sheets:** Generate printable label sheets
- **Public QR Search:** API key-based public access for QR code lookup

### 4.5 Quality Control
- **Quarantine System:** Track materials in quarantine
- **Inspection Management:** Define and track inspection topics
- **Result Recording:** Record and update inspection results
- **Audit Trail:** Complete audit status tracking
- **Material Inspection Mapping:** Link materials to inspection requirements

### 4.6 Supply Chain Management
- **Vendor Management:** Complete vendor information management
- **Order Processing:** Create and manage purchase orders
- **Material Tracking:** Track materials in orders
- **Delivery Management:** Delivery days and scheduling
- **Payment Type Management:** Multiple payment method support

---

## 5. Database Schema Overview

### 5.1 Core Entities

- **Users & User Groups:** User management and role assignment
- **Categories:** Product and material categorization
- **Products:** Finished product information
- **Materials:** Raw material inventory
- **Product Formulas:** Product-to-material relationships
- **Vendors:** Supplier information
- **Orders:** Purchase order management
- **Quarantines:** Material quarantine tracking
- **Inspection Topics:** Quality inspection definitions
- **Material Inspections:** Material-to-inspection mappings
- **Inspection Results:** Quality test results
- **Label Templates:** Label design templates
- **QR Codes:** Traceability codes

---

## 6. API Structure

### 6.1 Base URL
```
/herbal/api
```

### 6.2 Route Organization
- `/auth/*` - Authentication endpoints
- `/users/*` - User management
- `/user-groups/*` - User group management
- `/categories/*` - Category management
- `/products/*` - Product management
- `/product-formulas/*` - Formula management
- `/materials/*` - Material management
- `/material-type`, `/material-unit`, `/user-role` - Data type endpoints
- `/vendors/*` - Vendor management
- `/payment-types/*` - Payment type management
- `/orders/*` - Order management
- `/audit-status/*` - Audit status management
- `/quarantines/*` - Quarantine management
- `/inspection-topics/*` - Inspection topic management
- `/material-inspections/*` - Material inspection management
- `/order-detail-inspection-results/*` - Inspection result management
- `/label-templates/*` - Label template management
- `/upload/*` - File upload endpoints
- `/health` - Health check

### 6.3 Document Routes
```
/herbal/api/documents/*
```
- Document generation and template management
- Image management

---

## 7. System Requirements

### 7.1 Server Requirements
- **Node.js:** Version 16 or higher
- **PostgreSQL:** Version 12 or higher
- **RAM:** Minimum 2GB, Recommended 4GB+
- **Storage:** Minimum 10GB for logs, uploads, and generated documents
- **CPU:** 2+ cores recommended

### 7.2 Development Requirements
- TypeScript 5.8+
- npm or yarn package manager
- Docker (optional, for containerized deployment)

---

## 8. Deployment Architecture

### 8.1 Supported Deployment Methods
- **Docker:** Docker Compose configuration included
- **Traditional:** Direct Node.js deployment
- **Cloud:** Compatible with AWS, Azure, GCP

### 8.2 Environment Configuration
- Environment variables for database connection
- JWT secret configuration
- API key management
- File storage paths configuration

---

## 9. Project Statistics

### 9.1 Code Metrics
- **Total API Endpoints:** 95+
- **Route Modules:** 12
- **Controllers:** 25+
- **Database Models:** 20+
- **Middleware Components:** 5+

### 9.2 Feature Count by Category

| Category | Endpoints | Features |
|----------|-----------|----------|
| Authentication | 2 | 2 |
| User Management | 8 | 7 |
| Category Management | 5 | 5 |
| Product Management | 9 | 9 |
| Material Management | 7 | 7 |
| Vendor Management | 9 | 9 |
| Order Management | 8 | 8 |
| Quality Control | 20 | 20 |
| Label & QR Codes | 10 | 10 |
| Document Management | 9 | 9 |
| Image Management | 7 | 7 |
| System Utilities | 2 | 2 |
| **TOTAL** | **106** | **103** |

---

## 10. Future Enhancements

### 10.1 Potential Additions
- Real-time notifications
- Advanced reporting and analytics
- Mobile application support
- Barcode scanning integration
- Inventory forecasting
- Automated reorder points
- Batch tracking enhancements
- Multi-warehouse support
- Advanced search and filtering
- Export to Excel/PDF functionality

---

## 11. Project Benefits

### 11.1 Operational Benefits
- **Efficiency:** Streamlined manufacturing processes
- **Accuracy:** Reduced manual errors through automation
- **Compliance:** Built-in quality control and audit trails
- **Traceability:** Complete product and material tracking
- **Documentation:** Automated document generation

### 11.2 Business Benefits
- **Cost Reduction:** Optimized inventory and order management
- **Quality Assurance:** Comprehensive inspection system
- **Regulatory Compliance:** Audit-ready documentation
- **Scalability:** Modular architecture for future growth
- **Data Integrity:** Centralized data management

---

## 12. Conclusion

The Herbal Delight API is a comprehensive, production-ready system designed specifically for herbal/pharmaceutical manufacturing operations. With over 100 features across 12 major modules, the system provides end-to-end management of manufacturing processes, quality control, and compliance documentation.

The system's modular architecture, robust security features, and comprehensive logging make it suitable for production deployment in regulated manufacturing environments. The integration of QR code tracking, automated document generation, and quality control systems ensures full traceability and regulatory compliance.

---

## Document Information

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Prepared By:** Development Team  
**Project Status:** Production Ready

---

*This document provides a comprehensive overview of the Herbal Delight Manufacturing & Quality Management System. For detailed API documentation, please refer to the API endpoint specifications.*

