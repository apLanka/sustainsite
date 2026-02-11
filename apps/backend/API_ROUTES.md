# API Routes Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: <PRODUCTION_URL>/api
```

## Authentication
All routes except `/api/auth/register` and `/api/auth/login` require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Routes (`/api/auth`)

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "PROJECT_MANAGER"
}
```
**Access:** Public  
**Roles:** ADMIN, PROJECT_MANAGER, INSPECTOR, SUPPLIER, VIEWER

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
**Access:** Public

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```
**Access:** Authenticated users

---

## 2. Project Routes (`/api/projects`)

### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER

### List Projects
```http
GET /api/projects?status=In Progress&page=1&limit=10
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER, INSPECTOR, VIEWER

### Get Project by ID
```http
GET /api/projects/:id
Authorization: Bearer <token>
```
**Access:** Project members (manager or team member)

### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer <token>
```
**Access:** Project manager or ADMIN

### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```
**Access:** ADMIN only

### Add Milestone
```http
POST /api/projects/:id/milestones
Authorization: Bearer <token>
```
**Access:** Project manager or ADMIN

### Update Milestone
```http
PUT /api/projects/:id/milestones/:milestoneId
Authorization: Bearer <token>
```
**Access:** Project manager or ADMIN

### Get Project Timeline
```http
GET /api/projects/:id/timeline
Authorization: Bearer <token>
```
**Access:** Project members

---

## 3. Sustainability Routes (`/api/sustainability`)

### Create Metric
```http
POST /api/sustainability/metrics
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER, INSPECTOR

### List Metrics
```http
GET /api/sustainability/metrics
Authorization: Bearer <token>
```
**Access:** All authenticated users

### Get Metric by ID
```http
GET /api/sustainability/metrics/:id
Authorization: Bearer <token>
```
**Access:** All authenticated users

### Update Metric
```http
PUT /api/sustainability/metrics/:id
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER, INSPECTOR

### Delete Metric
```http
DELETE /api/sustainability/metrics/:id
Authorization: Bearer <token>
```
**Access:** ADMIN only

### Get Project Metrics
```http
GET /api/sustainability/projects/:projectId/metrics
Authorization: Bearer <token>
```
**Access:** Project members

---

## 4. Document Routes (`/api/documents`)

### Upload Document
```http
POST /api/documents
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER, INSPECTOR

### List Documents
```http
GET /api/documents?projectId=xxx&documentType=Blueprint
Authorization: Bearer <token>
```
**Access:** All authenticated users

### Get Document by ID
```http
GET /api/documents/:id
Authorization: Bearer <token>
```
**Access:** All authenticated users

### Update Document
```http
PUT /api/documents/:id
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER, INSPECTOR

### Delete Document
```http
DELETE /api/documents/:id
Authorization: Bearer <token>
```
**Access:** Document owner or ADMIN

### Approve Document
```http
PUT /api/documents/:id/approve
Authorization: Bearer <token>
```
**Access:** ADMIN, INSPECTOR

### Reject Document
```http
PUT /api/documents/:id/reject
Authorization: Bearer <token>
```
**Access:** ADMIN, INSPECTOR

### Create New Version
```http
POST /api/documents/:id/version
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER, INSPECTOR

### Download Document
```http
GET /api/documents/:id/download
Authorization: Bearer <token>
```
**Access:** All authenticated users

---

## 5. Compliance Routes (`/api/compliance`)

### Checklists

#### Create Checklist
```http
POST /api/compliance/checklists
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER, INSPECTOR

#### List Checklists
```http
GET /api/compliance/checklists?projectId=xxx&category=Safety
Authorization: Bearer <token>
```
**Access:** All authenticated users

#### Get Checklist by ID
```http
GET /api/compliance/checklists/:id
Authorization: Bearer <token>
```
**Access:** All authenticated users

