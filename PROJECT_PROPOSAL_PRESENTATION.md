---
marp: true
theme: default
paginate: true
header: 'Herbal Delight Manufacturing & Quality Management System'
footer: 'Project Proposal - 2024'
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
## Manufacturing & Quality Management System

**Project Proposal Presentation**

Version 1.0.0 | December 2024

---

## Executive Summary

**Project Overview:**
- Comprehensive backend system for herbal/pharmaceutical manufacturing
- End-to-end management from procurement to finished products
- Full traceability and compliance documentation

**Key Statistics:**
- **103 Features** across **12 Modules**
- **106 API Endpoints**
- **25+ Controllers**
- **20+ Database Models**

**Status:** Production Ready

---

## Business Objectives (Part 1)

**Streamline Manufacturing Operations**
- Centralized management system

**Ensure Quality Compliance**
- Quality control & inspection tracking

**Enable Full Traceability**
- QR code-based tracking

---

## Business Objectives (Part 2)

**Automate Documentation**
- Automated document generation

**Optimize Supply Chain**
- Vendor & order management

**Maintain Regulatory Compliance**
- Audit trails & documentation

---

## Technology Stack

### Backend Framework
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **RESTful API** architecture

### Database
- **PostgreSQL** (relational database)
- **Sequelize ORM** for database operations

### Core Libraries
- **Authentication:** JWT, bcrypt
- **Document Processing:** docxtemplater, PizZip
- **Image Processing:** Canvas, Jimp
- **QR Codes:** qrcode library
- **File Upload:** Multer

---

## System Architecture

```
┌─────────────────────────────────────┐
│         Client Applications         │
│    (Web, Mobile, External APIs)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         API Layer (Express)          │
│  - Authentication Middleware         │
│  - Request Validation                │
│  - Transaction ID Tracking           │
│  - Logging                           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Business Logic Layer           │
│  - 25+ Controllers                  │
│  - Business Rules                    │
│  - Data Processing                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Data Access Layer              │
│  - Sequelize ORM                     │
│  - Database Models                   │
│  - Migrations                        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      PostgreSQL Database            │
│  - 20+ Tables                        │
│  - Relationships                     │
└─────────────────────────────────────┘
```

---

## Feature Modules Overview (Part 1)

**12 Major Modules**

1. Authentication & Authorization (2)
2. User Management (7)
3. Category Management (5)
4. Product Management (9)
5. Material Management (7)
6. Vendor & Payment (9)

---

## Feature Modules Overview (Part 2)

7. Order Management (8)
8. Quality Control (20)
9. Label & QR Codes (10)
10. Document Management (9)
11. Image Management (7)
12. System Utilities (2)

---

## Module 1: Authentication & Security

### Features

- User Login with API Key Validation
- User Logout
- JWT-based Authentication
- Role-Based Access Control
- Password Hashing (bcrypt)

---

## Module 1: Security Features

- API Key Validation Middleware
- Input Validation
- CORS Support
- Secure Token Management

---

## Module 2: User Management

**7 Features**

- User Groups: Create, Read, Update
- User Registration & Management
- Password Management
- Role Assignment

---

## Module 3: Category Management

**5 Features**

- CRUD Operations
- Admin-only Management
- Category Organization

---

## Module 4: Product Management

**9 Features**

- Full CRUD Operations
- Product Formulas
- Multi-language (EN/TH)
- Quantity & Unit Management

---

## Module 5: Material Management

**7 Features**

- Inventory Management
- Material Types & Units
- Stock Volume Tracking
- Category Organization

---

## Module 6: Vendor Management

**9 Features**

- Complete Vendor Information
- Payment Types Management
- Contact Management
- Bilingual Support (TH/EN)

---

## Module 7: Order Management

**8 Features**

- Purchase Order Management
- Material Management in Orders
- Vendor & Payment Assignment
- Delivery Tracking

---

## Module 8: Quality Control (Part 1)

**20 Features Total**

**Audit Status Management (5)**
- Status code & name management
- Complete CRUD operations

**Quarantine System (5)**
- Material quarantine tracking
- Date management

---

## Module 8: Quality Control (Part 2)

**Inspection Topics (5)**
- Define inspection criteria
- Method & specification tracking

**Material Inspections (4)**
- Link materials to requirements
- Query by material or topic

**Inspection Results (1)**
- Record & update test results

---

## Module 9: Label Templates

**5 Features**

- Create Templates with Image Upload
- Template Approval Workflow
- Template Management

---

## Module 9: QR Codes & Composite

**7 Features**

- QR Code Generation
- Statistics & Tracking
- Public Search API
- Composite Sheet Generation

---

## Module 10: Document Management

**9 Features**

- Generate Documents from Templates
- Template Upload/Download
- Image Embedding
- Batch Manufacturing Records
- Multi-language Support

---

