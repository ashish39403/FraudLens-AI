![image alt](https://github.com/ashish39403/FraudLens-AI/blob/5b02017b8c7a6430a565c0df5d69632bd80a5298/img_01.png)
# FraudLens AI

**AI-assisted fraud investigation and AML operations platform** for fintech transaction monitoring, alert review, case management, and audit-ready human decisions.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.11x-009688)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![License](https://img.shields.io/badge/license-Personal%20Project-lightgrey)

## Overview

FraudLens AI is a production-oriented backend project for investigating suspicious financial activity in digital banking and fintech systems.

The platform is designed around a practical investigation workflow:

```text
Customer → Transaction → Rule Detection → Alert → Investigation Case → Decision → Audit Log
```

The system starts with **deterministic, explainable rule-based detection** and adds AI only where it supports analysts — such as investigation report drafting and policy retrieval. High-risk decisions remain human-controlled by design.

## Table of Contents

- [Current Status](#current-status)
- [Tech Stack](#tech-stack)
- [Backend Features](#backend-features)
- [Architecture](#architecture)
- [Local Setup](#local-setup)
- [Database](#database)
- [License](#license)

## Current Status

### ✅ Implemented

- FastAPI application structure
- Health check endpoint
- PostgreSQL database setup
- SQLModel data models
- Alembic migrations
- Customer API
- Automated tests with pytest

### 🚧 In Progress

- Transaction API
- Rule-based alert generation
- Case workflow
- Audit logging

### 📋 Planned

- Authentication and role-based access control
- AI-assisted investigation report drafts
- Policy document retrieval
- Dashboard frontend
- Dockerized deployment
- Observability and benchmarking

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python |
| API Framework | FastAPI |
| ORM | SQLModel |
| Database | PostgreSQL |
| Migrations | Alembic |
| Testing | Pytest |
| Server | Uvicorn |
| Package Manager | uv |

## Backend Features

### Implemented

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/v1/customers` | Create customer |
| GET | `/api/v1/customers` | List customers |
| GET | `/api/v1/customers/{customer_id}` | Get customer by ID |

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
├── app/
│   ├── api/routes/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   └── services/
├── alembic/
└── tests/
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

- API docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

## Database

_Schema diagram / ERD to be added._

## License

This project is currently maintained as a personal portfolio project.
