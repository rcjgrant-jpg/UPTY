# Upty API Contract

Base URL: `/api/`

---

## Authentication

### POST /api/auth/register

Creates a new user and team.

**Auth required:** No

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "team_name": "My Startup"
}
```

**Success response (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "team": {
    "id": 1,
    "name": "My Startup"
  }
}
```

**Error response (400):**
```json
{
  "error": "Email already exists"
}
```

---

### POST /api/auth/login

Logs in a user.

**Auth required:** No

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "team": {
    "id": 1,
    "name": "My Startup"
  }
}
```

**Error response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### POST /api/auth/logout

Logs out the current user.

**Auth required:** Yes

**Request body:** None

**Success response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/me

Gets current logged-in user info.

**Auth required:** Yes

**Success response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "team": {
    "id": 1,
    "name": "My Startup"
  }
}
```

---

## Monitors

### GET /api/monitors

Lists all monitors for the user's team. Sorted: DOWN first, then by last checked.

**Auth required:** Yes

**Success response (200):**
```json
{
  "monitors": [
    {
      "id": 2,
      "url": "https://staging.mysite.com",
      "current_state": "DOWN",
      "latency_ms": null,
      "last_checked_at": "2026-03-01T14:30:01Z",
      "created_by": {
        "id": 1,
        "email": "user@example.com"
      }
    },
    {
      "id": 1,
      "url": "https://api.example.com/health",
      "current_state": "UP",
      "latency_ms": 124,
      "last_checked_at": "2026-03-01T14:32:01Z",
      "created_by": {
        "id": 1,
        "email": "user@example.com"
      }
    }
  ]
}
```

---

### POST /api/monitors

Creates a new monitor.

**Auth required:** Yes

**Request body:**
```json
{
  "url": "https://mysite.com/health",
  "interval": 60,
  "timeout": 5000,
  "expected_status": 200,
  "failure_threshold": 3
}
```

Note: Only `url` is required. Others have defaults:
- interval: 60 (seconds)
- timeout: 5000 (ms)
- expected_status: 200
- failure_threshold: 3

**Success response (201):**
```json
{
  "id": 3,
  "url": "https://mysite.com/health",
  "current_state": "UP",
  "interval": 60,
  "timeout": 5000,
  "expected_status": 200,
  "failure_threshold": 3,
  "last_checked_at": null,
  "created_at": "2026-03-01T15:00:00Z",
  "created_by": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Error response (400):**
```json
{
  "error": "Invalid URL format"
}
```

---

### GET /api/monitors/:id

Gets a single monitor with recent results.

**Auth required:** Yes

**Success response (200):**
```json
{
  "id": 1,
  "url": "https://api.example.com/health",
  "current_state": "UP",
  "interval": 60,
  "timeout": 5000,
  "expected_status": 200,
  "failure_threshold": 3,
  "last_checked_at": "2026-03-01T14:32:01Z",
  "created_at": "2026-02-15T10:00:00Z",
  "created_by": {
    "id": 1,
    "email": "user@example.com"
  },
  "recent_results": [
    {
      "id": 100,
      "status_code": 200,
      "latency_ms": 124,
      "error_message": null,
      "checked_at": "2026-03-01T14:32:01Z"
    },
    {
      "id": 99,
      "status_code": 200,
      "latency_ms": 118,
      "error_message": null,
      "checked_at": "2026-03-01T14:31:01Z"
    }
  ]
}
```

**Error response (404):**
```json
{
  "error": "Monitor not found"
}
```

---

### DELETE /api/monitors/:id

Deletes a monitor.

**Auth required:** Yes

**Success response (204):** No content

**Error response (404):**
```json
{
  "error": "Monitor not found"
}
```

---

## Incidents

### GET /api/incidents

Lists all incidents for the user's team.

**Auth required:** Yes

**Success response (200):**
```json
{
  "incidents": [
    {
      "id": 1,
      "monitor": {
        "id": 2,
        "url": "https://staging.mysite.com"
      },
      "started_at": "2026-03-01T09:04:00Z",
      "is_resolved": false,
      "resolved_at": null,
      "resolved_by": null
    },
    {
      "id": 2,
      "monitor": {
        "id": 1,
        "url": "https://api.example.com/health"
      },
      "started_at": "2026-02-28T14:45:00Z",
      "is_resolved": true,
      "resolved_at": "2026-02-28T14:52:00Z",
      "resolved_by": {
        "id": 1,
        "email": "user@example.com"
      }
    }
  ]
}
```

---

### POST /api/incidents/:id/resolve

Marks an incident as resolved.

**Auth required:** Yes

**Request body:** None

**Success response (200):**
```json
{
  "id": 1,
  "monitor": {
    "id": 2,
    "url": "https://staging.mysite.com"
  },
  "started_at": "2026-03-01T09:04:00Z",
  "is_resolved": true,
  "resolved_at": "2026-03-01T15:30:00Z",
  "resolved_by": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Error response (400):**
```json
{
  "error": "Incident already resolved"
}
```

---

## Team

### GET /api/team

Gets team info and members.

**Auth required:** Yes

**Success response (200):**
```json
{
  "id": 1,
  "name": "My Startup",
  "members": [
    {
      "id": 1,
      "email": "user@example.com",
      "joined_at": "2026-02-15T10:00:00Z"
    },
    {
      "id": 2,
      "email": "teammate@example.com",
      "joined_at": "2026-02-20T14:00:00Z"
    }
  ]
}
```

---

### POST /api/team/invite

Generates an invite link (expires in 7 days).

**Auth required:** Yes

**Request body:** None

**Success response (201):**
```json
{
  "token": "a8f3k2x9...",
  "url": "https://upty.app/invite/a8f3k2x9...",
  "expires_at": "2026-03-08T15:00:00Z"
}
```

---

### GET /api/invite/:token

Validates an invite token (public endpoint).

**Auth required:** No

**Success response (200):**
```json
{
  "valid": true,
  "team_name": "My Startup",
  "invited_by": "user@example.com",
  "expires_at": "2026-03-08T15:00:00Z"
}
```

**Error response (400):**
```json
{
  "valid": false,
  "error": "Invite expired or invalid"
}
```

---

### POST /api/invite/:token/accept

Accepts invite (for logged-in user).

**Auth required:** Yes

**Request body:** None

**Success response (200):**
```json
{
  "message": "Successfully joined team",
  "team": {
    "id": 1,
    "name": "My Startup"
  }
}
```

---

## Settings

### PUT /api/settings/email

Updates user's email (also changes where alerts are sent).

**Auth required:** Yes

**Request body:**
```json
{
  "email": "newemail@example.com"
}
```

**Success response (200):**
```json
{
  "id": 1,
  "email": "newemail@example.com"
}
```

---

### PUT /api/settings/password

Updates user's password.

**Auth required:** Yes

**Request body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

**Success response (200):**
```json
{
  "message": "Password updated successfully"
}
```

**Error response (400):**
```json
{
  "error": "Current password is incorrect"
}
```
