# Sustainable Construction Project Management System

> **SE3040 – Application Frameworks | Academic Year 2026**  
> **SDG Goal:** Industry, Innovation and Infrastructure

A comprehensive full-stack web application designed to help construction companies manage projects while monitoring and optimizing environmental sustainability metrics.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)

## 🌟 Overview

The Sustainable Construction Project Management System provides an integrated platform for managing construction projects with real-time sustainability monitoring, document management, and resource optimization.

### Key Features

- **Project Lifecycle Management:** Track projects from planning to completion with milestone tracking
- **Real-time Sustainability Monitoring:** Monitor carbon footprint, energy consumption, and waste management
- **Digital Document Repository:** Centralized storage for blueprints, permits, and compliance documents
- **Resource Optimization:** Inventory management for materials and equipment
- **Role-based Access Control:** Different permission levels for stakeholders
- **Compliance Tracking:** Safety inspections and regulatory compliance checklists

## 🚀 Features

### Component 1: Project Management
**Owner:** Member 1

- Create and manage construction projects with location mapping (Google Maps)
- Track project milestones and completion percentages
- Project status tracking (Planning → In Progress → On Hold → Completed)
- Project dashboard with filters and search functionality
- Automated notifications on status changes

### Component 2: Sustainability Monitoring
**Owner:** Member 1

- Record and analyze sustainability metrics (carbon, energy, waste, water)
- Calculate sustainability scores with weighted algorithm (0-100)
- Environmental impact analysis (trees equivalent, green energy used)
- Historical trend analysis with month-over-month comparisons
- Carbon emission calculations via Carbon Interface API

### Component 3: Document & Compliance Management
**Owner:** Member 2

- Upload and manage project documents (blueprints, permits, certificates)
- Document approval workflow (Draft → Under Review → Approved/Rejected)
- Compliance checklist management with scoring
- Safety inspection tracking with risk assessment
- Cloud storage integration (Cloudinary)
- Document versioning and access control

### Component 4: Resource & Material Management
**Owner:** Member 3

- Material inventory tracking with status workflow
- Low stock alerts via email notifications (SendGrid)
- Equipment management with maintenance scheduling
- Supplier performance tracking and rating
- Cost tracking and budget analysis
- Sustainability scoring for materials

## 🛠 Technology Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js v5.2+
- **Language:** TypeScript 5.9
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, bcrypt, express-rate-limit
- **File Upload:** Multer
- **Email:** SendGrid
- **Logging:** Winston, Morgan

### Frontend
- **Library:** React v19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS (planned)
- **State Management:** Redux Toolkit (planned)
- **HTTP Client:** Axios (planned)

### Third-Party Services
- **Google Maps API:** Location geocoding and visualization
- **Cloudinary:** File storage and CDN
- **SendGrid:** Email notifications
- **Carbon Interface API:** Carbon emission calculations (optional)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** v18 or higher ([Download](https://nodejs.org/))
- **Package Manager:** npm (v10+ recommended; lockfile is `package-lock.json`)
- **MongoDB Atlas Account:** Free tier ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Git:** For version control

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sustainsite
```

### 2. Install Dependencies

This is a Turborepo monorepo. Install all dependencies from the root:

```bash
npm install
```

### 3. Configure Backend Environment Variables

Navigate to the backend directory and create a `.env` file:

```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/construction_management?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid (Email Service)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@sustainsite.com

# Carbon Interface API (Optional)
CARBON_INTERFACE_API_KEY=your_carbon_api_key

# CORS
FRONTEND_URL=http://localhost:3000

# Logging (optional — default: info)
LOG_LEVEL=info
```

### 4. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with username and password
4. Whitelist your IP address (use `0.0.0.0/0` for development)
5. Get your connection string and update `MONGODB_URI` in `.env`

### 5. Set Up Third-Party Services

#### Cloudinary (File Storage)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Update the Cloudinary variables in `.env`

#### SendGrid (Email Notifications)
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Update `SENDGRID_API_KEY` in `.env`

### 6. Run the Application

From the root directory:

```bash
# Development mode (runs both backend and frontend)
npm run dev

# Or run specific apps (Turborepo filters)
npm run dev -- --filter=backend
npm run dev -- --filter=frontend
```

The backend will start on `http://localhost:5000`  
The frontend will start on `http://localhost:3000`

### 7. Verify Backend Setup

Visit `http://localhost:5000/health` - you should see:

```json
{
  "success": true,
  "message": "Server is running"
}
```

### 8. Build for Production

```bash
# Build all apps
npm run build

# Build specific app
npm run build -- --filter=backend
```

## 📚 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Authentication Endpoints

#### Register User

**POST** `/api/auth/register`

Create a new user account.

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

**Roles:** `ADMIN`, `PROJECT_MANAGER`, `INSPECTOR`, `SUPPLIER`, `VIEWER`

---

#### Login

**POST** `/api/auth/login`

Authenticate user and receive JWT token.

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

---

#### Get Current User

**GET** `/api/auth/me`

Get authenticated user details.

**Access:** Protected (All authenticated users)

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

### Project Management Endpoints

#### Create Project

**POST** `/api/projects`

Create a new construction project.

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
  "teamMembers": ["65f8b1c2d3e4f5a6b7c8d9e0"]
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
    "status": "Planning",
    "sustainabilityScore": 0,
    "completionPercentage": 0,
    "createdAt": "2026-02-07T11:00:00.000Z"
  }
}
```

---

#### Get All Projects

**GET** `/api/projects`

Retrieve all projects with optional filters and pagination.

**Access:** Protected (All authenticated users)

**Query Parameters:**
- `status` (optional): Filter by status (Planning, In Progress, On Hold, Completed)
- `manager` (optional): Filter by project manager ID
- `search` (optional): Search by project name or description
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `sortBy` (optional, default: createdAt): Sort field
- `sortOrder` (optional, default: desc): asc or desc

**Example:** `GET /api/projects?status=In Progress&page=1&limit=10`

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
      "totalProjects": 48
    }
  }
}
```

