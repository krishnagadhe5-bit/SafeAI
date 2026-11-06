/* ── API service — all HTTP calls to the backend ── */

import type {
  User,
  Assessment,
  AssessmentListResponse,
  AssessmentCreateInput,
  DashboardSummary,
  DashboardTrends,
  ResourcePlanResult,
  ReportSummary,
} from '@/types';
import { getSupabaseAccessToken } from '@/lib/supabase';

const BASE = '/api/v1';

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  // Retrieve current Supabase access token if available
  const token = await getSupabaseAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${url}`, {
    credentials: 'include',
    ...opts,
    headers,
  });

  if (res.status === 401) {
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired or not authenticated');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }

  // Handle CSV/blob responses
  if (res.headers.get('content-type')?.includes('text/csv')) {
    return (await res.blob()) as unknown as T;
  }
  return res.json();
}

export const api = {
  /* ── Auth ── */
  me: () => request<User>('/auth/me'),

  /* ── Health ── */
  health: () => request<{ status: string; service: string; version: string }>('/health'),

  /* ── Dashboard ── */
  dashboardSummary: () => request<DashboardSummary>('/dashboard/summary'),
  dashboardTrends: (days = 30) => request<DashboardTrends>(`/dashboard/trends?days=${days}`),

  /* ── Assessments ── */
  createAssessment: (data: AssessmentCreateInput) =>
    request<Assessment>('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listAssessments: (params: Record<string, string | number>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v));
    });
    return request<AssessmentListResponse>(`/assessments?${qs}`);
  },

  getAssessment: (id: number) => request<Assessment>(`/assessments/${id}`),

  getAssessmentResources: (id: number) =>
    request<{ assessment_id: number; resources: Record<string, number>; methodology: string; disclaimer: string }>(
      `/assessments/${id}/resources`
    ),

  exportAssessments: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params);
    return request<Blob>(`/assessments/export?${qs}`);
  },

  /* ── Resource Planning ── */
  calculateResources: (risk_level: string, crowd_size: number, venue_capacity: number) =>
    request<ResourcePlanResult>('/resource-plans', {
      method: 'POST',
      body: JSON.stringify({ risk_level, crowd_size, venue_capacity }),
    }),

  /* ── Reports ── */
  reportSummary: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params);
    return request<ReportSummary>(`/reports/summary?${qs}`);
  },

  /* ── Admin ── */
  listUsers: () => request<User[]>('/admin/users'),
  updateUserRole: (userId: number, role: string) =>
    request<{ message: string }>(`/admin/users/${userId}/role?role=${role}`, { method: 'PATCH' }),
  toggleUserStatus: (userId: number) =>
    request<{ message: string }>(`/admin/users/${userId}/status`, { method: 'PATCH' }),
};
