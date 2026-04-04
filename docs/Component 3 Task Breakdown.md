# Component 3: Document & Compliance Management — Implementation Task Breakdown

**Owner:** Member 2
**Status:** In Progress
**Third-Party API:** Cloudinary

---

## Overview

All models, routes, configs, and middleware are already scaffolded. The work is entirely in
implementing the two controller files and writing integration tests.

**Files to implement:**
- `apps/backend/src/controllers/document.controller.ts`
- `apps/backend/src/controllers/compliance.controller.ts`

**Files to create (tests):**
- `apps/backend/src/__tests__/integration/document.test.ts`
- `apps/backend/src/__tests__/integration/compliance.test.ts`

---

## Pre-Implementation Reference

### Key Patterns (follow existing code)

| Pattern | Where to look |
|---------|---------------|
| Controller structure | `sustainability.controller.ts` |
| `req.user.userId` for auth user | `sustainability.controller.ts:13` |
| Error response shape | `{ success: false, error: string }` |
| Success response shape | `{ success: true, data: ... }` |
| Pagination response | `{ success, pagination: { page, limit, total, totalPages }, data }` |
| Cloudinary upload helper | `config/cloudinary.ts` → `uploadToCloudinary(filePath, folder)` |
| Cloudinary delete helper | `config/cloudinary.ts` → `deleteFromCloudinary(publicId)` |
| Multer file on request | `req.file.path` (disk storage), `req.file.originalname`, `req.file.size` |
| Test structure | `__tests__/integration/sustainability.test.ts` |
| Test helpers | `__tests__/helpers/testHelpers.ts` → `createTestUser`, `getAuthToken` |

### Route Map (already wired — do not modify)

**Documents** (`/api/documents`)
```
POST   /                    → uploadDocument       [ADMIN, PM, INSPECTOR]
GET    /                    → getDocuments         [all authenticated]
GET    /:id                 → getDocumentById      [all authenticated]
PUT    /:id                 → updateDocument       [ADMIN, PM, INSPECTOR]
DELETE /:id                 → deleteDocument       [owner or ADMIN via checkOwnership]
PUT    /:id/approve         → approveDocument      [ADMIN, INSPECTOR]
PUT    /:id/reject          → rejectDocument       [ADMIN, INSPECTOR]
POST   /:id/version         → createNewVersion     [ADMIN, PM, INSPECTOR]
GET    /:id/download        → downloadDocument     [all authenticated]
```

**Compliance** (`/api/compliance`)
```
POST   /checklists          → createChecklist      [ADMIN, PM, INSPECTOR]
GET    /checklists          → getChecklists        [all authenticated]
GET    /checklists/:id      → getChecklistById     [all authenticated]
PUT    /checklists/:id      → updateChecklist      [ADMIN, PM, INSPECTOR]
DELETE /checklists/:id      → deleteChecklist      [ADMIN only]
POST   /inspections         → createInspection     [ADMIN, INSPECTOR]
GET    /inspections         → getInspections       [all authenticated]
GET    /inspections/:id     → getInspectionById    [all authenticated]
PUT    /inspections/:id     → updateInspection     [ADMIN, INSPECTOR]
DELETE /inspections/:id     → deleteInspection     [ADMIN only]
```

### Model Instance Methods (already implemented — use these)

```typescript
// Document model — Document.ts
document.addAccessLog(userId, AccessAction.VIEW | DOWNLOAD | EDIT)  // logs & saves
document.createNewVersion(newFileUrl, uploadedBy)                    // bumps version, resets to Draft
```

---

## Task 1 — Implement `uploadDocument`

**File:** `document.controller.ts`
**Route:** `POST /api/documents`
**Description:** Accept a multipart file, upload to Cloudinary, save metadata to MongoDB.

### Steps