---

#### Get Project by ID

**GET** `/api/projects/:id`

Get detailed information about a specific project.

**Access:** Protected (All authenticated users)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
    "projectName": "Green Tower Construction",
    "status": "In Progress",
    "budget": 50000000,
    "actualCost": 17500000,
    "sustainabilityScore": 78,
    "completionPercentage": 35,
    "milestones": [
      {
        "milestoneId": "65f8e7f8a9b0c1d2e3f4a5b6",
        "title": "Foundation Complete",
        "status": "Completed",
        "completionPercentage": 100
      }
    ]
  }
}
```

---

#### Update Project

**PUT** `/api/projects/:id`

Update project details.

**Access:** Protected (ADMIN, PROJECT_MANAGER - own projects)

**Request Body:** (All fields optional)
```json
{
  "projectName": "Updated Project Name",
  "status": "In Progress",
  "completionPercentage": 45
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": { /* updated project */ }
}
```

---

#### Delete Project

**DELETE** `/api/projects/:id`

Delete a project (ADMIN only).

**Access:** Protected (ADMIN only)

**Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

#### Add Milestone

**POST** `/api/projects/:id/milestones`

Add a milestone to a project.

**Access:** Protected (ADMIN, PROJECT_MANAGER)

**Request Body:**
```json
{
  "title": "Foundation Complete",
  "description": "Complete foundation work",
  "targetDate": "2026-04-30",
  "assignedTo": "65f8b1c2d3e4f5a6b7c8d9e0"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Milestone added successfully",
  "data": {
    "milestoneId": "65f8e7f8a9b0c1d2e3f4a5b6",
    "title": "Foundation Complete",
    "status": "Pending",
    "completionPercentage": 0
  }
}
```

---

### Sustainability Monitoring Endpoints

#### Record Sustainability Metrics

**POST** `/api/sustainability/metrics`

Record new sustainability metrics for a project.

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
    "sustainabilityScore": 78,
    "scoreCategory": "Green",
    "treesEquivalent": 272,
    "carbonEmissions": {
      "total": 5.0
    },
    "wasteManagement": {
      "diversionRate": 76.19
    }
  }
}
```

---

#### Get Enriched Sustainability Score

**GET** `/api/sustainability/projects/:projectId/score`

Get current sustainability score with breakdown, trend, benchmark comparison, and recommendations.

