# Compliance Module — Databinding Plan

## Overview

Replace all hardcoded mock data in `CompliancePage.tsx` with real API calls.
The module covers **two distinct resources**: Compliance Checklists and Safety Inspections.
All routes are mounted at `/api/compliance`.

---

## 1. Backend Endpoint Map

### Checklists

| # | Method | Path | Guard | Controller |
|---|--------|------|-------|------------|
| 1 | POST | `/checklists` | `authenticate` + `requireDataEntry` | `createChecklist` |
| 2 | GET | `/checklists` | `authenticate` | `getChecklists` |
| 3 | GET | `/checklists/:id` | `authenticate` | `getChecklistById` |
| 4 | PUT | `/checklists/:id` | `authenticate` + `requireDataEntry` | `updateChecklist` |
| 5 | DELETE | `/checklists/:id` | `authenticate` + `requireAdmin` | `deleteChecklist` |

### Inspections

| # | Method | Path | Guard | Controller |
|---|--------|------|-------|------------|
| 6 | POST | `/inspections` | `authenticate` + `authorize(ADMIN, INSPECTOR)` | `createInspection` |
| 7 | GET | `/inspections` | `authenticate` | `getInspections` |
| 8 | GET | `/inspections/:id` | `authenticate` | `getInspectionById` |
| 9 | PUT | `/inspections/:id` | `authenticate` + `authorize(ADMIN, INSPECTOR)` | `updateInspection` |
| 10 | DELETE | `/inspections/:id` | `authenticate` + `requireAdmin` | `deleteInspection` |

---

## 2. Request / Response Shapes

### POST `/checklists` — Create Checklist
**Body (JSON):**
```json
{
  "projectId":      "string (ObjectId, required)",
  "checklistName":  "string (required, 3–200 chars)",
  "category":       "Environmental | Safety | Building Code | Sustainability Certification (optional)",
  "items":          "ComplianceItem[] (optional, defaults [])",
  "dueDate":        "ISO date string (optional)",
  "lastReviewDate": "ISO date string (optional)"
}
```
**Response 201:** `{ success: true, data: ComplianceChecklist }`
Note: `totalItems`, `completedItems`, `complianceScore` are computed by the pre-save hook — do NOT send them.

### GET `/checklists` — List Checklists
**Query params:**
```
projectId?  string (ObjectId)
category?   string
page?       number (default 1)
limit?      number (default 10, max 100)
```
**Response 200:**
```json
{
  "success": true,
  "data": [ComplianceChecklist],
  "pagination": { "total": 12, "page": 1, "limit": 10, "pages": 2 }
}
```

### GET `/checklists/:id` — Get Checklist (full)
**Response 200:** `{ success: true, data: ComplianceChecklist }`
`createdBy`, `items[].completedBy`, and `items[].attachedDocuments` are populated.

### PUT `/checklists/:id` — Update Checklist
**Body:** any subset of `{ checklistName, category, dueDate, lastReviewDate, items }`

Key behaviour when sending `items[]`:
- The full items array replaces the existing one (not a merge/patch).
- If an item has `isCompleted: true` and no `completedBy`, the backend sets `completedBy` to the current user.
- The pre-save hook recalculates `totalItems`, `completedItems`, `complianceScore`.

**Response 200:** `{ success: true, data: ComplianceChecklist }` (populated)

### DELETE `/checklists/:id`
**Response 200:** `{ success: true, message: 'Checklist deleted successfully' }` (ADMIN only)

---

### POST `/inspections` — Create Inspection
**Body (JSON):**
```json
{
  "projectId":          "string (ObjectId, required)",
  "inspectionDate":     "ISO date string (required)",
  "findings":           "string (required)",
  "riskLevel":          "Low | Medium | High | Critical (required)",
  "inspectionType":     "Safety | Environmental | Quality | Structural (optional)",
  "inspectorNotes":     "string (optional)",
  "issuesIdentified":   "IssueIdentified[] (optional)",
  "actionRequired":     "string (optional)",
  "recommendedActions": "string[] (optional)",
  "actionDeadline":     "ISO date string (optional)",
  "followUpDate":       "ISO date string (optional)",
  "followUpNotes":      "string (optional)"
}
```
Note: `inspector` is set server-side from `req.user.userId` — do NOT send it.
**Response 201:** `{ success: true, data: SafetyInspection }` with `inspector` populated.

