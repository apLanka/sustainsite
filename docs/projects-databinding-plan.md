# Projects Databinding Plan

Frontend → Backend wiring for the Projects module (Component 1).

---

## API Endpoint Map

| Method | Endpoint | Auth / Guard | Used By |
|--------|----------|--------------|---------|
| `POST` | `/api/projects` | `requireManager` | `ProjectForm` |
| `GET` | `/api/projects` | `ADMIN \| PM \| INSPECTOR \| VIEWER` | `ProjectsGrid`, `ProjectFilters` |
| `GET` | `/api/projects/:id` | `checkProjectMembership` | `ProjectDetailPage`, `ProjectHeader`, `ProjectStats` |
| `PUT` | `/api/projects/:id` | `checkProjectManager` | (future edit flow) |
| `DELETE` | `/api/projects/:id` | `requireAdmin` | (future delete action) |
| `POST` | `/api/projects/:id/milestones` | `checkProjectManager` | `MilestoneTimeline` (add) |
| `PUT` | `/api/projects/:id/milestones/:milestoneId` | `checkProjectManager` | `MilestoneTimeline` (update) |
| `GET` | `/api/projects/:id/timeline` | `checkProjectMembership` | (future timeline view) |

---

## Backend Response Shapes

### Project object
```ts
{
  _id: string
  projectName: string
  description?: string
  location: { address: string; latitude?: number; longitude?: number }
  startDate: string          // ISO date
  endDate: string            // ISO date
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed'
  budget: number
  actualCost: number
  projectManager: { _id: string; firstName: string; lastName: string; email: string }
  teamMembers: { _id: string; firstName: string; lastName: string; email: string }[]
  sustainabilityScore: number   // 0–100
  currentPhase?: string
  completionPercentage: number  // 0–100
  createdBy: { _id: string; firstName: string; lastName: string; email: string }
  daysRemaining: number         // virtual
  budgetVariance: number        // virtual: budget - actualCost
  milestones?: Milestone[]      // included in GET /projects/:id only
  createdAt: string
  updatedAt: string
}
```

### Milestone object
```ts
{
  _id: string
  projectId: string
  title: string
  description?: string
  targetDate: string         // ISO date
  completionDate?: string    // ISO date, auto-set when status = Completed
  status: 'Pending' | 'In Progress' | 'Completed'
  completionPercentage: number  // auto-set to 100 when Completed
  assignedTo?: string        // User ObjectId (not populated in most responses)
  createdAt: string
  updatedAt: string
}
```

### Paginated list response
```ts
{
  success: true
  pagination: { page: number; limit: number; total: number; totalPages: number }
  data: Project[]
}
```

### Query params for GET /api/projects
| Param | Type | Effect |
|-------|------|--------|
| `status` | `ProjectStatus` | Filter by status |
| `search` | `string` | `$regex` match on `projectName` |
| `manager` | `string` (ObjectId) | Filter by projectManager |
| `page` | `number` | Default 1 |
| `limit` | `number` | Default 10 |

---

## Step-by-Step Implementation

### Step 1 — Types (`src/types/project.ts`)
Create frontend TypeScript types mirroring the backend shapes above:
- `ProjectStatus` enum
- `MilestoneStatus` enum
- `PopulatedUser` interface (for populated manager/team fields)
- `Project` interface
- `Milestone` interface
- `ProjectFilters` interface `{ search: string; status: string; page: number; limit: number }`
- `Pagination` interface

---

### Step 2 — API layer (`src/lib/api.ts`)
Add `projectApi` object with these methods:

```ts
projectApi = {
  getProjects(filters: ProjectFilters)       // GET /projects?status=&search=&page=&limit=
  getProjectById(id: string)                 // GET /projects/:id   (includes milestones[])
  createProject(data: CreateProjectPayload)  // POST /projects
  updateProject(id, data)                    // PUT /projects/:id
  deleteProject(id)                          // DELETE /projects/:id
  addMilestone(projectId, data)              // POST /projects/:id/milestones
  updateMilestone(projectId, milestoneId, data) // PUT /projects/:id/milestones/:milestoneId
  getTimeline(id)                            // GET /projects/:id/timeline
}
```

**Create payload** maps directly to backend required fields:
```ts
{
  projectName: string        // required, 3–200 chars
  description?: string
  location: { address: string }
  startDate: string          // ISO
  endDate: string            // ISO
  budget: number
  status?: ProjectStatus     // defaults to Planning
}
// projectManager & createdBy set server-side from req.user.userId
```

---

### Step 3 — Zustand store slice (`src/store/index.ts`)
Add `useProjectStore`:

```ts
interface ProjectSlice {
  projects: Project[]
  selectedProject: Project | null
  pagination: Pagination | null
  filters: ProjectFilters
  isLoading: boolean
  isDetailLoading: boolean

  setProjects(projects: Project[], pagination: Pagination): void
  setSelectedProject(project: Project | null): void
  setFilters(filters: Partial<ProjectFilters>): void
  setLoading(v: boolean): void
  setDetailLoading(v: boolean): void
}
```

