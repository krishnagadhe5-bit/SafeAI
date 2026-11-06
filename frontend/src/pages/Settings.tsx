import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Key,
  Users,
  Database,
  Cpu,
  CheckCircle,
  XCircle,
  AlertCircle,
  Terminal,
  Activity,
  Layers,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Admin user list query (only fetched if user is admin)
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: api.listUsers,
    enabled: user?.role === 'admin',
  });

  // Admin toggle role mutation
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      api.updateUserRole(id, role),
    onSuccess: (data) => {
      toast.success(data.message || 'User role updated');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update role');
    },
  });

  // Admin toggle status mutation
  const statusMutation = useMutation({
    mutationFn: (id: number) => api.toggleUserStatus(id),
    onSuccess: (data) => {
      toast.success(data.message || 'User status updated');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to toggle status');
    },
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">
            SECURITY // GOVERNANCE
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display mt-1">
          System Settings & Access Control
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage user credentials, review account authorization roles, and inspect platform diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="glass-card border-slate-800/80 p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Analyst Identity</h2>
              <p className="text-[11px] text-slate-400">Active authenticated session</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-mono font-bold text-lg shadow-glow-cyan">
                {user?.full_name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-bold text-white font-display text-sm">{user?.full_name}</p>
                <p className="font-mono text-[11px] text-cyan-400">{user?.email}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-800 font-mono text-xs">
              <div className="flex justify-between py-2.5">
                <span className="text-slate-400 uppercase text-[10px]">Access Clearance</span>
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                  {user?.role?.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-400 uppercase text-[10px]">Account State</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  VERIFIED
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-400 uppercase text-[10px]">Session Provider</span>
                <span className="text-slate-200">Supabase IAM</span>
              </div>
            </div>
          </div>
        </Card>

        {/* System Diagnostics & Config */}
        <Card className="glass-card border-slate-800/80 p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">System Telemetry & Architecture</h2>
              <p className="text-[11px] text-slate-400">Underlying engines, security modules, and databases</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">
              <span className="font-mono text-[10px] uppercase font-bold text-cyan-400">
                Database Engine
              </span>
              <p className="mt-1 font-semibold text-white font-display">
                SQLite (Dev Fallback) / PostgreSQL Ready
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                Thread-safe WAL mode enabled; Alembic migrations active
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">
              <span className="font-mono text-[10px] uppercase font-bold text-indigo-400">
                ML Pipeline Engine
              </span>
              <p className="mt-1 font-semibold text-white font-display">
                scikit-learn Random Forest (180 Trees)
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                Continuous Risk Score Index (0–100) calibration
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">
              <span className="font-mono text-[10px] uppercase font-bold text-emerald-400">
                Security Architecture
              </span>
              <p className="mt-1 font-semibold text-white font-display">
                Supabase IAM & GoTrue Verification
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                Direct Supabase GoTrue Auth token resolution & auto-sync
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">
              <span className="font-mono text-[10px] uppercase font-bold text-purple-400">
                API Gateway Engine
              </span>
              <p className="mt-1 font-semibold text-white font-display">
                FastAPI 0.110+ on Python 3.11
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                Async high-throughput JSON endpoint router
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin User Management Section (visible to admins) */}
      {user?.role === 'admin' && (
        <Card className="glass-card border-slate-800/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-display">
                  Platform User Directory & Role Delegation
                </h2>
                <p className="text-xs text-slate-400">
                  Manage clearance levels and activation state for platform personnel
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] text-cyan-400 border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 rounded-full">
              ADMIN CONTROL PANEL
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Clearance Role</th>
                  <th className="pb-3">Account State</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersLoading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Querying user registry...
                    </td>
                  </tr>
                ) : !users?.length ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No additional users registered.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3">
                        <div className="font-semibold text-white font-sans">{u.full_name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            roleMutation.mutate({ id: u.id, role: e.target.value })
                          }
                          disabled={u.id === user.id}
                          className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none disabled:opacity-50"
                        >
                          <option value="analyst">Analyst</option>
                          <option value="planner">Planner</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td className="py-3">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 text-[11px]">
                            <XCircle className="h-3 w-3" />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={u.id === user.id}
                          onClick={() => statusMutation.mutate(u.id)}
                          className="text-[11px] border-slate-700 hover:border-cyan-400"
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