### GET `/inspections` — List Inspections
**Query params:**
```
projectId?      string (ObjectId)
riskLevel?      Low | Medium | High | Critical
actionStatus?   Pending | In Progress | Completed
inspectionType? Safety | Environmental | Quality | Structural
isResolved?     true | false (string)
page?           number (default 1)
limit?          number (default 10)
```
Sorted by `inspectionDate` descending.
**Response 200:** `{ success: true, data: [SafetyInspection], pagination: { total, page, limit, pages } }`

### GET `/inspections/:id`
`inspector` and `attachments` (populated as `{ title, fileUrl, fileName, documentType }`) are included.

### PUT `/inspections/:id` — Update Inspection
Any subset of all editable fields. Key: setting `actionStatus: 'Completed'` triggers pre-save hook which auto-sets `isResolved: true`.

### DELETE `/inspections/:id`
ADMIN only. **Response 200:** `{ success: true, message: 'Inspection deleted successfully' }`

---

## 3. TypeScript Types to Create

**File:** `apps/frontend/src/types/compliance.ts`

```ts
export enum ComplianceCategory {
  ENVIRONMENTAL              = 'Environmental',
  SAFETY                     = 'Safety',
  BUILDING_CODE              = 'Building Code',
  SUSTAINABILITY_CERTIFICATION = 'Sustainability Certification',
}

export enum InspectionType {
  SAFETY        = 'Safety',
  ENVIRONMENTAL = 'Environmental',
  QUALITY       = 'Quality',
  STRUCTURAL    = 'Structural',
}

export enum RiskLevel {
  LOW      = 'Low',
  MEDIUM   = 'Medium',
  HIGH     = 'High',
  CRITICAL = 'Critical',
}

export enum ActionStatus {
  PENDING     = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED   = 'Completed',
}

export enum IssueSeverity {
  MINOR    = 'Minor',
  MODERATE = 'Moderate',
  MAJOR    = 'Major',
}

// ── Checklist ────────────────────────────────────────────────────────────────

export interface AttachedDocument {
  _id: string;
  title: string;
  fileUrl: string;
  fileName?: string;
  documentType: string;
}

export interface ComplianceItem {
  itemId: string;
  itemName: string;
  description?: string;
  isCompleted: boolean;
  completedDate?: string;
  completedBy?: { _id: string; name: string; email: string } | null;
  attachedDocuments: AttachedDocument[];
  notes?: string;
}

export interface ComplianceChecklist {
  _id: string;
  projectId: string;
  checklistName: string;
  category?: ComplianceCategory;
  items: ComplianceItem[];
  totalItems: number;
  completedItems: number;
  complianceScore: number;
  createdBy?: { _id: string; name: string; email: string } | null;
  dueDate?: string;
  lastReviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Inspection ───────────────────────────────────────────────────────────────

export interface IssueIdentified {
  issue: string;
  severity: IssueSeverity;
  location?: string;
}

export interface InspectionPhoto {
  url: string;
  caption?: string;
  uploadedAt: string;
}

export interface SafetyInspection {
  _id: string;
  projectId: string;
  inspectionType?: InspectionType;
  inspectionDate: string;
  inspector: { _id: string; name: string; email: string };
  inspectorNotes?: string;
  findings: string;
  riskLevel: RiskLevel;
  issuesIdentified: IssueIdentified[];
  actionRequired?: string;
  recommendedActions: string[];
  actionDeadline?: string;
  actionStatus: ActionStatus;
  attachments: AttachedDocument[];
  photos: InspectionPhoto[];
  followUpDate?: string;
  followUpNotes?: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Filters ──────────────────────────────────────────────────────────────────

export interface ChecklistFilters {
  projectId?: string;
  category?: ComplianceCategory | '';
  page: number;
  limit: number;
}

export interface InspectionFilters {
  projectId?: string;
  riskLevel?: RiskLevel | '';
  actionStatus?: ActionStatus | '';
  inspectionType?: InspectionType | '';
  isResolved?: boolean | '';
  page: number;
  limit: number;
}

// ── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateChecklistPayload {
  projectId: string;
  checklistName: string;
  category?: ComplianceCategory;
  items?: Omit<ComplianceItem, 'completedBy' | 'completedDate' | 'attachedDocuments'>[];
  dueDate?: string;
  lastReviewDate?: string;
}

export interface UpdateChecklistPayload {
  checklistName?: string;
  category?: ComplianceCategory;
  dueDate?: string;
  lastReviewDate?: string;
  items?: ComplianceItem[];
}

export interface CreateInspectionPayload {
  projectId: string;
  inspectionDate: string;
  findings: string;
  riskLevel: RiskLevel;
  inspectionType?: InspectionType;
  inspectorNotes?: string;
  issuesIdentified?: IssueIdentified[];
  actionRequired?: string;
  recommendedActions?: string[];
  actionDeadline?: string;
  followUpDate?: string;
  followUpNotes?: string;
}

export interface UpdateInspectionPayload {
  inspectionType?: InspectionType;
  inspectionDate?: string;
  inspectorNotes?: string;
  findings?: string;
  riskLevel?: RiskLevel;
  issuesIdentified?: IssueIdentified[];
  actionRequired?: string;
  recommendedActions?: string[];
  actionDeadline?: string;
  actionStatus?: ActionStatus;
  followUpDate?: string;
  followUpNotes?: string;
}

// ── Shared pagination ─────────────────────────────────────────────────────────

export interface CompliancePagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
```

