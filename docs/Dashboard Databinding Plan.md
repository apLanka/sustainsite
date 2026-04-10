# Dashboard Databinding Plan

## Overview

The dashboard (`/dashboard`) is a **cross-project summary view** — unlike Documents/Compliance which are scoped to a single project, the dashboard aggregates data across **all projects the user can see**. Every widget is currently hardcoded with mock data.

---

## What the Dashboard Shows

| Widget | Component | Current State |
|---|---|---|
| Active Projects count | `StatCards` | Hardcoded `14` |
| Sustainability Score donut | `StatCards` | Hardcoded `92.4%` |
| Pending Document Approvals | `StatCards` | Hardcoded `8` |
| Low Stock Alerts | `StatCards` | Hardcoded material names/quantities |
| Project Progress list | `ProjectOverview` | Hardcoded 3 fake projects |
| Global ESG Score card | `SecondaryColumn` | Static marketing text |
| Recent Activity feed | `SecondaryColumn` | Hardcoded 3 fake events |

---

## API Mapping

### Available backend endpoints

| Data Needed | Endpoint | Notes |
|---|---|---|
| All user projects | `GET /projects?limit=50` | Returns paginated list with `status`, `budget`, `sustainabilityScore` |
| Compliance checklists | `GET /compliance/checklists?projectId=&limit=50` | Per-project; avg complianceScore across all |
| Pending document approvals | `GET /documents?status=Under Review&limit=1` | Use pagination `total` for the count |
| Document count | `GET /documents?limit=1` | Use `total` for count across projects |
| High-risk inspections | `GET /compliance/inspections?riskLevel=High&limit=1` | Use `total` for count |

> **No single "dashboard summary" endpoint exists** — we fetch the pieces we need and derive the rest client-side.

---

## Data Strategy per Widget

### 1. Active Projects count
- Source: `GET /projects?status=Active&limit=1`
- Use `pagination.total` — no need to load all projects
- Also fetch `GET /projects?limit=50` (all statuses) for the progress list

### 2. Sustainability Score
- Source: Average of `project.sustainabilityScore` across all fetched projects
- `sustainabilityScore` is already on the project object from `GET /projects`
- No extra API call needed

### 3. Pending Document Approvals
- Source: `GET /documents?status=Under Review&limit=1`
- Use `pagination.total` as the count

### 4. Low Stock Alerts (skip for now)
- Resource/Material module (Component 4) is not implemented yet
- Replace with **High-Risk Inspection count** from `GET /compliance/inspections?riskLevel=High&limit=1` + `riskLevel=Critical` — more actionable anyway

### 5. Project Progress List
- Source: `GET /projects?limit=6` (top 6 most recent)
- Fields used: `projectName`, `location.address`, `status`, `budget`, `sustainabilityScore`, `startDate`, `endDate`
- Progress % = derived from `sustainabilityScore` (best available proxy without a separate progress field)

### 6. Global ESG / Summary Card
- Source: derived from projects — average `sustainabilityScore`, count of `Active` projects
- Keep the card design, replace static text with real numbers

### 7. Recent Activity Feed
- **No activity/audit-log endpoint exists** on the backend
- Replace with **Upcoming Compliance Due Dates** — pull checklists with `dueDate` across all projects (already have them)
- More actionable than a fake activity log

---

## Zustand Store Changes

Add a `useDashboardStore` slice to `store/index.ts`:

```ts
interface DashboardState {
  projects: Project[];           // top 6 recent projects
  activeCount: number;           // total active projects
  pendingApprovals: number;      // documents Under Review
  highRiskCount: number;         // High + Critical unresolved inspections
  avgSustainability: number;     // average sustainabilityScore across all projects
  upcomingDueDates: ComplianceChecklist[]; // checklists with dueDate, sorted asc
  isDashboardLoading: boolean;
  setDashboard: (data: Partial<DashboardState>) => void;
  setDashboardLoading: (v: boolean) => void;
}
```

---

## New API Methods (add to `lib/api.ts`)

```ts
dashboardApi.getProjects(params)       // reuse projectApi.getProjects
dashboardApi.getPendingApprovals()     // GET /documents?status=Under+Review&limit=1 → pagination.total
dashboardApi.getHighRiskCount()        // GET /compliance/inspections?riskLevel=High&limit=1 → total
dashboardApi.getUpcomingChecklists()   // GET /compliance/checklists?limit=50 → filter + sort client-side
```

> All 4 fetches fire in **parallel** (`Promise.all`) on dashboard mount.

---

## Component Changes

### `DashboardPage.tsx`
- Add `useEffect` on mount to fire all 4 parallel fetches
- Pass loading state to child components
- Fix hardcoded date to `new Date().toLocaleDateString(...)`

### `StatCards.tsx`
- Accept props: `activeCount`, `avgSustainability`, `pendingApprovals`, `highRiskCount`, `isLoading`
- Replace all hardcoded numbers with props
- Show skeleton shimmer while `isLoading`

### `ProjectOverview.tsx`
- Accept props: `projects: Project[]`, `isLoading`
- Map real projects: name, address, sustainabilityScore as progress %
- Remove hardcoded avatar images — show initials avatar instead
- Show skeleton rows while `isLoading`
- Status badge: colour-coded chip per `project.status`

### `SecondaryColumn.tsx`
- **Removed** — ESG card and activity feed both removed per user direction. Component returns null. `ProjectOverview` now takes full width.

---

## Implementation Steps

1. **Types** — add `DashboardSummary` interface to a new `types/dashboard.ts`
2. **API layer** — add `dashboardApi` methods to `lib/api.ts`
3. **Store** — add `useDashboardStore` slice to `store/index.ts`
4. **Components** — rewrite `StatCards`, `ProjectOverview`, `SecondaryColumn`, update `DashboardPage`

---

## What We Won't Bind (deferred)

| Item | Reason |
|---|---|
| Low Stock Alerts | Resources module (Component 4) not implemented |
| Recent Activity log | No audit-log endpoint on backend |
| "Quick Action" buttons | Out of scope for databinding sprint |
| Download ESG Report | No report-generation endpoint |
