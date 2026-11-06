import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Shield,
  Truck,
  HeartPulse,
  Sliders,
  AlertTriangle,
  Info,
  CheckCircle2,
  Cpu,
  Calculator,
  Compass,
  Radio,
} from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ResourcePlanning() {
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [crowdSize, setCrowdSize] = useState<number>(10000);
  const [venueCapacity, setVenueCapacity] = useState<number>(12000);

  const { data: plan, isLoading } = useQuery({
    queryKey: ['resourcePlan', riskLevel, crowdSize, venueCapacity],
    queryFn: () => api.calculateResources(riskLevel, crowdSize, venueCapacity),
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">
            SIMULATOR // LOGISTICS
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display mt-1">
          Tactical Resource Planning Simulator
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Simulate illustrative personnel and vehicle allocation models across dynamic crowd density curves.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-300 font-display">
            Decision-Support Simulation Notice
          </h4>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-200/80">
            Calculated allocations reflect established crowd-density planning divisors. This platform is a simulation framework for public safety strategists and does not interface directly with 911 dispatch or automatic CAD networks. All operational decisions require authorized supervisory sign-off.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Simulator Controls */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="glass-card border-slate-800/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-400 border border-cyan-500/20">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Operational Controls</CardTitle>
                  <CardDescription className="text-xs">Adjust volume and tier to recalculate curves</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Risk Level Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 font-display">
                  Target Risk Tier
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map((level) => {
                    const isSelected = riskLevel === level;
                    const tierColors = {
                      Low: isSelected ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-glow-emerald' : 'text-slate-400',
                      Medium: isSelected ? 'border-amber-500 bg-amber-950/40 text-amber-300 shadow-glow-amber' : 'text-slate-400',
                      High: isSelected ? 'border-orange-500 bg-orange-950/40 text-orange-300 shadow-glow-orange' : 'text-slate-400',
                      Critical: isSelected ? 'border-rose-500 bg-rose-950/40 text-rose-300 shadow-glow-rose' : 'text-slate-400',
                    };

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setRiskLevel(level)}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all border-slate-800 bg-slate-900/60 ${tierColors[level]}`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Crowd Slider & Input */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300 font-display">
                  <span>Projected Attendance</span>
                  <span className="font-mono text-cyan-400 font-bold text-sm">
                    {crowdSize.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="50000"
                  step="500"
                  value={crowdSize}
                  onChange={(e) => setCrowdSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                />
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>200</span>
                  <span>25,000</span>
                  <span>50,000+</span>
                </div>
              </div>

              {/* Venue Capacity */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-display">
                  Facility Capacity
                </label>
                <input
                  type="number"
                  min="500"
                  value={venueCapacity}
                  onChange={(e) => setVenueCapacity(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 font-mono text-xs text-white shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                />
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  Tactical Presets:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setCrowdSize(1200);
                      setVenueCapacity(1500);
                      setRiskLevel('Low');
                    }}
                    className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                  >
                    Community Theater (1.2k)
                  </button>
                  <button
                    onClick={() => {
                      setCrowdSize(12000);
                      setVenueCapacity(15000);
                      setRiskLevel('High');
                    }}
                    className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                  >
                    Arena Concert (12k)
                  </button>
                  <button
                    onClick={() => {
                      setCrowdSize(35000);
                      setVenueCapacity(40000);
                      setRiskLevel('Critical');
                    }}
                    className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:border-rose-500/40 hover:text-rose-300 transition-colors"
                  >
                    City Carnival (35k)
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Security Card */}
            <Card className="glass-card border-cyan-500/30 shadow-glow-cyan p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Security Officers
                </span>
                <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-400 border border-cyan-500/30">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-mono text-4xl font-extrabold text-white">
                  {isLoading ? '...' : plan?.resources.security_personnel}
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  Perimeter & egress management personnel
                </p>
                <div className="mt-3 font-mono text-[10px] text-cyan-400/80 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                  1 per 500 attendees × {plan?.multiplier}x risk multiplier
                </div>
              </div>
            </Card>

            {/* Police Units Card */}
            <Card className="glass-card border-indigo-500/30 shadow-glow-indigo p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Police Units
                </span>
                <div className="rounded-xl bg-indigo-500/15 p-2 text-indigo-400 border border-indigo-500/30">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-mono text-4xl font-extrabold text-white">
                  {isLoading ? '...' : plan?.resources.police_units}
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  Public order & municipal traffic squads
                </p>
                <div className="mt-3 font-mono text-[10px] text-indigo-400/80 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  1 per 1,800 attendees × {plan?.multiplier}x risk multiplier
                </div>
              </div>
            </Card>

            {/* Medical Teams Card */}
            <Card className="glass-card border-emerald-500/30 shadow-glow-emerald p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Medical Teams
                </span>
                <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-400 border border-emerald-500/30">
                  <HeartPulse className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-mono text-4xl font-extrabold text-white">
                  {isLoading ? '...' : plan?.resources.medical_teams}
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  On-site triage & emergency first responders
                </p>
                <div className="mt-3 font-mono text-[10px] text-emerald-400/80 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  1 per 3,500 attendees × {plan?.multiplier}x risk multiplier
                </div>
              </div>
            </Card>

            {/* Ambulances Card */}
            <Card className="glass-card border-purple-500/30 shadow-glow-purple p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Ambulance Vehicles
                </span>
                <div className="rounded-xl bg-purple-500/15 p-2 text-purple-400 border border-purple-500/30">
                  <Truck className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-mono text-4xl font-extrabold text-white">
                  {isLoading ? '...' : plan?.resources.ambulances}
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  Dedicated critical patient transport units
                </p>
                <div className="mt-3 font-mono text-[10px] text-purple-400/80 bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  1 per 5,000 attendees × {plan?.multiplier}x risk multiplier
                </div>
              </div>
            </Card>
          </div>

          {/* Planning Model Formula Documentation */}
          <Card className="glass-card border-slate-800/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-cyan-400" />
                <CardTitle className="text-sm">Algorithmic Formulation Specification</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Transparent deterministic calculation method implemented in backend services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-300">
              <div className="rounded-xl bg-slate-950/80 p-3.5 font-mono text-[11px] text-cyan-300 border border-cyan-500/20 shadow-inner">
                units = max(minimum_bound, round((crowd_size / threshold_divisor) × risk_multiplier))
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                  <span className="font-mono font-bold uppercase text-slate-400 text-[10px]">
                    Risk Tier Scaling Coefficients:
                  </span>
                  <ul className="mt-1.5 space-y-1 font-mono text-slate-300 text-[11px]">
                    <li>• Low Risk: <span className="text-emerald-400 font-bold">0.65x</span></li>
                    <li>• Medium Risk: <span className="text-amber-400 font-bold">0.85x</span></li>
                    <li>• High Risk: <span className="text-orange-400 font-bold">1.15x</span></li>
                    <li>• Critical Risk: <span className="text-rose-400 font-bold">1.40x</span></li>
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                  <span className="font-mono font-bold uppercase text-slate-400 text-[10px]">
                    Baseline Population Divisors:
                  </span>
                  <ul className="mt-1.5 space-y-1 font-mono text-slate-300 text-[11px]">
                    <li>• Security: <span className="text-cyan-400 font-bold">1 / 500</span></li>
                    <li>• Police: <span className="text-indigo-400 font-bold">1 / 1,800</span></li>
                    <li>• Medical: <span className="text-emerald-400 font-bold">1 / 3,500</span></li>
                    <li>• Ambulance: <span className="text-purple-400 font-bold">1 / 5,000</span></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
