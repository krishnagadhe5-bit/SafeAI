import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileBarChart,
  Printer,
  Download,
  Filter,
  Calendar,
  Building,
  AlertCircle,
  PieChart as PieIcon,
  Activity,
  Layers,
  ShieldAlert,
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
import toast from 'react-hot-toast';

const RISK_COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#f43f5e',
};

// Custom glowing tooltip for charts with clear high-contrast white text
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const color = item.payload?.fill || RISK_COLORS[item.name as keyof typeof RISK_COLORS] || '#06b6d4';
    return (
      <div className="rounded-xl border border-cyan-500/40 bg-slate-900/95 px-3.5 py-2.5 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white/20" style={{ backgroundColor: color }} />
          <span className="font-display font-bold text-white text-xs">{item.name} Tier</span>
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

export function Reports() {
  const [venueFilter, setVenueFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reportSummary', venueFilter, dateFrom, dateTo],
    queryFn: () =>
      api.reportSummary({
        venue: venueFilter,
        date_from: dateFrom,
        date_to: dateTo,
      }),
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = async () => {
    try {
      const blob = await api.exportAssessments({
        venue: venueFilter,
      });
      const url = window.URL.createObjectURL(blob as unknown as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safeai_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Report data exported to CSV');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const riskPieData = data?.by_risk
    ? Object.entries(data.by_risk).map(([name, value]) => ({ name, value }))
    : [];

  const activeRiskPieData = riskPieData.filter((item) => item.value > 0);

  const eventTypeData = data?.by_event_type
    ? Object.entries(data.by_event_type).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header & Print/Export Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">
              INTELLIGENCE // SYNTHESIS
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display mt-1">
            Operational Intelligence Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprehensive audit reports, risk distributions, and resource utilization summaries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="border-slate-800 text-slate-300">
            <Printer className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
            Print Report
          </Button>
          <Button variant="cyber" size="sm" onClick={handleExportCSV}>
            <Download className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
            Export Raw CSV
          </Button>
        </div>
      </div>

      {/* Filter Toolbar (Hidden on print) */}
      <Card className="glass-card border-slate-800/80 p-4 print:hidden">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              Filter by Venue
            </label>
            <input
              type="text"
              placeholder="e.g. Arena"
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="glass-card border-slate-800/80 p-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Evaluations
          </span>
          <p className="mt-2 font-mono text-3xl font-extrabold text-white">
            {isLoading ? '...' : data?.total ?? 0}
          </p>
          <span className="font-mono text-[10px] text-cyan-400/80">Archived assessments</span>
        </Card>
        <Card className="glass-card border-rose-500/30 shadow-glow-rose p-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-400">
            Critical Alerts
          </span>
          <p className="mt-2 font-mono text-3xl font-extrabold text-rose-400">
            {isLoading ? '...' : data?.by_risk?.Critical ?? 0}
          </p>
          <span className="font-mono text-[10px] text-rose-400/80">Immediate attention</span>
        </Card>
        <Card className="glass-card border-orange-500/30 p-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-orange-400">
            High Risk Alerts
          </span>
          <p className="mt-2 font-mono text-3xl font-extrabold text-orange-400">
            {isLoading ? '...' : data?.by_risk?.High ?? 0}
          </p>
          <span className="font-mono text-[10px] text-orange-400/80">Elevated vigilance</span>
        </Card>
        <Card className="glass-card border-cyan-500/30 p-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Audited Venues
          </span>
          <p className="mt-2 font-mono text-3xl font-extrabold text-cyan-400">
            {isLoading ? '...' : data?.by_venue?.length ?? 0}
          </p>
          <span className="font-mono text-[10px] text-cyan-400/80">Distinct locations</span>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:grid-cols-2">
        {/* Risk Tier Distribution */}
        <Card className="glass-card border-slate-800/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-cyan-400" />
              <CardTitle className="text-base">Risk Distribution Breakdown</CardTitle>
            </div>
            <CardDescription className="text-xs">Classification volume across historical assessments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-60 items-center justify-center font-mono text-xs text-slate-400">
                Loading...
              </div>
            ) : !data?.total ? (
              <div className="flex h-60 items-center justify-center font-mono text-xs text-slate-400">
                No telemetry available for active filter.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeRiskPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={activeRiskPieData.length > 1 ? 4 : 0}
                      stroke="rgba(0,0,0,0.4)"
                      strokeWidth={2}
                      label={
                        activeRiskPieData.length > 1
                          ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`
                          : false
                      }
                      labelLine={activeRiskPieData.length > 1}
                    >
                      {activeRiskPieData.map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS] || '#06b6d4'}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
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

        {/* Event Type Breakdown */}
        <Card className="glass-card border-slate-800/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <CardTitle className="text-base">Assessments by Event Classification</CardTitle>
            </div>
            <CardDescription className="text-xs">Volume distribution across event categories</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-60 items-center justify-center font-mono text-xs text-slate-400">
                Loading...
              </div>
            ) : !eventTypeData.length ? (
              <div className="flex h-60 items-center justify-center font-mono text-xs text-slate-400">
                No events recorded.
              </div>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={110}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        borderColor: '#1e293b',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar dataKey="count" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Venues Summary Table */}
      <Card className="glass-card border-slate-800/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-base">Venue Assessment Aggregation</CardTitle>
          </div>
          <CardDescription className="text-xs">Cross-venue risk averages and evaluation frequencies</CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.by_venue?.length ? (
            <div className="py-8 text-center font-mono text-xs text-slate-400">
              No venue assessments recorded in ledger.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-[10px] uppercase text-slate-400">
                    <th className="pb-3">Venue / Facility</th>
                    <th className="pb-3">Evaluations</th>
                    <th className="pb-3">Mean Risk Score</th>
                    <th className="pb-3">Predominant Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {data.by_venue.map((v) => (
                    <tr key={v.venue} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-semibold text-slate-100 font-sans">
                        {v.venue}
                      </td>
                      <td className="py-3 text-cyan-400 font-bold">{v.count}</td>
                      <td className="py-3 font-bold text-white">
                        {v.avg_score} <span className="text-slate-500 text-[10px]">/ 100</span>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            v.avg_score < 40
                              ? 'low'
                              : v.avg_score < 60
                              ? 'medium'
                              : v.avg_score < 80
                              ? 'high'
                              : 'critical'
                          }
                        >
                          {v.avg_score < 40
                            ? 'Low'
                            : v.avg_score < 60
                            ? 'Medium'
                            : v.avg_score < 80
                            ? 'High'
                            : 'Critical'}
                        </Badge>
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
