import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  Inbox,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirm_password: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function Register() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password') || '';
  const confirmPasswordValue = watch('confirm_password') || '';

  const onSubmit = async (data: RegisterValues) => {
    setLoading(true);
    try {
      const result = await registerAuth(data.email, data.full_name, data.password);
      if (result.needsConfirmation) {
        setConfirmationSentTo(data.email);
        toast.success('Registration initiated. Verification email dispatched!');
      } else {
        toast.success('Account successfully registered with Supabase!');
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('exceeded') || msg.toLowerCase().includes('rate_limit')) {
        toast.error(
          'Supabase email confirmation rate limit reached. Please disable "Confirm email" in Supabase Auth settings for unlimited instant sign-ups.',
          { duration: 8000 }
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#020617] px-4 py-12 overflow-hidden sm:px-6 lg:px-8">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-cyan-600/15 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />

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
              SAFEAI // REGISTRATION
            </span>
          </div>

          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-white font-display">
            Register Analyst Profile
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Create your authenticated profile via Supabase Identity Management
          </p>
        </div>

        {confirmationSentTo ? (
          <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-7 text-center shadow-2xl shadow-cyan-950/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Inbox className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white font-display">
              Verification Email Dispatched
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              Supabase GoTrue dispatched a confirmation token to:
            </p>
            <p className="mt-2 font-mono text-xs font-bold text-cyan-400 bg-slate-950/80 py-1.5 px-3 rounded-lg border border-cyan-500/30 inline-block">
              {confirmationSentTo}
            </p>
            <p className="mt-3 text-[11px] text-slate-400">
              Please click the link in your email to activate your analyst clearance, then proceed to sign in.
            </p>
            <div className="mt-5">
              <Link to="/login">
                <Button variant="cyber" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 p-7 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-200 mb-1.5">
                  Full Name & Designation
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-cyan-400" />
                  <input
                    {...register('full_name')}
                    type="text"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 font-mono text-xs text-white placeholder-slate-500 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    placeholder="Analyst Alex Mercer"
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1.5 font-mono text-[11px] text-rose-400 font-medium">{errors.full_name.message}</p>
                )}
              </div>

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
                    Clearance Password
                  </label>
                  <span className="font-mono text-[10px] text-cyan-400 font-medium">
                    Min. 8 characters
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-cyan-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-10 font-mono text-xs text-white placeholder-slate-500 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password length indicator requirement */}
                <div className="mt-2 flex items-center gap-2">
                  <div className={`flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded ${
                    passwordValue.length >= 8
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {passwordValue.length >= 8 ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <X className="h-3 w-3 text-slate-500" />
                    )}
                    <span>Length: {passwordValue.length}/8 characters</span>
                  </div>
                </div>

                {errors.password && (
                  <p className="mt-1.5 font-mono text-[11px] text-rose-400 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-200 mb-1.5">
                  Confirm Clearance Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-cyan-400" />
                  <input
                    {...register('confirm_password')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-10 font-mono text-xs text-white placeholder-slate-500 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    placeholder="Repeat at least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {confirmPasswordValue && passwordValue && (
                  <div className="mt-2">
                    {confirmPasswordValue === passwordValue ? (
                      <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-rose-400 flex items-center gap-1">
                        <X className="h-3 w-3" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}

                {errors.confirm_password && (
                  <p className="mt-1.5 font-mono text-[11px] text-rose-400 font-medium">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="cyber"
                className="w-full py-2.5 text-xs font-bold tracking-wide mt-2"
                loading={loading}
              >
                Register Clearance Credentials
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="mt-5 border-t border-slate-800 pt-4 text-center text-xs text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign in here →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