`filters` drives the API call — components mutate filters, a `useEffect` reacts and re-fetches.

---

### Step 4 — `ProjectFilters` component
- Add local state for search (debounced ~400ms) and status select
- On change → call `useProjectStore.setFilters({ search, status, page: 1 })`
- Clears pagination back to page 1 on any filter change

---

### Step 5 — `ProjectsGrid` component
- Read `projects`, `isLoading`, `filters`, `pagination` from store
- `useEffect([filters])` → call `projectApi.getProjects(filters)` → `setProjects(data, pagination)`
- Replace hardcoded `projects` array with store data
- Card `Link` → `/projects/${project._id}` (was hardcoded `/projects/1`)
- Status badge color derived from `project.status` (matches `ProjectStatus` enum values)
- Progress bar uses `project.completionPercentage`
- Manager name: `project.projectManager.firstName + lastName`
- Team avatars: `project.teamMembers` (no avatar URLs from backend — show initials fallback)
- Show skeleton cards while `isLoading`

---

### Step 6 — `ProjectForm` component
Wire with `react-hook-form` + zod schema:

**Fields to bind:**
| Form field | Backend field | Notes |
|---|---|---|
| Project Title | `projectName` | required |
| Description | `description` | optional |
| Total Budget | `budget` | number, > 0 |
| Location / Site Address | `location.address` | required |
| Start Date | `startDate` | date |
| Estimated Completion | `endDate` | date, must be after startDate |
| Status | `status` | defaults to Planning |

**Remove:** Project Manager select — set server-side from `req.user.userId`.

**On submit:**
1. Call `projectApi.createProject(data)`
2. On success → `setSelectedProject(newProject)` → `navigate('/projects/:newId')`
3. On error → show error banner

---

### Step 7 — `ProjectDetailPage` + `ProjectHeader`
- On mount, read `:id` from `useParams`
- Call `projectApi.getProjectById(id)` → `setSelectedProject(project)`
- Pass `selectedProject` down to `ProjectStats` and `MilestoneTimeline` as props
- `ProjectHeader` reads project name from store: replace hardcoded `"Eco-Hub Corporate Center"`
- Header compliance badge: can show `project.sustainabilityScore` until compliance API is wired

---

### Step 8 — `ProjectStats` component
Accept `project: Project` as prop. Replace hardcoded values:

| Stat card | Source field |
|---|---|
| Budget Utilized | `actualCost / budget * 100`, display `$actualCost / $budget` |
| Days Elapsed | derive from `startDate` to today vs total duration |
| Sustainability Score | `project.sustainabilityScore` |
| Incidents Logged | hardcode `0` — no incidents API yet (compliance module) |

---

### Step 9 — `MilestoneTimeline` component
Accept `milestones: Milestone[]` as prop (comes from `selectedProject.milestones`).

Replace hardcoded `milestones` array:
- `milestone.title` → card title
- `milestone.targetDate` → formatted date display
- `milestone.status` → node color / stem progress logic
- `milestone.assignedTo` → no populated name available in list; show "Unassigned" fallback
- Progress stem height: calculate index of first non-Completed milestone

**"Add Milestone" button** in `ProjectDetailPage`:
- Open a modal with fields: `title`, `description`, `targetDate`
- Call `projectApi.addMilestone(projectId, data)` on submit
- Append new milestone to `selectedProject.milestones` in store

---

## Files to Create / Modify

| File | Action |
|---|---|
| `src/types/project.ts` | **Create** — all project/milestone types |
| `src/lib/api.ts` | **Modify** — add `projectApi` |
| `src/store/index.ts` | **Modify** — add `useProjectStore` |
| `src/components/projects/ProjectFilters.tsx` | **Modify** — wire search + status to store |
| `src/components/projects/ProjectsGrid.tsx` | **Modify** — replace mock data, fetch from store |
| `src/components/projects/ProjectForm.tsx` | **Modify** — react-hook-form + API call |
| `src/components/project/ProjectHeader.tsx` | **Modify** — read project name from store |
| `src/components/projects/ProjectStats.tsx` | **Modify** — accept project prop |
| `src/components/projects/MilestoneTimeline.tsx` | **Modify** — accept milestones prop |
| `src/pages/ProjectDetailPage.tsx` | **Modify** — fetch on mount, pass data to children |

---

## Deferred (Out of Scope for This Phase)

- `PUT /api/projects/:id` — edit project form
- `DELETE /api/projects/:id` — delete with confirmation
- `GET /api/projects/:id/timeline` — dedicated timeline view
- Team member avatars (no avatar field in User model)
- Incidents Logged stat (compliance module)
