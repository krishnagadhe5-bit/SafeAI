import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'low' | 'medium' | 'high' | 'critical' | 'cyber';
  dot?: boolean;
}

export function Badge({ className, variant = 'default', dot = false, children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-500/30',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60',
    outline: 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300',
    cyber: 'bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-violet-500/15 text-cyan-700 border-cyan-400/40 dark:text-cyan-300 dark:border-cyan-400/30 shadow-sm',
    low: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/40',
    medium: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/40',
    high: 'bg-orange-500/10 text-orange-700 border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-500/40',
    critical: 'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/40',
  };

  const dotColors = {
    default: 'bg-cyan-500',
    secondary: 'bg-slate-400',
    outline: 'bg-slate-400',
    cyber: 'bg-cyan-400 animate-pulse',
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-orange-500',
    critical: 'bg-rose-500 animate-ping',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-all',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />
        </span>
      )}
      {children}
    </div>
  );
}
