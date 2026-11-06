import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileSpreadsheet,
  AlertCircle,
  Building,
  Terminal,
  ShieldAlert,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { api } from '@/services/api';
import type { Assessment } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AssessmentHistory() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [page, setPage] = useState(1);
  const [venueSearch, setVenueSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['assessments', page, venueSearch, riskFilter, sortBy, sortOrder],
    queryFn: () =>
      api.listAssessments({
        page,
        per_page: 12,
        venue: venueSearch,
        risk_level: riskFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const handleExportCSV = async () => {
    try {
      const blob = await api.exportAssessments({
        venue: venueSearch,
        risk_level: riskFilter,
      });
      const url = window.URL.createObjectURL(blob as unknown as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safeai_assessments_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Assessment log exported to CSV');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">
              AUDIT // LEDGER
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display mt-1">
            Historical Assessments
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically logged public safety evaluations with complete parameter audit trails.
          </p>
        </div>
        <Button variant="cyber" size="sm" onClick={handleExportCSV}>
          <Download className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
          Export Ledger (CSV)
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="glass-card border-slate-800/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-cyan-400/70" />
              <input
                type="text"
                placeholder="Search venue or location..."
                value={venueSearch}
                onChange={(e) => {
                  setVenueSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
              />
            </div>

            {/* Risk Tier Select */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="">All Risk Tiers</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
                <option value="Critical">Critical Risk</option>
              </select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">
              Sort By:
            </span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [col, ord] = e.target.value.split('-');
                setSortBy(col);
                setSortOrder(ord);
              }}
              className="rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="created_at-desc">Latest Evaluations</option>
              <option value="created_at-asc">Oldest Evaluations</option>
              <option value="risk_score-desc">Highest Risk Score</option>
              <option value="risk_score-asc">Lowest Risk Score</option>
              <option value="crowd_size-desc">Largest Expected Crowd</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="glass-card border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800/80 bg-slate-950/60 font-mono text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Venue / Location</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Expected Crowd</th>
                <th className="px-4 py-3">Atmosphere</th>
                <th className="px-4 py-3">Classification</th>
                <th className="px-4 py-3">Index Score</th>
                <th className="px-4 py-3 text-right">Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-xs text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                      <span className="font-mono text-xs text-slate-400">Querying intelligence database...</span>
                    </div>
                  </td>
                </tr>
              ) : !data?.items?.length ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-xs text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-7 w-7 text-slate-600" />
                      <span className="font-semibold text-slate-300">No Assessment Records Found</span>
                      <p className="text-[11px] text-slate-500">
                        Adjust your search filters or initiate a new risk evaluation.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((item) => {
                  const isHighlighted = highlightId === String(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        isHighlighted
                          ? 'bg-cyan-950/30 border-l-2 border-cyan-400'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-[11px] text-cyan-400/90 font-semibold">
                        #{String(item.id).padStart(4, '0')}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {new Date(item.created_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-100 flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-500" />
                        <span>{item.venue}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="rounded bg-slate-800/70 px-2 py-0.5 text-[11px] font-mono border border-slate-700/60 text-slate-300">
                          {item.event_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {item.crowd_size.toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-500">
                          ({Math.round((item.crowd_size / item.venue_capacity) * 100)}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {item.weather},{' '}
                        <span className="font-mono text-slate-300">{item.temperature_c}°C</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            item.risk_level.toLowerCase() as
                              | 'low'
                              | 'medium'
                              | 'high'
                              | 'critical'
                          }
                        >
                          {item.risk_level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-100">
                            {item.risk_score}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">/100</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAssessment(item)}
                          className="hover:bg-cyan-950/40 hover:text-cyan-300 font-mono text-xs"
                          title="Inspect complete telemetry and resource allocation"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1 text-cyan-400" />
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/40 px-4 py-3">
            <span className="font-mono text-[11px] text-slate-400">
              PAGE <span className="text-cyan-400 font-bold">{data.page}</span> OF{' '}
              <span className="text-slate-300">{data.pages}</span> (
              <span className="text-cyan-400 font-bold">{data.total}</span> AUDITED ASSESSMENTS)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border-slate-800 text-slate-300 hover:border-cyan-500/50"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="border-slate-800 text-slate-300 hover:border-cyan-500/50"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-6 shadow-2xl shadow-cyan-950/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    RECORD TELEMETRY // #{String(selectedAssessment.id).padStart(4, '0')}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white font-display mt-0.5">
                  {selectedAssessment.venue}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Classification Banner */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div>
                  <span className="font-mono text-[10px] uppercase text-slate-400">
                    Validated Classification
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={
                        selectedAssessment.risk_level.toLowerCase() as
                          | 'low'
                          | 'medium'
                          | 'high'
                          | 'critical'
                      }
                      className="text-xs px-2.5 py-1"
                    >
                      {selectedAssessment.risk_level}
                    </Badge>
                    <span className="font-mono text-sm font-bold text-white">
                      Score: {selectedAssessment.risk_score}/100
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] uppercase text-slate-400">
                    Pipeline Confidence
                  </span>
                  <p className="font-mono text-base font-bold text-cyan-400 mt-0.5">
                    {selectedAssessment.confidence}%
                  </p>
                </div>
              </div>

              {/* Submitted Parameters Grid */}
              <div>
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Logged Operational Parameters
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-2 text-slate-300">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                    <span className="font-mono text-[10px] uppercase text-slate-500">Event Classification</span>
                    <p className="font-medium text-slate-200 mt-0.5">{selectedAssessment.event_type}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                    <span className="font-mono text-[10px] uppercase text-slate-500">Crowd / Design Capacity</span>
                    <p className="font-mono font-medium text-slate-200 mt-0.5">
                      {selectedAssessment.crowd_size.toLocaleString()} /{' '}
                      {selectedAssessment.venue_capacity.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                    <span className="font-mono text-[10px] uppercase text-slate-500">Atmosphere Conditions</span>
                    <p className="font-medium text-slate-200 mt-0.5">
                      {selectedAssessment.weather},{' '}
                      <span className="font-mono text-cyan-400">{selectedAssessment.temperature_c}°C</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                    <span className="font-mono text-[10px] uppercase text-slate-500">Temporal Schedule</span>
                    <p className="font-medium text-slate-200 mt-0.5">
                      {selectedAssessment.day_of_week}{' '}
                      <span className="text-slate-400">({selectedAssessment.time_slot})</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Illustrative Resource Allocations */}
              <div>
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Illustrative Resource Deployment Footprint
                </h4>
                <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-2.5">
                    <span className="font-mono text-[9px] uppercase font-bold text-cyan-400">
                      Security
                    </span>
                    <p className="font-mono text-lg font-bold text-white mt-0.5">
                      {selectedAssessment.security_personnel}
                    </p>
                  </div>
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-2.5">
                    <span className="font-mono text-[9px] uppercase font-bold text-indigo-400">
                      Police
                    </span>
                    <p className="font-mono text-lg font-bold text-white mt-0.5">
                      {selectedAssessment.police_units}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5">
                    <span className="font-mono text-[9px] uppercase font-bold text-emerald-400">
                      Medical
                    </span>
                    <p className="font-mono text-lg font-bold text-white mt-0.5">
                      {selectedAssessment.medical_teams}
                    </p>
                  </div>
                  <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-2.5">
                    <span className="font-mono text-[9px] uppercase font-bold text-purple-400">
                      Ambulance
                    </span>
                    <p className="font-mono text-lg font-bold text-white mt-0.5">
                      {selectedAssessment.ambulances}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedAssessment(null)}>
                  Dismiss Telemetry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
