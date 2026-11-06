import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <div className="h-6 w-6 rounded-full bg-cyan-500/20 animate-ping" />
          </div>
          <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase">
            INITIALIZING SAFEAI...
          </span>
        </div>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div
      className="relative min-h-screen text-slate-100 antialiased transition-colors duration-500 overflow-x-hidden"
      style={{ background: 'var(--bg-gradient)' }}
    >
      {/* Dynamic ambient cyber glow orbs */}
      <div className="fixed -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 h-[550px] w-[550px] rounded-full bg-indigo-500/20 blur-[150px] pointer-events-none" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 h-[450px] w-[450px] rounded-full bg-emerald-500/10 blur-[160px] pointer-events-none" />

      {/* Subtle futuristic cyber grid texture */}
      <div className="fixed inset-0 cyber-grid-pattern opacity-40 pointer-events-none" />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300',
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <Navbar onMobileOpen={() => setMobileOpen(true)} collapsed={collapsed} />

        <main className="relative z-10 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