**Access:** Protected (project members)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
    "projectName": "Green Tower",
    "currentScore": 78,
    "scoreCategory": "Green",
    "scoreBreakdown": {
      "carbonEmissions": 23,
      "energyEfficiency": 20,
      "wasteManagement": 19,
      "waterConservation": 16
    },
    "lastUpdated": "2026-02-07T00:00:00.000Z",
    "trend": "improving",
    "benchmarkComparison": {
      "industryAverage": 65,
      "difference": 13
    },
    "recommendations": [
      "Increase renewable energy usage (solar/wind) to improve energy efficiency score."
    ]
  }
}
```

---

#### Get Aggregated Sustainability Trends

**GET** `/api/sustainability/projects/:projectId/trends`

Get time-bucketed sustainability trends using MongoDB aggregation.

**Access:** Protected (project members)

**Query Parameters:**
- `period` (number, default: `30`) — look-back window in days
- `interval` (`daily` | `weekly` | `monthly`, default: `weekly`)

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
        "period": "2026-W06",
        "startDate": "2026-02-03T00:00:00.000Z",
        "sustainabilityScore": 78,
        "carbonEmissions": 5.0,
        "energyConsumption": 3150,
        "wasteGenerated": 1050,
        "waterUsage": 15000,
        "recordCount": 2
      }
    ],
    "summary": {
      "averageScore": 75,
      "scoreImprovement": 6,
      "totalCarbonRecorded": 15.0,
      "totalWasteRecorded": 3150
    }
  }
}
```

---

#### Compare with Industry Benchmarks

**GET** `/api/sustainability/projects/:projectId/compare`

Compare the project's sustainability score against industry averages.

**Access:** Protected (project members)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
    "projectName": "Green Tower",
    "projectScore": 78,
    "industryAverage": 65,
    "difference": 13,
    "percentileBand": "Top 35% (Good)",
    "areasAboveAverage": ["Carbon emissions", "Waste diversion rate"],
    "areasBelowAverage": ["Renewable energy usage"],
    "benchmarks": {
      "average": 65,
      "good": 75,
      "excellent": 85
    }
  }
}
```

---

### Document Management Endpoints

#### Upload Document

**POST** `/api/documents/upload`

Upload a new document to a project.

**Access:** Protected (ADMIN, PROJECT_MANAGER, INSPECTOR)

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
```
file: [File object]
projectId: "65f8d5e6f7a8b9c0d1e2f3a4"
documentType: "Permit"
title: "Building Permit - 2026"
description: "Municipal building permit"
version: "1.0"
```

**Response (201):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "documentId": "65faa2b3c4d5e6f7a8b9c0d1",
    "documentType": "Permit",
    "title": "Building Permit - 2026",
    "fileUrl": "https://res.cloudinary.com/.../permit_abc123.pdf",
    "fileName": "building_permit_2026.pdf",
    "fileSize": 2457600,
    "status": "Draft"
  }
}
```

---

#### Get Project Documents

**GET** `/api/documents/:projectId`

