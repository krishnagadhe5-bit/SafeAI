# SafeAI — Intelligent Public Safety Intelligence Platform

**SafeAI** is a modern, full-stack decision-support platform designed to evaluate event risks and recommend illustrative public safety resources (security, police, medical, and ambulance units) using a trained machine-learning pipeline.

*Predict earlier. Plan smarter. Respond better.*

---

## 1. System Architecture & Communication Flow

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 18 SPA)                  │
│   Vite + TypeScript + Tailwind CSS + TanStack Query    │
│   (Dashboard, Prediction, History, Planning, Reports)  │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON (HttpOnly JWT)
                           ▼
┌────────────────────────────────────────────────────────┐
│             Backend API Gateway (FastAPI)              │
│       Pydantic v2 · SQLAlchemy 2.0 · Alembic           │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ▼                        ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│     Relational Database       │ │      ML Pipeline Engine       │
│  PostgreSQL (Prod) / SQLite   │ │ scikit-learn (ColumnTransformer│
│  Users · Assessments · Audits │ │   + Balanced Random Forest)   │
└───────────────────────────────┘ └───────────────────────────────┘
```

### Communication Flow:
1. **User Authentication**: The analyst logs in via `POST /api/v1/auth/login`. FastAPI validates password against bcrypt hash and issues an `HttpOnly`, `SameSite=Lax` session cookie (`access_token`).
2. **Assessment Submission**: The user submits event parameters (crowd size, venue capacity, weather, temperature, previous incidents, holiday status, time slot, day of week, event type) via typed React Hook Form with Zod validation.
3. **Pydantic Validation**: FastAPI parses the incoming JSON, sanitizes text inputs, checks capacity constraints, and rejects negative numbers (`422 Unprocessable Entity` on violation).
4. **ML Inference**: `ml_service` passes validated features through a cached `ColumnTransformer` (numeric median imputation + scaling, categorical one-hot encoding) into a 180-tree `RandomForestClassifier`.
5. **Scoring & Resource Planning**: Model probability outputs are mapped to a continuous 0–100 Risk Score Index. The resource service computes illustrative security, police, medical, and ambulance deployments.
6. **Persistence**: The assessment record, user ID, calculated scores, and resource allocations are committed transactionally to the database.
7. **Client Synchronization**: TanStack Query invalidates cache keys, automatically updating the Dashboard KPI cards, Recharts time-series charts, and Assessment History tables.

---

## 2. Technology Stack

| Tier | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, TanStack Query v5, React Hook Form, Zod, Recharts, React Hot Toast |
| **Backend** | Python 3.11+, FastAPI, Uvicorn (ASGI), Pydantic v2, SQLAlchemy 2.0, Alembic, bcrypt, python-jose, Pytest, HTTPX |
| **Machine Learning** | scikit-learn (Pipeline, ColumnTransformer, RandomForestClassifier), pandas, NumPy, joblib |
| **Database** | SQLite (development fallback with WAL mode) / PostgreSQL (production) |

---

## 3. Project Directory Structure

```
SafeAI/
├── backend/
│   ├── app/
│   │   ├── api/v1/              # API router & modular endpoints
│   │   │   └── endpoints/       # auth, assessments, dashboard, resources, reports, admin
│   │   ├── core/                # config (Pydantic settings), security (bcrypt/JWT), deps (RBAC)
│   │   ├── db/                  # SQLAlchemy engine, session maker, WAL pragmas
│   │   ├── models/              # User, Assessment, AuditLog ORM models
│   │   ├── schemas/             # Pydantic v2 request/response schemas
│   │   ├── services/            # Resource planning service & methodology
│   │   ├── ml/                  # Singleton ML service loader & inference logic
│   │   └── main.py              # FastAPI app, CORS, lifespan, SPA static mount
│   ├── alembic/                 # Database migrations (001_initial_schema.py)
│   ├── tests/                   # 19 comprehensive pytest test cases
│   ├── safeai_new.db            # SQLite database with migrated records
│   ├── requirements.txt         # Pinned backend dependencies
│   └── alembic.ini              # Migration configuration
├── frontend/
│   ├── src/
│   │   ├── components/ui/       # Badge, Button, Card UI primitives
│   │   ├── components/layout/   # Collapsible Sidebar, Navbar, AppLayout
│   │   ├── pages/               # Dashboard, RiskPrediction, AssessmentHistory,
│   │   │                        # ResourcePlanning, Reports, About, Settings, Login, Register
│   │   ├── hooks/               # useAuth (cookie state management)
│   │   ├── services/            # Typed fetch API client
│   │   ├── types/               # TypeScript interfaces matching backend models
│   │   ├── App.tsx              # Router & QueryClient setup
│   │   └── main.tsx             # React entry point
│   ├── dist/                    # Compiled production assets
│   ├── package.json             # NPM dependencies & scripts
│   └── vite.config.ts           # Vite build config with backend proxy
├── ml/
│   ├── model/                   # Serialized model.joblib artifact
│   ├── training/                # Reproducible train.py & demo_training_data.csv
│   ├── evaluation/              # evaluate.py (confusion matrix, classification report)
│   └── README.md                # ML feature specifications & formulas
├── scripts/
│   └── migrate_sqlite.py        # Safe data migration from legacy prototype
├── docs/
│   └── ARCHITECTURE.md          # Architectural notes
├── .env.example                 # Safe environment template
├── .env                         # Local development settings
└── README.md                    # Platform documentation
```

---

## 4. Local Development Setup (Windows)

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Quick Start (Single Full-Stack Server)

Because the frontend is pre-built into `frontend/dist`, you can run the complete full-stack application directly from FastAPI on a single port:

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd "C:\Users\Lenovo\Downloads\SafeAI-Team-Aegis-main\SafeAI-Team-Aegis-main"
   ```

