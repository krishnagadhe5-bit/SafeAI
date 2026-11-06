# SafeAI System Architecture (v2.0)

## Overview

SafeAI v2.0 transforms the legacy single-file prototype into an enterprise-grade full-stack intelligence platform.

```
[Browser Client]
  │
  ▼  React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query
[API Gateway]
  │
  ▼  FastAPI (/api/v1) + Pydantic v2 + Bcrypt/JWT Auth (HttpOnly)
[Core Services]
  ├── ML Service: scikit-learn Pipeline (ColumnTransformer + RandomForestClassifier)
  ├── Resource Service: Multi-tier deployment curves with risk coefficients
  └── Audit Service: Transactional user action audit logging
  │
  ▼  SQLAlchemy 2.0 ORM + Alembic Migrations
[Database Layer]
  └── SQLite (Dev with WAL mode) / PostgreSQL (Production)
```

## Key Architectural Principles

1. **Separation of Concerns**: ML modeling, API routing, schema validation, persistence, and presentation are strictly decoupled into independent modules.
2. **Deterministic Preprocessing**: Features are passed through an immutable pipeline preserving feature names, exact column ordering, median imputation, and categorical encoding.
3. **Defense in Depth**: Passwords are hashed with raw `bcrypt` salts, tokens are transmitted exclusively via `HttpOnly` and `SameSite` cookies, and database operations use parameterized ORM queries.
4. **Transparent Planning Models**: Illustrative resource curves are calculated in dedicated backend services with visible assumptions and academic disclaimers.