## Module 11: Image Management

**7 Features**

- Upload & Store Images
- List & Retrieve Images
- Base64 Encoding
- Public Image Serving
- Bulk Delete Operations

---

## Module 12: System Utilities

**5 Features**

- Health Check Endpoint
- Transaction ID Tracking
- Comprehensive Logging
- File Upload Support
- Static File Serving

---

## Logging & Monitoring

**Transaction ID Tracking**
- Unique UUID per request
- Full lifecycle tracking

**Logging Features**
- Request/Response logging
- Daily log rotation
- Multiple log levels
- 30-day retention

**Monitoring**
- Response time tracking
- User activity tracking
- Error tracking

---

## API Structure

**Base URL:** `/herbal/api`

**Main Routes:**
- `/auth/*` - Authentication
- `/users/*` - User management
- `/products/*` - Products
- `/materials/*` - Materials
- `/orders/*` - Orders
- `/quarantines/*` - Quality control
- `/label-templates/*` - Labels & QR codes
- `/documents/*` - Document management

**Total: 106 API Endpoints**

---

## Database Schema Overview

**Core Entities:**

- User Management (Users, Groups, Roles)
- Product Management (Products, Materials, Formulas)
- Supply Chain (Vendors, Orders, Payments)
- Quality Control (Quarantines, Inspections)
- Traceability (Labels, QR Codes)

**Total: 20+ Database Models**

---

## Key Capabilities: Security & Monitoring

**Security**
- JWT Authentication
- API Key Validation
- Role-Based Access Control
- Password Encryption
- Input Validation

**Monitoring**
- Transaction ID Tracking
- Comprehensive Logging
- Performance Metrics
- Error Tracking

---

## Key Capabilities: Documentation & Traceability

**Documentation**
- Automated Document Generation
- Template Management
- Multi-language Support
- Image Embedding

**Traceability**
- QR Code Generation
- Product Tracking
- Material Tracking
- Audit Trails

---

## Deployment Architecture

**Docker Deployment**
- Docker Compose included
- Containerized services

**Traditional Deployment**
- Direct Node.js
- PostgreSQL database

**Cloud Deployment**
- AWS, Azure, GCP compatible
- Scalable architecture

---

## System Requirements

**Server:**
- Node.js 16+, PostgreSQL 12+
- RAM: 2GB min, 4GB+ recommended
- Storage: 10GB+ | CPU: 2+ cores

**Development:**
- TypeScript 5.8+
- npm/yarn
- Docker (optional)

---

## Project Statistics

**Code Metrics:**
- Total Features: 103
- API Endpoints: 106
- Route Modules: 12
- Controllers: 25+
- Database Models: 20+

**Top Modules:**
- Quality Control: 20 features
- Label & QR Codes: 10 features
- Product Management: 9 features

---

## Feature Count Summary

**Top Categories:**
- Quality Control: 20 features
- Label & QR Codes: 10 features
- Product Management: 9 features
- Document Management: 9 features
- Vendor Management: 9 features

**Total: 106 Endpoints | 103 Features**

---

## Business Benefits

**Operational:**
- Streamlined processes
- Reduced errors
- Quality control
- Full traceability
- Automated documentation

**Business:**
- Cost reduction
- Quality assurance
- Regulatory compliance
- Scalable architecture
- Data integrity

---

## Use Cases

**Manufacturing Workflow:**
1. Material Procurement
2. Quality Inspection
3. Production
4. Labeling
5. Documentation

**Quality Control Workflow:**
1. Material Receipt
2. Inspection Planning
3. Testing
4. Approval
5. Release

---

## Future Enhancements

**Potential Additions:**
- Real-time notifications
- Advanced reporting & analytics
- Mobile application support
- Barcode scanning integration
- Inventory forecasting
- Multi-warehouse support

---

## Competitive Advantages

**Why Choose This System?**

- Comprehensive Solution
- Regulatory Compliance
- Full Traceability
- Automation
- Scalable Architecture
- Production Ready

---

## Project Status

**Current Status: Production Ready**

**Completed:**
- 103 features implemented
- 106 API endpoints functional
- Database schema complete
- Security & logging active

**Ready for:**
- Production deployment
- User training
- Performance monitoring

---

## Conclusion

**Summary**

The Herbal Delight API is a comprehensive, production-ready system for herbal/pharmaceutical manufacturing.

**Key Highlights:**
- 103 Features across 12 Modules
- 106 API Endpoints
- Full Traceability with QR codes
- Automated Documentation
- Quality Control System

**Next Steps:**
1. Production deployment
2. User training
3. Performance monitoring
4. Continuous improvement

---

<!-- _class: lead -->
# Thank You

## Questions & Discussion

**Project:** Herbal Delight Manufacturing & Quality Management System  
**Version:** 1.0.0  
**Status:** Production Ready

---

