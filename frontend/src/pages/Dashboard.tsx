import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Activity,
  Calendar,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Database,
  BrainCircuit,
  Sparkles,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RISK_GRADIENTS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444',
};

const CustomDonutTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const color = item.payload?.fill || RISK_GRADIENTS[item.name as keyof typeof RISK_GRADIENTS] || '#06b6d4';
    return (
      <div className="rounded-xl border border-cyan-500/40 bg-slate-900/95 px-3.5 py-2.5 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white/20" style={{ backgroundColor: color }} />
          <span className="font-display font-bold text-white text-xs">{item.name} Risk</span>
        </div>
        <div className="mt-1 font-mono text-[11px] text-slate-300 flex items-center justify-between gap-4">
          <span>Evaluations:</span>
          <span className="font-bold text-cyan-400">{item.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const [days, setDays] = useState(30);

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: api.dashboardSummary,
  });

  const {
    data: trends,
    isLoading: trendsLoading,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ['dashboardTrends', days],
    queryFn: () => api.dashboardTrends(days),
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchTrends();
  };

  const pieData = trends?.risk_distribution
    ? Object.entries(trends.risk_distribution).map(([name, value]) => ({ name, value }))
    : [];
  const activePieData = pieData.filter((x) => x.value > 0);

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
              OPERATIONAL COMMAND CONSOLE
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Public Safety <span className="gradient-text-cyber">Intelligence</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Real-time multi-variable threat modeling, crowd density forecasts, and emergency resource allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="appearance-none rounded-xl border border-slate-200/80 bg-white/80 py-2 pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 cursor-pointer"
            >
              <option value={7}>Window: 7 Days</option>
              <option value={14}>Window: 14 Days</option>
              <option value={30}>Window: 30 Days</option>
              <option value={90}>Window: 90 Days</option>
            </select>
          </div>

          <Button variant="secondary" size="sm" onClick={handleRefresh} title="Sync database telemetry">
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sync</span>
          </Button>

          <Link to="/predict">
            <Button size="sm" variant="cyber">
              <ShieldAlert className="h-4 w-4 mr-1.5" />
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid with Amazing Luminous Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Assessments */}
        <Card glow="cyan" className="group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TOTAL EVALUATIONS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {summaryLoading ? '—' : summary?.total_assessments ?? 0}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Persisted database records</span>
            </div>
          </div>
        </Card>

        {/* High / Critical Alerts */}
        <Card glow="rose" className="group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ELEVATED / CRITICAL
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 group-hover:bg-rose-500/20 transition-colors">
              <Flame className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              {summaryLoading
                ? '—'
                : (summary?.high_risk ?? 0) + (summary?.critical_risk ?? 0)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>{summary?.critical_risk ?? 0} critical tier alerts</span>
            </div>
          </div>
        </Card>

        {/* Holdout Accuracy */}
        <Card glow="emerald" className="group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              MODEL HOLDOUT ACCURACY
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
              <BrainCircuit className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {summaryLoading ? '—' : `${summary?.model_accuracy ?? 62.9}%`}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Stratified test split</span>
            </div>
          </div>
        </Card>

        {/* Training Dataset Baseline */}
        <Card glow="amber" className="group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TRAINED BASELINE
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <Database className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {summaryLoading ? '—' : `${(summary?.model_training_rows ?? 1200).toLocaleString()}`}
              <span className="text-sm font-normal text-slate-400 ml-1">rows</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>Random Forest (180 trees)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Trend Area / Bar Chart */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Assessment Volume & Risk Evolution</CardTitle>
                <CardDescription>Daily evaluated event counts across risk categories</CardDescription>
              </div>
              <Badge variant="cyber" dot>
                REALTIME TRENDS
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="flex h-72 items-center justify-center text-xs font-mono text-slate-400">
                PROCESSING TELEMETRY...
              </div>
            ) : !trends?.trends?.length ? (
              <div className="flex h-72 flex-col items-center justify-center gap-3 text-center text-xs text-slate-400">
                <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                <p>No assessment trends recorded in this time range.</p>
                <Link to="/predict">
                  <Button size="sm" variant="outline">
                    Run New Evaluation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends.trends}>
                    <defs>
                      <linearGradient id="cyberCyan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="cyberAmber" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="cyberRose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#e11d48" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={{ stroke: '#334155', opacity: 0.2 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={{ stroke: '#334155', opacity: 0.2 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(6, 182, 212, 0.3)',
                        borderRadius: '0.75rem',
                        backdropFilter: 'blur(12px)',
                        color: '#f8fafc',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                      }}
                    />
                    <Bar dataKey="count" name="Total Events" fill="url(#cyberCyan)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="high" name="High Risk" fill="url(#cyberAmber)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="critical" name="Critical Risk" fill="url(#cyberRose)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Distribution Donut */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Risk Distribution</CardTitle>
            <CardDescription>Proportional class breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="flex h-72 items-center justify-center text-xs font-mono text-slate-400">
                LOADING...
              </div>
            ) : activePieData.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center text-xs text-slate-400">
                No assessments to classify.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={activePieData.length > 1 ? 4 : 0}
                    >
                      {activePieData.map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={RISK_GRADIENTS[entry.name as keyof typeof RISK_GRADIENTS] || '#94a3b8'}
                          stroke="rgba(0,0,0,0.3)"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomDonutTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      formatter={(value, entry: any) => (
                        <span className="font-mono text-[11px] text-slate-300 ml-1">
                          {value}: <span className="font-bold text-white">{entry.payload?.value ?? 0}</span>
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Risk Evaluations</CardTitle>
            <CardDescription>Latest telemetry and allocations logged to the database</CardDescription>
          </div>
          <Link
            to="/history"
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 transition-colors"
          >
            <span>View Complete Log</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {!trends?.recent_assessments?.length ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No assessments recorded yet. Run your first prediction.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-800/80 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <th className="pb-3.5 pl-2">Location / Venue</th>
                    <th className="pb-3.5">Event Type</th>
                    <th className="pb-3.5">Attendees</th>
                    <th className="pb-3.5">Weather Condition</th>
                    <th className="pb-3.5">Assigned Risk</th>
                    <th className="pb-3.5">Risk Score</th>
                    <th className="pb-3.5 pr-2 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {trends.recent_assessments.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-slate-500/5 transition-colors group"
                    >
                      <td className="py-3.5 pl-2 font-semibold text-slate-900 dark:text-slate-100">
                        {a.venue}
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400">{a.event_type}</td>
                      <td className="py-3.5 font-mono text-slate-600 dark:text-slate-300">
                        {a.crowd_size.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400">{a.weather}</td>
                      <td className="py-3.5">
                        <Badge
                          variant={
                            a.risk_level.toLowerCase() as
                              | 'low'
                              | 'medium'
                              | 'high'
                              | 'critical'
                          }
                          dot
                        >
                          {a.risk_level.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {a.risk_score}{' '}
                        <span className="text-[10px] font-normal text-slate-400">/ 100</span>
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <Link
                          to={`/history?highlight=${a.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 text-xs transition-colors"
                        >
                          Details
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
