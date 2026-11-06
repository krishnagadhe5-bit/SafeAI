import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShieldAlert,
  Users,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Info,
  Calendar,
  Thermometer,
  CloudSun,
  Building,
  Radio,
  FileText,
  Sparkles,
  Zap,
  ArrowRight,
  Shield,
  Truck,
  HeartPulse,
} from 'lucide-react';
import { api } from '@/services/api';
import type { Assessment, AssessmentCreateInput } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const schema = z
  .object({
    venue: z.string().min(2, 'Venue name is required').max(100),
    event_type: z.enum([
      'Normal Operations',
      'Sports Event',
      'Concert',
      'Festival',
      'Public Gathering',
    ]),
    crowd_size: z.coerce.number().int().min(0, 'Crowd size must be 0 or greater'),
    venue_capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
    weather: z.enum(['Clear', 'Cloudy', 'Rain', 'Heavy Rain', 'Extreme Heat']),
    temperature_c: z.coerce.number().min(-50).max(60, 'Temperature must be between -50°C and 60°C'),
    previous_incidents: z.coerce.number().int().min(0, 'Incidents must be non-negative'),
    holiday: z.string().transform((v) => v === 'true'),
    time_slot: z.enum(['Morning', 'Afternoon', 'Evening', 'Night']),
    day_of_week: z.enum([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]),
  })
  .refine((data) => data.crowd_size <= data.venue_capacity * 2.5, {
    message: 'Crowd size exceeds 250% of venue capacity; please verify numbers.',
    path: ['crowd_size'],
  });

type FormValues = z.infer<typeof schema>;

