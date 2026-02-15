# Service Management API Documentation

## Overview
The Service Management module allows users to create, manage, and search for migration-related services. Services can be offered by providers and booked by migrants.

**Base URL:** `/api/services`

---

## Authentication
Most endpoints require JWT authentication. Include the token in the header:
```
Authorization: Bearer <your_jwt_token>
```

| Endpoint | Auth Required |
|----------|--------------|
| POST `/api/services` | ✅ Yes |
| GET `/api/services` | ❌ No |
| GET `/api/services/{id}` | ❌ No |
| GET `/api/services/provider/{providerId}` | ❌ No |
| GET `/api/services/my-services` | ✅ Yes |
| GET `/api/services/category/{category}` | ❌ No |
| GET `/api/services/search` | ❌ No |
| PUT `/api/services/{id}` | ✅ Yes (Owner only) |
| DELETE `/api/services/{id}` | ✅ Yes (Owner only) |
| DELETE `/api/services/admin/{id}` | ✅ Yes (Admin only) |
| PATCH `/api/services/{id}/toggle` | ✅ Yes (Owner only) |

---

## API Response Format

All endpoints return a standard response format:

```json
{
  "success": true,
  "message": "Operation message",
  "data": { ... }
}
```

---

## Endpoints

### 1. Create Service
**POST** `/api/services`

Creates a new service listing with optional image uploads.

**Request Body:**
```json
{
  "title": "Airport Pickup Service",
  "description": "Professional airport pickup and drop-off service for new migrants",
  "category": "TRANSPORT",
  "origin": "Sri Lanka",
  "destination": "Sydney, Australia",
  "specificLocation": "Sydney CBD",
  "price": 85.00,
  "currency": "AUD",
  "pricingType": "FIXED",
  "features": ["Air-conditioned vehicle", "Luggage assistance", "Meet & Greet"],
  "maxCapacity": 4,
  "duration": 60,
  "durationType": "MINUTES",
  "availableDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  "availableTimeSlot": "6AM-10PM",
  "imagesBase64": ["data:image/png;base64,iVBORw0KGgo...", "data:image/jpeg;base64,/9j/4AAQ..."],
  "imageUrls": ["https://example.com/existing-image.jpg"]
}
```

**Image Upload Options:**
| Field | Type | Description |
|-------|------|-------------|
| `imagesBase64` | List\<String\> | Base64 encoded images (auto-uploaded to Cloudinary) |
| `imageUrls` | List\<String\> | Direct image URLs (optional) |

> **Note:** Base64 images are automatically uploaded to Cloudinary and the returned URLs are stored.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "id": "65abc123def456",
    "title": "Airport Pickup Service",
    "description": "Professional airport pickup and drop-off service for new migrants",
    "category": "TRANSPORT",
    "providerId": "user123",
    "providerName": "John Doe",
    "providerProfilePicture": "https://example.com/avatar.jpg",
    "origin": "Sri Lanka",
    "destination": "Sydney, Australia",
    "specificLocation": "Sydney CBD",
    "price": 85.00,
    "currency": "AUD",
    "pricingType": "FIXED",
    "imageUrls": ["https://res.cloudinary.com/.../image1.png", "https://example.com/existing-image.jpg"],
    "features": ["Air-conditioned vehicle", "Luggage assistance", "Meet & Greet"],
    "maxCapacity": 4,
    "duration": 60,
    "durationType": "MINUTES",
    "isActive": true,
    "isAvailable": true,
    "availableDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
    "availableTimeSlot": "6AM-10PM",
    "totalBookings": 0,
    "averageRating": 0.0,
    "totalReviews": 0,
    "createdAt": "2026-02-01T16:00:00",
    "updatedAt": "2026-02-01T16:00:00"
  }
}
```

---

### 2. Get All Services
**GET** `/api/services`

Returns all active services.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": [
    {
      "id": "65abc123def456",
      "title": "Airport Pickup Service",
      ...
    }
  ]
}
```

---

### 3. Get Service by ID
**GET** `/api/services/{id}`

**Path Parameters:**
- `id` - Service ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Service retrieved successfully",
  "data": {
    "id": "65abc123def456",
    "title": "Airport Pickup Service",
    ...
  }
}
```

---

### 4. Get Services by Provider
**GET** `/api/services/provider/{providerId}`

**Path Parameters:**
- `providerId` - Provider's user ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Provider services retrieved successfully",
  "data": [...]
}
```

---

### 5. Get My Services
**GET** `/api/services/my-services`

Returns services created by the authenticated user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Your services retrieved successfully",
  "data": [...]
}
```

---

### 6. Get Services by Category
**GET** `/api/services/category/{category}`

**Path Parameters:**
- `category` - Service category (TRANSPORT, HOUSING, DOCUMENTATION, CULTURAL_SUPPORT)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category services retrieved successfully",
  "data": [...]
}
```

---

### 7. Search Services
**GET** `/api/services/search`

Search and filter services with multiple criteria.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | String | Filter by category |
| `origin` | String | Filter by origin country |
| `destination` | String | Filter by destination |
| `minPrice` | Double | Minimum price |
| `maxPrice` | Double | Maximum price |
| `searchTerm` | String | Keyword search in title/description |
| `pricingType` | String | FIXED, HOURLY, or NEGOTIABLE |
| `availableOnly` | Boolean | Show only available services |

