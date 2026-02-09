# Sustainable Construction Project Management System
## Project Specification Document

**Course:** SE3040 – Application Frameworks  
**Academic Year:** 2026  
**SDG Goal:** Industry, Innovation and Infrastructure  
**Team Size:** 3 Members  
**Project Duration:** Feb 7 - Apr 12, 2026

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [System Architecture](#3-system-architecture)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Core Components](#5-core-components)
6. [System Workflows](#6-system-workflows)
7. [Technical Specifications](#7-technical-specifications)
8. [Third-Party Integrations](#8-third-party-integrations)
9. [Database Design](#9-database-design)
10. [API Specifications](#10-api-specifications)
11. [Security & Authentication](#11-security--authentication)
12. [Deployment Architecture](#12-deployment-architecture)

---

## 1. Executive Summary

The **Sustainable Construction Project Management System** is a comprehensive full-stack web application designed to help construction companies manage their projects while monitoring and optimizing environmental sustainability metrics. The system provides tools for project planning, sustainability tracking, document management, and resource optimization—all integrated into a single platform.

### Key Features:
- **Project Lifecycle Management:** From planning to completion with milestone tracking
- **Real-time Sustainability Monitoring:** Track carbon footprint, energy consumption, and waste management
- **Digital Document Repository:** Centralized storage for blueprints, permits, and compliance documents
- **Resource Optimization:** Inventory management for materials and equipment
- **Role-based Access Control:** Different permission levels for various stakeholders
- **Compliance Tracking:** Safety inspections and regulatory compliance checklists

### Business Value:
- Reduce environmental impact of construction projects by 20-30%
- Improve project delivery timelines through better resource management
- Ensure regulatory compliance with digital tracking
- Provide data-driven insights for sustainable construction practices

---

## 2. Project Overview

### 2.1 Problem Statement

Modern construction projects face several challenges:
- **Environmental Impact:** Construction accounts for 38% of global CO2 emissions
- **Resource Wastage:** Poor inventory management leads to 10-15% material wastage
- **Compliance Issues:** Manual tracking of safety and environmental regulations is error-prone
- **Data Fragmentation:** Project data scattered across multiple tools and spreadsheets
- **Lack of Visibility:** Stakeholders lack real-time insights into project sustainability metrics

### 2.2 Solution

Our system provides an integrated platform that:
1. **Centralizes** all project information in one accessible location
2. **Automates** sustainability calculations and compliance tracking
3. **Visualizes** environmental impact through intuitive dashboards
4. **Optimizes** resource allocation to minimize waste
5. **Ensures** accountability through role-based permissions and audit trails

### 2.3 Target Users

| User Type | Primary Needs | System Access |
|-----------|---------------|---------------|
| **Construction Companies** | Project oversight, compliance, cost control | Admin, Project Manager |
| **Project Managers** | Timeline management, resource allocation | Project Manager role |
| **Environmental Inspectors** | Sustainability audits, compliance verification | Inspector role |
| **Suppliers** | Inventory visibility, delivery coordination | Supplier role |
| **Regulatory Bodies** | Compliance reports, environmental data | Viewer role |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
│  React SPA (Vercel/Netlify) - TailwindCSS - Redux Toolkit  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    BACKEND LAYER                            │
│         Express.js API (Render/Railway)                     │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│  │   Project    │Sustainability│  Document    │ Resource │ │
│  │  Management  │  Monitoring  │  Management  │Management│ │
│  └──────────────┴──────────────┴──────────────┴──────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────┐ ┌──▼────────────────┐
│   MongoDB    │ │Third-   │ │ File Storage      │
│   Atlas      │ │Party    │ │ (Cloudinary/S3)   │
│   (Primary   │ │APIs     │ │                   │
│   Database)  │ │         │ │                   │
└──────────────┘ └─────────┘ └───────────────────┘
```

### 3.2 Component Architecture

The system is built using a **modular component-based architecture** where each component is self-contained with its own:
- **Models:** Data schemas and business entities
- **Controllers:** Request/response handlers
- **Services:** Core business logic
- **Routes:** API endpoint definitions
- **Validators:** Input validation rules

**Shared Infrastructure:**
- Authentication middleware (JWT)
- Error handling middleware
- Database connection pooling
- Logging & monitoring
- API rate limiting

---

## 4. User Roles & Permissions

### 4.1 Role Definitions

| Role | Description | Key Capabilities |
|------|-------------|------------------|
| **ADMIN** | System administrator | Full CRUD access to all modules, user management, system configuration |
| **PROJECT_MANAGER** | Manages construction projects | Create/edit projects, assign resources, view all project data, manage team members |
| **INSPECTOR** | Environmental & safety compliance officer | Update sustainability metrics, conduct inspections, approve compliance items, read-only access to projects |
| **SUPPLIER** | Material/equipment supplier | View assigned material orders, update delivery status, limited inventory access |
| **VIEWER** | Stakeholder/regulatory body | Read-only access to reports, projects, and compliance data |

### 4.2 Permission Matrix

| Feature | ADMIN | PROJECT_MANAGER | INSPECTOR | SUPPLIER | VIEWER |
|---------|-------|-----------------|-----------|----------|--------|
| Create Projects | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Projects | ✅ | ✅ (own) | ❌ | ❌ | ❌ |
| View Projects | ✅ | ✅ | ✅ | ❌ | ✅ |
| Delete Projects | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update Sustainability Metrics | ✅ | ✅ | ✅ | ❌ | ❌ |
| Upload Documents | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Documents | ✅ | ❌ | ✅ | ❌ | ❌ |
| Manage Resources | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Material Status | ✅ | ✅ | ❌ | ✅ | ❌ |
| Generate Reports | ✅ | ✅ | ✅ | ❌ | ✅ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Core Components

### 5.1 Component 1: Project Management

**Owner:** Member 1 (Lanka)

**Purpose:** Manage the complete lifecycle of construction projects from initiation to completion.

#### Features:
1. **Project Creation & Setup**
   - Define project details (name, description, location, budget)
   - Set project timeline (start date, end date)
   - Assign project manager and team members
   - Integrate with Google Maps for location visualization

2. **Milestone Management**
   - Create project milestones with target dates
   - Track milestone completion percentage
   - Update milestone status (Pending → In Progress → Completed)
   - Automated progress calculations

3. **Project Status Tracking**
   - Workflow states: Planning → In Progress → On Hold → Completed
   - Status history with change logs
   - Automated notifications on status changes

4. **Project Dashboard**
   - Overview of all projects with filters (status, date range, manager)
   - Quick stats: Total projects, active projects, completion rate
   - Search functionality by name, location, or manager

#### User Flow Example:
```
1. PROJECT_MANAGER logs in
2. Clicks "Create New Project"
3. Fills project form:
   - Project Name: "Green Tower Construction"
   - Location: "Colombo, Sri Lanka" → Google Maps autocomplete
   - Budget: LKR 50,000,000
   - Start Date: March 1, 2026
   - End Date: December 31, 2026
4. Adds milestones:
   - Foundation (Target: April 30)
   - Structure (Target: August 31)
   - Finishing (Target: November 30)
5. System assigns unique project ID
6. Project appears in "In Progress" projects list
7. Team members receive notification (email via third-party API)
```

#### API Endpoints:
```
POST   /api/projects                    # Create new project
GET    /api/projects                    # List all projects (with pagination & filters)
GET    /api/projects/:id                # Get project details
PUT    /api/projects/:id                # Update project
DELETE /api/projects/:id                # Delete project (ADMIN only)
GET    /api/projects/status/:status     # Filter by status
POST   /api/projects/:id/milestones     # Add milestone
PUT    /api/projects/:id/milestones/:mid # Update milestone
GET    /api/projects/:id/timeline       # Get project timeline view
```

#### Third-Party Integration:
- **Google Maps Geocoding API:** Convert addresses to coordinates and vice versa
- **Google Maps JavaScript API:** Display project locations on interactive maps

---

### 5.2 Component 2: Sustainability Monitoring

**Owner:** Member 1 (Lanka)

**Purpose:** Track, monitor, and analyze the environmental impact of construction projects to promote sustainable practices.

#### Features:
1. **Carbon Footprint Tracking**
   - Record CO2 emissions from:
     - Transportation (material delivery, equipment movement)
     - Equipment operation (diesel generators, machinery)
     - Material production (cement manufacturing emissions)
   - Calculate total carbon footprint per project
   - Compare against industry benchmarks

2. **Energy Consumption Monitoring**
   - Track electricity usage (kWh)
   - Monitor fuel consumption (diesel, petrol)
   - Calculate renewable energy usage percentage
   - Energy efficiency scoring

3. **Waste Management**
   - Record waste generated:
     - Recyclable waste (wood, metal, plastic)
     - Non-recyclable waste
     - Hazardous waste (chemicals, asbestos)
   - Track waste disposal methods
   - Calculate waste diversion rate (% recycled)

4. **Water Usage Tracking**
   - Monitor water consumption (liters)
   - Track water sources (municipal, recycled)
   - Calculate water efficiency metrics

5. **Sustainability Scoring**
   - Automated calculation of overall sustainability score (0-100)
   - Weighted scoring algorithm:
     - Carbon emissions: 30%
     - Energy efficiency: 25%
     - Waste management: 25%
     - Water conservation: 20%
   - Color-coded indicators (Red: <50, Yellow: 50-75, Green: 75+)

6. **Environmental Impact Analysis**
   - Calculate equivalent trees planted (based on carbon offset)
   - Show positive environmental actions:
     - Green energy used
     - Materials recycled
     - Water saved

7. **Trend Analysis**
   - Historical sustainability metrics over time
   - Month-over-month comparisons
   - Identify improvement opportunities

#### User Flow Example:
```
1. INSPECTOR logs in
2. Selects "Green Tower Construction" project
3. Navigates to "Sustainability Dashboard"
4. Clicks "Record New Metrics"
5. Enters data for current week:
   - Carbon Emissions: 5 tons CO2
   - Energy Used: 2,500 kWh (500 kWh from solar)
   - Waste Generated:
     - Recyclable: 800 kg
     - Non-recyclable: 200 kg
     - Hazardous: 50 kg
   - Water Used: 15,000 liters
6. System calculates:
   - Sustainability Score: 78/100 (Green)
   - Trees Equivalent: 272 trees planted
   - Waste Diversion Rate: 76%
7. Data saved and displayed in trend chart
8. Automated report generated and emailed to PROJECT_MANAGER
```

#### API Endpoints:
```
POST   /api/sustainability/metrics                      # Record new metrics
GET    /api/sustainability/metrics/:projectId           # Get all metrics for project
GET    /api/sustainability/metrics/:projectId/latest    # Get most recent metrics
PUT    /api/sustainability/metrics/:id                  # Update metrics record
GET    /api/sustainability/score/:projectId             # Get sustainability score
GET    /api/sustainability/trends/:projectId            # Get historical trends
POST   /api/sustainability/calculate-impact             # Calculate environmental impact
GET    /api/sustainability/compare/:projectId           # Compare with industry standards
```

#### Third-Party Integration:
- **Carbon Interface API:** Calculate carbon emissions from various activities
- **OpenWeatherMap API:** Get weather data that affects energy consumption calculations
- Alternative: Custom carbon calculation algorithms based on industry standards

---

### 5.3 Component 3: Document & Compliance Management

**Owner:** Member 2

**Purpose:** Centralized digital repository for all project documents with compliance tracking and safety inspection management.

#### Features:
1. **Document Management**
   - Upload documents with metadata:
     - Document type (Blueprint, Permit, Certificate, Safety Report, Contract, etc.)
     - Title and description
     - Version number
     - Associated project
   - Supported file types: PDF, DOCX, XLSX, JPG, PNG, DWG (AutoCAD)
   - File size limit: 10MB per document
   - Cloud storage integration (Cloudinary or AWS S3)
   - Document versioning (v1.0, v1.1, v2.0)
   - Document status workflow: Draft → Under Review → Approved → Rejected

2. **Document Categorization**
   - **Blueprints & Drawings:** Architectural and structural plans
   - **Permits & Licenses:** Government approvals, building permits
   - **Certificates:** ISO certifications, environmental clearances
   - **Safety Reports:** Incident reports, risk assessments
   - **Compliance Documents:** Environmental impact assessments
   - **Contracts:** Supplier agreements, labor contracts
   - **Other:** Miscellaneous project documents

3. **Compliance Checklist Management**
   - Pre-defined compliance templates:
     - Environmental compliance (EIA requirements)
     - Safety compliance (OSHA standards)
     - Building code compliance
     - Sustainability certifications (LEED, BREEAM)
   - Custom checklist creation
   - Item-level tracking:
     - Item description
     - Completion status (Pending/Completed)
     - Completion date
     - Responsible person
     - Attached documents
   - Overall compliance score calculation
   - Automated reminders for pending items

4. **Safety Inspection System**
   - Schedule inspections
   - Record inspection findings:
     - Inspection date
     - Inspector details
     - Findings and observations
     - Risk level assessment (Low/Medium/High)
     - Required actions
     - Photographic evidence
   - Follow-up action tracking
   - Inspection history with trends

5. **Document Search & Filtering**
   - Search by:
     - Document title/description
     - Document type
     - Upload date range
     - Project
     - Status
   - Advanced filters for quick access

6. **Access Control**
   - Document-level permissions
   - Watermarking for sensitive documents
   - Download tracking (who accessed what and when)

#### User Flow Example:
```
1. PROJECT_MANAGER uploads building permit
   - Selects project: "Green Tower Construction"
   - Document type: "Permit"
   - Title: "Municipal Building Permit - 2026"
   - Uploads PDF file → Stored in Cloudinary
   - Status: "Under Review"

2. INSPECTOR reviews and approves
   - Views document
   - Changes status to "Approved"
   - Adds approval notes

3. INSPECTOR creates compliance checklist
   - Template: "Environmental Compliance"
   - Items:
     ✅ Environmental Impact Assessment (Completed)
     ✅ Waste Management Plan (Completed)
     ⬜ Air Quality Monitoring (Pending)
     ⬜ Noise Level Assessment (Pending)
   - Attaches relevant documents to each item

4. INSPECTOR conducts safety inspection
   - Date: Feb 15, 2026
   - Findings: "Scaffolding not properly secured on 5th floor"
   - Risk Level: High
   - Action Required: "Immediate rectification within 24 hours"
   - Uploads inspection photos
   - System sends alert to PROJECT_MANAGER
```

#### API Endpoints:
```
# Document Management
POST   /api/documents/upload                    # Upload document
GET    /api/documents/:projectId                # Get all project documents
GET    /api/documents/:id                       # Get document details
PUT    /api/documents/:id                       # Update document metadata
DELETE /api/documents/:id                       # Delete document
GET    /api/documents/search                    # Search documents
PUT    /api/documents/:id/status                # Update document status

# Compliance
POST   /api/compliance/checklist                # Create compliance checklist
GET    /api/compliance/:projectId               # Get project compliance data
PUT    /api/compliance/:id/item/:itemId         # Update checklist item
GET    /api/compliance/:projectId/score         # Get compliance score

# Safety Inspections
POST   /api/safety/inspection                   # Create inspection record
GET    /api/safety/:projectId                   # Get project inspections
GET    /api/safety/inspection/:id               # Get inspection details
PUT    /api/safety/inspection/:id               # Update inspection
GET    /api/safety/:projectId/high-risk         # Get high-risk findings
```

#### Third-Party Integration:
- **Cloudinary (Primary):** 
  - File upload and storage
  - Image transformations and optimizations
  - CDN delivery
  - File metadata management
- **Alternative - AWS S3:**
  - Scalable object storage
  - Presigned URLs for secure access
  - S3 lifecycle policies for archival

---

### 5.4 Component 4: Resource & Material Management

**Owner:** Member 3

**Purpose:** Optimize resource allocation, track material inventory, and manage equipment to minimize waste and ensure timely project delivery.

#### Features:
1. **Material Inventory Management**
   - Track construction materials:
     - Material name and category (Cement, Steel, Wood, Aggregates, etc.)
     - Quantity and unit (kg, tons, cubic meters, pieces)
     - Unit price and total cost
     - Supplier information
     - Order date and expected delivery date
     - Actual delivery date
   - Material status tracking:
     - Ordered → In Transit → Delivered → In Stock → Used
   - Real-time inventory levels
   - Material usage history per project

2. **Low Stock Alerts**
   - Set minimum stock thresholds
   - Automated email notifications when stock falls below threshold
   - Suggested reorder quantities based on usage patterns
   - Critical materials flagging

3. **Equipment Management**
   - Equipment registry:
     - Equipment name and type (Excavator, Crane, Mixer, etc.)
     - Serial number and asset ID
     - Current status (Available, In Use, Under Maintenance, Damaged)
     - Current project assignment
     - Assigned operator/team member
   - Maintenance tracking:
     - Last maintenance date
     - Next scheduled maintenance
     - Maintenance history
   - Equipment utilization reports

4. **Supplier Management**
   - Supplier database:
     - Company name and contact details
     - Materials supplied
     - Sustainability certification status
     - Supplier rating (1-5 stars)
     - Payment terms
   - Supplier performance tracking:
     - On-time delivery rate
     - Quality ratings
     - Price competitiveness
   - Preferred supplier lists

5. **Resource Allocation**
   - Assign materials to specific projects
   - Track material consumption per project phase
   - Material transfer between projects
   - Waste tracking (damaged/expired materials)

6. **Sustainability Scoring for Materials**
   - Eco-friendliness rating (1-10):
     - Recycled content
     - Carbon footprint
     - Local sourcing
     - Certifications (FSC for wood, etc.)
   - Green material percentage calculation
   - Recommendations for sustainable alternatives

7. **Cost Tracking**
   - Total material cost per project
   - Budget vs. actual spending
   - Cost variance analysis
   - Cost projections based on current usage

#### User Flow Example:
```
1. PROJECT_MANAGER orders cement
   - Project: "Green Tower Construction"
   - Material: "Portland Cement"
   - Quantity: 100 tons
   - Unit Price: LKR 15,000/ton
   - Supplier: "Lanka Cement Co."
   - Expected Delivery: March 5, 2026
   - Sustainability Rating: 7/10 (contains 20% recycled content)
   - Status: "Ordered"

2. System tracks delivery
   - Status changes: Ordered → In Transit → Delivered
   - Delivery confirmation on March 5
   - Status: "In Stock"
   - Inventory updated: 100 tons added

3. Material usage tracking
   - March 10: 25 tons used for foundation work
   - Status: "Used"
   - Remaining inventory: 75 tons
   - Cost tracking: LKR 375,000 consumed

4. Low stock alert triggered
   - Threshold: 30 tons
   - Current stock: 75 tons → 25 tons (after usage)
   - Alert sent to PROJECT_MANAGER via email (SendGrid)
   - "Low stock alert: Portland Cement down to 25 tons"

5. Equipment assignment
   - Equipment: "Excavator CAT-320"
   - Assigned to: "Green Tower Construction"
   - Operator: John Silva
   - Status: "In Use"
   - Next maintenance: April 1, 2026

6. Supplier rating update
   - Delivery on-time: ✅
   - Quality: 5/5
   - Overall supplier rating: 4.8/5
```

#### API Endpoints:
```
# Material Management
POST   /api/materials                           # Add new material order
GET    /api/materials/:projectId                # Get project materials
GET    /api/materials/:id                       # Get material details
PUT    /api/materials/:id                       # Update material
DELETE /api/materials/:id                       # Delete material
GET    /api/materials/low-stock                 # Get low stock items
GET    /api/materials/:projectId/cost-summary   # Get cost summary
PUT    /api/materials/:id/status                # Update material status

# Equipment Management
POST   /api/equipment                           # Add equipment
GET    /api/equipment/:projectId                # Get project equipment
GET    /api/equipment/:id                       # Get equipment details
PUT    /api/equipment/:id/status                # Update equipment status
POST   /api/equipment/:id/maintenance           # Record maintenance
GET    /api/equipment/available                 # Get available equipment

# Supplier Management
POST   /api/suppliers                           # Add supplier
GET    /api/suppliers                           # Get all suppliers
GET    /api/suppliers/:id                       # Get supplier details
PUT    /api/suppliers/:id                       # Update supplier
GET    /api/suppliers/:id/performance           # Get supplier performance
POST   /api/suppliers/:id/rate                  # Rate supplier
```

#### Third-Party Integration:
- **SendGrid / Nodemailer:**
  - Low stock email alerts
  - Delivery confirmation emails
  - Maintenance reminder emails
  - Purchase order notifications to suppliers
- **Alternative - Twilio:**
  - SMS alerts for critical stock levels
  - Equipment maintenance reminders

---

## 6. System Workflows

### 6.1 Project Creation Workflow

```
┌─────────────────┐
│  Login          │
│  (PM/ADMIN)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Navigate to     │
│ "Projects"      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click "Create   │
│ New Project"    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Fill Project Details Form:      │
│ - Name, Description             │
│ - Location (Google Maps API)    │
│ - Budget, Timeline              │
│ - Assign PM                     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Add Milestones  │
│ (Optional)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Submit Form     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Backend Validation:             │
│ - Check required fields         │
│ - Validate date ranges          │
│ - Check budget format           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Save to MongoDB:                │
│ - Generate project ID           │
│ - Create project document       │
│ - Initialize sustainability     │
│   metrics (score: 0)            │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Notifications:                  │
│ - Email to assigned PM          │
│ - Email to team members         │
│ - Log activity                  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Redirect to     │
│ Project Detail  │
│ Page            │
└─────────────────┘
```

### 6.2 Sustainability Monitoring Workflow

```
┌─────────────────┐
│  Login          │
│  (Inspector)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select Project  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Navigate to Sustainability Tab  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ View Current Metrics Dashboard: │
│ - Latest sustainability score   │
│ - Trend charts                  │
│ - Comparison with benchmarks    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Click "Record   │
│ New Metrics"    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Fill Metrics Form:              │
│ - Carbon emissions (tons)       │
│ - Energy consumption (kWh)      │
│ - Waste breakdown (kg)          │
│ - Water usage (liters)          │
│ - Date of measurement           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Submit Metrics  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Backend Processing:             │
│ 1. Validate input data          │
│ 2. Call Carbon Interface API    │
│    (if applicable)              │
│ 3. Calculate sustainability     │
│    score (weighted algorithm)   │
│ 4. Calculate environmental      │
│    impact (trees equivalent)    │
│ 5. Determine score category     │
│    (Green/Yellow/Red)           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Save to MongoDB:                │
│ - SustainabilityMetric doc      │
│ - Update project's overall      │
│   sustainability score          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Generate Insights:              │
│ - Compare with previous periods │
│ - Identify trends (improving/   │
│   declining)                    │
│ - Flag areas needing attention  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Update Dashboard:               │
│ - New score displayed           │
│ - Trend chart updated           │
│ - Recommendations shown         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Notifications:                  │
│ - Email report to PM            │
│ - Alert if score below          │
│   threshold                     │
└─────────────────────────────────┘
```

### 6.3 Document Upload & Approval Workflow

```
┌─────────────────┐
│  Login          │
│  (PM/Inspector) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select Project  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Navigate to     │
│ "Documents"     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click "Upload   │
│ Document"       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Fill Upload Form:               │
│ - Document type (dropdown)      │
│ - Title                         │
│ - Description                   │
│ - Select file (browse)          │
│ - Version number                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Click "Upload"  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Frontend Validation:            │
│ - Check file size (<10MB)       │
│ - Check file type               │
│ - Check required fields         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Upload to Cloudinary:           │
│ 1. Send file to Cloudinary API  │
│ 2. Receive secure URL           │
│ 3. Receive cloudinary_id        │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Save to MongoDB:                │
│ - Document metadata             │
│ - File URL from Cloudinary      │
│ - Status: "Draft"               │
│ - Uploaded by (user ID)         │
│ - Timestamp                     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Notification:                   │
│ - Email to assigned Inspector   │
│   for review                    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Document List   │
│ Updated         │
│ Status: Draft   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ INSPECTOR Reviews:              │
│ 1. Opens document (from URL)    │
│ 2. Reviews content              │
│ 3. Makes decision               │
└────────┬────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│Approve │ │  Reject  │
└───┬────┘ └────┬─────┘
    │           │
    │           ▼
    │      ┌─────────────────┐
    │      │ Status: Rejected│
    │      │ Add rejection   │
    │      │ reason          │
    │      │ Notify uploader │
    │      └─────────────────┘
    │
    ▼
┌─────────────────┐
│Status: Approved │
│Add approval note│
│Update timestamp │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Notification:                   │
│ - Email to PM                   │
│ - "Document XYZ approved"       │
└─────────────────────────────────┘
```

### 6.4 Material Ordering & Alert Workflow

```
┌─────────────────┐
│  Login          │
│  (PM)           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Navigate to     │
│ "Resources"     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click "Order    │
│ Material"       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Fill Material Form:             │
│ - Material name                 │
│ - Category (dropdown)           │
│ - Quantity + Unit               │
│ - Supplier (dropdown)           │
│ - Expected delivery date        │
│ - Unit price                    │
│ - Sustainability rating         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Submit Order    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Backend Processing:             │
│ 1. Validate data                │
│ 2. Calculate total cost         │
│ 3. Check budget availability    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Save to MongoDB:                │
│ - Material document             │
│ - Status: "Ordered"             │
│ - Order date: Now               │
│ - Link to project               │
│ - Link to supplier              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Email Notification (SendGrid):  │
│ - To: Supplier email            │
│ - Subject: "New Purchase Order" │
│ - Body: Order details           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Material Status │
│ Tracking Begins │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Status Updates (SUPPLIER/PM):   │
│ - Ordered → In Transit          │
│ - In Transit → Delivered        │
│ - Delivered → In Stock          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Material Usage:                 │
│ - PM updates quantity used      │
│ - Status: "Used"                │
│ - Inventory decreased           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Check Stock Level:              │
│ IF (current_qty < threshold)    │
│   THEN trigger alert            │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Low Stock Alert:                │
│ 1. Create alert record          │
│ 2. Send email (SendGrid)        │
│    - To: PM email               │
│    - Subject: "Low Stock Alert" │
│    - Body: Material details +   │
│            suggested reorder qty│
│ 3. Display badge on dashboard   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ PM Reviews      │
│ Alert           │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│Reorder │ │  Dismiss │
│Material│ │  Alert   │
└───┬────┘ └──────────┘
    │
    ▼
┌─────────────────┐
│ Create New      │
│ Material Order  │
│ (loop back)     │
└─────────────────┘
```

---

## 7. Technical Specifications

### 7.1 Technology Stack

#### Backend:
- **Runtime:** Node.js v18+
- **Framework:** Express.js v4.18+
- **Language:** JavaScript (ES6+) or TypeScript
- **Database:** MongoDB v6+ (via Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi or Zod
- **File Upload:** Multer
- **Email:** SendGrid or Nodemailer
- **Testing:** Jest + Supertest
- **API Documentation:** Swagger (swagger-jsdoc + swagger-ui-express)
- **Security:** Helmet, CORS, bcrypt, express-rate-limit

#### Frontend:
- **Library:** React v18+
- **Language:** JavaScript or TypeScript
- **State Management:** Redux Toolkit or Context API + useReducer
- **Routing:** React Router v6
- **HTTP Client:** Axios or Fetch API
- **Styling:** TailwindCSS v3+
- **UI Components:** Headless UI or shadcn/ui
- **Forms:** React Hook Form + Yup validation
- **Charts:** Recharts or Chart.js
- **Maps:** React Google Maps API (@react-google-maps/api)
- **Icons:** Heroicons or Lucide React

#### Deployment:
- **Backend:** Render, Railway, or Heroku
- **Frontend:** Vercel or Netlify
- **Database:** MongoDB Atlas (Cloud)
- **File Storage:** Cloudinary or AWS S3
- **CI/CD:** GitHub Actions

### 7.2 Development Tools

- **Version Control:** Git + GitHub
- **Code Editor:** VS Code
- **API Testing:** Postman or Insomnia
- **Package Manager:** npm or yarn
- **Linting:** ESLint + Prettier
- **Performance Testing:** Artillery.io

### 7.3 Non-Functional Requirements

#### Performance:
- API response time: <500ms for 95% of requests
- Frontend initial load: <3 seconds
- Support 100 concurrent users
- Database query optimization with indexes

#### Security:
- HTTPS encryption for all communication
- JWT tokens expire after 24 hours
- Password hashing with bcrypt (salt rounds: 10)
- Rate limiting: 100 requests per 15 minutes per IP
- Input sanitization to prevent XSS/SQL injection
- File upload validation (type, size, malware scanning)

#### Scalability:
- Horizontal scaling capability
- Database connection pooling
- Caching strategy (Redis for future enhancement)
- CDN for static assets

#### Reliability:
- 99.5% uptime target
- Automated backups (daily)
- Error logging with Winston or Morgan
- Graceful error handling (no 500 errors exposed to users)

#### Usability:
- Responsive design (mobile, tablet, desktop)
- Accessible (WCAG 2.1 Level AA compliance goal)
- Intuitive navigation
- Loading indicators for async operations
- Form validation with clear error messages

---

## 8. Third-Party Integrations

### 8.1 Google Maps API (Component 1)

**Purpose:** Visualize project locations on interactive maps

**APIs Used:**
- Geocoding API
- Maps JavaScript API
- Places API (optional for autocomplete)

**Implementation:**
```javascript
// Backend - Geocoding
const geocodeAddress = async (address) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json`,
    {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    }
  );
  
  const { lat, lng } = response.data.results[0].geometry.location;
  return { latitude: lat, longitude: lng };
};

// Frontend - Display Map
import { GoogleMap, Marker } from '@react-google-maps/api';

<GoogleMap
  center={{ lat: project.location.latitude, lng: project.location.longitude }}
  zoom={15}
>
  <Marker position={{ lat: project.location.latitude, lng: project.location.longitude }} />
</GoogleMap>
```

**Rate Limits:** 40,000 requests/month (free tier)

---

### 8.2 Carbon Interface API (Component 2)

**Purpose:** Calculate carbon emissions from various activities

**API Endpoints:**
- `/estimates` - Calculate CO2 emissions

**Implementation:**
```javascript
const calculateCarbonEmissions = async (activityData) => {
  const response = await axios.post(
    'https://www.carboninterface.com/api/v1/estimates',
    {
      type: 'electricity',
      electricity_unit: 'kwh',
      electricity_value: activityData.energyUsed,
      country: 'lk'
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.data.attributes.carbon_kg; // CO2 in kg
};
```

**Alternative:** Custom carbon calculation formulas based on industry standards

**Rate Limits:** 200 requests/month (free tier)

---

### 8.3 Cloudinary (Component 3)

**Purpose:** Cloud-based file storage and management

**Features Used:**
- File upload
- Image transformations
- CDN delivery
- File metadata management

**Implementation:**
```javascript
// Backend - Upload
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadDocument = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'construction-docs',
    resource_type: 'auto'
  });
  
  return {
    url: result.secure_url,
    cloudinary_id: result.public_id,
    format: result.format,
    size: result.bytes
  };
};

// Frontend - Display
<img src={document.url} alt={document.title} />
<a href={document.url} download>Download</a>
```

**Storage Limits:** 25 GB (free tier)

---

### 8.4 SendGrid (Component 4)

**Purpose:** Transactional email notifications

**Email Types:**
- Low stock alerts
- Delivery confirmations
- Maintenance reminders
- Purchase order notifications

**Implementation:**
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendLowStockAlert = async (material, projectManager) => {
  const msg = {
    to: projectManager.email,
    from: 'alerts@constructionapp.com',
    subject: `Low Stock Alert: ${material.name}`,
    html: `
      <h2>Low Stock Alert</h2>
      <p>The following material is running low:</p>
      <ul>
        <li><strong>Material:</strong> ${material.name}</li>
        <li><strong>Current Stock:</strong> ${material.quantity} ${material.unit}</li>
        <li><strong>Threshold:</strong> ${material.minThreshold} ${material.unit}</li>
        <li><strong>Suggested Reorder:</strong> ${material.suggestedReorder} ${material.unit}</li>
      </ul>
      <p>Please consider reordering to avoid project delays.</p>
    `
  };
  
  await sgMail.send(msg);
};
```

**Rate Limits:** 100 emails/day (free tier)

**Alternative:** Nodemailer with Gmail SMTP

---

## 9. Database Design

### 9.1 Collections Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                         │
│                 "construction_management"                   │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                               │
│  1. users              - User accounts & authentication     │
│  2. projects           - Construction projects              │
│  3. milestones         - Project milestones                 │
│  4. sustainability     - Environmental metrics              │
│  5. documents          - Document metadata                  │
│  6. compliance         - Compliance checklists              │
│  7. inspections        - Safety inspection records          │
│  8. materials          - Material inventory                 │
│  9. equipment          - Equipment registry                 │
│  10. suppliers         - Supplier information               │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Schema Definitions

#### Collection: `users`
```javascript
{
  _id: ObjectId,
  fullName: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: ['ADMIN', 'PROJECT_MANAGER', 'INSPECTOR', 'SUPPLIER', 'VIEWER']),
  assignedProjects: [ObjectId] (ref: 'Project'),
  phoneNumber: String,
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date (default: now),
  updatedAt: Date
}

// Indexes
email: 1 (unique)
role: 1
```

#### Collection: `projects`
```javascript
{
  _id: ObjectId,
  projectName: String (required),
  description: String,
  location: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  startDate: Date (required),
  endDate: Date (required),
  status: String (enum: ['Planning', 'In Progress', 'On Hold', 'Completed'], default: 'Planning'),
  budget: Number (required),
  actualCost: Number (default: 0),
  projectManager: ObjectId (ref: 'User', required),
  teamMembers: [ObjectId] (ref: 'User'),
  sustainabilityScore: Number (default: 0, min: 0, max: 100),
  currentPhase: String,
  completionPercentage: Number (default: 0),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (default: now),
  updatedAt: Date
}

// Indexes
projectManager: 1
status: 1
startDate: -1
```

#### Collection: `milestones`
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'Project', required),
  title: String (required),
  description: String,
  targetDate: Date (required),
  completionDate: Date,
  status: String (enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending'),
  completionPercentage: Number (default: 0, min: 0, max: 100),
  dependencies: [ObjectId] (ref: 'Milestone'),
  assignedTo: ObjectId (ref: 'User'),
  createdAt: Date (default: now),
  updatedAt: Date
}

// Indexes
projectId: 1
status: 1
targetDate: 1
```

#### Collection: `sustainability`
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'Project', required),
  
  // Carbon Footprint
  carbonEmissions: {
    transportation: Number (default: 0),
    equipment: Number (default: 0),
    materials: Number (default: 0),
    total: Number (default: 0)
  },
  
  // Energy
  energyConsumption: {
    electricity: Number (default: 0), // kWh
    diesel: Number (default: 0),      // liters
    renewableEnergy: Number (default: 0), // kWh
    total: Number (default: 0)
  },
  
  // Waste
  wasteManagement: {
    recyclable: Number (default: 0),    // kg
    nonRecyclable: Number (default: 0), // kg
    hazardous: Number (default: 0),     // kg
    total: Number (default: 0),
    diversionRate: Number (default: 0)  // percentage
  },
  
  // Water
  waterUsage: {
    municipal: Number (default: 0),  // liters
    recycled: Number (default: 0),   // liters
    total: Number (default: 0)
  },
  
  // Calculated Metrics
  sustainabilityScore: Number (min: 0, max: 100),
  treesEquivalent: Number,
  scoreCategory: String (enum: ['Red', 'Yellow', 'Green']),
  
  // Metadata
  recordedDate: Date (required),
  recordedBy: ObjectId (ref: 'User'),
  notes: String,
  createdAt: Date (default: now),
  updatedAt: Date
}

// Indexes
projectId: 1
recordedDate: -1
sustainabilityScore: -1
```

#### Collection: `documents`
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'Project', required),
  documentType: String (enum: ['Blueprint', 'Permit', 'Certificate', 'Safety Report', 'Contract', 'Other'], required),
  title: String (required),
  description: String,
  
  // File Information
  fileUrl: String (required), // Cloudinary URL
  cloudinaryId: String,
  fileName: String,
  fileSize: Number,  // bytes
  fileFormat: String, // pdf, jpg, png, etc.
  
  // Version Control
  version: String (default: '1.0'),
  previousVersions: [{
    version: String,
    fileUrl: String,
    uploadedAt: Date,
    uploadedBy: ObjectId (ref: 'User')
  }],
  
  // Status Workflow
  status: String (enum: ['Draft', 'Under Review', 'Approved', 'Rejected'], default: 'Draft'),
  approvedBy: ObjectId (ref: 'User'),
  approvalDate: Date,
  rejectionReason: String,
  
  // Metadata
  uploadedBy: ObjectId (ref: 'User', required),
  tags: [String],
  accessLog: [{
    userId: ObjectId (ref: 'User'),
    action: String (enum: ['view', 'download', 'edit']),
    timestamp: Date
  }],
  
  createdAt: Date (default: now),
  updatedAt: Date
}

// Indexes
projectId: 1
documentType: 1
status: 1
uploadedBy: 1
```

#### Collection: `compliance`
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'Project', required),
  checklistName: String (required),
  category: String (enum: ['Environmental', 'Safety', 'Building Code', 'Sustainability Certification']),
  
  items: [{
    itemId: String (unique within array),
    itemName: String (required),
    description: String,
    isCompleted: Boolean (default: false),
    completedDate: Date,
    completedBy: ObjectId (ref: 'User'),
    attachedDocuments: [ObjectId] (ref: 'Document'),
    notes: String
  }],
  
  // Compliance Metrics
  totalItems: Number,
  completedItems: Number,
  complianceScore: Number (calculated: completedItems/totalItems * 100),
  
  // Metadata
  createdBy: ObjectId (ref: 'User'),
  dueDate: Date,
  lastReviewDate: Date,
  createdAt: Date (default: now),
  updatedAt: Date
}

// Indexes
projectId: 1
category: 1
complianceScore: 1
```

#### Collection: `inspections`
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'Project', required),
  inspectionType: String (enum: ['Safety', 'Environmental', 'Quality', 'Structural']),
  inspectionDate: Date (required),
  
  // Inspector Information
  inspector: ObjectId (ref: 'User', required),
  inspectorNotes: String,
  
  // Findings
  findings: String (required),
  riskLevel: String (enum: ['Low', 'Medium', 'High', 'Critical'], required),
  issuesIdentified: [{
    issue: String,
    severity: String (enum: ['Minor', 'Moderate', 'Major']),
    location: String
  }],
  
  // Actions
  actionRequired: String,
  recommendedActions: [String],
  actionDeadline: Date,
  actionStatus: String (enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending'),
  
  // Attachments
  attachments: [ObjectId] (ref: 'Document'),
  photos: [{
    url: String,
    caption: String,
    uploadedAt: Date
  }],
  
  // Follow-up
  followUpDate: Date,
  followUpNotes: String,
  isResolved: Boolean (default: false),
  
  createdAt: Date (default: now),
  updatedAt: Date
}

// Indexes
projectId: 1
riskLevel: 1
inspectionDate: -1
isResolved: 1
```

#### Collection: `materials`
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'Project', required),
  
  // Material Information
  materialName: String (required),
  category: String (enum: ['Cement', 'Steel', 'Wood', 'Aggregates', 'Bricks', 'Equipment', 'Other'], required),
  description: String,
  
  // Quantity & Pricing
  quantity: Number (required),
  unit: String (required), // kg, tons, cubic meters, pieces, etc.
  unitPrice: Number (required),
  totalCost: Number (calculated: quantity * unitPrice),
  
  // Supplier Information
  supplier: ObjectId (ref: 'Supplier', required),
  purchaseOrderNumber: String,
  
  // Delivery Tracking
  orderDate: Date (required),
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  status: String (enum: ['Ordered', 'In Transit', 'Delivered', 'In Stock', 'Used', 'Cancelled'], default: 'Ordered'),
  
  // Stock Management
  currentStock: Number (default: 0),
  minimumThreshold: Number (default: 0),
  suggestedReorderQuantity: Number,
  
  // Usage Tracking
  usageHistory: [{
    usedQuantity: Number,
    usedDate: Date,
    usedBy: ObjectId (ref: 'User'),
    purpose: String,
    notes: String
  }],
  
  // Sustainability
  sustainabilityRating: Number (min: 0, max: 10),
  isEcoFriendly: Boolean (default: false),
  recycledContent: Number (percentage, default: 0),
  certifications: [String], // FSC, LEED, etc.
  
  // Metadata
  createdBy: ObjectId (ref: 'User'),
  notes: String,
  createdAt: Date (default: now),
  updatedAt: Date
}

// Indexes
projectId: 1
status: 1
supplier: 1
currentStock: 1
```

#### Collection: `equipment`
```javascript
{
  _id: ObjectId,
  
  // Equipment Information
  equipmentName: String (required),
  equipmentType: String (enum: ['Excavator', 'Crane', 'Bulldozer', 'Mixer', 'Loader', 'Other'], required),
  serialNumber: String (unique),
  assetId: String (unique),
  manufacturer: String,
  model: String,
  yearOfManufacture: Number,
  
  // Current Assignment
  currentProjectId: ObjectId (ref: 'Project'),
  assignedTo: ObjectId (ref: 'User'),
  status: String (enum: ['Available', 'In Use', 'Under Maintenance', 'Damaged', 'Retired'], default: 'Available'),
  
  // Maintenance Tracking
  lastMaintenanceDate: Date,
  nextScheduledMaintenance: Date,
  maintenanceHistory: [{
    maintenanceDate: Date,
    maintenanceType: String (enum: ['Routine', 'Repair', 'Overhaul']),
    description: String,
    cost: Number,
    performedBy: String,
    nextMaintenanceDate: Date
  }],
  
  // Assignment History
  assignmentHistory: [{
    projectId: ObjectId (ref: 'Project'),
    assignedDate: Date,
    returnedDate: Date,
    operatorId: ObjectId (ref: 'User'),
    hoursUsed: Number,
    fuelConsumed: Number
  }],
  
  // Cost & Value
  purchasePrice: Number,
  currentValue: Number,
  depreciationRate: Number,
  rentalRatePerDay: Number,
  
  // Location
  currentLocation: String,
  
  // Metadata
  notes: String,
  createdAt: Date (default: now),
  updatedAt: Date
}

// Indexes
serialNumber: 1 (unique)
status: 1
currentProjectId: 1
nextScheduledMaintenance: 1
```

#### Collection: `suppliers`
```javascript
{
  _id: ObjectId,
  
  // Company Information
  companyName: String (required, unique),
  registrationNumber: String,
  vatNumber: String,
  
  // Contact Information
  contactPerson: String (required),
  email: String (required),
  phoneNumber: String (required),
  alternatePhone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  
  // Business Details
  materialsSupplied: [String], // categories of materials
  servicesProvided: [String],
  paymentTerms: String,
  deliveryLeadTime: Number (days),
  
  // Performance Metrics
  totalOrders: Number (default: 0),
  completedOrders: Number (default: 0),
  onTimeDeliveryRate: Number (percentage, default: 0),
  averageRating: Number (min: 0, max: 5, default: 0),
  
  ratings: [{
    ratedBy: ObjectId (ref: 'User'),
    rating: Number (min: 1, max: 5),
    comment: String,
    ratedDate: Date
  }],
  
  // Sustainability
  isSustainabilityCertified: Boolean (default: false),
  certifications: [String], // ISO 14001, etc.
  sustainabilityScore: Number (min: 0, max: 10),
  
  // Status
  isActive: Boolean (default: true),
  isPreferred: Boolean (default: false),
  blacklisted: Boolean (default: false),
  blacklistReason: String,
  
  // Metadata
  addedBy: ObjectId (ref: 'User'),
  notes: String,
  createdAt: Date (default: now),
  updatedAt: Date
}

// Indexes
companyName: 1 (unique)
email: 1
isActive: 1
averageRating: -1
```

### 9.3 Relationships Diagram

```
users ─────────┬─────────────────┐
               │                 │
               │                 │
          createdBy          projectManager
               │                 │
               ▼                 ▼
         projects ◄───────── milestones
               │                 
               │                 
          projectId              
               │                 
               ├────────────► sustainability
               │                 
               ├────────────► documents
               │                 
               ├────────────► compliance
               │                 
               ├────────────► inspections
               │                 
               └────────────► materials ───► suppliers
                              equipment
```

---

## 10. API Specifications

### 10.1 Authentication Endpoints

#### POST `/api/auth/register`
**Description:** Register a new user account  
**Access:** Public  
**Request Body:**
```json
{
  "fullName": "John Silva",
  "email": "john.silva@example.com",
  "password": "SecurePass123!",
  "role": "PROJECT_MANAGER",
  "phoneNumber": "+94771234567"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "65f8a9c8d9e7f8a9b0c1d2e3",
    "fullName": "John Silva",
    "email": "john.silva@example.com",
    "role": "PROJECT_MANAGER",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/login`
**Description:** Authenticate user and receive JWT token  
**Access:** Public  
**Request Body:**
```json
{
  "email": "john.silva@example.com",
  "password": "SecurePass123!"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "65f8a9c8d9e7f8a9b0c1d2e3",
    "fullName": "John Silva",
    "email": "john.silva@example.com",
    "role": "PROJECT_MANAGER",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

#### GET `/api/auth/me`
**Description:** Get current authenticated user details  
**Access:** Protected (requires valid JWT)  
**Headers:** `Authorization: Bearer <token>`  
**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "65f8a9c8d9e7f8a9b0c1d2e3",
    "fullName": "John Silva",
    "email": "john.silva@example.com",
    "role": "PROJECT_MANAGER",
    "assignedProjects": ["65f8b1c2d3e4f5a6b7c8d9e0"],
    "lastLogin": "2026-02-07T10:30:00.000Z"
  }
}
```

---

### 10.2 Project Management Endpoints

#### POST `/api/projects`
**Description:** Create a new construction project  
**Access:** Protected (ADMIN, PROJECT_MANAGER)  
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "projectName": "Green Tower Construction",
  "description": "Sustainable high-rise residential building",
  "location": {
    "address": "123 Main St, Colombo, Sri Lanka",
    "latitude": 6.9271,
    "longitude": 79.8612
  },
  "startDate": "2026-03-01",
  "endDate": "2026-12-31",
  "budget": 50000000,
  "projectManager": "65f8a9c8d9e7f8a9b0c1d2e3",
  "teamMembers": ["65f8b1c2d3e4f5a6b7c8d9e0", "65f8c3d4e5f6a7b8c9d0e1f2"]
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
    "projectName": "Green Tower Construction",
    "description": "Sustainable high-rise residential building",
    "location": {
      "address": "123 Main St, Colombo, Sri Lanka",
      "latitude": 6.9271,
      "longitude": 79.8612
    },
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": "2026-12-31T00:00:00.000Z",
    "status": "Planning",
    "budget": 50000000,
    "sustainabilityScore": 0,
    "completionPercentage": 0,
    "createdAt": "2026-02-07T11:00:00.000Z"
  }
}
```

#### GET `/api/projects`
**Description:** Get all projects with optional filters and pagination  
**Access:** Protected (All authenticated users)  
**Query Parameters:**
- `status` (optional): Filter by status (Planning, In Progress, On Hold, Completed)
- `manager` (optional): Filter by project manager ID
- `search` (optional): Search by project name or description
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `sortBy` (optional, default: createdAt): Sort field
- `sortOrder` (optional, default: desc): asc or desc

**Example:** `GET /api/projects?status=In Progress&page=1&limit=10&sortBy=startDate&sortOrder=desc`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
        "projectName": "Green Tower Construction",
        "status": "In Progress",
        "location": {
          "address": "123 Main St, Colombo, Sri Lanka"
        },
        "startDate": "2026-03-01T00:00:00.000Z",
        "endDate": "2026-12-31T00:00:00.000Z",
        "budget": 50000000,
        "sustainabilityScore": 78,
        "completionPercentage": 35,
        "projectManager": {
          "userId": "65f8a9c8d9e7f8a9b0c1d2e3",
          "fullName": "John Silva"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProjects": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### GET `/api/projects/:id`
**Description:** Get detailed information about a specific project  
**Access:** Protected (All authenticated users)  
**Response (200):**
```json
{
  "success": true,
  "data": {
    "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
    "projectName": "Green Tower Construction",
    "description": "Sustainable high-rise residential building",
    "location": {
      "address": "123 Main St, Colombo, Sri Lanka",
      "latitude": 6.9271,
      "longitude": 79.8612
    },
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": "2026-12-31T00:00:00.000Z",
    "status": "In Progress",
    "budget": 50000000,
    "actualCost": 17500000,
    "sustainabilityScore": 78,
    "completionPercentage": 35,
    "currentPhase": "Structural Works",
    "projectManager": {
      "userId": "65f8a9c8d9e7f8a9b0c1d2e3",
      "fullName": "John Silva",
      "email": "john.silva@example.com"
    },
    "teamMembers": [
      {
        "userId": "65f8b1c2d3e4f5a6b7c8d9e0",
        "fullName": "Sarah Fernando",
        "role": "INSPECTOR"
      }
    ],
    "milestones": [
      {
        "milestoneId": "65f8e7f8a9b0c1d2e3f4a5b6",
        "title": "Foundation Complete",
        "status": "Completed",
        "completionPercentage": 100,
        "targetDate": "2026-04-30T00:00:00.000Z"
      }
    ],
    "createdAt": "2026-02-07T11:00:00.000Z",
    "updatedAt": "2026-02-07T14:30:00.000Z"
  }
}
```

---

### 10.3 Sustainability Monitoring Endpoints

#### POST `/api/sustainability/metrics`
**Description:** Record new sustainability metrics for a project  
**Access:** Protected (ADMIN, PROJECT_MANAGER, INSPECTOR)  
**Request Body:**
```json
{
  "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
  "carbonEmissions": {
    "transportation": 1.5,
    "equipment": 2.3,
    "materials": 1.2
  },
  "energyConsumption": {
    "electricity": 2500,
    "diesel": 150,
    "renewableEnergy": 500
  },
  "wasteManagement": {
    "recyclable": 800,
    "nonRecyclable": 200,
    "hazardous": 50
  },
  "waterUsage": {
    "municipal": 12000,
    "recycled": 3000
  },
  "recordedDate": "2026-02-07",
  "notes": "Weekly sustainability audit"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Sustainability metrics recorded successfully",
  "data": {
    "metricsId": "65f9a1b2c3d4e5f6a7b8c9d0",
    "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
    "carbonEmissions": {
      "transportation": 1.5,
      "equipment": 2.3,
      "materials": 1.2,
      "total": 5.0
    },
    "energyConsumption": {
      "electricity": 2500,
      "diesel": 150,
      "renewableEnergy": 500,
      "total": 3150
    },
    "wasteManagement": {
      "recyclable": 800,
      "nonRecyclable": 200,
      "hazardous": 50,
      "total": 1050,
      "diversionRate": 76.19
    },
    "waterUsage": {
      "municipal": 12000,
      "recycled": 3000,
      "total": 15000
    },
    "sustainabilityScore": 78,
    "scoreCategory": "Green",
    "treesEquivalent": 272,
    "recordedDate": "2026-02-07T00:00:00.000Z",
    "createdAt": "2026-02-07T15:00:00.000Z"
  }
}
```

#### GET `/api/sustainability/score/:projectId`
**Description:** Get current sustainability score and analysis for a project  
**Access:** Protected (All authenticated users)  
**Response (200):**
```json
{
  "success": true,
  "data": {
    "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
    "projectName": "Green Tower Construction",
    "currentScore": 78,
    "scoreCategory": "Green",
    "scoreBreakdown": {
      "carbonEmissions": 23,
      "energyEfficiency": 20,
      "wasteManagement": 19,
      "waterConservation": 16
    },
    "lastUpdated": "2026-02-07T15:00:00.000Z",
    "trend": "improving",
    "benchmarkComparison": {
      "industryAverage": 65,
      "difference": 13
    },
    "recommendations": [
      "Increase renewable energy usage to reach 85+ score",
      "Improve waste diversion rate by 5% for better performance"
    ]
  }
}
```

#### GET `/api/sustainability/trends/:projectId`
**Description:** Get historical sustainability trends for a project  
**Access:** Protected (All authenticated users)  
**Query Parameters:**
- `period` (optional, default: 30): Number of days to retrieve
- `interval` (optional, default: weekly): daily, weekly, monthly

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
    "period": "30 days",
    "interval": "weekly",
    "trends": [
      {
        "week": "2026-W01",
        "startDate": "2026-01-01",
        "endDate": "2026-01-07",
        "sustainabilityScore": 72,
        "carbonEmissions": 5.2,
        "energyConsumption": 2800,
        "wasteGenerated": 1100,
        "waterUsage": 16000
      },
      {
        "week": "2026-W02",
        "startDate": "2026-01-08",
        "endDate": "2026-01-14",
        "sustainabilityScore": 75,
        "carbonEmissions": 4.8,
        "energyConsumption": 2600,
        "wasteGenerated": 1050,
        "waterUsage": 15500
      },
      {
        "week": "2026-W06",
        "startDate": "2026-02-01",
        "endDate": "2026-02-07",
        "sustainabilityScore": 78,
        "carbonEmissions": 5.0,
        "energyConsumption": 3150,
        "wasteGenerated": 1050,
        "waterUsage": 15000
      }
    ],
    "summary": {
      "averageScore": 75,
      "scoreImprovement": 6,
      "totalCarbonReduced": 1.2,
      "totalWasteRecycled": 2850
    }
  }
}
```

---

### 10.4 Document Management Endpoints

#### POST `/api/documents/upload`
**Description:** Upload a new document to a project  
**Access:** Protected (ADMIN, PROJECT_MANAGER, INSPECTOR)  
**Content-Type:** `multipart/form-data`  
**Request Body (FormData):**
```
file: [File object]
projectId: "65f8d5e6f7a8b9c0d1e2f3a4"
documentType: "Permit"
title: "Building Permit - 2026"
description: "Municipal building permit for Green Tower"
version: "1.0"
```
**Response (201):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "documentId": "65faa2b3c4d5e6f7a8b9c0d1",
    "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
    "documentType": "Permit",
    "title": "Building Permit - 2026",
    "description": "Municipal building permit for Green Tower",
    "fileUrl": "https://res.cloudinary.com/xyz/image/upload/v1234/construction-docs/permit_abc123.pdf",
    "fileName": "building_permit_2026.pdf",
    "fileSize": 2457600,
    "fileFormat": "pdf",
    "version": "1.0",
    "status": "Draft",
    "uploadedBy": {
      "userId": "65f8a9c8d9e7f8a9b0c1d2e3",
      "fullName": "John Silva"
    },
    "createdAt": "2026-02-07T16:00:00.000Z"
  }
}
```

