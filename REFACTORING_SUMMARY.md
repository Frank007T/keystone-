# KEYSTONE Field Service Management - Enterprise User Provisioning Refactoring

## Overview
This document outlines all changes made to transform the KEYSTONE system from an approval-based user registration workflow to an enterprise user provisioning workflow where only customers self-register and all employee accounts are created by administrators.

---

## BACKEND CHANGES

### 1. Database Schema Updates

#### UserEntity.java
**Changes:**
- **Removed fields:**
  - `approvalToken` (String)
  - `approvalTokenExpiresAt` (Instant)
- **Added fields:**
  - `zoneId` (Long) - References the zone the user belongs to
  - `managerId` (Long) - Foreign key to parent Manager
  - `dispatcherId` (Long) - Foreign key to parent Dispatcher
  - `updatedAt` (Instant) - Track last update time
- **Lifecycle Methods:**
  - Added `@PreUpdate` method to update `updatedAt` timestamp

**File:** `backend/src/main/java/com/keystone/backend/entity/UserEntity.java`

---

### 2. Database Migrations (Flyway)

**Files Created:**

#### V1__Initial_Schema.sql
Creates the complete `users` table schema with:
- All user columns (id, fullName, email, password, etc.)
- Zone management fields (zoneId, managerId, dispatcherId)
- OTP fields for email verification (otpCode, otpExpiresAt)
- Password recovery fields (recoveryToken, recoveryTokenExpiresAt)
- Indexes on frequently queried columns (email, role, enabled, zone_id, manager_id, dispatcher_id)
- Foreign key constraints for manager and dispatcher relationships

**File:** `backend/src/main/resources/db/migration/V1__Initial_Schema.sql`

#### V2__Seed_Super_Admin.sql
Seeds the initial Super Admin account:
- Email: `admin@keystone.com`
- Role: `SUPER_ADMIN`
- Enabled: true
- OTP Verified: true
- **Note:** Password is hashed with BCrypt. Current hash is for "password". UPDATE THIS with a secure password hash before deployment.

**File:** `backend/src/main/resources/db/migration/V2__Seed_Super_Admin.sql`

---

### 3. Configuration Changes

