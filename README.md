# Clinical Forms API

FastAPI backend for clinical forms with Supabase authentication.

## Features

- Async FastAPI application with SQLAlchemy 2.0
- Supabase JWT authentication middleware
- Comprehensive data models and validation
- Automatic OpenAPI documentation
- Alembic migrations for database versioning

## Setup

### Prerequisites

- Python 3.10+
- Poetry for dependency management
- PostgreSQL database

### Installation

```bash
# Install dependencies
poetry install

# Activate the virtual environment
poetry shell
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/clinical_forms
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Database Migrations

```bash
# Apply migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "Description of changes"
```

### Running the Application

```bash
# Development server
uvicorn app.main:app --reload

# Production server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
app/
├── api/
│   ├── dependencies.py
│   ├── endpoints/
│   │   ├── volunteers.py
│   │   ├── form_templates.py
│   │   ├── forms.py
│   │   └── change_log.py
│   └── router.py
├── core/
│   ├── config.py
│   ├── security.py
│   └── exceptions.py
├── db/
│   ├── base.py
│   ├── session.py
│   └── init_db.py
├── models/
│   ├── volunteer.py
│   ├── form_template.py
│   ├── form.py
│   └── change_log.py
├── schemas/
│   ├── volunteer.py
│   ├── form_template.py
│   ├── form.py
│   └── change_log.py
├── services/
│   ├── volunteer.py
│   ├── form_template.py
│   ├── form.py
│   └── change_log.py
├── validators/
│   └── date_validator.py
├── utils/
│   └── diff.py
└── main.py
```

## Business Rules

1. All date fields in incoming data must be >= `volunteers.screening_date`
2. On PATCH: compare old vs new, record each diff with reason & timestamp
3. On save = "draft"; on submit = "submitted"; audit cannot modify submitted without password + reason

## Authentication

The API uses Supabase JWT authentication. To access protected endpoints, include the following header:

```
Authorization: Bearer <supabase_jwt_token>
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.