# Profile Settings — Databinding Plan

**Feature:** Load and update the authenticated user's profile from the Account Settings → Profile tab.  
**Date:** 2026-04-10  
**Status:** Planned

---

## Current State

- `ProfileSettings` is a static component with hardcoded values (`"Admin User"`, `"admin@sustainsite.com"`, `"Sustainability Lead"`)
- No `PATCH /auth/profile` endpoint exists on the backend
- The `User` model has: `fullName`, `email`, `role` — **no `jobTitle` field**
- `GET /auth/me` already returns the user and is called on app boot; result lives in `useAuthStore`

---

## Editable Fields (Profile Tab)

| Field       | Source         | Editable | Notes                                      |
|-------------|----------------|----------|--------------------------------------------|
| Full Name   | `user.fullName`| Yes      | Min 2, max 100 chars                       |
| Email       | `user.email`   | Yes      | Must be unique; lowercase                  |
| Job Title   | N/A            | Yes      | **New field** — needs backend schema add   |
| Role        | `user.role`    | No       | Display only — admin-controlled            |

---

## Architecture

```
ProfileSettings component
  ├── On mount: populate fields from useAuthStore (no extra fetch needed)
  └── handleSubmit()
        └── authApi.updateProfile({ fullName, email, jobTitle })
              └── PATCH /api/auth/profile          ← new Express route
                    └── validateRequest(updateProfileSchema)  ← Joi
                          └── updateProfile controller
                                └── User.findByIdAndUpdate()
                                      └── refreshUser() → update AuthContext + store
```

---

## Implementation Steps

### Step 1 — Backend: Add `jobTitle` to User model
**`apps/backend/src/models/User.ts`**
```ts
jobTitle: {
  type: String,
  trim: true,
  maxlength: [100, 'Job title cannot exceed 100 characters'],
  default: '',
},
```
Also add `jobTitle?: string` to the `IUser` interface.

---

### Step 2 — Backend: Joi validation schema
**`apps/backend/src/validation/auth.validation.ts`** — add `updateProfileSchema`:
```ts
{
  fullName: Joi.string().min(2).max(100).required(),
  email:    Joi.string().email().lowercase().trim().required(),
  jobTitle: Joi.string().max(100).allow('').optional(),
}
```

---

### Step 3 — Backend: `updateProfile` controller
**`apps/backend/src/controllers/auth.controller.ts`**
1. Read `req.user.userId` from the authenticated middleware
2. Check if a different user already has the submitted email (duplicate guard)
3. `User.findByIdAndUpdate(id, { fullName, email, jobTitle }, { new: true, runValidators: true })`
4. Return `{ success: true, data: { userId, fullName, email, role, jobTitle } }`

---

### Step 4 — Backend: Route
**`apps/backend/src/routes/auth.routes.ts`**
```
PATCH /api/auth/profile
  → authenticate
  → validateRequest(updateProfileSchema)
  → updateProfile
```

---

### Step 5 — Frontend: Update `User` type
**`apps/frontend/src/types/auth.ts`**
- Add `jobTitle?: string` to the `User` interface
- Add `jobTitle?: string` to `UserResponse.data`

---

### Step 6 — Frontend: Add `updateProfile` to `authApi`
**`apps/frontend/src/lib/api.ts`**
```ts
updateProfile: async (data: { fullName: string; email: string; jobTitle?: string }): Promise<UserResponse> => {
  const response = await api.patch<UserResponse>('/auth/profile', data);
  return response.data;
}
```

---

### Step 7 — Frontend: Wire `ProfileSettings` component
**`apps/frontend/src/pages/SettingsPage.tsx`**

State:
| State       | Type      | Purpose                                       |
|-------------|-----------|-----------------------------------------------|
| `fields`    | object    | Controlled: `fullName`, `email`, `jobTitle`   |
| `isLoading` | boolean   | Disables button, shows "Saving..."            |
| `error`     | string    | Top-level API error message                   |
| `apiErrors` | string[]  | Validation error list from backend            |
| `success`   | boolean   | Shows success confirmation                    |

On mount:
- Read `user` from `useAuth()` — already in store, no extra fetch
- Initialise `fields` from `user.fullName`, `user.email`, `user.jobTitle ?? ''`

On submit:
1. Call `authApi.updateProfile(fields)`
2. On success: call `refreshUser()` from `useAuth()` to sync the store + AuthContext
3. Show success card; surface `error` + `apiErrors[]` on failure

Role display:
- Read `user.role` from store, format for display (e.g. `PROJECT_MANAGER` → `Project Manager`)
- Render as a read-only badge, not an input

---

## Error Cases

| Scenario                  | Where caught  | User sees                              |
|---------------------------|---------------|----------------------------------------|
| Email already taken       | Backend → 409 | "Email already in use"                 |
| Validation failure        | Backend → 400 | Joi messages in `errors[]` list        |
| Network / server error    | catch block   | "Failed to save changes..."            |
| Success                   | —             | Green success card, store refreshed    |

---

## Out of Scope

- Profile image upload (removed from UI; would require Cloudinary/Multer integration)
- Role change (admin-only operation, separate admin panel concern)