Get all documents for a project.

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
        "fileUrl": "https://res.cloudinary.com/.../permit.pdf",
        "status": "Approved",
        "uploadedBy": {
          "fullName": "John Silva"
        }
      }
    ],
    "pagination": {
      "totalDocuments": 52
    }
  }
}
```

---

#### Update Document Status

**PUT** `/api/documents/:id/status`

Update document approval status.

**Access:** Protected (INSPECTOR for approval, uploader for draft edits)

**Request Body:**
```json
{
  "status": "Approved",
  "notes": "All requirements met"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Document status updated",
  "data": { /* updated document */ }
}
```

---

#### Create Compliance Checklist

**POST** `/api/compliance/checklist`

Create a compliance checklist for a project.

**Access:** Protected (ADMIN, INSPECTOR)

**Request Body:**
```json
{
  "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
  "checklistName": "Environmental Compliance",
  "category": "Environmental",
  "items": [
    {
      "itemName": "Environmental Impact Assessment",
      "description": "Complete EIA report"
    },
    {
      "itemName": "Waste Management Plan",
      "description": "Approved waste disposal plan"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Compliance checklist created",
  "data": {
    "checklistId": "65fcc7d8e9f0a1b2c3d4e5f6",
    "totalItems": 2,
    "completedItems": 0,
    "complianceScore": 0
  }
}
```

---

#### Create Safety Inspection

**POST** `/api/safety/inspection`

Record a safety inspection.

**Access:** Protected (ADMIN, INSPECTOR)

**Request Body:**
```json
{
  "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
  "inspectionType": "Safety",
  "inspectionDate": "2026-02-15",
  "findings": "Scaffolding not properly secured on 5th floor",
  "riskLevel": "High",
  "actionRequired": "Immediate rectification within 24 hours"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Inspection recorded successfully",
  "data": {
    "inspectionId": "65fdd8e9f0a1b2c3d4e5f6a7",
    "riskLevel": "High",
    "actionStatus": "Pending"
  }
}
```

---

### Material Management Endpoints

#### Add Material Order

**POST** `/api/materials`

Create a new material order.

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
    "materialName": "Portland Cement",
    "totalCost": 1500000,
    "status": "Ordered",
    "supplier": {
      "companyName": "Lanka Cement Co."
    }
  }
}
```

---

#### Get Low Stock Items

**GET** `/api/materials/low-stock`

Get materials with stock below minimum threshold.

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
        "suggestedReorder": 75,
        "supplier": {
          "companyName": "Lanka Cement Co.",
          "email": "contact@lankacement.com"
        }
      }
    ],
    "totalLowStockItems": 1
  }
}
```

---

#### Add Equipment

**POST** `/api/equipment`

Add equipment to the registry.

**Access:** Protected (ADMIN, PROJECT_MANAGER)

**Request Body:**
```json
{
  "equipmentName": "Excavator CAT-320",
  "equipmentType": "Excavator",
  "serialNumber": "CAT320-2024-001",
  "manufacturer": "Caterpillar",
  "status": "Available"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Equipment added successfully",
  "data": {
    "equipmentId": "65fee9f0a1b2c3d4e5f6a7b8",
    "equipmentName": "Excavator CAT-320",
    "status": "Available"
  }
}
```

---

#### Add Supplier

**POST** `/api/suppliers`

Add a new supplier.

**Access:** Protected (ADMIN, PROJECT_MANAGER)

**Request Body:**
```json
{
  "companyName": "Lanka Cement Co.",
  "contactPerson": "Nimal Perera",
  "email": "nimal@lankacement.com",
  "phoneNumber": "+94112345678",
  "materialsSupplied": ["Cement", "Aggregates"],
  "paymentTerms": "Net 30 days"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Supplier added successfully",
  "data": {
    "supplierId": "65fab3c4d5e6f7a8b9c0d1e2",
    "companyName": "Lanka Cement Co.",
    "averageRating": 0,
    "isActive": true
  }
}
```

---

#### Search Documents

**GET** `/api/documents/search`

Full-text search across document title, description, and tags.

**Access:** Protected (all authenticated users)

**Query Parameters:**
- `q` — search keyword
- `projectId` — filter by project
- `documentType` — `Blueprint` | `Permit` | `Certificate` | `Safety Report` | `Contract` | `Other`
- `status` — `Draft` | `Under Review` | `Approved` | `Rejected`
- `page` (default: `1`), `limit` (default: `10`)

**Response (200):**
```json
{
  "success": true,
  "data": [{ "title": "Safety Report Alpha", "status": "Approved" }],
  "pagination": { "total": 1, "page": 1, "limit": 10, "pages": 1 }
}
```

---

#### Update Document Status

**PUT** `/api/documents/:id/status`

Transition a document through its approval workflow.

**Access:** Protected — ADMIN/INSPECTOR can approve or reject; PROJECT_MANAGER can submit for review

**Allowed transitions:**
- `Draft` → `Under Review`
- `Under Review` → `Approved` or `Rejected`
- `Rejected` → `Under Review`

**Request Body:**
```json
{
  "status": "Approved",
  "rejectionReason": "Required only when status is Rejected"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "status": "Approved", "approvedBy": { "fullName": "Admin User" } }
}
```

---

#### Update Checklist Item

**PUT** `/api/compliance/checklists/:id/items/:itemId`

Update a single checklist item's completion status, notes, or attached documents. Automatically recalculates the parent checklist's `complianceScore`.

**Access:** Protected (ADMIN, PROJECT_MANAGER, INSPECTOR)

**Request Body:**
```json
{
  "isCompleted": true,
  "notes": "Verified on site 2026-04-10"
}
```

**Response (200):** Returns the full updated checklist with recalculated score.

---

#### Get Project Compliance Score

**GET** `/api/compliance/score/:projectId`

Aggregate compliance score across all checklists for a project.

**Access:** Protected (all authenticated users)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projectId": "65f8d5e6f7a8b9c0d1e2f3a4",
    "overallScore": 75,
    "totalChecklists": 3,
    "completedChecklists": 1,
    "totalItems": 12,
    "completedItems": 9,
    "breakdown": [
      { "checklistName": "Safety Standards", "complianceScore": 100, "category": "Safety" }
    ]
  }
}
```

---

### Safety Inspection Endpoints

