import React from 'react';
import {
  Shield,
  Layers,
  BrainCircuit,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  BookOpen,
  Terminal,
  Activity,
  Binary,
  Radio,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function About() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">
            DOSSIER // ARCHITECTURE
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display mt-1">
          About SafeAI Public Safety Intelligence Platform
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Architecture, methodology, dataset characteristics, and operational boundaries of the SafeAI decision-support system.
        </p>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 text-xs text-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-300 font-display text-sm">
              Academic Decision-Support Prototype Notice
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-200/80">
              SafeAI is engineered as an educational research prototype exploring machine-learning assisted risk prediction and illustrative resource allocation.
              The baseline training data is <strong>synthetic</strong>. Reported accuracy measures holdout performance against synthetic mathematical rules,
              <strong> not real-world public safety operations</strong>. This platform does not dispatch emergency services and must never replace certified human judgment or official municipal safety mandates.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Project Objective */}
        <Card className="glass-card border-slate-800/80 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">System Purpose & Problem Scope</h2>
              <p className="text-[11px] text-slate-400">Predict earlier. Plan smarter. Respond better.</p>
            </div>
          </div>
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              Large-scale public gatherings, sports tournaments, and concerts present complex risk profiles driven by intersecting variables: crowd density, venue ingress/egress ratios, adverse weather conditions, seasonal holidays, and localized incident history.
            </p>
            <p>
              SafeAI explores how modern machine-learning classification and structured tabular preprocessing can assist safety analysts by synthesizing these multi-dimensional factors into an interpretable risk index and illustrative resource deployment curves.
            </p>
          </div>
        </Card>

        {/* Technology Stack */}
        <Card className="glass-card border-slate-800/80 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Technology Architecture</h2>
              <p className="text-[11px] text-slate-400">Modern full-stack decoupled architecture</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
              <span className="font-mono text-[10px] uppercase font-bold text-cyan-400">Frontend Client</span>
              <ul className="mt-1.5 space-y-1 font-mono text-[11px] text-slate-300">
                <li>• React 18 & TypeScript</li>
                <li>• Vite Build Pipeline</li>
                <li>• Tailwind CSS & Cyber Tokens</li>
                <li>• TanStack Query v5</li>
                <li>• Recharts Data Engine</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
              <span className="font-mono text-[10px] uppercase font-bold text-indigo-400">Backend API</span>
              <ul className="mt-1.5 space-y-1 font-mono text-[11px] text-slate-300">
                <li>• Python 3.11 & FastAPI</li>
                <li>• Uvicorn ASGI Server</li>
                <li>• Supabase GoTrue Auth API</li>
                <li>• SQLAlchemy 2.0 ORM</li>
                <li>• scikit-learn Pipeline</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Machine Learning Pipeline Details */}
      <Card className="glass-card border-slate-800/80 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-xl bg-teal-500/10 p-2 text-teal-400 border border-teal-500/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display">
              Machine Learning Pipeline Methodology
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic tabular preprocessing and 180-tree ensemble classification
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            The inference engine loads the verified scikit-learn Pipeline (<code className="text-cyan-400 font-mono">model.joblib</code>) with strict segregation between numerical scaling and categorical one-hot encoding:
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-cyan-500/20 bg-slate-950/60 p-4">
              <span className="font-mono text-[10px] font-bold uppercase text-cyan-400">
                1. Numeric Sub-Pipeline
              </span>
              <p className="mt-1 text-[11px] text-slate-400">
                Features: crowd size, venue capacity, temperature (°C), holiday flag, previous incidents.
              </p>
              <div className="mt-2.5 font-mono text-[10px] text-cyan-300 bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/20">
                SimpleImputer(median) → StandardScaler()
              </div>
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-slate-950/60 p-4">
              <span className="font-mono text-[10px] font-bold uppercase text-indigo-400">
                2. Categorical Sub-Pipeline
              </span>
              <p className="mt-1 text-[11px] text-slate-400">
                Features: weather condition, time slot, day of week, event category.
              </p>
              <div className="mt-2.5 font-mono text-[10px] text-indigo-300 bg-indigo-950/40 p-2 rounded-lg border border-indigo-500/20">
                SimpleImputer(most_frequent) → OneHotEncoder()
              </div>
            </div>

            <div className="rounded-xl border border-purple-500/20 bg-slate-950/60 p-4">
              <span className="font-mono text-[10px] font-bold uppercase text-purple-400">
                3. Ensemble Classifier
              </span>
              <p className="mt-1 text-[11px] text-slate-400">
                RandomForestClassifier with 180 decision trees, max depth 14, balanced weights.
              </p>
              <div className="mt-2.5 font-mono text-[10px] text-purple-300 bg-purple-950/40 p-2 rounded-lg border border-purple-500/20">
                RandomForestClassifier(n_estimators=180)
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 mt-2">
            <h4 className="font-mono text-[11px] font-bold uppercase text-slate-200">
              Continuous Risk Score Index Calculation (0 - 100)
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Rather than presenting a raw uncalibrated probability, SafeAI computes a composite Risk Score Index between 0 and 100 by calculating the dot product of the ensemble's class probabilities with assigned class anchor scores:
            </p>
            <div className="mt-2 rounded-lg bg-slate-900/90 p-3 font-mono text-[11px] text-cyan-300 border border-slate-800">
              score = round( ∑ [ P(class_i) × anchor_score(class_i) ] )
            </div>
            <p className="mt-2 font-mono text-[10px] text-slate-500">
              Anchor Values: Low = 20, Medium = 50, High = 70, Critical = 90. Thresholds: Low (&lt;40), Medium (40-59), High (60-79), Critical (≥80).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
