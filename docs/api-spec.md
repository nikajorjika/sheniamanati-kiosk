# API Specification — Sheniamanati Kiosk

This document describes the API endpoints that the Next.js kiosk app expects the Laravel backend to provide.

All endpoints are proxied through Next.js API routes, which forward requests to the Laravel base URL configured via environment variable.

---

## Base URL

```
LARAVEL_API_URL=https://your-laravel-app.test
```

---

## Authentication

Internal endpoints require a Bearer token obtained from the login endpoint.

```
Authorization: Bearer <token>
```

Client endpoints are public (no auth required), but should be rate-limited by IP/tablet ID on the Laravel side.

---

## Client Endpoints

### `POST /api/client/identify`

Called when a guest enters their room number at the kiosk. Validates the room, generates an OTP, and sends it via SMS.

**Request:**
```json
{
  "tablet_id": "123",
  "room_number": "142857"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `tablet_id` | string | 3-digit terminal identifier |
| `room_number` | string | 6-digit room number entered by guest |

**Response — valid room:**
```json
{
  "valid": true,
  "phone_last_three": "234"
}
```

**Response — invalid room:**
```json
{
  "valid": false,
  "error": "Room not found"
}
```

**Backend responsibilities:**
- Look up an active guest by `room_number`
- Generate and send a 6-digit OTP via the existing SMS service
- Return the last 3 digits of the guest's phone number (for display hint on kiosk)
- OTP should expire after 5 minutes and be single-use

---

### `POST /api/client/verify-otp`

Called after the guest enters the SMS code. Validates the OTP and, on success, creates a pickup request.

**Request:**
```json
{
  "tablet_id": "123",
  "room_number": "142857",
  "otp": "483920"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `tablet_id` | string | 3-digit terminal identifier |
| `room_number` | string | Room number from the previous step |
| `otp` | string | 6-digit code entered by guest |

**Response — valid OTP:**
```json
{
  "valid": true,
  "package_count": 3,
  "tracking_numbers": [
    "GE123456789",
    "GE987654321",
    "GE555000111"
  ]
}
```

**Response — invalid/expired OTP:**
```json
{
  "valid": false,
  "error": "Invalid or expired code"
}
```

**Backend responsibilities:**
- Validate the OTP (correct code, not expired, not already used)
- Mark OTP as used
- Create a pickup request record in the DB (status: `pending`)
- Return all tracking numbers associated with that guest's pending packages
- The kiosk will display the package count and tracking numbers on the waiting screen

---

## Internal Endpoints

All internal endpoints require `Authorization: Bearer <token>` header.

---

### `POST /api/internal/auth`

Admin login. Returns a Bearer token on success.

**Request:**
```json
{
  "username": "admin",
  "password": "secret"
}
```

**Response — success:**
```json
{
  "success": true,
  "token": "<bearer_token>"
}
```

**Response — failure:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Notes:**
- Validates against the existing `admins` table in Laravel
- Token is stored in memory on the frontend (page refresh requires re-login)
- Token lifetime is at your discretion — recommend at least 8 hours for a shift

---

### `GET /api/internal/requests`

Returns all active (pending) pickup requests, grouped by guest. Each entry may have multiple tracking numbers.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "client_name": "გიორგი მამალაძე",
      "room_number": "142857",
      "tracking_numbers": [
        "GE123456789",
        "GE987654321",
        "GE555000111"
      ],
      "created_at": "2026-02-24T10:00:00Z"
    },
    {
      "id": "uuid",
      "client_name": "მარიამ ჯაფარიძე",
      "room_number": "271828",
      "tracking_numbers": [
        "GE444333222"
      ],
      "created_at": "2026-02-24T10:05:00Z"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Pickup request identifier |
| `client_name` | string | Guest full name |
| `room_number` | string | Guest room number |
| `tracking_numbers` | string[] | All parcel tracking numbers for this request |
| `created_at` | string (ISO 8601) | When the kiosk request was created |

**Notes:**
- Only return requests with status `pending`
- Order by `created_at ASC` (oldest first)
- The frontend polls this endpoint every 10 seconds

---

### `POST /api/internal/mark-received`

Marks a pickup request as fulfilled.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "id": "uuid"
}
```

**Response — success:**
```json
{
  "success": true
}
```

**Response — not found / already received:**
```json
{
  "success": false,
  "error": "Request not found"
}
```

**Backend responsibilities:**
- Set pickup request status to `received`
- Record `received_at` timestamp
- The frontend removes the row optimistically — no further sync needed

---

## Error Handling

For all endpoints, respond with appropriate HTTP status codes:

| Status | When |
|--------|------|
| `200` | Success |
| `400` | Validation error (malformed request) |
| `401` | Missing or invalid Bearer token (internal endpoints) |
| `404` | Resource not found |
| `422` | Business logic failure (invalid OTP, room not found, etc.) |
| `500` | Server error |

The frontend handles `valid: false` / `success: false` at the application level — HTTP status codes are used for infrastructure-level errors.

---

## Field Naming

The Laravel API should use **snake_case** for all JSON fields (e.g. `phone_last_three`, `tracking_numbers`, `package_count`). The Next.js layer maps these to camelCase where needed internally.
