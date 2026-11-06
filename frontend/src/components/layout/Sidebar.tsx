import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  History,
  Users,
  FileBarChart,
  Info,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Risk Prediction', href: '/predict', icon: ShieldAlert },
    { name: 'Assessment History', href: '/history', icon: History },
    { name: 'Resource Planning', href: '/resources', icon: Users },
    { name: 'Reports', href: '/reports', icon: FileBarChart },
    { name: 'About SafeAI', href: '/about', icon: Info },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-2xl transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-950/90',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand header with luminous emblem */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white p-1 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/40">
              <img src="/logo.jpg" alt="SafeAI Logo" className="h-full w-full object-contain" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-teal-900 to-cyan-900 dark:from-white dark:via-cyan-200 dark:to-teal-300 bg-clip-text text-transparent">
                  SafeAI
                </span>
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-cyan-600 dark:text-cyan-400">
                  DEFENSE INTEL · v2.0
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-3 py-5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-transparent text-cyan-600 dark:text-cyan-300 shadow-sm border border-cyan-500/30'
                      : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200 border border-transparent',
                    collapsed && 'justify-center px-2'
                  )
                }
                title={collapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-cyan-400 to-teal-500 shadow-glow-cyan" />
                    )}
                    <Icon
                      className={cn(
                        'h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                        isActive
                          ? 'text-cyan-500 dark:text-cyan-400'
                          : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'
                      )}
                    />
                    {!collapsed && <span className="tracking-tight">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer profile card */}
        <div className="border-t border-slate-200/60 p-3 dark:border-slate-800/60">
          {!collapsed && user && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-100/70 p-2.5 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50">
              <div className="truncate pr-2">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                  {user.full_name || user.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
          {collapsed && user && (
            <div className="flex justify-center py-2">
              <button
                onClick={logout}
                title="Log out"
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
