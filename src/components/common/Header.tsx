import React from 'react';
import { 
  Calendar, 
  Flame, 
  Bell, 
  Volume2, 
  VolumeX, 
  PlusCircle, 
  User, 
  Menu, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { calculateStreak } from '../../utils/calculations';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickLog: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickLog,
  onToggleMobileSidebar
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

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Male Healthy Dashboard';
      case 'water': return 'Water & Hydration Tracker';
      case 'exercise': return 'Exercises & Workout Hub';
      case 'meals': return 'Meals & Nutrition Planner';
      case 'progress': return 'Analytics & Progress Reports';
      case 'sleep': return 'Sleep & Recovery Tracker';
      case 'goals': return 'Daily Health Goals';
      case 'reminders': return 'Reminders & Notifications';
      case 'ai': return 'AI Health Consultant';
      case 'profile': return 'Profile & Biometrics';
      default: return 'Dashboard Overview';
    }
  };

  const toggleTheme = () => {
    updateProfile({ theme: profile.theme === 'light' ? 'dark' : 'light' });
  };

  const toggleSound = () => {
    updateProfile({ soundEnabled: !profile.soundEnabled });
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Mobile Sidebar Trigger + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
              {getPageTitle(activeTab)}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Male Health & Vitality Tracking System
            </p>
          </div>
        </div>

        {/* Center/Right Controls: Date, Streak, Quick Log, Sound, Notifs, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Date Picker */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 border-none outline-none cursor-pointer"
            />
            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline pl-1 border-l border-slate-300 dark:border-slate-700"
              >
                Today
              </button>
            )}
          </div>

          {/* Streak Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
            <span>{streak}d Streak</span>
          </div>

          {/* Quick Log Button */}
          <button
            onClick={onOpenQuickLog}
            className="btn-primary py-2 px-3 sm:px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Log</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700/80 shadow-sm"
            title={profile.soundEnabled ? 'Disable Sounds' : 'Enable Sounds'}
            aria-label="Toggle Sound"
          >
            {profile.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700/80 shadow-sm"
            title="Toggle Light / Dark Mode"
            aria-label="Toggle Theme"
          >
            {profile.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Reminders / Notifications Button */}
          <button
            onClick={() => setActiveTab('reminders')}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700/80 shadow-sm"
            title="Reminders & Notifications"
            aria-label="Reminders"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* User Profile Avatar / Initial Shortcut Button */}
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-100 dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 border border-slate-200 dark:border-slate-700 rounded-xl transition group shadow-sm"
            title="View Profile Settings"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-emerald-500/40 bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name || 'User Profile'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {profile.name && profile.name.trim() 
                    ? profile.name.trim().slice(0, 2).toUpperCase() 
                    : 'MH'}
                </span>
              )}
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {profile.name || 'Male Profile'}
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                {profile.weightKg > 0 ? `${profile.weightKg} kg` : 'My Stats'}
              </span>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
};
