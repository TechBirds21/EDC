# EDC API Documentation

## Overview

The Electronic Data Capture (EDC) API is a comprehensive, production-ready system for managing clinical forms, projects, users, and audit trails. Built with FastAPI, PostgreSQL, and modern security practices.

## Base URL

```
Production: https://your-domain.com/api/v1
Development: http://localhost:8000/api/v1
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "employee",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## User Roles

- **employee**: Can create and manage their own forms, view assigned projects
- **admin**: Can manage projects, assign users, approve/reject forms
- **super_admin**: Full system access, can manage users and all resources

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/auth/login` | User login | Public |
| POST | `/auth/register` | Create new user | admin, super_admin |
| GET | `/auth/me` | Get current user info | All authenticated |
| PUT | `/auth/me` | Update current user | All authenticated |

### Forms Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/forms/` | List forms (filtered by role) | All authenticated |
| POST | `/forms/` | Create new form | All authenticated |
| GET | `/forms/{form_id}` | Get specific form | All authenticated |
| PUT | `/forms/{form_id}` | Update form | creator, admin, super_admin |
| DELETE | `/forms/{form_id}` | Delete form (draft only) | creator, admin, super_admin |
| POST | `/forms/{form_id}/submit` | Submit form for review | creator, admin, super_admin |
| POST | `/forms/{form_id}/approve` | Approve/reject form | admin, super_admin |

#### Form Types

- `volunteer_medical_screening`
- `pregnancy_tests`
- `laboratory_reports`
- `study_period`
- `post_study`
- `custom`

#### Form Status Workflow

1. **draft** → **submitted** (via submit endpoint)
2. **submitted** → **approved** or **rejected** (via approve endpoint)
3. **approved** → **locked** (optional, for finalized forms)

### Projects Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/projects/` | List projects | All authenticated |
| POST | `/projects/` | Create project | admin, super_admin |
| GET | `/projects/{project_id}` | Get specific project | All authenticated |
| PUT | `/projects/{project_id}` | Update project | admin, super_admin |
| DELETE | `/projects/{project_id}` | Delete project | admin, super_admin |
| POST | `/projects/{project_id}/assign` | Assign user to project | admin, super_admin |
| DELETE | `/projects/{project_id}/unassign/{user_id}` | Unassign user | admin, super_admin |
| GET | `/projects/{project_id}/users` | Get project users | All authenticated |

### Audit Trail

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/audit/` | List audit logs | All authenticated* |
| GET | `/audit/form/{form_id}` | Form audit trail | All authenticated* |
| GET | `/audit/user/{user_id}` | User audit trail | admin, super_admin |
| GET | `/audit/project/{project_id}` | Project audit trail | All authenticated* |
| GET | `/audit/stats` | Audit statistics | admin, super_admin |

*Employees can only see their own audit logs

### PDF Export

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/export/{form_id}` | Export form as PDF | All authenticated* |
| GET | `/export/{form_id}/preview` | Preview form PDF | All authenticated* |

*Based on form access permissions

## Request/Response Examples

### Create Form

```http
POST /forms/
Authorization: Bearer <token>
Content-Type: application/json

{
  "form_type": "volunteer_medical_screening",
  "title": "Volunteer Medical Screening - Patient 001",
  "case_id": "CASE-001",
  "volunteer_id": "VOL-001",
  "study_number": "STUDY-001",
  "period_number": "P1",
  "form_data": {
    "screening_date": "2024-01-15",
    "medical_history": {
      "allergies": "None",
      "medications": ["Aspirin 81mg daily"],
      "previous_surgeries": []
    },
    "vital_signs": {
      "blood_pressure": "120/80",
      "heart_rate": 72,
      "temperature": 98.6
    }
  },
  "project_id": "project-uuid-here"
}
```

### Submit Form

```http
POST /forms/{form_id}/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "form_data": {
    "screening_date": "2024-01-15",
    "medical_history": {
      "allergies": "Penicillin",
      "medications": ["Aspirin 81mg daily"],
      "previous_surgeries": ["Appendectomy 2020"]
    },
    "vital_signs": {
      "blood_pressure": "118/78",
      "heart_rate": 68,
      "temperature": 98.4
    },
    "notes": "Patient reported feeling well, no concerns"
  },
  "review_comments": "Form completed and reviewed for accuracy"
}
```

### Approve/Reject Form

```http
POST /forms/{form_id}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve",
  "comments": "All data appears accurate and complete",
  "reason": "Quality review passed"
}
```

```http
POST /forms/{form_id}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "reject",
  "comments": "Missing vital signs data",
  "reason": "Incomplete form - please add missing vital signs"
}
```

### Create Project

```http
POST /projects/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Clinical Trial Study 002",
  "description": "Phase III clinical trial for cardiovascular medication",
  "start_date": "2024-02-01",
  "end_date": "2024-12-31",
  "settings": {
    "require_approval": true,
    "allow_draft_deletion": true
  },
  "project_metadata": {
    "protocol_number": "PROTO-002",
    "sponsor": "MedCorp Inc",
    "therapeutic_area": "Cardiovascular"
  }
}
```

### Assign User to Project

```http
POST /projects/{project_id}/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "user-uuid-here",
  "project_id": "project-uuid-here"
}
```

## Query Parameters

### Forms List

```http
GET /forms/?page=1&limit=20&form_type=volunteer_medical_screening&status=submitted&case_id=CASE-001
```

Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `form_type`: Filter by form type
- `status`: Filter by status (draft, submitted, approved, rejected, locked)
- `case_id`: Filter by case ID (partial match)
- `volunteer_id`: Filter by volunteer ID (partial match)
- `study_number`: Filter by study number (partial match)
- `project_id`: Filter by project ID

### Audit Logs

```http
GET /audit/?page=1&limit=50&resource_type=form&action=submit_form&user_id=user-uuid
```

Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `resource_type`: Filter by resource type (form, project, user)
- `resource_id`: Filter by specific resource
- `user_id`: Filter by user
- `action`: Filter by action type

## Error Responses

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "detail": "Error message description"
}
```

### Common Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `422`: Unprocessable Entity (validation error)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Rate Limiting

The API implements rate limiting of 60 requests per minute per IP address. Exceeded limits return a 429 status code.

## Security Features

1. **JWT Authentication**: Stateless authentication with role-based access
2. **Password Hashing**: bcrypt with configurable rounds
3. **CORS Protection**: Configurable allowed origins
4. **Security Headers**: X-Content-Type-Options, X-Frame-Options, etc.
5. **Input Validation**: Comprehensive validation using Pydantic
6. **Audit Logging**: All actions logged with user context
7. **Rate Limiting**: Protection against abuse
8. **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries

## Interactive Documentation

When running in development mode, interactive API documentation is available at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## SDK and Client Libraries

For frontend integration, the API follows RESTful conventions and returns JSON responses that can be easily consumed by any HTTP client library.

### JavaScript/TypeScript Example

```javascript
// Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
});
const { access_token } = await loginResponse.json();

// Use token for authenticated requests
const formsResponse = await fetch('/api/v1/forms/', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const forms = await formsResponse.json();
```

## Health Check

```http
GET /health
```

Returns system health status:

```json
{
  "status": "ok",
  "environment": "production",
  "version": "1.0.0"
}
```

## Support

For technical support and questions:
- API Documentation: `/docs` (development mode)
- Health Check: `/health`
- Repository: [GitHub Repository URL]