1. Add `upload.single('file')` multer middleware call **inside** the route handler — OR verify `upload` is already applied at the route level. Check `document.routes.ts` — if not, the controller must handle it inline via `upload.single('file')(req, res, next)`.
2. Check `req.file` exists; if not, return `400` with `'No file uploaded'`.
3. Destructure `projectId`, `documentType`, `title`, `description`, `version`, `tags` from `req.body`.
4. Validate required fields: `projectId`, `documentType`, `title`. Return `400` if missing.
5. Validate `projectId` is a valid MongoDB ObjectId (`mongoose.Types.ObjectId.isValid`).
6. Call `uploadToCloudinary(req.file.path, 'construction-docs')` — wrap in try/catch.
7. Create document in MongoDB:
   ```typescript
   await DocumentModel.create({
     projectId,
     documentType,
     title,
     description,
     version: version || '1.0',
     tags: tags ? JSON.parse(tags) : [],   // tags sent as JSON string in FormData
     fileUrl,
     cloudinaryId,
     fileName: req.file.originalname,
     fileSize: req.file.size,
     fileFormat: format,
     status: DocumentStatus.DRAFT,
     uploadedBy: req.user!.userId,
   });
   ```
8. Delete the temp file from disk after Cloudinary upload (`fs.unlink`).
9. Return `201` with the created document.

### Error Cases
- `400` — missing required fields
- `400` — invalid `projectId` format
- `400` — no file in request
- `500` — Cloudinary upload failure
- `500` — DB save failure

---

## Task 2 — Implement `getDocuments`

**File:** `document.controller.ts`
**Route:** `GET /api/documents`
**Description:** List documents with optional filters and pagination.

### Steps

1. Extract query params: `projectId`, `documentType`, `status`, `page` (default `1`), `limit` (default `20`).
2. Build a `query` object — only add fields that are present in query params.
3. `countDocuments(query)` for total.
4. `find(query).skip(skip).limit(limit).populate('uploadedBy', 'fullName email').sort({ createdAt: -1 })`.
5. Return paginated response using the standard shape.

---

## Task 3 — Implement `getDocumentById`

**File:** `document.controller.ts`
**Route:** `GET /api/documents/:id`
**Description:** Fetch a single document and log the view access.

### Steps

1. Validate `req.params.id` is a valid ObjectId — return `400` if not.
2. `findById(id).populate('uploadedBy', 'fullName email').populate('approvedBy', 'fullName')`.
3. If not found, return `404`.
4. Call `document.addAccessLog(req.user!.userId, AccessAction.VIEW)` to log the view.
5. Return `200` with the document.

---

## Task 4 — Implement `updateDocument`

