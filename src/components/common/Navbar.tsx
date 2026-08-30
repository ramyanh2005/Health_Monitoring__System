import React from 'react';
import { 
  HeartPulse, 
  Flame, 
  Bell, 
  Calendar, 
  Moon, 
  Sun, 
  Sparkles, 
  PlusCircle, 
  User, 
  Volume2, 
  VolumeX,
  Menu
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { calculateStreak } from '../../utils/calculations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickLog: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenQuickLog,
  onToggleSidebar 
}) => {
  const { 
    profile, 
    updateProfile, 
    selectedDate, 
    setSelectedDate, 
    pastLogs, 
    todayLog,
    notifications 
  } = useHealth();

  const streak = calculateStreak(pastLogs);
  const todayStr = new Date().toISOString().split('T')[0];

  const cycleTheme = () => {
    const nextTheme = profile.theme === 'dark' ? 'emerald' : profile.theme === 'emerald' ? 'light' : 'dark';
    updateProfile({ theme: nextTheme });
  };

  const toggleSound = () => {
    updateProfile({ soundEnabled: !profile.soundEnabled });
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-heading">
                  Healthy<span className="text-emerald-400">Me</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Personal Health & Wellness</p>
            </div>
          </div>
        </div>

        {/* Center: Date Selector & Streak Badge */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-inner">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm text-slate-200 border-none outline-none font-medium cursor-pointer"
            />
            {selectedDate !== todayStr && (
              <button 
                onClick={() => setSelectedDate(todayStr)}
                className="text-[11px] font-bold text-emerald-400 hover:underline pl-1 border-l border-slate-700"
              >
                Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold shadow-sm">
            <Flame className="w-4 h-4 fill-amber-400 animate-bounce" />
            <span>{streak} Day Streak</span>
          </div>
        </div>

        {/* Right: Quick Log, Audio, Notifications, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Log Button */}
          <button
            onClick={onOpenQuickLog}
            className="btn-primary py-2 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold shadow-emerald-500/25 flex items-center gap-1.5"
            title="Quick Log Health Activity"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Log</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="btn-icon text-slate-400 hover:text-emerald-400"
            title={profile.soundEnabled ? 'Mute Audio Chimes' : 'Enable Audio Chimes'}
          >
            {profile.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Reminders / Notifications */}
          <button
            onClick={() => setActiveTab('reminders')}
            className="btn-icon relative text-slate-400 hover:text-cyan-400"
            title="Reminders & Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={cycleTheme}
            className="btn-icon text-slate-400 hover:text-amber-400"
            title={`Theme: ${profile.theme.toUpperCase()} (Click to toggle)`}
          >
            {profile.theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : profile.theme === 'emerald' ? (
              <Sparkles className="w-4 h-4 text-emerald-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl border transition ${
              activeTab === 'profile'
                ? 'border-emerald-500/80 bg-emerald-500/15'
                : 'border-slate-700/60 bg-slate-800/60 hover:border-slate-600'
            }`}
            title="User Profile & Settings"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-200 leading-tight truncate max-w-[90px]">{profile.name}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">{todayLog.healthScore}/100 Score</p>
            </div>
          </button>

        </div>
      </div>
    </header>
  );
};
