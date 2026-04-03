# Component 3: Document & Compliance Management

**Owner:** Member 2

**Status:** Pending

**Third-Party API:** Cloudinary

## Overview

Centralized digital repository for all project documents with compliance tracking and safety inspection management.

## Features

### 1. Document Management

- Upload documents with metadata
- Document types: Blueprint, Permit, Certificate, Safety Report, Contract
- Supported file types: PDF, DOCX, XLSX, JPG, PNG, DWG
- File size limit: 10MB per document
- Cloud storage integration (Cloudinary)
- Document versioning (v1.0, v1.1, v2.0)
- Status workflow: Draft → Under Review → Approved → Rejected

### 2. Document Categorization

- **Blueprints & Drawings:** Architectural and structural plans
- **Permits & Licenses:** Government approvals, building permits
- **Certificates:** ISO certifications, environmental clearances
- **Safety Reports:** Incident reports, risk assessments
- **Compliance Documents:** Environmental impact assessments
- **Contracts:** Supplier agreements, labor contracts

### 3. Compliance Checklist Management

- Pre-defined compliance templates
- Custom checklist creation
- Item-level tracking with completion status
- Attached documents to checklist items
- Overall compliance score calculation
- Automated reminders for pending items

### 4. Safety Inspection System

- Schedule inspections
- Record inspection findings
- Risk level assessment (Low/Medium/High/Critical)
- Photographic evidence upload
- Follow-up action tracking
- Inspection history with trends

### 5. Document Search & Filtering

- Search by title, description, type, status
- Advanced filters for quick access
- Download tracking (audit trail)

## Database Schema

### Collection: `documents`

```jsx
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'Project'),
  documentType: String ['Blueprint', 'Permit', 'Certificate', 'Safety Report', 'Contract', 'Other'],
  title: String (required),
  description: String,
  
  // File Information
  fileUrl: String (Cloudinary URL),
  cloudinaryId: String,
  fileName: String,
  fileSize: Number,
  fileFormat: String,
  
  // Version Control
  version: String (default: '1.0'),
  previousVersions: [{
    version: String,
    fileUrl: String,
    uploadedAt: Date,
    uploadedBy: ObjectId
  }],
  
  // Status Workflow
  status: String ['Draft', 'Under Review', 'Approved', 'Rejected'],
  approvedBy: ObjectId (ref: 'User'),
  approvalDate: Date,
  rejectionReason: String,
  
  uploadedBy: ObjectId (ref: 'User'),
  tags: [String],
  createdAt: Date
}
```

### Collection: `compliance`

```jsx
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'Project'),
  checklistName: String,
  category: String ['Environmental', 'Safety', 'Building Code', 'Sustainability'],
  
  items: [{
    itemId: String,
    itemName: String,
    description: String,
    isCompleted: Boolean,
    completedDate: Date,
    completedBy: ObjectId,
    attachedDocuments: [ObjectId],
    notes: String
  }],
  
  totalItems: Number,
  completedItems: Number,
  complianceScore: Number,
  
  createdBy: ObjectId,
  dueDate: Date,
  createdAt: Date
}
```

### Collection: `inspections`

```jsx
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'Project'),
  inspectionType: String ['Safety', 'Environmental', 'Quality', 'Structural'],
  inspectionDate: Date,
  inspector: ObjectId (ref: 'User'),
  
  findings: String,
  riskLevel: String ['Low', 'Medium', 'High', 'Critical'],
  issuesIdentified: [{
    issue: String,
    severity: String,
    location: String
  }],
  
  actionRequired: String,
  actionDeadline: Date,
  actionStatus: String ['Pending', 'In Progress', 'Completed'],
  
  attachments: [ObjectId],
  photos: [{
    url: String,
    caption: String
  }],
  
  isResolved: Boolean,
  createdAt: Date
}
```

## API Endpoints

### Document Management

```
POST   /api/documents/upload                    # Upload document
GET    /api/documents/:projectId                # Get all project documents
GET    /api/documents/:id                       # Get document details
PUT    /api/documents/:id                       # Update document metadata
DELETE /api/documents/:id                       # Delete document
GET    /api/documents/search                    # Search documents
PUT    /api/documents/:id/status                # Update document status
```

### Compliance

```
POST   /api/compliance/checklist                # Create compliance checklist
GET    /api/compliance/:projectId               # Get project compliance data
PUT    /api/compliance/:id/item/:itemId         # Update checklist item
GET    /api/compliance/:projectId/score         # Get compliance score
```

### Safety Inspections

```
POST   /api/safety/inspection                   # Create inspection record
GET    /api/safety/:projectId                   # Get project inspections
GET    /api/safety/inspection/:id               # Get inspection details
PUT    /api/safety/inspection/:id               # Update inspection
GET    /api/safety/:projectId/high-risk         # Get high-risk findings
```

## User Flow Example

1. **PROJECT_MANAGER** uploads building permit
    - Selects project: "Green Tower Construction"
    - Document type: "Permit"
    - Title: "Municipal Building Permit - 2026"
    - Uploads PDF file → Stored in Cloudinary
    - Status: "Under Review"
2. **INSPECTOR** reviews and approves
    - Views document
    - Changes status to "Approved"
    - Adds approval notes
3. **INSPECTOR** creates compliance checklist
    - Template: "Environmental Compliance"
    - Items:
        
        ✅ Environmental Impact Assessment (Completed)
        
        ✅ Waste Management Plan (Completed)
        
        ◻ Air Quality Monitoring (Pending)
        
        ◻ Noise Level Assessment (Pending)
        
    - Attaches relevant documents
4. **INSPECTOR** conducts safety inspection
    - Date: Feb 15, 2026
    - Findings: "Scaffolding not properly secured on 5th floor"
    - Risk Level: High
    - Action Required: "Immediate rectification within 24 hours"
    - Uploads inspection photos
    - System sends alert to PROJECT_MANAGER

## Third-Party Integration

### Cloudinary

**Purpose:** Cloud-based file storage and management

**Features:**

- File upload and storage
- Image transformations
- CDN delivery
- File metadata management

**Implementation:**

```jsx
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
```

**Storage Limits:** 25 GB (free tier)

## Protected Routes & Permissions

| Action | ADMIN | PROJECT_MANAGER | INSPECTOR | SUPPLIER | VIEWER |
| --- | --- | --- | --- | --- | --- |
| Upload Documents | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Documents | ✅ | ❌ | ✅ | ❌ | ❌ |
| View Documents | ✅ | ✅ | ✅ | ❌ | ✅ |
| Delete Documents | ✅ | ✅ (own) | ❌ | ❌ | ❌ |
| Create Inspections | ✅ | ❌ | ✅ | ❌ | ❌ |

## Validation Rules

- **fileSize:** Maximum 10MB
- **fileFormat:** PDF, DOCX, XLSX, JPG, PNG, DWG only
- **title:** Required, 3-100 characters
- **documentType:** Required, must be from enum list
- **projectId:** Required, must be valid Project ID

## Testing Requirements

### Unit Tests

- File upload validation
- Compliance score calculation
- Document version management

### Integration Tests

- Upload document to Cloudinary
- Retrieve documents with filters
- Update compliance checklist items
- Create safety inspection

### Performance Tests

- Upload multiple files simultaneously
- Search documents with various filters