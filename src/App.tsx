import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { DisabledDashboard } from './pages/DisabledDashboard/DisabledDashboard';
import { HeartPulse, UserCheck, ChevronRight } from 'lucide-react';

/**
 * Team Integration Landing Placeholder (for root route '/')
 * Demonstrates how the central team Auth/Category Router directs users to category dashboards.
 */
const TeamPortalLauncher: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'var(--font-base)'
      }}
    >
      <div
        className="wellness-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 16px rgba(13, 148, 136, 0.25)'
          }}
        >
          <HeartPulse size={32} />
        </div>

        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
          NutriTrack AI
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Team Health & Wellness Platform Portal. Select your module below to launch the category dashboard.
        </p>

        {/* Primary Assigned Module Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/dashboard/disabled"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              fontSize: 'var(--text-base)',
              justifyContent: 'space-between',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <UserCheck size={22} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontWeight: 800 }}>Disabled Citizen Dashboard</span>
                <span style={{ fontSize: '11px', opacity: 0.9, fontWeight: 500 }}>Route: /dashboard/disabled</span>
              </div>
            </div>
            <ChevronRight size={20} />
          </Link>
        </div>

        {/* Teammate Category Placeholders */}
        <div style={{ textAlign: 'left', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
            Other Team Member Modules (Merge Ready):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
              &bull; Senior Citizen (/dashboard/senior)
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
              &bull; Pregnant Woman (/dashboard/pregnant)
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
              &bull; Healthy Male (/dashboard/healthy-male)
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
              &bull; Postpartum (/dashboard/postpartum)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main route for the Disabled Citizen Dashboard module */}
        <Route path="/dashboard/disabled" element={<DisabledDashboard />} />

        {/* Team Platform Portal root */}
        <Route path="/" element={<TeamPortalLauncher />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard/disabled" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
