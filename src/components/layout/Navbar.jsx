import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  Dumbbell, 
  UtensilsCrossed, 
  TrendingUp, 
  Settings, 
  HeartHandshake,
  AlertTriangle
} from 'lucide-react';

export const Navbar = () => {
  const { activeTab, setActiveTab, setActiveModal } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
    { id: 'exercises', label: 'Exercises', icon: Dumbbell, badge: 'Daily' },
    { id: 'meals', label: 'Meals & Water', icon: UtensilsCrossed, badge: null },
    { id: 'progress', label: 'Progress', icon: TrendingUp, badge: 'Streak' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <>
      {/* ======================================================================
          Desktop & Tablet Persistent Left Nav Rail
          ====================================================================== */}
      <aside className="nav-rail-desktop" aria-label="Main Navigation">
        <div className="nav-brand-container">
          <div className="brand-logo-icon">
            <HeartHandshake className="w-8 h-8 text-primary-500" strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="brand-title">Vitality</h1>
            <span className="brand-subtitle">Senior Wellness</span>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'exercises' && activeTab === 'catalog');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="nav-icon-wrapper">
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Emergency Button in Rail */}
        <div className="nav-rail-footer">
          <button
            onClick={() => setActiveModal('emergency')}
            className="btn btn-emergency w-full pulse-emergency-ring"
            aria-label="Emergency Help Quick Action"
          >
            <AlertTriangle size={20} />
            <span>Emergency SOS</span>
          </button>
        </div>
      </aside>

      {/* ======================================================================
          Mobile Bottom Tab Bar (Accessible & Large Touch Targets)
          ====================================================================== */}
      <nav className="nav-bottom-mobile" aria-label="Mobile Bottom Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'exercises' && activeTab === 'catalog');
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`mobile-tab-btn ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={24} strokeWidth={isActive ? 2.6 : 1.9} />
              <span className="mobile-tab-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        /* Desktop Rail Styles */
        .nav-rail-desktop {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--nav-rail-width);
          background-color: var(--bg-surface);
          border-right: 1.5px solid var(--border-light);
          flex-direction: column;
          padding: 1.75rem 1.25rem;
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }

        @media (min-width: 1024px) {
          .nav-rail-desktop {
            display: flex;
          }
        }

        .nav-brand-container {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.5rem 0.75rem 1.75rem 0.75rem;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 1.5rem;
        }

        .brand-logo-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--primary-100), var(--primary-50));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-600);
          border: 1px solid var(--primary-200);
        }

        .brand-title {
          font-size: var(--text-2xl);
          font-weight: 800;
          color: var(--primary-700);
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .brand-subtitle {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          flex: 1;
        }

        .nav-item-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.1rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          background-color: transparent;
          font-weight: 600;
          font-size: var(--text-base);
          text-align: left;
          justify-content: flex-start;
          transition: all var(--trans-fast);
          min-height: 52px;
        }

        .nav-item-btn:hover {
          background-color: var(--bg-surface-subtle);
          color: var(--primary-600);
          transform: translateX(3px);
        }

        .nav-item-btn.active {
          background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
          color: var(--text-inverse);
          box-shadow: 0 4px 14px rgba(45, 106, 79, 0.28);
        }

        .nav-item-btn.active .nav-icon-wrapper {
          color: var(--text-inverse);
        }

        .nav-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          flex: 1;
        }

        .nav-badge {
          font-size: 0.7rem;
          padding: 0.15rem 0.55rem;
          border-radius: var(--radius-full);
          background-color: var(--primary-100);
          color: var(--primary-700);
          font-weight: 700;
          text-transform: uppercase;
        }

        .nav-item-btn.active .nav-badge {
          background-color: rgba(255, 255, 255, 0.25);
          color: var(--text-inverse);
        }

        .nav-rail-footer {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-light);
        }

        /* Mobile Bottom Tab Bar */
        .nav-bottom-mobile {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: var(--bg-glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1.5px solid var(--border-light);
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom)) 0.5rem;
          z-index: 900;
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
        }

        @media (min-width: 1024px) {
          .nav-bottom-mobile {
            display: none;
          }
        }

        .mobile-tab-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          padding: 0.4rem 0.25rem;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          min-height: 52px;
          min-width: 48px;
        }

        .mobile-tab-btn.active {
          color: var(--primary-600);
          font-weight: 700;
        }

        .mobile-tab-label {
          font-size: calc(0.72rem * var(--font-scale));
          font-weight: 600;
        }
      `}</style>
    </>
  );
};