---

## 4. API Layer

**File:** `apps/frontend/src/lib/api.ts` — add `complianceApi`.

```ts
// Checklists
complianceApi.createChecklist(payload: CreateChecklistPayload)
  → POST /compliance/checklists   → { success, data: ComplianceChecklist }

complianceApi.getChecklists(filters: Partial<ChecklistFilters>)
  → GET  /compliance/checklists   → { success, data: [], pagination }

complianceApi.getChecklistById(id: string)
  → GET  /compliance/checklists/:id → { success, data: ComplianceChecklist }

complianceApi.updateChecklist(id, payload: UpdateChecklistPayload)
  → PUT  /compliance/checklists/:id → { success, data: ComplianceChecklist }

complianceApi.deleteChecklist(id: string)
  → DELETE /compliance/checklists/:id → void

// Inspections
complianceApi.createInspection(payload: CreateInspectionPayload)
  → POST /compliance/inspections  → { success, data: SafetyInspection }

complianceApi.getInspections(filters: Partial<InspectionFilters>)
  → GET  /compliance/inspections  → { success, data: [], pagination }

complianceApi.getInspectionById(id: string)
  → GET  /compliance/inspections/:id → { success, data: SafetyInspection }

complianceApi.updateInspection(id, payload: UpdateInspectionPayload)
  → PUT  /compliance/inspections/:id → { success, data: SafetyInspection }

complianceApi.deleteInspection(id: string)
  → DELETE /compliance/inspections/:id → void
```

---

## 5. Zustand Store Slice

**File:** `apps/frontend/src/store/index.ts` — add `useComplianceStore`.

```ts
interface ComplianceSlice {
  // Checklists
  checklists:          ComplianceChecklist[];
  selectedChecklist:   ComplianceChecklist | null;
  checklistPagination: CompliancePagination | null;
  checklistFilters:    ChecklistFilters;
  isChecklistLoading:  boolean;

  // Inspections
  inspections:          SafetyInspection[];
  inspectionPagination: CompliancePagination | null;
  inspectionFilters:    InspectionFilters;
  isInspectionLoading:  boolean;

  // Checklist actions
  setChecklists:             (data: ComplianceChecklist[], pagination: CompliancePagination) => void;
  setSelectedChecklist:      (c: ComplianceChecklist | null) => void;
  appendChecklist:           (c: ComplianceChecklist) => void;
  updateChecklistInStore:    (id: string, patch: Partial<ComplianceChecklist>) => void;
  removeChecklist:           (id: string) => void;
  setChecklistFilters:       (partial: Partial<ChecklistFilters>) => void;
  setChecklistLoading:       (v: boolean) => void;

  // Inspection actions
  setInspections:            (data: SafetyInspection[], pagination: CompliancePagination) => void;
  appendInspection:          (i: SafetyInspection) => void;
  updateInspectionInStore:   (id: string, patch: Partial<SafetyInspection>) => void;
  removeInspection:          (id: string) => void;
  setInspectionFilters:      (partial: Partial<InspectionFilters>) => void;
  setInspectionLoading:      (v: boolean) => void;

  resetComplianceFilters:    (projectId?: string) => void;
}
```

---

## 6. CompliancePage Component Plan

### Current page structure (to keep, with data replaced)
```
CompliancePage
├── Left sidebar
│   ├── Aggregate Compliance Score (donut chart)  ← derive from checklists avg
│   └── Compliance Roadmap (upcoming due dates)   ← derive from checklists with dueDate
├── Right main panel
│   └── Current Checklist                          ← selected checklist items
└── Bottom
    └── Safety Inspection History table            ← inspections list
```

