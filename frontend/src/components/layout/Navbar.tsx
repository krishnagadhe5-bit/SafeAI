import React, { useEffect, useState, useRef } from 'react';
import { Menu, Sun, Moon, Radio, Activity, ShieldCheck, Sparkles, Palette, Check } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface NavbarProps {
  onMobileOpen: () => void;
  collapsed: boolean;
}

interface ThemeOption {
  id: string;
  name: string;
  accent: string;
  gradient: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'cosmic-aurora',
    name: 'Cosmic Aurora',
    accent: '#06b6d4',
    gradient: 'from-cyan-500 via-indigo-500 to-emerald-500',
  },
  {
    id: 'cyberpunk-twilight',
    name: 'Cyber Twilight',
    accent: '#d946ef',
    gradient: 'from-fuchsia-500 via-purple-500 to-cyan-500',
  },
  {
    id: 'tactical-emerald',
    name: 'Tactical Emerald',
    accent: '#10b981',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    id: 'deep-ocean',
    name: 'Deep Oceanic',
    accent: '#3b82f6',
    gradient: 'from-blue-500 via-sky-500 to-indigo-500',
  },
];

export function Navbar({ onMobileOpen, collapsed }: NavbarProps) {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem('safeai_theme') || 'cosmic-aurora';
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  const [isDark, setIsDark] = useState(() => {
    return true; // Default to rich cyber dark
  });
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('safeai_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Click outside to close palette
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setPaletteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        await api.health();
        if (mounted) setApiOnline(true);
      } catch {
        if (mounted) setApiOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeThemeObj = THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileOpen}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800/60 hover:text-white lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-1.5 text-[11px] font-mono text-slate-300 border border-slate-700/60 shadow-inner">
            <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
            <span className="text-cyan-400 font-bold">NODE 01</span>
            <span className="text-slate-600">|</span>
            <span className="font-semibold text-white tracking-wider">{timeStr}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="text-slate-600">/</span>
            <span className="font-display font-semibold tracking-tight text-slate-200">
              Tactical Public Safety Hub
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Interactive Theme Palette Switcher */}
        <div className="relative" ref={paletteRef}>
          <button
            onClick={() => setPaletteOpen(!paletteOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs font-mono text-slate-200 hover:border-cyan-400/60 hover:bg-slate-800/80 transition-all shadow-sm"
            title="Change background color theme"
          >
            <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${activeThemeObj.gradient} shadow-sm animate-pulse`} />
            <span className="hidden sm:inline font-sans font-semibold text-[11px]">{activeThemeObj.name}</span>
            <Palette className="h-3.5 w-3.5 text-cyan-400 ml-0.5" />
          </button>

          {/* Palette Popover */}
          {paletteOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-2 shadow-2xl shadow-cyan-950/60 backdrop-blur-2xl z-50 animate-fade-in">
              <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Select Visual Aesthetic
                </span>
              </div>
              <div className="space-y-1">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setCurrentTheme(theme.id);
                        setPaletteOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-3 w-3 rounded-full bg-gradient-to-tr ${theme.gradient} ring-1 ring-white/20`} />
                        <span className="font-sans text-[12px]">{theme.name}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Telemetry Pill */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono font-medium border transition-all ${
            apiOnline
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                apiOnline ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                apiOnline ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <span className="tracking-wider">{apiOnline ? 'LIVE' : 'OFFLINE'}</span>
        </div>

        {/* User avatar indicator */}
        {user && (
          <div className="flex items-center gap-2 pl-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-500 text-slate-950 font-display font-bold text-xs shadow-md shadow-cyan-500/20 ring-2 ring-cyan-400/30">
              {user.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
