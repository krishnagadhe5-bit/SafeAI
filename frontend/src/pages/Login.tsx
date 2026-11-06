import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Successfully authenticated via Supabase');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#020617] px-4 py-12 overflow-hidden sm:px-6 lg:px-8">
      {/* Dynamic ambient cyber orbs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-cyan-600/15 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />

      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-glow-cyan border border-cyan-400/50 overflow-hidden">
            <img src="/logo.jpg" alt="SafeAI Logo" className="h-full w-full object-contain" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500" />
            </span>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
              SAFEAI // INTELLIGENCE
            </span>
          </div>

          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-white font-display">
            SafeAI Intelligence Portal
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Sign in with your verified Supabase analyst credentials
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-slate-900/80 py-2 px-3 text-xs text-cyan-300 shadow-inner">
          <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="font-mono text-[11px] font-medium">Protected by Supabase Identity & Access Management</span>
        </div>

        {/* Crisp Dark Cyber Form Card */}
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 p-7 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-200 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-cyan-400" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 font-mono text-xs text-white placeholder-slate-500 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  placeholder="analyst@domain.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 font-mono text-[11px] text-rose-400 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-200">
                  Security Password
                </label>
                <span className="font-mono text-[10px] text-cyan-400">
                  Min. 8 characters
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-cyan-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-10 font-mono text-xs text-white placeholder-slate-500 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-cyan-400 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Real-time 8-character indicator */}
              {passwordValue && passwordValue.length < 8 && (
                <p className="mt-1.5 font-mono text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                  <KeyRound className="h-3.5 w-3.5" />
                  Password must be at least 8 characters ({passwordValue.length}/8 entered)
                </p>
              )}

              {errors.password && (
                <p className="mt-1.5 font-mono text-[11px] text-rose-400 font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="cyber"
              className="w-full py-2.5 text-xs font-bold tracking-wide mt-2"
              loading={loading}
            >
              Authenticate Clearance
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          <div className="mt-5 border-t border-slate-800 pt-4 text-center text-xs text-slate-400">
            Need an analyst account?{' '}
            <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
              Register via Supabase →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