#### Update Checklist
```http
PUT /api/compliance/checklists/:id
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER, INSPECTOR

#### Delete Checklist
```http
DELETE /api/compliance/checklists/:id
Authorization: Bearer <token>
```
**Access:** ADMIN only

### Safety Inspections

#### Create Inspection
```http
POST /api/compliance/inspections
Authorization: Bearer <token>
```
**Access:** ADMIN, INSPECTOR

#### List Inspections
```http
GET /api/compliance/inspections?projectId=xxx&riskLevel=High
Authorization: Bearer <token>
```
**Access:** All authenticated users

#### Get Inspection by ID
```http
GET /api/compliance/inspections/:id
Authorization: Bearer <token>
```
**Access:** All authenticated users

#### Update Inspection
```http
PUT /api/compliance/inspections/:id
Authorization: Bearer <token>
```
**Access:** ADMIN, INSPECTOR

#### Delete Inspection
```http
DELETE /api/compliance/inspections/:id
Authorization: Bearer <token>
```
**Access:** ADMIN only

---

## 6. Resource Routes (`/api/resources`)

### Materials

#### Create Material
```http
POST /api/resources/materials
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER

#### List Materials
```http
GET /api/resources/materials?projectId=xxx&status=In Stock
Authorization: Bearer <token>
```
**Access:** All authenticated users

#### Get Material by ID
```http
GET /api/resources/materials/:id
Authorization: Bearer <token>
```
**Access:** All authenticated users

#### Update Material
```http
PUT /api/resources/materials/:id
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER

#### Delete Material
```http
DELETE /api/resources/materials/:id
Authorization: Bearer <token>
```
**Access:** ADMIN only

#### Update Material Status
```http
PUT /api/resources/materials/:id/status
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER, SUPPLIER (for their materials)

#### Record Material Usage
```http
POST /api/resources/materials/:id/usage
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER

### Equipment

#### Create Equipment
```http
POST /api/resources/equipment
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER

#### List Equipment
```http
GET /api/resources/equipment?status=Available
Authorization: Bearer <token>
```
**Access:** All authenticated users

#### Get Equipment by ID
```http
GET /api/resources/equipment/:id
Authorization: Bearer <token>
```
**Access:** All authenticated users

#### Update Equipment
```http
PUT /api/resources/equipment/:id
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER

#### Delete Equipment
```http
DELETE /api/resources/equipment/:id
Authorization: Bearer <token>
```
**Access:** ADMIN only

#### Assign Equipment to Project
```http
POST /api/resources/equipment/:id/assign
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER

#### Schedule Maintenance
```http
POST /api/resources/equipment/:id/maintenance
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER

### Suppliers

#### Create Supplier
```http
POST /api/resources/suppliers
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER

#### List Suppliers
```http
GET /api/resources/suppliers?isActive=true
Authorization: Bearer <token>
```
**Access:** All authenticated users

#### Get Supplier by ID
```http
GET /api/resources/suppliers/:id
Authorization: Bearer <token>
```
**Access:** All authenticated users

#### Update Supplier
```http
PUT /api/resources/suppliers/:id
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER

#### Delete Supplier
```http
DELETE /api/resources/suppliers/:id
Authorization: Bearer <token>
```
**Access:** ADMIN only

#### Rate Supplier
```http
POST /api/resources/suppliers/:id/rating
Authorization: Bearer <token>
```
**Access:** ADMIN, PROJECT_MANAGER

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No token provided. Authorization denied."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied. Required role: ADMIN or PROJECT_MANAGER. Your role: INSPECTOR"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Server error"
}
```

### 501 Not Implemented
```json
{
  "success": false,
  "error": "Not implemented yet"
}
```

---

## Role Permissions Summary

| Role | Create Projects | Edit Projects | Delete Projects | Approve Docs | Conduct Inspections | Manage Resources |
|------|----------------|---------------|-----------------|--------------|---------------------|------------------|
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **PROJECT_MANAGER** | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ✅ |
| **INSPECTOR** | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **SUPPLIER** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (limited) |
| **VIEWER** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Rate Limiting
- **Limit:** 100 requests per 15 minutes per IP
- **Applies to:** All `/api/*` routes
- **Response when exceeded:**
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

---

## CORS Configuration
- **Allowed Origins:** 
  - Development: `http://localhost:5173`, `http://localhost:5174`
  - Production: Configured via `FRONTEND_URL` environment variable
- **Credentials:** Enabled
- **Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers:** Content-Type, Authorization
