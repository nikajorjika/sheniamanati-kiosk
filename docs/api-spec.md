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
      "received_tracking_numbers": ["GE123456789"],
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
| `received_tracking_numbers` | string[] | Subset of `tracking_numbers` whose `Package.status` is already `received`. Populated by partial scans from `/internal/scan-package`. Used by the scan panel to render per-package progress (green ticks). May be omitted for empty arrays. |
| `created_at` | string (ISO 8601) | When the kiosk request was created |

**Notes:**
- Only return requests with status `pending`
- Order by `created_at ASC` (oldest first)
- The frontend polls this endpoint every 10 seconds

---

### `GET /api/internal/history`

Returns **today's completed** pickup requests for the branch — those finalized today, whether received or rejected. Backs the warehouse scan panel's History tab. Unlike `/internal/requests`, this is not polled; the frontend fetches it on tab-open, after a scan that completes a request, and via a manual refresh button.

**Headers:** `Authorization: Bearer <token>`

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `branch_id` | integer (optional) | Restrict to requests created at terminals in this branch. Same branch-scoping as `/internal/requests`. |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "client_name": "გიორგი მამალაძე",
      "room_number": "142857",
      "status": "received",
      "tracking_numbers": ["GE123456789", "GE987654321"],
      "received_tracking_numbers": ["GE123456789"],
      "kiosk_number": "A01",
      "actioned_by_kiosk_number": "W02",
      "actioned_at": "2026-06-05T14:22:00+04:00",
      "created_at": "2026-06-05T09:10:00+04:00"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Pickup request identifier |
| `client_name` | string | Guest full name |
| `room_number` | string | Guest room number |
| `status` | `"received"` \| `"rejected"` | Completion outcome |
| `tracking_numbers` | string[] | All parcel tracking numbers for this request |
| `received_tracking_numbers` | string[] | Subset of `tracking_numbers` whose `Package.status` is `received`. Typically `[]` for rejected requests. |
| `kiosk_number` | string | Terminal number that **created** the request |
| `actioned_by_kiosk_number` | string\|null | Terminal number that **finalized** (marked received / rejected) the request; may be null |
| `actioned_at` | string (ISO 8601) | `marked_at` (received) or `rejected_at` (rejected) |
| `created_at` | string (ISO 8601) | When the kiosk request was created |

**Notes:**
- Only requests with status `received` or `rejected`. Pending requests stay in `/internal/requests`.
- "Today" is by action date in the app timezone: `received` with `marked_at` today **OR** `rejected` with `rejected_at` today. A request created yesterday but finalized today appears today.
- Ordered most-recently-actioned first (`COALESCE(marked_at, rejected_at) DESC`).
- No scan-level / not-found event log is returned — only completed requests.

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

### `POST /api/internal/scan-package`

Marks a single package as received by tracking number — used by the warehouse scan panel where a worker scans the barcode on a parcel. This endpoint operates per-package (not per-request); the parent `PickupRequest` is auto-completed only when every package in it has reached `received`.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "tracking_number": "GE123456789"
}
```

**Response:**
```json
{
  "status": "received",
  "tracking_number": "GE123456789",
  "request_id": "uuid",
  "client_name": "გიორგი მამალაძე",
  "room_number": "142857",
  "request_completed": false,
  "remaining": ["GE987654321", "GE555000111"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | enum | One of `received` \| `already_received` \| `no_pending_request` \| `not_found` |
| `tracking_number` | string | The tracking number that was scanned (echoed back, trimmed) |
| `request_id` | string (UUID) | Parent pickup request — only present when `status = received` |
| `client_name` | string\|null | Customer display name — only when `status = received` |
| `room_number` | string\|null | Customer room number — only when `status = received` |
| `request_completed` | bool | `true` if this scan completed the parent request (all packages received) |
| `remaining` | string[] | Tracking numbers in the request still not received |

**Status meanings:**
- `received` — package was `arrived`, now flipped to `received`. Triggers `PackageObserver` → SMS, same as the legacy mark-received endpoint.
- `already_received` — package status was already `received`; no-op.
- `no_pending_request` — package exists but no pending `PickupRequest` at this terminal's branch contains it. (E.g. customer hasn't started a pickup flow yet, or request belongs to another branch.)
- `not_found` — no `Package` row matches the scanned tracking number.

**Backend responsibilities:**
- Update only the single `Package` row matching `tracking_number`.
- Scope pending-request lookup to pickup requests whose `kiosk_terminal_id` is in the warehouse terminal's branch.
- If every tracking number on the parent `PickupRequest` is `received` after this scan, also set `pickup_request.status = received`, `received_at = now`, `marked_by_terminal_id = <scanning terminal>`, `marked_at = now`.
- Always return HTTP 200 with a `status` discriminator — error states are domain conditions, not transport errors.

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

All JSON field names use **snake_case** end-to-end (e.g. `phone_last_three`, `tracking_numbers`, `package_count`, `kiosk_terminal_id`). The Next.js `/api/*` routes are thin passthrough proxies — they forward the browser request body to Laravel and return Laravel's response verbatim. Their only added responsibilities are attaching the `Authorization` header and hiding `API_URL` from the browser. Do not re-key fields in a proxy.
