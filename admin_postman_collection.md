# Admin Management Postman Collection

Base URL: `http://localhost:8080`

## 1. Create Admin (Register)

**Endpoint:** `POST /api/admin/register`

**Description:** Creates a new admin account.

**Body (JSON):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": "64f1a2b3c...",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "admin@example.com",
    "status": "Active",
    "createdData": "2023-10-27T10:00:00"
  }
}
```

---

## 2. Admin Login

**Endpoint:** `POST /api/admin/login`

**Description:** Authenticates an admin and returns a JWT token.

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "admin": {
        "id": "64f1a2b3c...",
        "firstName": "John",
        "lastName": "Doe",
        "fullName": "John Doe",
        "email": "admin@example.com",
        "status": "Active",
        "createdData": "2023-10-27T10:00:00"
    }
  }
}
```

---

## 3. Get All Admins

**Endpoint:** `GET /api/admin`

**Description:** Retrieves a list of all admins.

**Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admins retrieved successfully",
  "data": [
    {
      "id": "64f1a2b3c...",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "email": "admin@example.com",
      "status": "Active",
      "createdData": "2023-10-27T10:00:00"
    }
  ]
}
```

---

## 4. Update Admin

**Endpoint:** `PUT /api/admin/{id}`

**Description:** Updates an admin's profile (First Name, Last Name).
*Replace `{id}` with the actual admin ID.*

**Body (JSON):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
     "id": "64f1a2b3c...",
     "firstName": "Jane",
     "lastName": "Smith",
     "fullName": "Jane Smith",
     "email": "admin@example.com",
     "status": "Active",
     "createdData": "2023-10-27T10:00:00"
  }
}
```

---

## 5. Change Admin Status

**Endpoint:** `PATCH /api/admin/{id}/status?status={newStatus}`

**Description:** Changes the status of an admin (Active/Disable).
*Replace `{id}` with the actual admin ID.*

**Query Params:**
- `status`: `Active` or `Disable`

**Example URL:** `http://localhost:8080/api/admin/64f1a2b3c.../status?status=Disable`

**Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
     "id": "64f1a2b3c...",
     "firstName": "John",
     "lastName": "Doe",
     "fullName": "John Doe",
     "email": "admin@example.com",
     "status": "Disable",
     "createdData": "2023-10-27T10:00:00"
  }
}
```
