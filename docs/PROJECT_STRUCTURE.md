# SafeAI Project Structure & Component Directory

This document details the clean, standardized organization of files, folders, and components across the SafeAI codebase.

---

## High-Level Directory Overview

```
SafeAI-Team-Aegis-main/
├── backend/                # FastAPI application, SQLAlchemy models, and ML service
├── frontend/               # React 18 + TypeScript + Vite + Tailwind CSS SPA
├── dataset/                # Training dataset (1,200 synthetic event records)
├── ml/                     # Standalone ML training & evaluation scripts
├── scripts/                # Database migration and utility scripts
├── docs/                   # System architecture and structure documentation
├── .env                    # Active environment variables (Supabase & Database)
├── .env.example            # Environment configuration template
├── .gitignore              # Git ignore rules for node_modules, caches, and DB files
└── README.md               # Complete platform documentation and quickstart guide
```

---

## 1. Frontend Directory Structure (`frontend/src/`)

```
frontend/src/
├── components/             # Reusable UI & Layout Components
│   ├── index.ts            # Central barrel export for all components
│   ├── layout/             # Application shell & navigation frames
│   │   ├── index.ts        # Barrel export: AppLayout, Navbar, Sidebar
│   │   ├── AppLayout.tsx   # Top-level shell with dynamic ambient glow orbs & background mesh
│   │   ├── Navbar.tsx      # Top bar with real-time digital clock, telemetry pill & Theme Switcher
│   │   └── Sidebar.tsx     # Collapsible navigation drawer with user clearance badge
│   └── ui/                 # Reusable atomic UI elements
│       ├── index.ts        # Barrel export: Badge, Button, Card
│       ├── badge.tsx       # Status badges with live glowing indicator dots
│       ├── button.tsx      # Cyber gradient buttons with hover shine animations
│       └── card.tsx        # Frosted glass cards (.glass-card) with glowing risk borders
│
├── pages/                  # Route Views & Screens
│   ├── index.ts            # Central barrel export for all 9 pages
│   ├── Dashboard.tsx       # Live KPI telemetry, volume area chart & risk distribution donut
│   ├── RiskPrediction.tsx  # Assessment console with input validation & continuous score index
│   ├── AssessmentHistory.tsx # Cryptographically logged audit ledger with CSV export & inspection modal
│   ├── ResourcePlanning.tsx # Interactive simulator with attendee slider & transparent formulation
│   ├── Reports.tsx         # Executive reporting console with print layouts & venue summaries
│   ├── About.tsx           # Technical dossier with methodology, architecture & disclaimers
│   ├── Settings.tsx        # Analyst identity, clearance matrix & system engine diagnostics
│   ├── Login.tsx           # Supabase GoTrue authentication with 8-char validation & eye toggle
│   └── Register.tsx        # Profile registration with real-time password meter & confirmation view
│
├── hooks/                  # Custom React Hooks
│   └── useAuth.tsx         # Supabase authentication provider (signUp, signIn, signOut, user session)
│
├── lib/                    # Client Libraries & Helpers
│   ├── supabase.ts         # Initialized Supabase client with publishable API key
│   └── utils.ts            # Tailwind CSS class merging utility (`cn`)
│
├── services/               # Network & API Integration
│   └── api.ts              # Strongly typed Axios/Fetch client with Supabase Bearer token attachment
│
├── types/                  # Shared TypeScript Interfaces
│   └── index.ts            # Pydantic-mirrored models (User, Assessment, DashboardSummary, etc.)
│
├── App.tsx                 # Route configuration with React Router & TanStack Query
├── index.css               # Cyber design tokens, ambient themes & glassmorphism utilities
├── main.tsx                # React DOM entry point
└── vite-env.d.ts           # Vite client environment type declarations
```

---

## 2. Backend Directory Structure (`backend/`)

```
backend/
├── app/                    # Core FastAPI Application Code
│   ├── api/v1/             # API Route Handlers
│   │   ├── endpoints/      # Modular REST Endpoint Controllers
│   │   │   ├── admin.py    # User administration & clearance role delegation
│   │   │   ├── assessments.py # Assessment creation, history listing & CSV export
│   │   │   ├── auth.py     # Session checks and user identity resolution
│   │   │   ├── dashboard.py # Aggregate KPI statistics, trends & venue summaries
│   │   │   ├── reports.py  # Filtered reporting summaries & venue aggregations
│   │   │   └── resources.py # Dynamic illustrative resource allocation curves
│   │   └── router.py       # Central API v1 router mounting all endpoints
│   │
│   ├── core/               # Platform Core Infrastructure
│   │   ├── config.py       # Pydantic Settings loading environment variables & Supabase normalization
│   │   ├── deps.py         # Dual auth provider: verifies Supabase GoTrue tokens & syncs to local DB
│   │   └── security.py     # Direct raw bcrypt password hashing & JWT generation utilities
│   │
│   ├── db/                 # Database Layer
│   │   └── session.py      # SQLAlchemy 2.0 engine, declarative base & scoped SessionLocal
│   │
│   ├── ml/                 # Machine Learning Inference Engine
│   │   └── service.py      # Singleton loader for Random Forest pipeline (model.joblib)
│   │
│   ├── models/             # SQLAlchemy ORM Database Entities
│   │   └── models.py       # User, Assessment, and AuditLog relational models
│   │
│   ├── schemas/            # Pydantic v2 Input/Output Schemas
│   │   └── schemas.py      # Strict validation schemas for requests and responses
│   │
│   ├── services/           # Business Logic Services
│   │   └── resource_planning.py # Deterministic crowd-density ratio calculation service
│   │
│   └── main.py             # FastAPI entry point, static SPA mount & CORS configuration
│
├── alembic/                # Alembic database migration scripts
├── alembic.ini             # Alembic configuration
├── model.joblib            # Verified 180-tree Random Forest scikit-learn Pipeline
├── requirements.txt        # Pinned Python package dependencies
└── safeai_new.db           # Active SQLite database with thread-safe WAL mode enabled
```

---

## 3. Machine Learning & Datasets

* `dataset/demo_training_data.csv`: 1,200 synthetic public safety event records with 9 input features.
* `ml/training/train.py`: Full training script with ColumnTransformer (median imputation, standard scaling, one-hot encoding).
* `ml/evaluation/evaluate.py`: Diagnostic evaluation script calculating holdout classification metrics (accuracy, precision, recall, F1, ROC-AUC).
* `ml/model/model.joblib`: Serialized trained model archive.

---

## 4. How to Find & Import Components

Every major module includes an `index.ts` file so you can import components cleanly:

```typescript
// Import UI elements from one clean path:
import { Badge, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

// Import layout components:
import { AppLayout, Navbar, Sidebar } from '@/components/layout';

// Import pages:
import { Dashboard, RiskPrediction, Reports, Settings } from '@/pages';
```

