import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Droplets, 
  Dumbbell, 
  UtensilsCrossed, 
  TrendingUp, 
  Moon, 
  Bot, 
  UserCircle2,
  HeartPulse,
  X,
  UserCheck
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { DailyStatsInputModal } from '../Dashboard/DailyStatsInputModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose
}) => {
  const { todayLog } = useHealth();
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  const navItems = [
    { id: 'dashboard', label: 'Male Healthy Dashboard', icon: LayoutDashboard },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'water', label: 'Water Tracker', icon: Droplets, badge: `${Math.round(((todayLog.waterIntakeMl || 0) / (todayLog.waterGoalMl || 3000)) * 100)}%` },
    { id: 'exercise', label: 'Exercises', icon: Dumbbell, badge: `${todayLog.exerciseMinutes || 0}m` },
    { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { id: 'sleep', label: 'Sleep', icon: Moon, badge: `${((todayLog.sleep?.durationMinutes || 0) / 60).toFixed(1)}h` },
    { id: 'ai', label: 'AI Assistant', icon: Bot, isAi: true },
    { id: 'profile', label: 'Profile', icon: UserCircle2 },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  const waterPercent = Math.min(100, Math.round(((todayLog.waterIntakeMl || 0) / (todayLog.waterGoalMl || 3000)) * 100));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container: Fixed width 260px */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-20 h-screen w-[260px] min-w-[260px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div 
            onClick={() => handleSelect('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white font-heading tracking-tight">
                  Healthy<span className="text-emerald-500">Me</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  ♂ Male
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Health & Wellness Tracker</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Item List */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all group relative ${
                  isActive
                    ? item.isAi
                      ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-teal-700 dark:text-teal-300 font-bold border border-teal-300 dark:border-teal-500/30'
                      : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-r-full bg-emerald-500" />
                )}

                <Icon 
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive
                      ? item.isAi
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }`} 
                />

                <span className="flex-1 text-left truncate">{item.label}</span>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-200/60 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2">
            <button
              onClick={() => setShowStatsModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-500/30 transition shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Update Daily Stats</span>
            </button>
          </div>
        </nav>

        {/* Bottom Health Score & Hydration Mini Summary */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 m-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Vitality Score</span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{todayLog.healthScore}/100</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, todayLog.healthScore)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>💧 Hydration:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">{waterPercent}%</span>
          </div>
        </div>
      </aside>

      <DailyStatsInputModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </>
  );
};