2. Start the FastAPI server:
   ```powershell
   & "C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.11_3.11.2544.0_x64__qbz5n2kfra8p0\python3.11.exe" -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
   ```

3. Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser!
   - Default Administrator: `admin@safeai.local`
   - Default Password: `admin123`

---

### Dual-Server Development Mode (Hot-Reloading)

If you wish to modify frontend React components with instant hot module replacement (HMR):

1. **Terminal 1 — Backend API Server**:
   ```powershell
   cd "C:\Users\Lenovo\Downloads\SafeAI-Team-Aegis-main\SafeAI-Team-Aegis-main"
   & "C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.11_3.11.2544.0_x64__qbz5n2kfra8p0\python3.11.exe" -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
   ```

2. **Terminal 2 — Vite Dev Server**:
   ```powershell
   cd "C:\Users\Lenovo\Downloads\SafeAI-Team-Aegis-main\SafeAI-Team-Aegis-main\frontend"
   npm run dev
   ```

3. Open **[http://localhost:5173](http://localhost:5173)**. Requests to `/api` are automatically proxied to port 8000.

---

## 5. Running Tests & Quality Verification

### Run Backend Pytest Suite
```powershell
cd "C:\Users\Lenovo\Downloads\SafeAI-Team-Aegis-main\SafeAI-Team-Aegis-main\backend"
$env:PYTHONPATH = "C:\Users\Lenovo\Downloads\SafeAI-Team-Aegis-main\SafeAI-Team-Aegis-main\backend"
& "C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.11_3.11.2544.0_x64__qbz5n2kfra8p0\python3.11.exe" -m pytest tests -v
```
*(All 19 tests pass: health, register, login, unauthorized access, validation errors, prediction, resource calculation, dashboard trends, reports, and CSV export).*

### Run Model Evaluation & Diagnostics
```powershell
cd "C:\Users\Lenovo\Downloads\SafeAI-Team-Aegis-main\SafeAI-Team-Aegis-main"
& "C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.11_3.11.2544.0_x64__qbz5n2kfra8p0\python3.11.exe" ml/evaluation/evaluate.py
```

### Run Frontend Production Build
```powershell
cd "C:\Users\Lenovo\Downloads\SafeAI-Team-Aegis-main\SafeAI-Team-Aegis-main\frontend"
npm run build
```

---

## 6. Environment Configuration (`.env`)

| Variable | Default Value | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./safeai_new.db` | Connection string (`postgresql://user:pass@host/db` in prod) |
| `SECRET_KEY` | `dev-secret-key-...` | Secret used for HMAC-SHA256 JWT signing |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Lifespan of auth tokens |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Allowed CORS origins |
| `MODEL_PATH` | `../ml/model/model.joblib` | Path to trained model artifact |
| `INIT_ADMIN_EMAIL` | `admin@safeai.local` | Default initial admin user |
| `INIT_ADMIN_PASSWORD` | `admin123` | Default initial admin password |

---

## 7. API Specification (`/api/v1`)

FastAPI automatically generates interactive Swagger documentation at **`/docs`** and ReDoc at **`/redoc`**.

- **Authentication**:
  - `POST /api/v1/auth/register` — Register a new analyst account.
  - `POST /api/v1/auth/login` — Authenticate and receive HttpOnly cookie.
  - `POST /api/v1/auth/logout` — Clear session cookie.
  - `GET /api/v1/auth/me` — Retrieve current authenticated user profile.
- **Assessments**:
  - `POST /api/v1/assessments` — Submit parameters, run ML model, calculate resources, and persist record.
  - `GET /api/v1/assessments` — Paginated list with venue search, risk filters, and sorting.
  - `GET /api/v1/assessments/{id}` — Full assessment details including model inputs and outputs.
  - `GET /api/v1/assessments/{id}/resources` — Breakdown of illustrative resource allocations.
  - `GET /api/v1/assessments/export` — Stream assessments to CSV.
- **Dashboard & Analytics**:
  - `GET /api/v1/dashboard/summary` — Aggregate counts, risk breakdown, and model holdout metrics.
  - `GET /api/v1/dashboard/trends?days=30` — Daily trend buckets, distribution, and recent evaluations.
- **Resource Planning**:
  - `POST /api/v1/resource-plans` — Simulate resource requirements for custom crowd and risk tiers.
- **Reports**:
  - `GET /api/v1/reports/summary` — Venue-level aggregations and event type distributions.
- **Admin**:
  - `GET /api/v1/admin/users` — List registered users (admin only).
  - `PATCH /api/v1/admin/users/{id}/role` — Promote or demote user roles (admin only).
  - `PATCH /api/v1/admin/users/{id}/status` — Enable or deactivate accounts (admin only).
- **System**:
  - `GET /api/v1/health` — Platform health check.

---

## 8. Migration & Obsolete Files

All original files have been backed up in `SafeAI-Team-Aegis-main-BACKUP/`.
The 3 historical records from `backend/safeai.db` were safely migrated into `backend/safeai_new.db` using `scripts/migrate_sqlite.py`.

### Obsolete Files (Safe to remove after review):
- `backend/app.py` — Fully replaced by the modular FastAPI application package in `backend/app/`.
- `frontend/index.html.old` — Fully replaced by the production React TypeScript application in `frontend/`.
- `backend/safeai.db` — Fully migrated into `backend/safeai_new.db`.

---

## 9. Academic Disclaimer & Limitations

- **Synthetic Data**: The baseline training dataset (`demo_training_data.csv`) is synthetic and designed solely to demonstrate software architectures and risk modeling pipelines.
- **Decision Support Only**: Reported accuracy (62.92%) reflects classification performance against synthetic mathematical rules. It does not measure real-world emergency response efficacy.
- **Human Authority**: Resource recommendations are illustrative planning models. Actual deployments require qualified human review, local emergency rules, and official dispatch authority.