| Method | Path | Description | Access |
|--------|------|-------------|--------|
| `POST` | `/api/safety/inspection` | Create inspection | ADMIN, INSPECTOR |
| `GET` | `/api/safety/:projectId` | List inspections for project | All authenticated |
| `GET` | `/api/safety/inspection/:id` | Get single inspection | All authenticated |
| `PUT` | `/api/safety/inspection/:id` | Update inspection | ADMIN, INSPECTOR |
| `DELETE` | `/api/safety/inspection/:id` | Delete inspection | ADMIN |
| `GET` | `/api/safety/:projectId/high-risk` | Unresolved High/Critical inspections | All authenticated |

#### Get High-Risk Inspections

**GET** `/api/safety/:projectId/high-risk`

Returns all unresolved inspections with `riskLevel` of `High` or `Critical`.

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "riskLevel": "High",
      "findings": "Scaffolding not secured",
      "isResolved": false,
      "inspector": { "fullName": "Site Inspector" }
    }
  ]
}
```

---

### User Management Endpoints (ADMIN only)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/users` | List all users (paginated, filterable) |
| `GET` | `/api/users/:id` | Get user by ID |
| `PATCH` | `/api/users/:id` | Update role, isActive, supplierId, assignedProjects |
| `DELETE` | `/api/users/:id` | Soft-delete (sets `isActive: false`) |

**Query Parameters for `GET /api/users`:**
- `role` — filter by role
- `isActive` — `true` | `false`
- `search` — search by name or email
- `page`, `limit`

---

### Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Field 'email' is required"]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "No token provided" 
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "An error occurred. Please try again later"
}
```

---

## 👥 User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **ADMIN** | System administrator | Full CRUD access, user management, system configuration |
| **PROJECT_MANAGER** | Manages projects | Create/edit projects, manage resources, assign team members |
| **INSPECTOR** | Compliance officer | Update sustainability metrics, conduct inspections, approve documents |
| **SUPPLIER** | Material supplier | View orders, update delivery status, limited inventory access |
| **VIEWER** | Stakeholder | Read-only access to reports and compliance data |

### Permission Matrix

| Feature | ADMIN | PROJECT_MANAGER | INSPECTOR | SUPPLIER | VIEWER |
|---------|-------|-----------------|-----------|----------|--------|
| Create Projects | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Projects | ✅ | ✅ (own) | ❌ | ❌ | ❌ |
| View Projects | ✅ | ✅ | ✅ | ❌ | ✅ |
| Update Sustainability | ✅ | ✅ | ✅ | ❌ | ❌ |
| Upload Documents | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Documents | ✅ | ❌ | ✅ | ❌ | ❌ |
| Manage Materials | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Delivery Status | ✅ | ✅ | ❌ | ✅ | ❌ |

## 📁 Project Structure

```
sustainsite/
├── apps/
│   ├── backend/              # Express.js TypeScript backend
│   │   ├── src/
│   │   │   ├── config/       # Database, Cloudinary, Email config
│   │   │   ├── middleware/   # Auth, role check, error handling
│   │   │   ├── types/        # TypeScript type definitions
│   │   │   ├── app.ts        # Express app setup
│   │   │   └── server.ts     # Server entry point
│   │   ├── .env              # Environment variables
│   │   └── package.json
│   │
│   └── frontend/             # React + Vite frontend
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
│
├── packages/
│   ├── eslint-config/        # Shared ESLint configuration
│   └── typescript-config/    # Shared TypeScript configuration
│
├── docs/
│   └── project-spec.md       # Complete project specification
│
├── package.json              # Root package.json (Turborepo)
├── turbo.json                # Turborepo configuration
└── README.md                 # This file
```

## 💻 Development

### Running Specific Apps

```bash
# Run only backend
npm run dev -- --filter=backend

# Run only frontend
npm run dev -- --filter=frontend
```

### Type Checking

```bash
# Check types in all apps
npm run check-types

# Check types in specific app
npm run check-types -- --filter=backend
```

### Linting

```bash
# Lint all apps
npm run lint

# Lint specific app
npm run lint -- --filter=backend
```

### Code Formatting

```bash
# Format all files
npm run format
```

### Common Development Tasks

**Backend:**
```bash
cd apps/backend

# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start
```

**Frontend:**
```bash
cd apps/frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