### State additions
```ts
const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);
// When changed → fetch getChecklistById → setSelectedChecklist
```

### On mount behaviour
1. `resetComplianceFilters(projectId)` — sets projectId on both filter objects.
2. Fetch checklists: `getChecklists({ projectId, limit: 50 })` — load all for the project (small number expected).
3. Fetch inspections: `getInspections({ projectId, limit: 10 })`.
4. Auto-select first checklist: `setActiveChecklistId(checklists[0]._id)`.

### Aggregate compliance score
```ts
const avgScore = checklists.length
  ? Math.round(checklists.reduce((s, c) => s + c.complianceScore, 0) / checklists.length)
  : 0;
```
Feed `avgScore` into the SVG donut `strokeDashoffset`.

### Compliance Roadmap
```ts
const upcoming = checklists
  .filter(c => c.dueDate)
  .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
  .slice(0, 4);
```

### Checklist selector
Replace the static `<select>` dropdown with real checklist names.
On change → call `getChecklistById(id)` → update `selectedChecklist`.

### Checklist item toggle
Current page toggles status locally. With the API:
1. Toggle item `isCompleted` locally in `selectedChecklist.items` (optimistic).
2. Call `updateChecklist(checklist._id, { items: updatedItems })`.
3. On success → `updateChecklistInStore(id, res.data)` — server returns recalculated scores.
4. On error → revert the optimistic toggle.

### "Save Progress" button
Calls `updateChecklist` with the current full items array.

### "New Inspection" button
Opens a modal. Role-gated to ADMIN and INSPECTOR (`UserRole.ADMIN`, `UserRole.INSPECTOR`).
Form fields: `inspectionDate`, `inspectionType`, `riskLevel`, `findings`, `inspectorNotes`, `issuesIdentified[]`, `actionRequired`, `recommendedActions[]`, `actionDeadline`.
On submit → `createInspection(payload)` → `appendInspection(res.data)`.

### "New Checklist" button (new, not in current UI)
Add alongside "New Inspection". Any authenticated user with `requireDataEntry` role can create.
Form fields: `checklistName`, `category`, `dueDate`.
Items can be added after creation via the edit flow.

### Inspection history table actions
- **View detail**: click row → `getInspectionById(id)` → show a detail modal.
- **Update action status**: inline dropdown per row → `updateInspection(id, { actionStatus })`. Setting `Completed` auto-resolves the inspection.
- **Delete**: ADMIN only → `deleteInspection(id)` → `removeInspection(id)`.

### High-risk banner
```ts
const highRiskCount = inspections.filter(
  i => (i.riskLevel === RiskLevel.HIGH || i.riskLevel === RiskLevel.CRITICAL) && !i.isResolved
).length;
```
Replace the hardcoded "2 High-Risk findings" with `highRiskCount`.

---

## 7. Implementation Order

1. **`apps/frontend/src/types/compliance.ts`** — create types file
2. **`apps/frontend/src/lib/api.ts`** — add `complianceApi`
3. **`apps/frontend/src/store/index.ts`** — add `useComplianceStore`
4. **`apps/frontend/src/pages/CompliancePage.tsx`** — full rewrite

---

## 8. Notes & Gotchas

- **Pagination key consistency** — both compliance endpoints use `pages` (not `totalPages`), same as the document API. Keep `CompliancePagination` consistent with `DocumentPagination`.
- **Items array is a full replace** — `updateChecklist` sends the whole items array. Never send a partial items patch; always send `selectedChecklist.items` with just the changed item toggled.
- **`isResolved` auto-set** — no need to send `isResolved: true` from the frontend. Setting `actionStatus: 'Completed'` in `updateInspection` triggers the pre-save hook on the backend.
- **`inspector` is server-assigned** — `createInspection` takes no `inspector` field; it's set from `req.user.userId`. Show the logged-in user's name in the form as a read-only preview.
- **`complianceScore` is server-computed** — never send it in create/update payloads; the pre-save hook always recalculates it from `items`.
- **`requireDataEntry` guard** — check the middleware definition to confirm which roles this allows (likely `Manager`, `DataEntry`, `Admin`). Use this to gate the "New Checklist" and checklist item toggle buttons.
- **Optimistic item toggle** — for a snappy UX, toggle the item in local state immediately, then confirm with the API response. If the API call fails, revert using the previous checklist snapshot.
- **`getChecklistById` for full item data** — the list endpoint returns all checklist fields including items, but `items[].completedBy` and `items[].attachedDocuments` are only populated on `getById`. Fetch by ID before showing a detail/edit view.
