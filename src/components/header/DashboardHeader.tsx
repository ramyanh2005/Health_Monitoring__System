import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { wellnessService } from '../../services/wellnessService';
import { Bell, HeartPulse, Sparkles, LogOut, Sliders, Database } from 'lucide-react';
import { SupabaseSyncModal } from '../supabase/SupabaseSyncModal';

export const DashboardHeader: React.FC = () => {
  const {
    userProfile,
    notifications,
    setIsNotificationDrawerOpen,
    setIsAccessibilityModalOpen,
    setIsEditProfileOpen,
    resetToDemoDefaults
  } = useWellness();

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = React.useState<boolean>(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const greeting = wellnessService.getTimeGreeting();

  return (
    <header
      role="banner"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
        padding: '1.25rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {/* Top Navbar Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          {/* Logo & Category Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(13, 148, 136, 0.25)',
                flexShrink: 0
              }}
            >
              <HeartPulse size={26} aria-hidden="true" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-text-main)'
                  }}
                >
                  NutriTrack <span style={{ color: 'var(--color-primary)' }}>AI</span>
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary-text)',
                    border: '1px solid var(--color-primary-border)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Disabled Wellness
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Adaptive Health & Supportive Living Companion
              </p>
            </div>
          </div>

          {/* Action Tools & User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Supabase Cloud Connection Button */}
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="btn-secondary"
              aria-label="Open Supabase Cloud Database Sync"
              title="Supabase Cloud Database Sync"
              style={{
                padding: '0.55rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                borderColor: '#3ecf8e',
                backgroundColor: 'rgba(62, 207, 142, 0.08)'
              }}
            >
              <Database size={17} color="#059669" aria-hidden="true" />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Supabase Sync
              </span>
            </button>

            {/* Accessibility Quick Settings */}
            <button
              onClick={() => setIsAccessibilityModalOpen(true)}
              className="btn-secondary"
              aria-label="Open Accessibility and Display Settings"
              title="Accessibility & Display Settings"
              style={{ padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sliders size={18} color="var(--color-primary)" aria-hidden="true" />
              <span className="sr-only">Accessibility</span>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>A11y Settings</span>
            </button>


            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="btn-secondary"
              aria-label={`Notifications. ${unreadCount} unread`}
              title="Notifications"
              style={{
                position: 'relative',
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                minHeight: 'auto'
              }}
            >
              <Bell size={20} aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '18px',
                    height: '18px',
                    backgroundColor: 'var(--color-alert)',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--color-bg-card)'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="btn-secondary"
              aria-label={`User profile for ${userProfile.name}. Click to edit wellness profile.`}
              title="Edit Profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 'var(--text-sm)',
                  border: '1px solid var(--color-primary-border)'
                }}
              >
                {userProfile.name.charAt(0)}
              </div>
              <div style={{ textAlign: 'left', display: 'none' }} className="user-name-desktop">
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, display: 'block', color: 'var(--color-text-main)' }}>
                  {userProfile.name}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-light)', display: 'block' }}>
                  {userProfile.mobilityLevel}
                </span>
              </div>
            </button>

            {/* Reset / Switcher Button for Demo */}
            <button
              onClick={resetToDemoDefaults}
              aria-label="Reset demo data"
              title="Reset Demo Data"
              className="btn-secondary"
              style={{
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-light)',
                minHeight: 'auto'
              }}
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Personalized Welcome Banner */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-bg-card) 100%)',
            border: '1px solid var(--color-primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem'
              }}
            >
              {greeting}, {userProfile.name} 👋
            </h1>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Let's take care of your wellness today, one step at a time.
            </p>
          </div>

          {/* Quick status pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-bg-card)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-primary-text)'
            }}
          >
            <Sparkles size={16} color="var(--color-primary)" aria-hidden="true" />
            <span>Mobility Focus: <strong>{userProfile.mobilityLevel}</strong></span>
          </div>
        </div>
      </div>

      {/* Supabase Cloud Connection & Sync Modal */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </header>
  );
};