This project deploys the **backend to [Render](https://render.com)** and the **frontend to [Vercel](https://vercel.com)**.

---

### Backend — Render

#### 1. Create a Web Service on Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Configure the service:

| Setting | Value |
|---|---|
| **Name** | `sustainsite-api` |
| **Region** | Singapore (or nearest) |
| **Branch** | `main` |
| **Root Directory** | `apps/backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (or Starter for production) |

#### 2. Set Environment Variables on Render

In the Render dashboard → **Environment** tab, add every variable below (no quotes):

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/sustainsite?retryWrites=true&w=majority
JWT_SECRET=<generate with: openssl rand -hex 64>
JWT_EXPIRE=24h
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>
SENDGRID_API_KEY=SG.<your sendgrid key>
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://<your-vercel-app>.vercel.app
LOG_LEVEL=info
```

> **CORS:** `FRONTEND_URL` must exactly match your Vercel deployment URL (no trailing slash).

#### 3. Health Check

Render will ping `GET /health` automatically. Confirm it returns `200` after deploy.

#### 4. Auto-Deploy

Render auto-deploys on every push to `main`. To disable, turn off **Auto-Deploy** in the service settings.

---

### Frontend — Vercel

#### 1. Import Project on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repository
3. Configure:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `apps/frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

#### 2. Set Environment Variables on Vercel

In **Settings → Environment Variables**, add:

```
VITE_API_URL=https://sustainsite-api.onrender.com/api
```

> Replace the URL with your actual Render service URL. The variable **must** start with `VITE_` to be exposed to the Vite build.

#### 3. Redeploy after adding env vars

Vercel does not automatically rebuild when you add env vars. Go to **Deployments → Redeploy** (without clearing cache).

---

### Production Checklist

Before going live, verify:

- [ ] `JWT_SECRET` is at least 64 random characters (never reuse the dev value)
- [ ] `MONGODB_URI` points to a MongoDB Atlas **production** cluster with IP allowlist set to `0.0.0.0/0` (or Render's static IP)
- [ ] `FRONTEND_URL` on Render matches the Vercel deployment URL exactly
- [ ] `VITE_API_URL` on Vercel matches the Render service URL exactly
- [ ] Cloudinary upload preset is set to **Signed** in production
- [ ] SendGrid sender identity is verified
- [ ] Render health check passes: `GET https://<your-api>.onrender.com/health`
- [ ] Swagger UI is accessible at `GET https://<your-api>.onrender.com/api-docs` (or set `DISABLE_SWAGGER=true` to hide it)

---

### Render Free Tier — Cold Start Note

On the free tier, Render spins down the service after 15 minutes of inactivity. The first request after a cold start can take **30–60 seconds**. Use the **Starter** plan or set up an uptime monitor (e.g. [UptimeRobot](https://uptimerobot.com)) to keep the service warm.

## 🔒 Security Features

- **Helmet.js:** Secure HTTP headers
- **CORS:** Configured cross-origin resource sharing; only `FRONTEND_URL` and localhost are allowed
- **Rate Limiting:** 100 requests / 15 min per IP on all `/api/` routes; stricter **5 requests / 15 min** on `/api/auth/login` and `/api/auth/register`
- **JWT Authentication:** Token-based authentication with 24h expiry; `supplierId` embedded in token for SUPPLIER scoping
- **Password Hashing:** bcrypt with salt rounds
- **Input Validation:** Joi validation for all inputs
- **File Upload Validation:** Type and size restrictions via Multer
- **RBAC:** Role-based access control — ADMIN, PROJECT_MANAGER, INSPECTOR, SUPPLIER, VIEWER
- **SUPPLIER Scoping:** SUPPLIER users can only read materials linked to their own `supplierId`
- **Soft Delete:** Users are deactivated (`isActive: false`) rather than hard-deleted
- **Winston Logging:** Structured logs with console output (+ file transport in production)

## 📖 Additional Resources

### Submission Documents

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | This file — Setup instructions, API documentation, deployment guide |
| [Deployment Report](./docs/DEPLOYMENT.md) | Formal deployment report: architecture, step-by-step Render + Vercel setup, env vars, post-deploy verification |
| [Testing Instruction Report](./docs/TESTING.md) | How to run unit, integration, and performance tests; environment configuration |
| [Test Report](./docs/TEST_REPORT.md) | Full test results — 268/268 tests passing, coverage table, k6 performance results |

### Developer References

- [Project Specification](./docs/project-spec.md) - Complete technical specification
- [Backend Tasks Checklist](./docs/BACKEND_TASKS.md) - Phase 1 & 2 completion tracker
- [Swagger UI](http://localhost:5000/api-docs) - Interactive API documentation (when server is running)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Turborepo Documentation](https://turborepo.dev/)

## 📝 License

This project is created for academic purposes as part of SE3040 – Application Frameworks course.

---

**Course:** SE3040 – Application Frameworks  
**Academic Year:** 2026  
**SDG Goal:** Industry, Innovation and Infrastructure