#### GET `/api/documents/:projectId`
**Description:** Get all documents for a specific project  
**Access:** Protected (All authenticated users)  
**Query Parameters:**
- `type` (optional): Filter by document type
- `status` (optional): Filter by status
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "documentId": "65faa2b3c4d5e6f7a8b9c0d1",
        "documentType": "Permit",
        "title": "Building Permit - 2026",
        "fileUrl": "https://res.cloudinary.com/.../permit_abc123.pdf",
        "fileName": "building_permit_2026.pdf",
        "fileSize": 2457600,
        "version": "1.0",
        "status": "Approved",
        "uploadedBy": {
          "fullName": "John Silva"
        },
        "uploadedAt": "2026-02-07T16:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalDocuments": 52
    }
  }
}
```

---

### 10.5 Material Management Endpoints

#### POST `/api/materials`
**Description:** Add a new material order  
**Access:** Protected (ADMIN, PROJECT_MANAGER)  
**Request Body:**
```json
{
  "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
  "materialName": "Portland Cement",
  "category": "Cement",
  "quantity": 100,
  "unit": "tons",
  "unitPrice": 15000,
  "supplier": "65fab3c4d5e6f7a8b9c0d1e2",
  "expectedDeliveryDate": "2026-03-05",
  "sustainabilityRating": 7,
  "minimumThreshold": 30
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Material order created successfully",
  "data": {
    "materialId": "65fbc5d6e7f8a9b0c1d2e3f4",
    "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
    "materialName": "Portland Cement",
    "category": "Cement",
    "quantity": 100,
    "unit": "tons",
    "unitPrice": 15000,
    "totalCost": 1500000,
    "supplier": {
      "supplierId": "65fab3c4d5e6f7a8b9c0d1e2",
      "companyName": "Lanka Cement Co.",
      "contactPerson": "Nimal Perera"
    },
    "orderDate": "2026-02-07T17:00:00.000Z",
    "expectedDeliveryDate": "2026-03-05T00:00:00.000Z",
    "status": "Ordered",
    "currentStock": 0,
    "sustainabilityRating": 7,
    "minimumThreshold": 30,
    "createdAt": "2026-02-07T17:00:00.000Z"
  }
}
```

#### GET `/api/materials/low-stock`
**Description:** Get all materials with stock below minimum threshold  
**Access:** Protected (ADMIN, PROJECT_MANAGER)  
**Response (200):**
```json
{
  "success": true,
  "data": {
    "lowStockItems": [
      {
        "materialId": "65fbc5d6e7f8a9b0c1d2e3f4",
        "materialName": "Portland Cement",
        "currentStock": 25,
        "minimumThreshold": 30,
        "unit": "tons",
        "projectName": "Green Tower Construction",
        "suggestedReorder": 75,
        "supplier": {
          "companyName": "Lanka Cement Co.",
          "contactPerson": "Nimal Perera",
          "email": "nimal@lankacement.com"
        },
        "lastOrderDate": "2026-02-07T17:00:00.000Z"
      }
    ],
    "totalLowStockItems": 1
  }
}
```

---

## 11. Security & Authentication

### 11.1 Authentication Flow

```
┌──────────────┐
│   User       │
│   Login      │
└──────┬───────┘
       │
       ▼