#### pom.xml
**Added Dependencies:**
```xml
<!-- Flyway -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

**File:** `backend/pom.xml`

#### application.yml
**Changes:**
- Changed `jpa.hibernate.ddl-auto` from `update` to `validate` (Flyway now manages schema)
- Changed `show-sql` from true to false
- Added Flyway configuration:
  ```yaml
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
  ```

**File:** `backend/src/main/resources/application.yml`

---

### 4. AuthController Refactoring

**Changes:**
- **Removed:** All signup logic for MANAGER, DISPATCHER, TECHNICIAN roles
- **Updated:** Signup now ONLY accepts CUSTOMER role
  - Enforces: `role.toUpperCase().equals("CUSTOMER")`
  - Returns error for non-customer signups
- **Kept:** 
  - Customer signup with OTP generation
  - OTP verification flow
  - Login endpoint (now uses JWT with role from database)
  - Forgot password and reset password endpoints
- **Removed imports:** `java.util.UUID` (no longer needed for approval tokens)
- **Simplified SignupRequest record:** Removed `managerEmail` field (optional parameter)

**File:** `backend/src/main/java/com/keystone/backend/controller/AuthController.java`

---

### 5. New UserManagementService

**Purpose:** Handles creation and management of employee accounts (Manager, Dispatcher, Technician)

**Key Methods:**
- `createManager(fullName, email, phone, zoneId)` - Super Admin only
- `createDispatcher(fullName, email, phone, managerId, zoneId)` - Manager only
- `createTechnician(fullName, email, phone, managerId, dispatcherId, zoneId)` - Manager only
- `resetPassword(userId)` - Reset any employee password
- `disableUser(userId)` - Soft delete (disable)
- `enableUser(userId)` - Re-enable account
- `deleteUser(userId)` - Permanent deletion
- `generateTemporaryPassword()` - Generates secure 12-character temporary password

**Features:**
- Generates secure temporary passwords (12 chars, mixed case + numbers + symbols)
- Sends email with account creation details
- All employee accounts created as ENABLED and OTP_VERIFIED
- Validates relationships (manager exists, dispatcher exists, belongs to correct manager)

**File:** `backend/src/main/java/com/keystone/backend/service/UserManagementService.java`

---

### 6. New UserManagementController

**Purpose:** Provides REST endpoints for admin panels

**Endpoints Structure:**

#### Manager Management (SUPER_ADMIN only)
```
POST   /api/admin/managers              - Create manager
GET    /api/admin/managers              - List all managers
PUT    /api/admin/managers/{id}         - Edit manager details
DELETE /api/admin/managers/{id}         - Delete manager
POST   /api/admin/managers/{id}/reset-password - Reset password
```

#### Dispatcher Management (MANAGER only)
```
POST   /api/admin/dispatchers           - Create dispatcher
GET    /api/admin/dispatchers           - List manager's dispatchers
PUT    /api/admin/dispatchers/{id}      - Edit dispatcher details
DELETE /api/admin/dispatchers/{id}      - Delete dispatcher
POST   /api/admin/dispatchers/{id}/reset-password - Reset password
```

#### Technician Management (MANAGER only)
```
POST   /api/admin/technicians           - Create technician
GET    /api/admin/technicians           - List manager's technicians
PUT    /api/admin/technicians/{id}      - Edit technician details
DELETE /api/admin/technicians/{id}      - Delete technician
POST   /api/admin/technicians/{id}/reset-password - Reset password
```

**Security Features:**
- Role-based access control (requireSuperAdmin(), requireManager())
- Managers can only see/manage their own zone's employees
- Technicians can only be created for dispatchers in manager's zone
- All endpoints validate relationships and permissions

**File:** `backend/src/main/java/com/keystone/backend/controller/UserManagementController.java`

---

### 7. UserRepository Updates

**Changes:**
- **Removed:** 
  - `findByApprovalToken(String approvalToken)`
  - `findByEnabledFalse()`
  - `findByRoleAndEnabledFalse(Role role)`
- **Added:**
  - `findByRole(Role role)` - Get all users with specific role
  - `findByRoleAndManagerId(Role role, Long managerId)` - Get role-specific employees for a manager
  - `findByZoneId(Long zoneId)` - Get all users in a zone

**File:** `backend/src/main/java/com/keystone/backend/repository/UserRepository.java`

---

### 8. AdminController (Old Approval-Based)

**Status:** DEPRECATED - No longer used

**Recommendation:** Delete `backend/src/main/java/com/keystone/backend/controller/AdminController.java`

This controller contained the approval workflow:
- Technician approvals
- Dispatcher approvals  
- Manager approvals
- Approve/reject endpoints

All functionality replaced by UserManagementController.

---

## FRONTEND CHANGES

### 1. API Client (api.ts)

**Interface Changes:**
- **Removed:** `PendingAccount` interface (no more pending approvals)
- **Updated:** `SignupPayload` - role is now hardcoded as `'customer'`
- **Updated:** `LoginPayload` - removed optional role field
- **Added:** `Manager`, `Dispatcher`, `Technician` interfaces for user management DTOs

**Removed Functions (Approval Workflow):**
```typescript
fetchPendingApprovals()
fetchTechnicianPendingApprovals()
fetchDispatcherPendingApprovals()
fetchManagerPendingApprovals()
approveAccount(email)
rejectAccount(email)
```

**Added Functions (User Management):**

Manager Management:
```typescript
createManager(fullName, email, phone, zoneId)
listManagers()
editManager(id, fullName, phone, zoneId?)
deleteManager(id)
resetManagerPassword(id)
```

Dispatcher Management:
```typescript
createDispatcher(fullName, email, phone, zoneId)
listDispatchers()
editDispatcher(id, fullName, phone, zoneId?)
deleteDispatcher(id)
resetDispatcherPassword(id)
```

Technician Management:
```typescript
createTechnician(fullName, email, phone, dispatcherId, zoneId)
listTechnicians()
editTechnician(id, fullName, phone, dispatcherId?, zoneId?)
deleteTechnician(id)
resetTechnicianPassword(id)
```

**File:** `frontend/src/lib/api.ts`

---

### 2. LoginPage.tsx

**Changes:**
- **Removed:** Role selector radio buttons group (loginRoles array)
- **Removed:** Manual role selection from form
- **Updated:** Login process to use only email + password
- **Enhanced:** Role-based redirect logic
  - Added redirect for SUPER_ADMIN → `/portal/admin`
  - Manager → `/portal/manager`
  - Technician → `/portal/technician`
  - Dispatcher → `/portal/dispatcher`
  - Customer → `/portal/customer`
- **Added:** Store user role in localStorage (`userRole`)
- **Simplified:** Form now only has email and password fields

**Login Flow:**
1. User enters email + password
2. Backend authenticates and determines role from JWT
3. Frontend stores token and role
4. Frontend automatically redirects to role-specific dashboard

**File:** `frontend/src/pages/LoginPage.tsx`

---

### 3. SignUpPage.tsx

**Changes:**
- **Removed:** Role selector (roles array and selection logic)
- **Removed:** Manager email field
- **Updated:** Schema validation - role is now hardcoded as 'customer'
- **Simplified:** Form fields:
  - Full Name
  - Company Name
  - Email
  - Phone
  - Password
  - Confirm Password
  - Accept Terms checkbox
- **Updated:** Success flow - redirects to OTP verification page with email in state

**Signup Flow:**
1. Customer fills form (name, company, email, phone, password)
2. Backend validates and sends OTP email
3. Frontend redirects to OTP verification
4. Customer verifies OTP
5. Account becomes ACTIVE
6. Customer can login

**File:** `frontend/src/pages/SignUpPage.tsx`

---

### 4. Pages to Delete/Update

**Pages to Delete** (Approval workflow - no longer needed):
```
frontend/src/pages/ApprovalRejectedPage.tsx
frontend/src/pages/ApprovalSuccessPage.tsx
frontend/src/pages/TechnicianApprovalPage.tsx
frontend/src/pages/DispatcherApprovalPage.tsx
frontend/src/pages/ManagerApprovalPage.tsx
frontend/src/pages/SuperAdminManagerApprovalPage.tsx
```

**Pages that Need Updates** (Not implemented in this refactoring):
```
frontend/src/pages/AdminDashboardPage.tsx
  → Add manager management UI (create, edit, delete, reset password)

