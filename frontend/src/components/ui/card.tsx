import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'none';
}

export function Card({ className, glow = 'none', ...props }: CardProps) {
  const glowStyles = {
    none: '',
    cyan: 'hover:shadow-glow-cyan hover:border-cyan-500/40',
    emerald: 'hover:shadow-glow-emerald hover:border-emerald-500/40',
    amber: 'hover:shadow-glow-amber hover:border-amber-500/40',
    rose: 'hover:shadow-glow-rose hover:border-rose-500/40',
  };

  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-5 shadow-sm transition-all duration-300',
        glowStyles[glow],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col space-y-1.5', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'font-display text-base font-bold tracking-tight text-slate-900 dark:text-slate-100',
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed', className)} {...props} />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('pt-0', className)} {...props} />;
}