┌────────────────────────────────┐
│  POST /api/auth/login          │
│  { email, password }           │
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│  Backend Validation:           │
│  1. Find user by email         │
│  2. Compare hashed password    │
│     (bcrypt.compare)           │
└──────┬─────────────────────────┘
       │
   ┌───┴────┐
   ▼        ▼
┌─────┐  ┌──────────────────────┐
│FAIL │  │ SUCCESS              │
└─────┘  │ Generate JWT token   │
         │ - user ID             │
         │ - role                │
         │ - expires in 24h      │
         └──────┬───────────────┘
                │
                ▼
         ┌─────────────────────┐
         │ Return token to     │
         │ frontend            │
         └──────┬──────────────┘
                │
                ▼
         ┌─────────────────────┐
         │ Frontend stores     │
         │ token in:           │
         │ - localStorage      │
         │ - Redux store       │
         └──────┬──────────────┘
                │
                ▼
         ┌─────────────────────┐
         │ All subsequent API  │
         │ calls include:      │
         │ Authorization:      │
         │ Bearer <token>      │
         └─────────────────────┘
```

### 11.2 JWT Token Structure

```javascript
// Token Payload
{
  userId: "65f8a9c8d9e7f8a9b0c1d2e3",
  email: "john.silva@example.com",
  role: "PROJECT_MANAGER",
  iat: 1707318000,  // Issued at (timestamp)
  exp: 1707404400   // Expires at (24 hours later)
}