frontend/src/pages/ManagerDashboardPage.tsx
  → Add dispatcher/technician management UI
```

---

## MIGRATION CHECKLIST

### Pre-Deployment Steps

1. **Backup Database**
   ```bash
   pg_dump keystone_db > keystone_db_backup.sql
   ```

2. **Review and Update Super Admin Password**
   - Edit `V2__Seed_Super_Admin.sql`
   - Replace the BCrypt hash with your own secure password hash
   - Generate hash: Use BCryptPasswordEncoder or online tool
   - Example: BCryptPasswordEncoder().encode("YourSecurePassword@123")

3. **Update Email Configuration**
   - Ensure `application.yml` has correct SMTP settings
   - Test email sending works

4. **Delete Old Approval Pages**
   - Remove 6 approval-related page files listed above
   - Update any route configurations that reference them

5. **Run Backend Tests**
   ```bash
   cd backend
   mvn clean test
   ```

6. **Build Backend**
   ```bash
   cd backend
   mvn clean package
   ```

7. **Run Flyway Migrations**
   ```bash
   # Migrations run automatically on Spring Boot startup
   # Check logs for migration status
   ```

8. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

---

## USER FLOWS SUMMARY

### Customer Registration
```
Customer → Signup Page → Enter Details → Submit
  ↓
Backend validates & sends OTP → Customer verifies OTP → Account ACTIVE
  ↓
Customer logs in → JWT issued → Redirected to Customer Dashboard
```

### Manager Creation
```
Super Admin logs in → Manager Portal → User Management
  ↓
Create Manager → Enter details (name, email, phone, zone)
  ↓
Backend generates temp password → Sends email with credentials
  ↓
Manager logs in → Must manage dispatchers/technicians
```

### Dispatcher Creation
```
Manager logs in → Dispatcher Management
  ↓
Create Dispatcher → Enter details (name, email, phone, zone)
  ↓
Backend generates temp password → Sends email with credentials
  ↓
Dispatcher logs in → Can manage work orders
```

### Technician Creation
```
Manager logs in → Technician Management
  ↓
Create Technician → Assign dispatcher + zone
  ↓
Backend generates temp password → Sends email with credentials
  ↓
Technician logs in → Assigned to dispatcher + zone
```

### Password Reset
```
Employee logs in → Account settings or Admin resets
  ↓
If Admin: Admin clicks "Reset Password" → New temp password generated
  ↓
Email sent with new temporary password
  ↓
