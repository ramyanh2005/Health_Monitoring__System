import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { Droplet, Play, Utensils, BarChart3, Award, User, Sliders } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const {
    addWater,
    setIsEditProfileOpen,
    setIsAccessibilityModalOpen
  } = useWellness();

  return (
    <section aria-labelledby="quick-actions-heading" style={{ width: '100%' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 id="quick-actions-heading" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
          Quick Actions
        </h2>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Large, high-contrast accessible shortcut triggers
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.85rem'
        }}
      >
        {/* Quick Action 1: Add Water */}
        <button
          onClick={() => addWater(250)}
          className="btn-action-large"
          aria-label="Quick Action: Add 250ml water"
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-water-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-water)'
            }}
          >
            <Droplet size={22} />
          </div>
          <span>+250ml Water</span>
        </button>

        {/* Quick Action 2: Start Activity */}
        <a
          href="#exercises-section"
          className="btn-action-large"
          aria-label="Quick Action: Start gentle movement routine"
          style={{ textDecoration: 'none' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-healthy-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-healthy)'
            }}
          >
            <Play size={22} />
          </div>
          <span>Start Activity</span>
        </a>

        {/* Quick Action 3: View Meals */}
        <a
          href="#meals-section"
          className="btn-action-large"
          aria-label="Quick Action: View meal suggestions"
          style={{ textDecoration: 'none' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-notice-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-notice)'
            }}
          >
            <Utensils size={22} />
          </div>
          <span>View Meals</span>
        </a>

        {/* Quick Action 4: View Progress */}
        <a
          href="#weekly-chart-heading"
          className="btn-action-large"
          aria-label="Quick Action: View weekly progress charts"
          style={{ textDecoration: 'none' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-secondary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-secondary)'
            }}
          >
            <BarChart3 size={22} />
          </div>
          <span>Weekly Chart</span>
        </a>

        {/* Quick Action 5: View Badges */}
        <a
          href="#badges-heading"
          className="btn-action-large"
          aria-label="Quick Action: View earned badges and streaks"
          style={{ textDecoration: 'none' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-warning-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-warning)'
            }}
          >
            <Award size={22} />
          </div>
          <span>Milestones</span>
        </a>

        {/* Quick Action 6: Edit Profile */}
        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="btn-action-large"
          aria-label="Quick Action: Edit wellness profile and metrics"
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}
          >
            <User size={22} />
          </div>
          <span>Edit Profile</span>
        </button>

        {/* Quick Action 7: Accessibility Settings */}
        <button
          onClick={() => setIsAccessibilityModalOpen(true)}
          className="btn-action-large"
          aria-label="Quick Action: Open accessibility settings"
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-main)'
            }}
          >
            <Sliders size={22} />
          </div>
          <span>A11y Tools</span>
        </button>
      </div>
    </section>
  );
};
