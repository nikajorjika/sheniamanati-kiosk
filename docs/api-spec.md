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

Internal endpoints require a Bearer token obtained from the **kiosk activation** endpoint.

```
Authorization: Bearer <token>
```

Client endpoints are public (no auth required), but should be rate-limited by IP/tablet ID on the Laravel side.

---

## Setup Endpoints

### `POST /api/kiosk/activate`

Called once when a manager sets up a new device. Validates the two kiosk codes and returns a session token plus terminal metadata.

**Request:**
```json
{
  "short_code": "TBIL1",
  "access_code": "aB3xQz9mKpLwRtNv4Yc2Zd8e"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `short_code` | string | Human-readable code assigned by admin in Nova |
| `access_code` | string | 24-char system-generated code, shown read-only in Nova |

**Response — success:**
```json
{
  "success": true,
  "token": "<64-char bearer token>",
  "terminal_id": 5,
  "terminal_number": "001",
  "terminal_name": "Front Desk 1",
  "terminal_type": "front",
  "branch_id": 2,
  "branch_name": "თბილისი"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | Bearer token (8h TTL) used for internal API calls |
| `terminal_id` | integer | DB id of the terminal, sent as `kiosk_terminal_id` in client calls |
| `terminal_number` | string | 3-digit display number |
| `terminal_name` | string\|null | Optional display name |
| `terminal_type` | `"front"` \| `"warehouse"` | Determines which page the device routes to |
| `branch_id` | integer | Branch the terminal belongs to |
| `branch_name` | string | Human-readable branch name |

**Response — invalid codes:**
```json
{
  "success": false,
  "error": "Invalid activation code"
}
```

**Notes:**
- Public endpoint — no auth required
- On success the kiosk stores all fields in localStorage and routes to `/client` (front) or `/internal` (warehouse)
- Admin can regenerate `access_code` via Nova action `RegenerateAccessCode`; existing device sessions expire within 8 hours

---

## Client Endpoints

### `POST /api/client/identify`

Called when a guest enters their room number at the kiosk. Validates the room, generates an OTP, and sends it via SMS.

**Request:**
```json
{
  "kiosk_terminal_id": 5,
  "room_number": "142857"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `kiosk_terminal_id` | integer | DB id of the terminal (from activation response) |
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
  "kiosk_terminal_id": 5,
  "room_number": "142857",
  "otp": "483920"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `kiosk_terminal_id` | integer | DB id of the terminal (from activation response) |
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

All internal endpoints require `Authorization: Bearer <token>` header. The Bearer token is the one issued by `POST /api/kiosk/activate` — there is no separate per-user login. All warehouse staff share the tablet and act under the terminal's identity.

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
