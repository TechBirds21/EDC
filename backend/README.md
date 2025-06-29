# Clinical Capture API

FastAPI backend for the Clinical Capture application.

## Features

- Async FastAPI application with SQLAlchemy 2.0
- Supabase JWT authentication middleware
- Comprehensive data models and validation
- Automatic OpenAPI documentation

## Setup

### Prerequisites

- Python 3.10+
- Poetry for dependency management

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
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/clinical_capture
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

### Database Migrations

```bash
# Initialize migrations (first time only)
alembic init migrations

# Create a new migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
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
backend/
├── app/
│   ├── api/
│   │   ├── dependencies.py
│   │   ├── endpoints/
│   │   │   ├── volunteers.py
│   │   │   ├── form_templates.py
│   │   │   ├── forms.py
│   │   │   └── change_log.py
│   │   └── router.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── exceptions.py
│   ├── db/
│   │   ├── base.py
│   │   ├── session.py
│   │   └── init_db.py
│   ├── models/
│   │   ├── volunteer.py
│   │   ├── form_template.py
│   │   ├── form.py
│   │   └── change_log.py
│   ├── schemas/
│   │   ├── volunteer.py
│   │   ├── form_template.py
│   │   ├── form.py
│   │   └── change_log.py
│   ├── services/
│   │   ├── volunteer.py
│   │   ├── form_template.py
│   │   ├── form.py
│   │   └── change_log.py
│   └── main.py
├── migrations/
├── tests/
├── .env
├── pyproject.toml
└── README.md
```