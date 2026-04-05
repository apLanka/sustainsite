# Documents Module — Databinding Plan

## Overview

Connect `DocumentsPage.tsx` and `DocumentUploader.tsx` to the 9 backend document endpoints.
All routes are mounted at `/api/projects/:projectId/documents` or `/api/documents/:id` — verify
the exact mount point in `app.ts` before calling.

---

## 1. Backend Endpoint Map

| # | Method | Path | Auth / Guard | Controller |
|---|--------|------|-------------|------------|
| 1 | POST | `/` | `authenticate` + `requireDataEntry` + `upload.single('file')` | `uploadDocument` |
| 2 | GET | `/` | `authenticate` | `getDocuments` |
| 3 | GET | `/:id` | `authenticate` | `getDocumentById` |
| 4 | PUT | `/:id` | `authenticate` + `requireDataEntry` | `updateDocument` |
| 5 | DELETE | `/:id` | `authenticate` + `checkOwnership(uploadedBy)` | `deleteDocument` |
| 6 | PUT | `/:id/approve` | `authenticate` + `authorize(ADMIN, INSPECTOR)` | `approveDocument` |
| 7 | PUT | `/:id/reject` | `authenticate` + `authorize(ADMIN, INSPECTOR)` | `rejectDocument` |
| 8 | POST | `/:id/version` | `authenticate` + `requireDataEntry` + `upload.single('file')` | `createNewVersion` |
| 9 | GET | `/:id/download` | `authenticate` | `downloadDocument` → 302 redirect to Cloudinary URL |

---

## 2. Request / Response Shapes

### POST `/` — Upload Document
**Body:** `multipart/form-data`
```
file          (binary, required)
projectId     string (ObjectId)
documentType  'Blueprint' | 'Permit' | 'Certificate' | 'Safety Report' | 'Contract' | 'Other'
title         string
description?  string
version?      string  (default '1.0')
tags?         JSON string array e.g. '["phase-1","structural"]'
```
**Response 201:** `{ success: true, data: Document }`

### GET `/` — List Documents
**Query params:**
```
projectId?    string (ObjectId) — filter by project
documentType? string
status?       'Draft' | 'Under Review' | 'Approved' | 'Rejected'
uploadedBy?   string (ObjectId)
tag?          string
page?         number (default 1)
limit?        number (default 10, max 100)
```
**Response 200:**
```json
{
  "success": true,
  "data": [Document],
  "pagination": { "total": 42, "page": 1, "limit": 10, "pages": 5 }
}
```
Note: `accessLog` and `previousVersions` are excluded from list response.

### GET `/:id` — Get Single Document
**Response 200:** `{ success: true, data: Document }` — includes `accessLog` (user populated) and `previousVersions`.
Side effect: logs a `view` access entry (fire-and-forget after response).

### PUT `/:id` — Update Metadata
**Body (JSON):** any subset of `{ title, description, documentType, tags }`
**Response 200:** `{ success: true, data: Document }`

### DELETE `/:id` — Delete Document
**Response 200:** `{ success: true, message: 'Document deleted successfully' }`
Also deletes file from Cloudinary.

### PUT `/:id/approve`
**Response 200:** `{ success: true, data: Document }` with `status: 'Approved'`, `approvedBy` populated.

### PUT `/:id/reject`
**Body:** `{ rejectionReason: string }`
**Response 200:** `{ success: true, data: Document }` with `status: 'Rejected'`.

### POST `/:id/version` — Upload New Version
**Body:** `multipart/form-data` with `file` only.
**Response 200:** `{ success: true, data: Document }` — `version` auto-incremented (e.g. `1.0 → 1.1`), previous version pushed to `previousVersions[]`, status reset to `'Draft'`.

### GET `/:id/download`
**Response:** `302` redirect to Cloudinary file URL. Side effect: logs `download` access entry.
Frontend should open this URL in a new tab (`window.open`) — do not use `axios.get` as it follows the redirect inside the browser context.

---

## 3. TypeScript Types to Create

**File:** `apps/frontend/src/types/document.ts`

