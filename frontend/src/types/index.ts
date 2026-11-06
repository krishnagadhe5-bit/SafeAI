/* ── Shared types matching backend Pydantic schemas ── */

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'analyst';
  is_active: boolean;
  supabase_uid?: string | null;
  created_at: string;
}

export interface Assessment {
  id: number;
  created_at: string;
  venue: string;
  event_type: string;
  crowd_size: number;
  venue_capacity: number;
  weather: string;
  temperature_c: number;
  previous_incidents: number;
  holiday: number;
  time_slot: string;
  day_of_week: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  risk_score: number;
  confidence: number | null;
  model_version: string | null;
  security_personnel: number | null;
  police_units: number | null;
  medical_teams: number | null;
  ambulances: number | null;
  user_id: number | null;
}

export interface AssessmentListResponse {
  items: Assessment[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface DashboardSummary {
  total_assessments: number;
  high_risk: number;
  critical_risk: number;
  low_risk: number;
  medium_risk: number;
  model_accuracy: number;
  model_training_rows: number;
  model_classes: string[];
}

export interface TrendPoint {
  date: string;
  count: number;
  high: number;
  critical: number;
}

export interface DashboardTrends {
  trends: TrendPoint[];
  risk_distribution: Record<string, number>;
  recent_assessments: Assessment[];
  venue_summary: { venue: string; count: number; avg_score: number }[];
}

export interface ResourceEstimate {
  security_personnel: number;
  police_units: number;
  medical_teams: number;
  ambulances: number;
}

export interface ResourcePlanResult {
  risk_level: string;
  crowd_size: number;
  venue_capacity: number;
  resources: ResourceEstimate;
  multiplier: number;
  methodology: string;
  disclaimer: string;
}

export interface ReportSummary {
  total: number;
  by_risk: Record<string, number>;
  by_venue: { venue: string; count: number; avg_score: number }[];
  by_event_type: Record<string, number>;
  date_range: { from: string | null; to: string | null };
}

export interface AssessmentCreateInput {
  venue: string;
  event_type: string;
  crowd_size: number;
  venue_capacity: number;
  weather: string;
  temperature_c: number;
  previous_incidents: number;
  holiday: boolean;
  time_slot: string;
  day_of_week: string;
}

