import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  AlertTriangle, 
  Type, 
  Sun, 
  Moon, 
  Sparkles, 
  Clock, 
  Check, 
  X, 
  ShieldCheck, 
  Volume2,
  Database
} from 'lucide-react';

export const Header = () => {
  const { 
    user, 
    fontSize, 
    setFontSize, 
    contrast, 
    setContrast, 
    setActiveModal, 
    medications, 
    dailyGoals, 
    showToast,
    isSupabaseActive 
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  // Count pending items for notification badge
  const pendingMeds = medications.filter(m => !m.taken).length;
  const remainingWater = Math.max(dailyGoals.waterGlassesGoal - dailyGoals.waterGlassesCurrent, 0);

  // Font size options
  const cycleFontSize = () => {
    if (fontSize === 'normal') {
      setFontSize('large');
      showToast("🔤 Font size set to Large");
    } else if (fontSize === 'large') {
      setFontSize('xlarge');
      showToast("🔤 Font size set to Extra Large");
    } else {
      setFontSize('normal');
      showToast("🔤 Font size set to Standard");
    }
  };

  const toggleContrast = () => {
    const next = contrast === 'normal' ? 'high' : 'normal';
    setContrast(next);
    showToast(next === 'high' ? '👁️ High Contrast Mode Enabled' : '👁️ Standard Contrast Restored');
  };

  const playVoiceSummary = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `${getGreeting()}, ${user.name.split(' ')[0]}! Today is ${currentDateFormatted}. You have walked ${dailyGoals.stepsCurrent} steps out of your ${dailyGoals.stepsGoal} step goal, and drank ${dailyGoals.waterGlassesCurrent} glasses of water. Remember to take your evening medications. Have a blessed and active day!`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      showToast("🔊 Reading today's health summary aloud...");
    } else {
      showToast("🔊 Voice read-aloud simulation active.");
    }
  };

  return (
    <header className="header-container">
      <div className="header-left">
        <div className="greeting-wrapper">
          <span className="greeting-pill">
            <Sparkles size={16} className="text-primary-500" />
            Senior Wellness Hub
          </span>
          <h2 className="greeting-title">
            {getGreeting()}, <span className="greeting-name">{user.name.split(' ')[0]}</span>! 👋
          </h2>
          <p className="greeting-date">
            <Clock size={16} className="inline mr-1 opacity-70" />
            {currentDateFormatted}
          </p>
        </div>
      </div>

      <div className="header-right">
        {/* Supabase Cloud Connection Status Badge */}
        <button
          onClick={() => setActiveModal('supabase')}
          className={`btn-supabase-status ${isSupabaseActive ? 'status-connected' : 'status-local'}`}
          title={isSupabaseActive ? "Supabase Cloud Database Connected (Click to view)" : "Local Storage Mode (Click to connect Supabase)"}
          aria-label="Supabase database connection status"
        >
          <Database size={16} />
          <span className="supabase-status-text">
            {isSupabaseActive ? 'Cloud Connected' : 'Connect Backend'}
          </span>
        </button>

        {/* Voice Read-Aloud Helper Button (Senior Accessibility) */}
        <button
          onClick={playVoiceSummary}
          className="btn-header-action"
          title="Read Page Summary Aloud"
          aria-label="Read today's health summary aloud"
        >
          <Volume2 size={20} className="text-primary-600" />
          <span className="sr-only">Read Aloud</span>
        </button>

        {/* Text Size Switcher */}
        <button
          onClick={cycleFontSize}
          className="btn-header-action font-toggle-btn"
          title={`Text Size: ${fontSize.toUpperCase()} (Click to change)`}
          aria-label="Toggle text size between Normal, Large, and Extra Large"
        >
          <Type size={18} />
          <span className="font-size-label">
            {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
          </span>
        </button>

        {/* High Contrast Toggle */}
        <button
          onClick={toggleContrast}
          className={`btn-header-action ${contrast === 'high' ? 'contrast-active' : ''}`}
          title="Toggle High Contrast Mode"
          aria-label="Toggle high contrast accessibility mode"
        >
          {contrast === 'high' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="notification-wrapper">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-header-action relative"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell size={20} />
            {(pendingMeds > 0 || remainingWater > 0) && (
              <span className="notification-dot" />
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown fade-in">
              <div className="dropdown-header">
                <h4 className="font-bold text-primary-900">Today's Reminders</h4>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-muted hover:text-primary-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="dropdown-body">
                {pendingMeds > 0 ? (
                  <div className="reminder-item" onClick={() => { setActiveModal('medication'); setShowNotifications(false); }}>
                    <div className="reminder-icon med-bg">💊</div>
                    <div>
                      <p className="font-semibold text-sm">Medications Reminder</p>
                      <p className="text-xs text-muted">{pendingMeds} pending doses for today</p>
                    </div>
                  </div>
                ) : (
                  <div className="reminder-item success-bg">
                    <Check size={16} className="text-primary-600" />
                    <p className="text-xs text-primary-800 font-medium">All current medications taken!</p>
                  </div>
                )}

                {remainingWater > 0 && (
                  <div className="reminder-item" onClick={() => { setShowNotifications(false); }}>
                    <div className="reminder-icon water-bg">💧</div>
                    <div>
                      <p className="font-semibold text-sm">Hydration Reminder</p>
                      <p className="text-xs text-muted">{remainingWater} glasses remaining to hit 8-glass goal</p>
                    </div>
                  </div>
                )}

                <div className="reminder-item doctor-bg">
                  <ShieldCheck size={18} className="text-primary-600" />
                  <div>
                    <p className="font-semibold text-sm">Doctor's Note</p>
                    <p className="text-xs text-muted">Stay active with 15 mins of Chair Yoga</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Emergency SOS Header Button */}
        <button
          onClick={() => setActiveModal('emergency')}
          className="btn btn-emergency header-emergency-btn pulse-emergency-ring"
          aria-label="Emergency SOS"
        >
          <AlertTriangle size={18} />
          <span className="sos-text">SOS</span>
        </button>

        {/* User Profile Pill */}
        <div className="user-profile-badge">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="user-avatar-img"
          />
          <div className="user-meta hidden sm:block">
            <p className="user-name">{user.name}</p>
            <span className="user-tier-tag">{user.tier}</span>
          </div>
        </div>
      </div>

      <style>{`
        .header-container {
          background-color: var(--bg-surface);
          border-bottom: 1.5px solid var(--border-light);
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: var(--shadow-sm);
        }

        @media (min-width: 768px) {
          .header-container {
            padding: 1.25rem 2.5rem;
          }
        }

        .header-left {
          flex: 1;
          min-width: 0;
        }

        .greeting-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.2rem 0.75rem;
          border-radius: var(--radius-full);
          background-color: var(--primary-50);
          color: var(--primary-700);
          font-size: var(--text-xs);
          font-weight: 700;
          margin-bottom: 0.35rem;
          border: 1px solid var(--primary-200);
        }

        .greeting-title {
          font-size: var(--text-xl);
          color: var(--text-primary);
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        @media (min-width: 768px) {
          .greeting-title {
            font-size: var(--text-2xl);
          }
        }

        .greeting-name {
          color: var(--primary-600);
        }

        .greeting-date {
          font-size: var(--text-xs);
          color: var(--text-muted);
          font-weight: 500;
          margin-top: 0.15rem;
          display: flex;
          align-items: center;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-supabase-status {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 700;
          min-height: 40px;
          transition: all var(--trans-fast);
        }

        .status-connected {
          background-color: var(--primary-100);
          color: var(--primary-800);
          border: 1.5px solid var(--primary-300);
        }

        .status-connected:hover {
          background-color: var(--primary-200);
        }

        .status-local {
          background-color: var(--accent-amber-light);
          color: var(--accent-amber);
          border: 1.5px solid #fed19d;
        }

        .status-local:hover {
          background-color: #fee9cf;
        }

        .supabase-status-text {
          display: none;
        }

        @media (min-width: 640px) {
          .supabase-status-text {
            display: inline;
          }
        }

        .btn-header-action {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: var(--radius-full);
          background-color: var(--bg-surface-subtle);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .btn-header-action:hover {
          background-color: var(--primary-50);
          color: var(--primary-600);
          border-color: var(--primary-200);
        }

        .contrast-active {
          background-color: var(--accent-amber-light);
          color: var(--accent-amber);
          border-color: var(--accent-amber);
        }

        .font-toggle-btn {
          font-weight: 800;
          gap: 2px;
        }

        .font-size-label {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--primary-600);
        }

        .notification-wrapper {
          position: relative;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--danger-main);
          border: 2px solid var(--bg-surface);
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 320px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          padding: 1.25rem;
          z-index: 200;
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 0.75rem;
        }

        .dropdown-body {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .reminder-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem;
          border-radius: var(--radius-md);
          background-color: var(--bg-surface-subtle);
          cursor: pointer;
          transition: background-color var(--trans-fast);
        }

        .reminder-item:hover {
          background-color: var(--primary-50);
        }

        .reminder-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .med-bg { background-color: #fee2e2; }
        .water-bg { background-color: #e0f2fe; }
        .doctor-bg { background-color: #e8f5e9; }
        .success-bg { background-color: var(--primary-50); }

        .header-emergency-btn {
          padding: 0.5rem 1rem;
          min-height: 44px;
          font-size: var(--text-sm);
          border-radius: var(--radius-full);
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.35rem 0.85rem 0.35rem 0.35rem;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-full);
        }

        .user-avatar-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--primary-300);
        }

        .user-meta {
          line-height: 1.2;
        }

        .user-name {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-primary);
        }

        .user-tier-tag {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--primary-600);
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
      `}</style>
    </header>
  );
};