Employee logs in with new password → Recommended to change
```

---

## SECURITY CONSIDERATIONS

1. **Temporary Passwords**
   - Generated using SecureRandom with 72 possible characters
   - 12 characters long
   - Includes: A-Z, a-z, 0-9, !@#$%^&*
   - Example: `K9@x4mL#Pz2w`

2. **Role-Based Access Control**
   - All admin endpoints verify user role via JWT
   - Managers can only manage their zone's employees
   - Cross-zone access prevented

3. **Email Security**
   - All credentials sent via email (use HTTPS in production)
   - Consider email encryption for sensitive data
   - Implement email verification for admin actions

4. **Password Policy**
   - Customers: Set their own password (8 chars minimum)
   - Employees: Get temporary password, must change on first login (implement required password change)

5. **Database Constraints**
   - Foreign keys ensure referential integrity
   - Manager and dispatcher IDs validate relationships

---

## NEXT STEPS (OPTIONAL ENHANCEMENTS)

1. **Implement Forced Password Change**
   - Add `passwordChangedAt` field to UserEntity
   - Redirect to change password page if not set

2. **Add Audit Logging**
   - Track who created/modified user accounts
   - Log all admin actions

3. **Implement API Rate Limiting**
   - Prevent brute force attacks on login/password reset

4. **Add Two-Factor Authentication (2FA)**
   - Email or SMS based OTP for sensitive operations

5. **Zone Management Module**
   - Create Zone entity for geo-based organization
   - Add zone creation/management endpoints

6. **Department/Team Structure**
   - Add department assignment
   - Implement approval chains

7. **Bulk User Import**
   - CSV import for initial employee setup

---

## SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue:** Flyway migration fails
- Check PostgreSQL is running
- Verify database credentials in `application.yml`
- Ensure database exists: `createdb keystone_db`

**Issue:** Emails not sending
- Verify SMTP settings in `application.yml`
- Check Gmail app password (not regular password)
- Verify firewall allows SMTP port 587

**Issue:** Employees can't log in
- Verify account is enabled (enabled = true)
- Check temporary password is correct
- Verify JWT secret matches

---

## FILES MODIFIED SUMMARY

### Backend
- `backend/pom.xml` - Added Flyway dependencies
- `backend/src/main/java/com/keystone/backend/entity/UserEntity.java` - Updated schema
- `backend/src/main/java/com/keystone/backend/controller/AuthController.java` - Removed employee signup
- `backend/src/main/java/com/keystone/backend/repository/UserRepository.java` - Updated queries
- `backend/src/main/resources/application.yml` - Enabled Flyway
- `backend/src/main/resources/db/migration/V1__Initial_Schema.sql` - NEW
- `backend/src/main/resources/db/migration/V2__Seed_Super_Admin.sql` - NEW
- `backend/src/main/java/com/keystone/backend/service/UserManagementService.java` - NEW
- `backend/src/main/java/com/keystone/backend/controller/UserManagementController.java` - NEW

### Frontend
- `frontend/src/lib/api.ts` - Updated endpoints
- `frontend/src/pages/LoginPage.tsx` - Removed role selector
- `frontend/src/pages/SignUpPage.tsx` - Customer-only signup

### To Delete
- `backend/src/main/java/com/keystone/backend/controller/AdminController.java` - Deprecated
- `frontend/src/pages/ApprovalRejectedPage.tsx` - Deprecated
- `frontend/src/pages/ApprovalSuccessPage.tsx` - Deprecated
- `frontend/src/pages/TechnicianApprovalPage.tsx` - Deprecated
- `frontend/src/pages/DispatcherApprovalPage.tsx` - Deprecated
- `frontend/src/pages/ManagerApprovalPage.tsx` - Deprecated
- `frontend/src/pages/SuperAdminManagerApprovalPage.tsx` - Deprecated

---

## DEPLOYMENT NOTES

1. **Database**: New Flyway migrations handle schema creation
2. **JWT**: No changes needed - role is now read from database
3. **Email**: Ensure SMTP credentials are set in environment
4. **Frontend**: Update API base URL if different from backend
5. **CORS**: Ensure frontend domain is whitelisted in SecurityConfig
6. **Secrets**: Store JWT secret and email credentials in environment variables for production

---

**Refactoring Completed:** [Your Date]
**Version:** 1.0 - Enterprise User Provisioning