```ts
export enum DocumentType {
  BLUEPRINT    = 'Blueprint',
  PERMIT       = 'Permit',
  CERTIFICATE  = 'Certificate',
  SAFETY_REPORT = 'Safety Report',
  CONTRACT     = 'Contract',
  OTHER        = 'Other',
}

export enum DocumentStatus {
  DRAFT        = 'Draft',
  UNDER_REVIEW = 'Under Review',
  APPROVED     = 'Approved',
  REJECTED     = 'Rejected',
}

export interface DocumentUploader {
  _id: string;
  name: string;
  email: string;
}

export interface PreviousVersion {
  version: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string | DocumentUploader;
}

export interface AccessLogEntry {
  userId: string | DocumentUploader;
  action: 'view' | 'download' | 'edit';
  timestamp: string;
}

export interface ProjectDocument {
  _id: string;
  projectId: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  fileUrl: string;
  cloudinaryId?: string;
  fileName?: string;
  fileSize?: number;
  fileFormat?: string;
  version: string;
  previousVersions: PreviousVersion[];   // present in getById only
  status: DocumentStatus;
  approvedBy?: DocumentUploader | null;
  approvalDate?: string;
  rejectionReason?: string;
  uploadedBy: DocumentUploader;
  tags: string[];
  accessLog?: AccessLogEntry[];          // present in getById only
  createdAt: string;
  updatedAt: string;
}

export interface DocumentPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface DocumentFilters {
  projectId?: string;
  documentType?: DocumentType | '';
  status?: DocumentStatus | '';
  tag?: string;
  page: number;
  limit: number;
}

// Upload form (multipart)
export interface UploadDocumentPayload {
  file: File;
  projectId: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  version?: string;
  tags?: string[];
}

// Update metadata (JSON)
export interface UpdateDocumentPayload {
  title?: string;
  description?: string;
  documentType?: DocumentType;
  tags?: string[];
}
```

---

## 4. API Layer

**File:** `apps/frontend/src/lib/api.ts` — add `documentApi` object alongside `projectApi`.

```ts
export const documentApi = {
  // 1. Upload — must use FormData, not JSON
  upload: (payload: UploadDocumentPayload) => {
    const form = new FormData();
    form.append('file', payload.file);
    form.append('projectId', payload.projectId);
    form.append('documentType', payload.documentType);
    form.append('title', payload.title);
    if (payload.description) form.append('description', payload.description);
    if (payload.version)     form.append('version', payload.version);
    if (payload.tags?.length) form.append('tags', JSON.stringify(payload.tags));
    return api.post<ApiResponse<ProjectDocument>>('/documents', form);
  },

  // 2. List
  getDocuments: (filters: DocumentFilters) =>
    api.get<PaginatedResponse<ProjectDocument>>('/documents', { params: filters }),

  // 3. Get by ID (includes accessLog + previousVersions)
  getById: (id: string) =>
    api.get<ApiResponse<ProjectDocument>>(`/documents/${id}`),

  // 4. Update metadata
  update: (id: string, payload: UpdateDocumentPayload) =>
    api.put<ApiResponse<ProjectDocument>>(`/documents/${id}`, payload),

  // 5. Delete
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/documents/${id}`),

  // 6. Approve
  approve: (id: string) =>
    api.put<ApiResponse<ProjectDocument>>(`/documents/${id}/approve`),

  // 7. Reject
  reject: (id: string, rejectionReason: string) =>
    api.put<ApiResponse<ProjectDocument>>(`/documents/${id}/reject`, { rejectionReason }),

  // 8. New version
  createVersion: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ApiResponse<ProjectDocument>>(`/documents/${id}/version`, form);
  },

  // 9. Download — returns the redirect URL, open in new tab
  getDownloadUrl: (id: string) => `${api.defaults.baseURL}/documents/${id}/download`,
};
```

For download: call `window.open(documentApi.getDownloadUrl(id))` directly rather than going through axios, since the endpoint issues a 302 redirect to Cloudinary.

---

## 5. Zustand Store Slice

**File:** `apps/frontend/src/store/index.ts` — add `useDocumentStore`.

```ts
interface DocumentSlice {
  documents: ProjectDocument[];
  selectedDocument: ProjectDocument | null;
  pagination: DocumentPagination | null;
  filters: DocumentFilters;
  isLoading: boolean;
  isUploading: boolean;