export function RiskPrediction() {
  const [result, setResult] = useState<Assessment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      venue: 'Metropolitan Arena',
      event_type: 'Concert',
      crowd_size: 14500,
      venue_capacity: 18000,
      weather: 'Cloudy',
      temperature_c: 24,
      previous_incidents: 2,
      holiday: 'false',
      time_slot: 'Evening',
      day_of_week: 'Saturday',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const payload: AssessmentCreateInput = {
        venue: data.venue,
        event_type: data.event_type,
        crowd_size: data.crowd_size,
        venue_capacity: data.venue_capacity,
        weather: data.weather,
        temperature_c: data.temperature_c,
        previous_incidents: data.previous_incidents,
        holiday: data.holiday,
        time_slot: data.time_slot,
        day_of_week: data.day_of_week,
      };
      const res = await api.createAssessment(payload);
      setResult(res);
      toast.success('Event evaluation calculated and logged to database!');
    } catch (err: any) {
      toast.error(err.message || 'Evaluation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    reset();
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="border-b border-slate-200/60 pb-5 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
            ML PREDICTION CONSOLE
          </span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Tactical Event <span className="gradient-text-cyber">Risk Evaluation</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Input venue capacity, meteorological factors, crowd expectations, and incident history to execute random forest classification.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Event Parameters Matrix</CardTitle>
                  <CardDescription>
                    All variables are scaled and encoded through the scikit-learn preprocessing pipeline
                  </CardDescription>
                </div>
                <Badge variant="cyber">PIPELINE v1</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Venue & Event Type */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Location / Target Venue
                    </label>
                    <div className="relative mt-1">
                      <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        {...register('venue')}
                        type="text"
                        className="w-full rounded-xl border border-slate-200/80 bg-white/70 py-2 pl-9 pr-3 text-xs text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-white transition-all"
                        placeholder="e.g. City Olympic Stadium"
                      />
                    </div>
                    {errors.venue && (
                      <p className="mt-1 text-[11px] text-rose-500">
                        {errors.venue.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Event Classification
                    </label>
                    <select
                      {...register('event_type')}
                      className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-white transition-all cursor-pointer"
                    >
                      <option value="Normal Operations">Normal Operations</option>
                      <option value="Sports Event">Sports Event</option>
                      <option value="Concert">Concert</option>
                      <option value="Festival">Festival</option>
                      <option value="Public Gathering">Public Gathering</option>
                    </select>
                  </div>
                </div>

                {/* Crowd Size & Capacity */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Expected Attendees
                    </label>
                    <div className="relative mt-1">
                      <Users className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        {...register('crowd_size')}
                        type="number"
                        className="w-full rounded-xl border border-slate-200/80 bg-white/70 py-2 pl-9 pr-3 text-xs font-mono text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-white transition-all"
                      />
                    </div>
                    {errors.crowd_size && (
                      <p className="mt-1 text-[11px] text-rose-500">
                        {errors.crowd_size.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Venue Design Capacity
                    </label>
                    <input
                      {...register('venue_capacity')}
                      type="number"
                      className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-mono text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-white transition-all"
                    />
                    {errors.venue_capacity && (
                      <p className="mt-1 text-[11px] text-rose-500">
                        {errors.venue_capacity.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Weather & Temperature */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Meteorological Condition
                    </label>
                    <select
                      {...register('weather')}
                      className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-white transition-all cursor-pointer"
                    >
                      <option value="Clear">Clear</option>
                      <option value="Cloudy">Cloudy</option>
                      <option value="Rain">Rain</option>
                      <option value="Heavy Rain">Heavy Rain</option>
                      <option value="Extreme Heat">Extreme Heat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Temperature (°C)
                    </label>
                    <div className="relative mt-1">
                      <Thermometer className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        {...register('temperature_c')}
                        type="number"
                        step="0.5"
                        className="w-full rounded-xl border border-slate-200/80 bg-white/70 py-2 pl-9 pr-3 text-xs font-mono text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-white transition-all"
                      />
                    </div>
                    {errors.temperature_c && (
                      <p className="mt-1 text-[11px] text-rose-500">
                        {errors.temperature_c.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Incidents & Holiday */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Historical Incident Count
                    </label>
                    <input
                      {...register('previous_incidents')}
                      type="number"
                      className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-mono text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-white transition-all"
                    />
                    {errors.previous_incidents && (
                      <p className="mt-1 text-[11px] text-rose-500">
                        {errors.previous_incidents.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Public Holiday / Festival
                    </label>
                    <select
                      {...register('holiday')}
                      className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-white transition-all cursor-pointer"
                    >
                      <option value="false">No (Standard Day)</option>
                      <option value="true">Yes (Holiday / Major Festival)</option>
                    </select>
                  </div>
                </div>

                {/* Time Slot & Day */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Operational Time Window
                    </label>
                    <select
                      {...register('time_slot')}
                      className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-white transition-all cursor-pointer"
                    >
                      <option value="Morning">Morning (06:00 - 12:00)</option>
                      <option value="Afternoon">Afternoon (12:00 - 17:00)</option>
                      <option value="Evening">Evening (17:00 - 22:00)</option>
                      <option value="Night">Night (22:00 - 06:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Day of the Week
                    </label>
                    <select
                      {...register('day_of_week')}
                      className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-white transition-all cursor-pointer"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <Button type="submit" variant="cyber" loading={submitting}>
                    <Zap className="h-4 w-4 mr-1.5" />
                    Compute Prediction & Allocations
                  </Button>
                  {result && (
                    <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                      Reset Form
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Output Evaluation Column */}
        <div className="lg:col-span-5 space-y-5">
          {result ? (
            <div className="space-y-4">
              <Card
                glow={
                  result.risk_level === 'Low'
                    ? 'emerald'
                    : result.risk_level === 'Medium'
                    ? 'amber'
                    : result.risk_level === 'High'
                    ? 'amber'
                    : 'rose'
                }
                className="border-cyan-500/30"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-cyan-500">
                        MODEL ASSESSMENT EVALUATION
                      </span>
                      <CardTitle className="text-xl mt-1">{result.venue}</CardTitle>
                    </div>
                    <Badge
                      variant={
                        result.risk_level.toLowerCase() as
                          | 'low'
                          | 'medium'
                          | 'high'
                          | 'critical'
                      }
                      dot
                      className="text-xs px-3 py-1 font-bold"
                    >
                      {result.risk_level.toUpperCase()} TIER
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Gauge Display */}
                  <div className="rounded-2xl bg-slate-100/80 p-5 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">
                        RISK SCORE INDEX
                      </span>
                      <div className="font-mono text-4xl font-extrabold text-slate-900 dark:text-white">
                        {result.risk_score}
                        <span className="text-sm font-normal text-slate-400"> / 100</span>
                      </div>
                    </div>

                    <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${result.risk_score}%`,
                          backgroundColor:
                            result.risk_level === 'Low'
                              ? '#10b981'
                              : result.risk_level === 'Medium'
                              ? '#f59e0b'
                              : result.risk_level === 'High'
                              ? '#f97316'
                              : '#ef4444',
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400">
                      <span>Low (0-39)</span>
                      <span>Med (40-59)</span>
                      <span>High (60-79)</span>
                      <span>Critical (≥80)</span>
                    </div>
                  </div>

                  {/* Telemetry Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-slate-200/60 p-3 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Model Confidence</span>
                      <p className="mt-0.5 font-mono text-base font-bold text-slate-800 dark:text-slate-100">
                        {result.confidence}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/60 p-3 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Database Entry</span>
                      <p className="mt-0.5 font-mono text-base font-bold text-cyan-600 dark:text-cyan-400">
                        RECORD #{result.id}
                      </p>
                    </div>
                  </div>

                  {/* Illustrative Resource Curves */}
                  <div>
                    <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      Recommended Resource Allocations
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Deployment estimates for {result.crowd_size.toLocaleString()} attendees under {result.risk_level} risk conditions:
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      <div className="rounded-xl bg-cyan-500/10 p-3 text-center border border-cyan-500/20">
                        <span className="text-[10px] uppercase font-mono font-bold text-cyan-600 dark:text-cyan-400">
                          Security
                        </span>
                        <p className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">
                          {result.security_personnel}
                        </p>
                        <span className="text-[9px] text-slate-400">Personnel</span>
                      </div>

                      <div className="rounded-xl bg-blue-500/10 p-3 text-center border border-blue-500/20">
                        <span className="text-[10px] uppercase font-mono font-bold text-blue-600 dark:text-blue-400">
                          Police
                        </span>
                        <p className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">
                          {result.police_units}
                        </p>
                        <span className="text-[9px] text-slate-400">Units</span>
                      </div>

                      <div className="rounded-xl bg-emerald-500/10 p-3 text-center border border-emerald-500/20">
                        <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Medical
                        </span>
                        <p className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">
                          {result.medical_teams}
                        </p>
                        <span className="text-[9px] text-slate-400">Teams</span>
                      </div>

                      <div className="rounded-xl bg-violet-500/10 p-3 text-center border border-violet-500/20">
                        <span className="text-[10px] uppercase font-mono font-bold text-violet-600 dark:text-violet-400">
                          Ambulance
                        </span>
                        <p className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">
                          {result.ambulances}
                        </p>
                        <span className="text-[9px] text-slate-400">Vehicles</span>
                      </div>
                    </div>
                  </div>

                  {/* Academic Disclaimer Callout */}
                  <div className="flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-900 dark:text-amber-300">
                    <Info className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <p className="text-[10px] leading-relaxed">
                      <strong>Decision Support Rationale:</strong> Values are derived from synthetic benchmark rules. Do not use for automated emergency dispatch or unapproved deployment commands.
                    </p>
                  </div>

                  <Link to={`/history?highlight=${result.id}`} className="block">
                    <Button variant="secondary" size="sm" className="w-full">
                      <span>Inspect in Assessment History</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center text-slate-400 min-h-[380px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500/40 border border-cyan-500/20">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-slate-700 dark:text-slate-300">
                Awaiting Evaluation Request
              </h3>
              <p className="mt-1.5 max-w-xs text-xs text-slate-500 leading-relaxed">
                Fill the venue parameters on the left and submit to trigger the trained Random Forest classifier.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