// Token Generation (Backend)
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Token Verification Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};
```

### 11.3 Role-Based Access Control

```javascript
// Role Check Middleware
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Usage in Routes
router.post(
  '/projects',
  authMiddleware,
  checkRole('ADMIN', 'PROJECT_MANAGER'),
  createProject
);

router.put(
  '/sustainability/metrics',
  authMiddleware,
  checkRole('ADMIN', 'PROJECT_MANAGER', 'INSPECTOR'),
  updateMetrics
);
```

### 11.4 Password Security

```javascript
const bcrypt = require('bcrypt');

// Password Hashing (Registration)
const hashPassword = async (plainPassword) => {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
};

// Password Comparison (Login)
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Password Validation Rules
const passwordSchema = Joi.string()
  .min(8)
  .max(30)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character'
  });
```

### 11.5 Security Best Practices Implementation

#### Input Validation & Sanitization
```javascript
const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');

// Request Validation Middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    next();
  };
};

// XSS Prevention
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {}
    });
  }
  return input;
};
```

#### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  }
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

#### HTTPS & CORS Configuration
```javascript
const helmet = require('helmet');
const cors = require('cors');

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 12. Deployment Architecture

### 12.1 Deployment Diagram

```
┌────────────────────────────────────────────────────────────┐
│                    FRONTEND DEPLOYMENT                     │
│                    Vercel / Netlify                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  React Production Build                              │ │
│  │  - Optimized assets                                  │ │
│  │  - Environment variables configured                  │ │
│  │  - Automatic HTTPS                                   │ │
│  │  - CDN distribution                                  │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTPS/REST API
                           │
┌──────────────────────────▼─────────────────────────────────┐
│                   BACKEND DEPLOYMENT                       │
│                   Render / Railway                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Express.js API Server                               │ │
│  │  - Node.js runtime                                   │ │
│  │  - Auto-scaling enabled                              │ │
│  │  - Health checks                                     │ │
│  │  - Logging & monitoring                              │ │
│  └──────────────────────────────────────────────────────┘ │
└────────┬──────────────────────┬──────────────────────┬─────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  MongoDB Atlas │  │   Cloudinary     │  │  SendGrid /      │
│  (Database)    │  │   (File Storage) │  │  Email Service   │
│  - Cluster M0  │  │  - Free tier     │  │  - Free tier     │
│  - Automatic   │  │  - CDN delivery  │  │  - 100 emails/   │
│    backups     │  │  - 25 GB storage │  │    day           │
│  - Auto-scale  │  │                  │  │                  │
└────────────────┘  └──────────────────┘  └──────────────────┘
```

### 12.2 Environment Variables

#### Backend (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/construction_db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Third-Party APIs
GOOGLE_MAPS_API_KEY=AIzaSy...
CARBON_INTERFACE_API_KEY=abc123...
SENDGRID_API_KEY=SG.xyz...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name