**Example Request:**
```
GET /api/services/search?category=TRANSPORT&origin=Sri Lanka&minPrice=50&maxPrice=200&availableOnly=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [...]
}
```

---

### 8. Update Service
**PUT** `/api/services/{id}`

Updates an existing service. Only the service owner can update.

**Path Parameters:**
- `id` - Service ID

**Request Body:**
```json
{
  "title": "Updated Airport Pickup Service",
  "description": "Updated description",
  "price": 95.00,
  "isAvailable": true,
  "newImagesBase64": ["data:image/png;base64,iVBORw0KGgo..."],
  "newImageUrls": ["https://example.com/new-image.jpg"],
  "removeImageUrls": ["https://res.cloudinary.com/.../old-image.jpg"]
}
```

**Image Update Options:**
| Field | Type | Description |
|-------|------|-------------|
| `newImagesBase64` | List\<String\> | New base64 images to upload to Cloudinary |
| `newImageUrls` | List\<String\> | New direct image URLs to add |
| `removeImageUrls` | List\<String\> | Image URLs to remove (also deleted from Cloudinary) |

> **Note:** All fields are optional. Only include fields you want to update. Removed images are automatically deleted from Cloudinary.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": { ... }
}
```

---

### 9. Delete Service
**DELETE** `/api/services/{id}`

Deletes a service. Only the service owner can delete.

**Path Parameters:**
- `id` - Service ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Service deleted successfully",
  "data": null
}
```

---

### 10. Admin Delete Service
**DELETE** `/api/services/admin/{id}`

Deletes a service by an administrator and sends an email notification to the provider with a reason.

**Path Parameters:**
- `id` - Service ID

**Request Body:**
```json
{
  "reason": "Violation of terms of service regarding prohibited items."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Service deleted by admin successfully",
  "data": null
}
```

---

### 11. Toggle Service Availability
**PATCH** `/api/services/{id}/toggle`

Toggles the `isAvailable` status of a service.

**Path Parameters:**
- `id` - Service ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Service availability toggled successfully",
  "data": {
    "id": "65abc123def456",
    "isAvailable": false,
    ...
  }
}
```

---

## Data Models

### ServiceEntity (MongoDB Document)

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | MongoDB ObjectId |
| `title` | String | Service title |
| `description` | String | Service description |
| `category` | String | TRANSPORT, HOUSING, DOCUMENTATION, CULTURAL_SUPPORT |
| `providerId` | String | Reference to User ID |
| `providerName` | String | Provider's display name |
| `providerProfilePicture` | String | Provider's avatar URL |
| `origin` | String | Origin country |
| `destination` | String | Destination city/country |
| `specificLocation` | String | Detailed location |
| `price` | Double | Service price |
| `currency` | String | Currency code (AUD, USD) |
| `pricingType` | String | FIXED, HOURLY, NEGOTIABLE |
| `imageUrls` | List<String> | Image URLs |
| `features` | List<String> | Service features |
| `maxCapacity` | Integer | Maximum booking capacity |
| `duration` | Integer | Service duration |
| `durationType` | String | MINUTES, HOURS, DAYS |
| `isActive` | Boolean | Service visibility |
| `isAvailable` | Boolean | Booking availability |
| `availableDays` | List<String> | Available weekdays |
| `availableTimeSlot` | String | Time slot |
| `totalBookings` | Integer | Total bookings count |
| `averageRating` | Double | Average rating |
| `totalReviews` | Integer | Total reviews count |
| `createdAt` | LocalDateTime | Creation timestamp |
| `updatedAt` | LocalDateTime | Last update timestamp |

---

## Category Values

| Category | Description |
|----------|-------------|
| `TRANSPORT` | Airport pickup, local transport |
| `HOUSING` | Temporary/permanent accommodation |
| `DOCUMENTATION` | Visa, legal documents assistance |
| `CULTURAL_SUPPORT` | Language, cultural integration |

---

## Pricing Types

| Type | Description |
|------|-------------|
| `FIXED` | Fixed price for the service |
| `HOURLY` | Price per hour |
| `NEGOTIABLE` | Price is negotiable |

---

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Failed to create service: [error details]",
  "data": null
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You are not authorized to update this service",
  "data": null
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Service not found",
  "data": null
}
```

---

## Notes

1. **Image Upload**: Base64 encoded images can be sent via `imagesBase64` (create) or `newImagesBase64` (update). They are automatically uploaded to Cloudinary and stored as URLs.

2. **Image Deletion**: When removing images via `removeImageUrls`, they are automatically deleted from Cloudinary.

3. **Provider Info**: Provider details (`providerName`, `providerProfilePicture`) are automatically populated from the authenticated user's profile.

4. **Timestamps**: `createdAt` and `updatedAt` are managed automatically by the system.

5. **Initial Values**: New services are created with `isActive=true`, `isAvailable=true`, `totalBookings=0`, `averageRating=0.0`, `totalReviews=0`.

6. **Cloudinary Folder**: Service images are stored in `migratemate/services` folder on Cloudinary.
