# API Testing Guide - Enterprise User Provisioning

## Postman Collection Format

### 1. Login as Super Admin
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@keystone.com",
  "password": "password"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@keystone.com",
  "role": "SUPER_ADMIN"
}
```

### 2. Create Manager
```
POST /api/admin/managers
Content-Type: application/json
Authorization: Bearer {ADMIN_TOKEN}

{
  "fullName": "Alice Manager",
  "email": "alice@company.com",
  "phone": "555-0001",
  "zoneId": 1
}

Response (201):
{
  "id": 2,
  "fullName": "Alice Manager",
  "email": "alice@company.com",
  "phone": "555-0001",
  "zoneId": 1,
  "enabled": true,
  "createdAt": "2024-01-15T10:30:00Z"
}

Side Effect: Email sent to alice@company.com with temporary password
```

### 3. List Managers
```
GET /api/admin/managers
Authorization: Bearer {ADMIN_TOKEN}

Response (200):
[
  {
    "id": 2,
    "fullName": "Alice Manager",
    "email": "alice@company.com",
    "phone": "555-0001",
    "zoneId": 1,
    "enabled": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### 4. Edit Manager
```
PUT /api/admin/managers/2
Content-Type: application/json
Authorization: Bearer {ADMIN_TOKEN}

{
  "fullName": "Alice Manager Updated",
  "phone": "555-0002",
  "zoneId": 2
}

Response (200):
{
  "id": 2,
  "fullName": "Alice Manager Updated",
  "email": "alice@company.com",
  "phone": "555-0002",
  "zoneId": 2,
  "enabled": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 5. Reset Manager Password
```
POST /api/admin/managers/2/reset-password
Authorization: Bearer {ADMIN_TOKEN}

Response (200):
"Password reset. New temporary password sent to email."

Side Effect: Email sent to alice@company.com with new temporary password
```

### 6. Delete Manager
```
DELETE /api/admin/managers/2
Authorization: Bearer {ADMIN_TOKEN}

Response (204):
No content
```

---

## Manager Operations (Once Manager Logs In)

### 1. Manager Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "alice@company.com",
  "password": "K9@x4mL#Pz2w"  // Temporary password from email
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "alice@company.com",
  "role": "MANAGER"
}
```

### 2. Create Dispatcher
```
POST /api/admin/dispatchers
Content-Type: application/json
Authorization: Bearer {MANAGER_TOKEN}

{
  "fullName": "Bob Dispatcher",
  "email": "bob@company.com",
  "phone": "555-0010",
  "zoneId": 1
}

Response (201):
{
  "id": 3,
  "fullName": "Bob Dispatcher",
  "email": "bob@company.com",
  "phone": "555-0010",
  "managerId": 2,
  "zoneId": 1,
  "enabled": true,
  "createdAt": "2024-01-15T10:35:00Z"
}

Side Effect: Email sent to bob@company.com with temporary password
```

### 3. List Dispatchers (Manager sees only their dispatchers)
```
GET /api/admin/dispatchers
Authorization: Bearer {MANAGER_TOKEN}

Response (200):
[
  {
    "id": 3,
    "fullName": "Bob Dispatcher",
    "email": "bob@company.com",
    "phone": "555-0010",
    "managerId": 2,
    "zoneId": 1,
    "enabled": true,
    "createdAt": "2024-01-15T10:35:00Z"
  }
]
```

### 4. Edit Dispatcher
```
PUT /api/admin/dispatchers/3
Content-Type: application/json
Authorization: Bearer {MANAGER_TOKEN}

{
  "fullName": "Bob Dispatcher Updated",
  "phone": "555-0011",
  "zoneId": 1
}

Response (200):
{
  "id": 3,
  "fullName": "Bob Dispatcher Updated",
  "email": "bob@company.com",
  "phone": "555-0011",
  "managerId": 2,
  "zoneId": 1,
  "enabled": true,
  "createdAt": "2024-01-15T10:35:00Z"
}
```

### 5. Reset Dispatcher Password
```
POST /api/admin/dispatchers/3/reset-password
Authorization: Bearer {MANAGER_TOKEN}

Response (200):
"Password reset. New temporary password sent to email."
```

### 6. Delete Dispatcher
```
DELETE /api/admin/dispatchers/3
Authorization: Bearer {MANAGER_TOKEN}

Response (204):
No content
```

---

## Technician Management (Manager)

### 1. Create Technician
```
POST /api/admin/technicians
Content-Type: application/json
Authorization: Bearer {MANAGER_TOKEN}

{
  "fullName": "Charlie Technician",
  "email": "charlie@company.com",
  "phone": "555-0020",
  "dispatcherId": 3,
  "zoneId": 1
}

Response (201):
{
  "id": 4,
  "fullName": "Charlie Technician",
  "email": "charlie@company.com",
  "phone": "555-0020",
  "managerId": 2,
  "dispatcherId": 3,
  "zoneId": 1,
  "enabled": true,
  "createdAt": "2024-01-15T10:40:00Z"
}

Side Effect: Email sent to charlie@company.com with temporary password
```

### 2. List Technicians
```
GET /api/admin/technicians
Authorization: Bearer {MANAGER_TOKEN}

Response (200):
[
  {
    "id": 4,
    "fullName": "Charlie Technician",
    "email": "charlie@company.com",
    "phone": "555-0020",
    "managerId": 2,
    "dispatcherId": 3,
    "zoneId": 1,
    "enabled": true,
    "createdAt": "2024-01-15T10:40:00Z"
  }
]
```

### 3. Edit Technician
```
PUT /api/admin/technicians/4
Content-Type: application/json
Authorization: Bearer {MANAGER_TOKEN}

{
  "fullName": "Charlie Technician Updated",
  "phone": "555-0021",
  "dispatcherId": 3,
  "zoneId": 1
}

Response (200):
{
  "id": 4,
  "fullName": "Charlie Technician Updated",
  "email": "charlie@company.com",
  "phone": "555-0021",
  "managerId": 2,
  "dispatcherId": 3,
  "zoneId": 1,
  "enabled": true,
  "createdAt": "2024-01-15T10:40:00Z"
}
```

### 4. Reset Technician Password
```
POST /api/admin/technicians/4/reset-password
Authorization: Bearer {MANAGER_TOKEN}

Response (200):
"Password reset. New temporary password sent to email."
```

### 5. Delete Technician
```
DELETE /api/admin/technicians/4
Authorization: Bearer {MANAGER_TOKEN}

Response (204):
No content
```

---

## Customer Signup Flow (Public)

### 1. Customer Signup
```
POST /api/auth/signup
Content-Type: application/json

{
  "fullName": "Dana Customer",
  "companyName": "ABC Corp",
  "email": "dana@abc.com",
  "phone": "555-0030",
  "password": "SecurePassword@123",
  "role": "customer"
}

Response (200):
"Customer signup successful. Please verify your email to complete registration."

Side Effect: 
- Email sent to dana@abc.com with OTP code
- Account created but DISABLED (enabled: false)
```

### 2. Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "dana@abc.com",
  "otp": "123456"  // From email
}

Response (200):
"OTP verified successfully."

Side Effect:
- Account becomes ENABLED
- Can now login
```

### 3. Customer Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "dana@abc.com",
  "password": "SecurePassword@123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "dana@abc.com",
  "role": "CUSTOMER"
}
```

---

## Error Cases

### Invalid Email (Already Exists)
```
POST /api/auth/signup

Response (400):
"Email already exists."
```

### Non-Customer Signup
```
POST /api/auth/signup

{
  ...
  "role": "dispatcher"
}

Response (400):
"Only customers can register. Employee accounts are created by administrators."
```

### Unauthorized Access
```
GET /api/admin/managers
Authorization: Bearer {CUSTOMER_TOKEN}

Response (403):
"Only Super Admin can perform this action."
```

### Invalid OTP
```
POST /api/auth/verify-otp

{
  "email": "dana@abc.com",
  "otp": "000000"
}

Response (400):
"Invalid email or OTP."
```

### User Not Found
```
GET /api/admin/managers/999

Response (404):
"Manager not found."
```

---

## Complete Workflow Example

### Scenario: Onboard New Team
**Timeline:** ~5 minutes

#### Step 1: Create Zone (Manual in database for now)
```
INSERT INTO zones (name, location) VALUES ('Zone A', 'Downtown');
```

#### Step 2: Super Admin Creates Manager (1 min)
```bash
curl -X POST http://localhost:8080/api/admin/managers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alice Manager",
    "email": "alice@company.com",
    "phone": "555-0001",
    "zoneId": 1
  }'
```
✅ Manager receives email with password

#### Step 3: Manager Logs In (2 min)
- Check email for temporary password
- Login to system
- (Optional: Change password)

#### Step 4: Manager Creates Dispatcher (1 min)
```bash
curl -X POST http://localhost:8080/api/admin/dispatchers \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Bob Dispatcher",
    "email": "bob@company.com",
    "phone": "555-0010",
    "zoneId": 1
  }'
```
✅ Dispatcher receives email with password

#### Step 5: Manager Creates Technicians (1 min each)
```bash
curl -X POST http://localhost:8080/api/admin/technicians \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Charlie Technician",
    "email": "charlie@company.com",
    "phone": "555-0020",
    "dispatcherId": 3,
    "zoneId": 1
  }'
```
✅ Technician receives email with password

#### Result: Team Ready to Work
- Alice (Manager) - Zone 1
- Bob (Dispatcher) - Reports to Alice - Zone 1
- Charlie (Technician) - Reports to Bob - Zone 1
- All can login with temporary passwords
- Can immediately access their dashboards
- Ready for operations

---

## Load Testing Example

### Create 100 Technicians
```bash
#!/bin/bash

MANAGER_TOKEN="your_manager_token"
DISPATCHER_ID=3

for i in {1..100}; do
  curl -X POST http://localhost:8080/api/admin/technicians \
    -H "Authorization: Bearer $MANAGER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"fullName\": \"Technician $i\",
      \"email\": \"tech$i@company.com\",
      \"phone\": \"555-$i\",
      \"dispatcherId\": $DISPATCHER_ID,
      \"zoneId\": 1
    }"
  
  sleep 1  # Don't hammer the server
done
```

---

## cURL Examples for Terminal

### Create Manager
```bash
ADMIN_TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@keystone.com","password":"password"}' \
  -s | jq -r '.token')

curl -X POST http://localhost:8080/api/admin/managers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Manager",
    "email": "test-mgr@company.com",
    "phone": "555-9999",
    "zoneId": 1
  }' | jq
```

### Quick Test All Endpoints
```bash
# Set your tokens
ADMIN_TOKEN="your_admin_token"
MANAGER_TOKEN="your_manager_token"

# Create
curl -X POST http://localhost:8080/api/admin/managers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@company.com","phone":"555-9999","zoneId":1}' | jq

# List
curl -X GET http://localhost:8080/api/admin/managers \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Edit (replace ID)
curl -X PUT http://localhost:8080/api/admin/managers/2 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Updated","phone":"555-8888","zoneId":1}' | jq

# Reset Password
curl -X POST http://localhost:8080/api/admin/managers/2/reset-password \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Delete (replace ID)
curl -X DELETE http://localhost:8080/api/admin/managers/2 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

**All endpoints tested and ready for production! 🚀**