**File:** `document.controller.ts`
**Route:** `PUT /api/documents/:id`
**Description:** Update metadata fields only (no file replacement — that's `createNewVersion`).

### Steps

1. Validate `req.params.id`.
2. Find document by ID — return `404` if not found.
3. Allow updates to: `title`, `description`, `documentType`, `version`, `tags`.
4. Do NOT allow updates to `fileUrl`, `cloudinaryId`, `status`, `uploadedBy`, `approvedBy`.
5. Use `Object.assign` or field-by-field update, then `document.save()`.
6. Return `200` with updated document.

---

## Task 5 — Implement `deleteDocument`

**File:** `document.controller.ts`
**Route:** `DELETE /api/documents/:id`
**Description:** Delete document from DB and remove the file from Cloudinary.

### Steps

1. Validate `req.params.id`.
2. Find document by ID — return `404` if not found.
3. If `document.cloudinaryId` exists, call `deleteFromCloudinary(document.cloudinaryId)`.
4. Also delete any `previousVersions` files from Cloudinary (loop through `previousVersions` array).
5. `DocumentModel.findByIdAndDelete(id)`.
6. Return `200` with `{ success: true, data: {} }`.

---

## Task 6 — Implement `approveDocument`

**File:** `document.controller.ts`
**Route:** `PUT /api/documents/:id/approve`
**Description:** Set status to Approved. Only ADMIN or INSPECTOR (enforced at route level).

### Steps

1. Validate `req.params.id`.
2. Find document — return `404` if not found.
3. Check current status — if already `Approved`, return `400` with `'Document is already approved'`.
4. Set `document.status = DocumentStatus.APPROVED`.
5. Set `document.approvedBy = req.user!.userId`.
6. `approvalDate` is set automatically by the pre-save hook.
7. `document.save()`.
8. Return `200` with updated document.

---

## Task 7 — Implement `rejectDocument`

**File:** `document.controller.ts`
**Route:** `PUT /api/documents/:id/reject`
**Description:** Set status to Rejected with a reason.

### Steps

1. Validate `req.params.id`.
2. Find document — return `404` if not found.
3. Extract `rejectionReason` from `req.body` — return `400` if missing.
4. Set `document.status = DocumentStatus.REJECTED`.
5. Set `document.rejectionReason = rejectionReason`.
6. `document.save()`.
7. Return `200` with updated document.

---

## Task 8 — Implement `createNewVersion`

**File:** `document.controller.ts`
**Route:** `POST /api/documents/:id/version`
**Description:** Upload a new file as a new version of an existing document.

### Steps

1. Validate `req.params.id`.
2. Check `req.file` exists — return `400` if not.
3. Find existing document — return `404` if not found.
4. Call `uploadToCloudinary(req.file.path, 'construction-docs')` for the new file.
5. Delete temp file from disk.
6. Call `document.createNewVersion(newFileUrl, req.user!.userId)` — this method handles:
   - Pushing current version to `previousVersions`
   - Incrementing version number (e.g. `1.0` → `1.1`)
   - Setting status back to `Draft`
7. Update `document.cloudinaryId`, `document.fileName`, `document.fileSize`, `document.fileFormat` with new file data.
8. `document.save()` (createNewVersion already calls save, verify if double save needed).
9. Return `200` with updated document.

---

## Task 9 — Implement `downloadDocument`

**File:** `document.controller.ts`
**Route:** `GET /api/documents/:id/download`
**Description:** Log download access and return the file URL.

### Steps

1. Validate `req.params.id`.
2. Find document — return `404` if not found.
3. Call `document.addAccessLog(req.user!.userId, AccessAction.DOWNLOAD)`.
4. Return `200` with `{ success: true, data: { fileUrl: document.fileUrl, fileName: document.fileName } }`.

> Note: We return the Cloudinary URL rather than streaming the file. The client handles the download via the CDN link.

---

## Task 10 — Implement `createChecklist`

**File:** `compliance.controller.ts`
**Route:** `POST /api/compliance/checklists`
**Description:** Create a new compliance checklist with items.

### Steps

1. Extract `projectId`, `checklistName`, `category`, `items`, `dueDate` from `req.body`.
2. Validate `projectId` and `checklistName` are present.
3. Validate `projectId` is a valid ObjectId.
4. For each item in `items`, generate a unique `itemId` (e.g. `crypto.randomUUID()` or `new mongoose.Types.ObjectId().toString()`).
5. `ComplianceChecklist.create({ projectId, checklistName, category, items, dueDate, createdBy: req.user!.userId })`.
6. The pre-save hook automatically computes `totalItems`, `completedItems`, `complianceScore`.
7. Return `201` with the created checklist.

---

## Task 11 — Implement `getChecklists`

**File:** `compliance.controller.ts`
**Route:** `GET /api/compliance/checklists`
**Description:** List checklists with optional `projectId` and `category` filters.

### Steps

1. Extract `projectId`, `category`, `page` (default `1`), `limit` (default `20`) from query params.
2. Build filter query.
3. `countDocuments(query)`.
4. `find(query).skip(skip).limit(limit).populate('createdBy', 'fullName').sort({ createdAt: -1 })`.
5. Return paginated response.

---

## Task 12 — Implement `getChecklistById`

**File:** `compliance.controller.ts`
**Route:** `GET /api/compliance/checklists/:id`
**Description:** Fetch a single checklist with all items.

### Steps

1. Validate `req.params.id`.
2. `findById(id).populate('createdBy', 'fullName').populate('items.completedBy', 'fullName')`.
3. Return `404` if not found.
4. Return `200` with checklist.

---

## Task 13 — Implement `updateChecklist`

**File:** `compliance.controller.ts`
**Route:** `PUT /api/compliance/checklists/:id`
**Description:** Update checklist metadata and/or update individual item completion status.

### Steps

1. Validate `req.params.id`.
2. Find checklist — return `404` if not found.
3. Handle two update modes:
   - **Metadata update:** `checklistName`, `category`, `dueDate` — update fields directly.
   - **Item update:** If `req.body.items` is provided, merge item changes by matching `itemId`.
     - If an item's `isCompleted` flips to `true`, set `completedBy = req.user!.userId`.
     - The pre-save hook recalculates `complianceScore` automatically.
4. `checklist.save()`.
5. Return `200` with updated checklist.

---

## Task 14 — Implement `deleteChecklist`

**File:** `compliance.controller.ts`
**Route:** `DELETE /api/compliance/checklists/:id`
**Description:** Delete a compliance checklist. ADMIN only (enforced at route level).

### Steps

1. Validate `req.params.id`.
2. Find checklist — return `404` if not found.
3. `ComplianceChecklist.findByIdAndDelete(id)`.
4. Return `200` with `{ success: true, data: {} }`.

---

## Task 15 — Implement `createInspection`

**File:** `compliance.controller.ts`
**Route:** `POST /api/compliance/inspections`
**Description:** Create a new safety inspection record.

### Steps

1. Extract all fields: `projectId`, `inspectionType`, `inspectionDate`, `findings`, `riskLevel`, `issuesIdentified`, `actionRequired`, `recommendedActions`, `actionDeadline`, `photos`, `attachments`.
2. Validate required fields: `projectId`, `inspectionDate`, `findings`, `riskLevel`.
3. Set `inspector = req.user!.userId` (the logged-in inspector is always the one creating it).
4. `SafetyInspection.create({ ...body, inspector })`.
5. The pre-save hook auto-sets `isResolved = true` when `actionStatus = Completed`.
6. Return `201` with created inspection.

---

## Task 16 — Implement `getInspections`

**File:** `compliance.controller.ts`
**Route:** `GET /api/compliance/inspections`
**Description:** List inspections with optional filters.

### Steps

1. Extract `projectId`, `riskLevel`, `isResolved`, `inspectionType`, `page` (default `1`), `limit` (default `20`) from query params.
2. Build filter query — only add filters that are present.
3. `countDocuments(query)`.
4. `find(query).skip(skip).limit(limit).populate('inspector', 'fullName email').sort({ inspectionDate: -1 })`.
5. Return paginated response.

---

## Task 17 — Implement `getInspectionById`

**File:** `compliance.controller.ts`
**Route:** `GET /api/compliance/inspections/:id`
**Description:** Fetch a single inspection with full details.

### Steps

1. Validate `req.params.id`.
2. `findById(id).populate('inspector', 'fullName email').populate('attachments', 'title fileUrl')`.
3. Return `404` if not found.
4. Return `200` with inspection.

---

## Task 18 — Implement `updateInspection`

**File:** `compliance.controller.ts`
**Route:** `PUT /api/compliance/inspections/:id`
**Description:** Update inspection findings, action status, or follow-up details.

### Steps

1. Validate `req.params.id`.
2. Find inspection — return `404` if not found.
3. Allowed update fields: `findings`, `riskLevel`, `issuesIdentified`, `actionRequired`, `recommendedActions`, `actionDeadline`, `actionStatus`, `followUpDate`, `followUpNotes`, `isResolved`, `photos`.
4. Apply updates field by field, then `inspection.save()`.
5. The pre-save hook auto-sets `isResolved = true` if `actionStatus` becomes `Completed`.
6. Return `200` with updated inspection.

---

## Task 19 — Implement `deleteInspection`

**File:** `compliance.controller.ts`
**Route:** `DELETE /api/compliance/inspections/:id`
**Description:** Delete a safety inspection. ADMIN only (enforced at route level).

### Steps

1. Validate `req.params.id`.
2. Find inspection — return `404` if not found.
3. `SafetyInspection.findByIdAndDelete(id)`.
4. Return `200` with `{ success: true, data: {} }`.

---

## Task 20 — Write Integration Tests: Documents

**File:** `apps/backend/src/__tests__/integration/document.test.ts`
**Pattern:** Follow `sustainability.test.ts` structure exactly.

### Test Setup (`beforeEach`)

```typescript
// Create users
adminUser, pmUser, inspectorUser, viewerUser — with createTestUser()
adminToken, pmToken, inspectorToken, viewerToken — with getAuthToken()

// Create a project
projectId — with Project.create(...)

// Clean Document collection
await DocumentModel.deleteMany({})
```

### Test Cases to Cover

**POST /api/documents (upload)**
- [ ] ADMIN can upload a document → expect 201, document created with status `Draft`
- [ ] PM can upload a document → expect 201
- [ ] INSPECTOR can upload a document → expect 201
- [ ] VIEWER cannot upload → expect 403
- [ ] Missing required field (`title`) → expect 400
- [ ] Invalid `projectId` format → expect 400
- [ ] No file in request → expect 400

**GET /api/documents**
- [ ] Returns list of documents with pagination
- [ ] Filters by `projectId` correctly
- [ ] Filters by `documentType` correctly
- [ ] Filters by `status` correctly
- [ ] Unauthenticated request → expect 401

**GET /api/documents/:id**
- [ ] Returns document by valid ID
- [ ] Invalid ID format → expect 400
- [ ] Non-existent ID → expect 404
- [ ] Access log is created after view

**PUT /api/documents/:id (update metadata)**
- [ ] ADMIN can update `title` and `description`
- [ ] PM can update their own document
- [ ] VIEWER cannot update → expect 403

**DELETE /api/documents/:id**
- [ ] Owner (PM) can delete their own document → expect 200
- [ ] Non-owner cannot delete → expect 403
- [ ] ADMIN can delete any document

**PUT /api/documents/:id/approve**
- [ ] INSPECTOR can approve a document → status becomes `Approved`, `approvedBy` set
- [ ] PM cannot approve → expect 403
- [ ] Already approved document → expect 400

**PUT /api/documents/:id/reject**
- [ ] INSPECTOR can reject with a reason → status becomes `Rejected`
- [ ] Missing `rejectionReason` → expect 400
- [ ] PM cannot reject → expect 403

**POST /api/documents/:id/version**
- [ ] Creates new version, old version saved to `previousVersions`, status resets to `Draft`
- [ ] Version number increments (1.0 → 1.1)

**GET /api/documents/:id/download**
- [ ] Returns file URL and logs download access

---

## Task 21 — Write Integration Tests: Compliance & Inspections

**File:** `apps/backend/src/__tests__/integration/compliance.test.ts`

### Test Setup (`beforeEach`)

```typescript
// Create users: admin, pm, inspector, viewer
// Create a project with pm as projectManager
// Clean ComplianceChecklist and SafetyInspection collections
```

### Test Cases to Cover

**POST /api/compliance/checklists**
- [ ] ADMIN can create checklist with items → expect 201, `complianceScore` calculated
- [ ] PM can create checklist → expect 201
- [ ] INSPECTOR can create checklist → expect 201
- [ ] VIEWER cannot create → expect 403
- [ ] Missing `checklistName` → expect 400
- [ ] Items with `isCompleted: true` reflected in `complianceScore`

**GET /api/compliance/checklists**
- [ ] Returns all checklists with pagination
- [ ] Filters by `projectId`
- [ ] Filters by `category`

**GET /api/compliance/checklists/:id**
- [ ] Returns checklist with items
- [ ] Non-existent ID → expect 404

**PUT /api/compliance/checklists/:id**
- [ ] Updates `checklistName`
- [ ] Marks item as completed → `complianceScore` updates
- [ ] `completedBy` is set to current user when item is marked complete

**DELETE /api/compliance/checklists/:id**
- [ ] ADMIN can delete → expect 200
- [ ] INSPECTOR cannot delete → expect 403

**POST /api/compliance/inspections**
- [ ] INSPECTOR can create inspection with riskLevel `High` → expect 201
- [ ] ADMIN can create inspection → expect 201
- [ ] PM cannot create inspection → expect 403
- [ ] Missing `findings` → expect 400
- [ ] Missing `riskLevel` → expect 400
- [ ] `inspector` is auto-set to logged-in user

**GET /api/compliance/inspections**
- [ ] Returns all inspections with pagination
- [ ] Filters by `projectId`
- [ ] Filters by `riskLevel`
- [ ] Filters by `isResolved`

**GET /api/compliance/inspections/:id**
- [ ] Returns inspection with populated `inspector`
- [ ] Non-existent ID → expect 404

**PUT /api/compliance/inspections/:id**
- [ ] INSPECTOR can update `actionStatus` to `Completed` → `isResolved` becomes `true`
- [ ] Can update `followUpNotes`
- [ ] PM cannot update → expect 403

**DELETE /api/compliance/inspections/:id**
- [ ] ADMIN can delete → expect 200
- [ ] INSPECTOR cannot delete → expect 403

---

## Task 22 — Multer + Upload Middleware Wiring

**Issue to verify before Task 1:**
The `upload` middleware in `upload.ts` uses disk storage. It must be applied **before** the controller in the route, OR applied inside the controller. Check `document.routes.ts`:

```typescript
// document.routes.ts currently has:
router.post('/', authenticate, requireDataEntry(), uploadDocument);

// It should be:
router.post('/', authenticate, requireDataEntry(), upload.single('file'), uploadDocument);
```

**Action:** Update `document.routes.ts` to include `upload.single('file')` for:
- `POST /` (uploadDocument)
- `POST /:id/version` (createNewVersion)

Also import `upload` from `../middleware/upload` in `document.routes.ts`.

Similarly for `POST /api/compliance/inspections` if photos are uploaded directly (TBD based on whether photos are Cloudinary URLs passed in body vs actual file uploads).

---

## Task 23 — Ensure `uploads/` Directory Exists

Multer disk storage writes to `uploads/` directory. This must exist before running the server.

**Action:** Check if `uploads/` exists at backend root. Add a `.gitkeep` file inside it if missing, or add startup logic in `server.ts` / `app.ts`:

```typescript
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
```

---

## Implementation Order (Recommended)

```
Day 1 — Foundation
  Task 22  Multer wiring in document.routes.ts
  Task 23  Ensure uploads/ directory exists
  Task 1   uploadDocument controller
  Task 2   getDocuments controller

Day 2 — Document CRUD + Status Flow
  Task 3   getDocumentById
  Task 4   updateDocument
  Task 5   deleteDocument
  Task 6   approveDocument
  Task 7   rejectDocument
  Task 8   createNewVersion
  Task 9   downloadDocument

Day 3 — Compliance CRUD
  Task 10  createChecklist
  Task 11  getChecklists
  Task 12  getChecklistById
  Task 13  updateChecklist
  Task 14  deleteChecklist

Day 4 — Safety Inspections CRUD
  Task 15  createInspection
  Task 16  getInspections
  Task 17  getInspectionById
  Task 18  updateInspection
  Task 19  deleteInspection

Day 5 — Tests
  Task 20  Integration tests: Documents
  Task 21  Integration tests: Compliance & Inspections
```

---

## Acceptance Criteria

- [ ] All 19 controller functions return proper responses (no 501 "Not implemented")
- [ ] Files are stored in Cloudinary, metadata in MongoDB
- [ ] Deleting a document also removes the file from Cloudinary
- [ ] Document status workflow enforced: `Draft → Under Review → Approved / Rejected`
- [ ] Compliance score auto-calculated on every checklist save
- [ ] Safety inspection `isResolved` auto-set when `actionStatus = Completed`
- [ ] Version history preserved when creating a new document version
- [ ] Access log populated on every `view` and `download`
- [ ] All role-based restrictions enforced (401 / 403 returned correctly)
- [ ] All integration tests pass with `bun test` or `npm test`
- [ ] No temp files left on disk after Cloudinary upload

---

## Environment Variables Required

Ensure these are set in `.env` (Cloudinary credentials):

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
