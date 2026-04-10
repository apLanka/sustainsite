# Change Password — Databinding Plan

**Feature:** Allow authenticated users to change their password from the Account Settings → Security tab.  
**Date:** 2026-04-10  
**Status:** Implemented

---

## Stack Context

- Auth: Custom JWT (bcrypt password hashing, `authenticate` middleware)
- No Clerk — Clerk would require replacing the entire auth layer (AuthContext, tokenManager, backend middleware, User model). Out of scope for this project.
- Validation: Joi (backend), client-side pre-check for confirm password match

---

## Architecture

```
SettingsPage (SecuritySettings component)
  └── handleSubmit()
        └── authApi.changePassword()               ← lib/api.ts
              └── PATCH /api/auth/change-password   ← Express route
                    └── validateRequest(changePasswordSchema)  ← Joi
                          └── changePassword controller
                                └── user.comparePassword()    ← bcrypt
                                      └── user.save()         ← bcrypt pre-save hook re-hashes
```

---

## Backend Changes

### 1. `apps/backend/src/validation/auth.validation.ts`
Added `changePasswordSchema`:
- `currentPassword` — required string
- `newPassword` — min 8 chars, must contain uppercase + lowercase + digit
- `confirmPassword` — must equal `newPassword` (Joi `ref`)

### 2. `apps/backend/src/controllers/auth.controller.ts`
Added `changePassword` handler:
1. Guard: check `req.user` exists (set by `authenticate` middleware)
2. Fetch user with `.select('+password')` (password field is excluded by default)
3. `user.comparePassword(currentPassword)` — returns `false` → 401
4. Set `user.password = newPassword` and `user.save()` — the User model's pre-save hook re-hashes automatically
5. Return `{ success: true, data: { message: 'Password changed successfully' } }`

### 3. `apps/backend/src/routes/auth.routes.ts`
```
PATCH /api/auth/change-password
  → authenticate (JWT guard)
  → validateRequest(changePasswordSchema) (Joi)
  → changePassword (controller)
```

---

## Frontend Changes

### 4. `apps/frontend/src/lib/api.ts`
Added to `authApi`:
```ts
changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
  await api.patch('/auth/change-password', data);
}
```
The axios interceptor automatically attaches the JWT Bearer token from `tokenManager`.

### 5. `apps/frontend/src/pages/SettingsPage.tsx` — `SecuritySettings` component
Converted from static JSX to a controlled form:

| State         | Type      | Purpose                                  |
|---------------|-----------|------------------------------------------|
| `fields`      | object    | Controlled values for all 3 inputs       |
| `isLoading`   | boolean   | Disables button + shows "Saving..."      |
| `error`       | string    | Inline error message below inputs        |
| `success`     | boolean   | Shows success confirmation               |

**Submit flow:**
1. Client-side: check `newPassword === confirmPassword` → set `error` if mismatch, abort
2. Call `authApi.changePassword({ currentPassword, newPassword })`
3. On success: set `success = true`, clear all fields
4. On error: extract message from axios error response, display inline

---

## Error Cases Handled

| Scenario                        | Where caught       | User sees                            |
|---------------------------------|--------------------|--------------------------------------|
| Passwords don't match           | Client (pre-fetch) | "Passwords do not match"             |
| Wrong current password          | Backend → 401      | "Current password is incorrect"      |
| Validation failure (weak pw)    | Backend → 400      | Joi message via axios error          |
| Network / server error          | catch block        | "Failed to change password..."       |

---

## Security Notes

- `currentPassword` is verified before any update — prevents unauthorised resets if session is hijacked
- Password field is excluded from all User queries by default (`select: false` on schema); fetched explicitly only here and in `login`
- The User model's pre-save hook re-hashes on every save where `password` is modified — no manual bcrypt call needed in the controller
- JWT is not rotated on password change (acceptable for academic scope; production would invalidate old tokens)
