# FraudLens AI

AI-assisted fraud investigation and AML operations platform for fintech transaction monitoring, alert review, case management, and audit-ready human decisions.

## Overview

FraudLens AI is a production-oriented backend project for investigating suspicious financial activity in digital banking and fintech systems.

The platform is designed around a practical investigation workflow:

```text
Customer -> Transaction -> Rule Detection -> Alert -> Investigation Case -> Decision -> Audit Log
```

The system starts with deterministic, explainable rule-based detection and adds AI only where it supports analysts, such as investigation report drafting and policy retrieval. High-risk decisions remain human-controlled.

## Current Status

Implemented:

- FastAPI application structure
- Health check endpoint
- PostgreSQL database setup
- SQLModel data models
- Alembic migrations
- Customer API
- Automated tests with pytest

In progress:

- Transaction API
- Rule-based alert generation
- Case workflow
- Audit logging

Planned:

- Authentication and role-based access control
- AI-assisted investigation report drafts
- Policy document retrieval
- Dashboard frontend
- Dockerized deployment
- Observability and benchmarking

## Tech Stack

- Python
- FastAPI
- SQLModel
- PostgreSQL
- Alembic
- Pytest
- Uvicorn
- uv

## Backend Features

### Implemented

- `GET /health`
- `POST /api/v1/customers`
- `GET /api/v1/customers`
- `GET /api/v1/customers/{customer_id}`

### Planned Core APIs

- Transactions
- Alerts
- Investigation cases
- Case notes
- Case decisions
- Audit events
- Operational metrics

## Architecture

```text
Client / Dashboard
        |
        v
FastAPI Backend
        |
        v
Service Layer
        |
        v
SQLModel Models
        |
        v
PostgreSQL
```

The backend follows a modular structure:

```text
backend/
  app/
    api/routes/
    core/
    db/
    models/
    schemas/
    services/
  alembic/
  tests/
```

## Local Setup

### 1. Clone the repository

```powershell
git clone <repo-url>
cd fraud-aml-investigation-platform/backend
```

### 2. Install dependencies

```powershell
uv sync
```

### 3. Configure environment

Create `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/fraud_aml_db
APP_NAME=Fraud AML Investigation Platform
ENVIRONMENT=local
```

### 4. Run database migrations

```powershell
uv run alembic upgrade head
```

### 5. Run tests

```powershell
uv run pytest
```

### 6. Start the API server

```powershell
uv run uvicorn app.main:app --reload
```

API docs:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

## Database

Current tables:

- `users`
- `customers`
- `transactions`
- `alembic_version`

Upcoming tables:

- `alerts`
- `investigation_cases`
- `case_notes`
- `case_decisions`
- `audit_events`

## Design Principles

- Explainable detection before complex ML
- Human-in-the-loop decisions for high-risk workflows
- Clear separation between routes, schemas, services, and models
- Database schema changes managed through migrations
- Tests for core backend behavior
- Secrets managed through environment variables

## Roadmap

1. Complete transaction APIs.
2. Add deterministic rule-based alert generation.
3. Build alert and case management workflow.
4. Add audit logging for important actions.
5. Add authentication and role-based access control.
6. Add AI-assisted report drafting.
7. Add policy retrieval for investigation support.
8. Build frontend dashboard.
9. Add Docker, deployment, logs, and monitoring.

## License

This project is currently maintained as a personal portfolio project.