  setDocuments: (docs: ProjectDocument[], pagination: DocumentPagination) => void;
  setSelectedDocument: (doc: ProjectDocument | null) => void;
  appendDocument: (doc: ProjectDocument) => void;
  updateDocumentInStore: (id: string, patch: Partial<ProjectDocument>) => void;
  removeDocument: (id: string) => void;
  setFilters: (partial: Partial<DocumentFilters>) => void;
  setLoading: (v: boolean) => void;
  setUploading: (v: boolean) => void;
  resetFilters: (projectId?: string) => void;
}
```

Default filters: `{ projectId: '', documentType: '', status: '', tag: '', page: 1, limit: 10 }`.
When page opens for a project, call `resetFilters(projectId)` and then `getDocuments`.

---

## 6. Component Changes

### 6.1 `DocumentsPage.tsx` — Full rewrite

**State to remove:** `allDocuments[]` hardcoded array, local `DocumentAsset` interface.

**New behaviour:**
1. On mount: read `id` from `useParams`, call `documentApi.getDocuments({ projectId: id, page: 1, limit: 10 })`, store result via `setDocuments`.
2. Search input: debounce (400ms) — there is no text-search endpoint, so filter client-side on `title` within the current page, or add a `tag` filter param to the API call.
3. Document type filter button → open a small dropdown, sets `filters.documentType` → triggers re-fetch.
4. Table rows from `documents` (store) instead of `allDocuments`.
5. Download button: `window.open(documentApi.getDownloadUrl(doc._id))`.
6. Version history button: fetch `documentApi.getById(doc._id)` to get `previousVersions`, then open history modal.
7. Delete button: confirm, then `documentApi.delete(doc._id)`, then `removeDocument(doc._id)` from store.
8. Replace hardcoded "148 total assets" with `pagination.total`.

**Upload flow (upload modal → confirm):**
1. User drops/selects file in `DocumentUploader` — lift selected `File` up to page via `onFileSelect(file: File)`.
2. "Confirm Registration" button → build `UploadDocumentPayload` from form state + file + `projectId` from params, call `documentApi.upload(...)`.
3. On success: `appendDocument(res.data)`, close modal, reset form.
4. Show upload progress (use `onUploadProgress` in axios config to track `loaded/total`).

**Approve/Reject (for ADMIN / INSPECTOR roles):**
- Add action buttons per row conditionally: `user.role === 'Admin' || user.role === 'Inspector'`.
- Approve: call `documentApi.approve(id)`, then `updateDocumentInStore(id, res.data)`.
- Reject: open a small inline modal to collect `rejectionReason`, then call `documentApi.reject(id, reason)`.

### 6.2 `DocumentUploader.tsx` — Add file selection logic

Add `onFileSelect: (file: File) => void` prop.
On `onDrop`: extract `e.dataTransfer.files[0]`, validate extension, call `onFileSelect`.
Add a hidden `<input type="file" />` for click-to-browse, trigger it via `onClick` on the drop zone.
Display selected file name + size once chosen (before upload completes).

---

## 7. Implementation Order

1. **`apps/frontend/src/types/document.ts`** — create types file
2. **`apps/frontend/src/lib/api.ts`** — add `documentApi`
3. **`apps/frontend/src/store/index.ts`** — add `useDocumentStore`
4. **`DocumentUploader.tsx`** — add `onFileSelect` prop + file input wiring
5. **`DocumentsPage.tsx`** — replace mock data with real API calls, wire all actions

---

## 8. Notes & Gotchas

- **Pagination key:** the backend returns `pages` (not `totalPages`) in the document response. This differs from the project pagination which uses `totalPages`. Reflect this in `DocumentPagination` type.
- **FormData + auth header:** axios interceptor already injects `Authorization: Bearer <token>` on every request. `Content-Type: multipart/form-data` is set automatically by the browser when you pass a `FormData` instance — do not set it manually or the boundary will be missing.
- **Download redirect:** axios follows 302 internally and may CORS-error on the Cloudinary redirect. Use `window.open(getDownloadUrl(id))` instead.
- **Tags:** sent as a JSON string (`'["tag1","tag2"]'`) in multipart, parsed server-side with `JSON.parse`. When building `FormData`, stringify the array.
- **Role guard — approve/reject:** backend guards with `authorize(ADMIN, INSPECTOR)`. Read `user.role` from `useAuthStore` to conditionally render approve/reject buttons.
- **Version modal uses getById:** the list endpoint strips `previousVersions`. Always fetch by ID before showing the version history modal.
- **`requireDataEntry` middleware:** this likely allows roles `Manager`, `DataEntry`, `Admin` — check the middleware definition to confirm which roles can upload/update.
