import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  Type, 
  Sun, 
  Moon, 
  Volume2, 
  ShieldCheck, 
  User, 
  Phone, 
  Target, 
  Save, 
  RotateCcw,
  Check,
  HeartHandshake
} from 'lucide-react';
import { initialUserData, initialDailyGoals } from '../../data/mockData';

export const SettingsView = () => {
  const { 
    user, 
    setUser, 
    dailyGoals, 
    setDailyGoals, 
    fontSize, 
    setFontSize, 
    contrast, 
    setContrast,
    showToast
  } = useApp();

  const [formDataUser, setFormDataUser] = useState(user);
  const [formDataGoals, setFormDataGoals] = useState(dailyGoals);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser(formDataUser);
    setDailyGoals(formDataGoals);
    showToast("⚙️ Profile and wellness targets updated successfully!");
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset all preferences to default?")) {
      setUser(initialUserData);
      setDailyGoals(initialDailyGoals);
      setFontSize('normal');
      setContrast('normal');
      showToast("Reset all preferences to default settings.", "info");
    }
  };

  return (
    <div className="settings-container fade-in">
      {/* Header */}
      <div>
        <h2 className="page-title">Settings & Accessibility</h2>
        <p className="page-subtitle">Customize text legibility, emergency contacts, and daily health targets</p>
      </div>

      <form onSubmit={handleSaveProfile} className="settings-grid">
        {/* ======================================================================
            1. Accessibility & Visual Display Card
            ====================================================================== */}
        <section className="card settings-section-card" aria-label="Visual & Accessibility">
          <div className="settings-card-header">
            <div className="settings-icon-circle bg-primary-100 text-primary-700">
              <Type size={22} />
            </div>
            <div>
              <h3 className="section-title">Visual Legibility & Display</h3>
              <p className="section-subtitle">Tailored for clear vision and comfort</p>
            </div>
          </div>

          <div className="settings-options-list mt-4">
            {/* Font Size Option */}
            <div className="option-row">
              <div>
                <label className="font-bold text-base text-primary-900 block">Text Size Scale</label>
                <p className="text-xs text-muted">Enlarges all headings, instructions, and buttons</p>
              </div>
              <div className="font-size-button-group">
                {[
                  { id: 'normal', label: 'Standard (17pt)' },
                  { id: 'large', label: 'Large (20pt)' },
                  { id: 'xlarge', label: 'Extra Large (24pt)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFontSize(item.id)}
                    className={`btn btn-secondary setting-toggle-btn ${fontSize === item.id ? 'active' : ''}`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Mode */}
            <div className="option-row">
              <div>
                <label className="font-bold text-base text-primary-900 block">High Contrast Mode</label>
                <p className="text-xs text-muted">Deep dark surfaces with luminous high-contrast text</p>
              </div>
              <button
                type="button"
                onClick={() => setContrast(contrast === 'high' ? 'normal' : 'high')}
                className={`btn btn-secondary setting-toggle-btn ${contrast === 'high' ? 'active' : ''}`}
              >
                {contrast === 'high' ? <Sun size={18} /> : <Moon size={18} />}
                <span>{contrast === 'high' ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================================
            2. Daily Wellness Targets
            ====================================================================== */}
        <section className="card settings-section-card" aria-label="Daily Targets">
          <div className="settings-card-header">
            <div className="settings-icon-circle bg-amber-100 text-accent-amber">
              <Target size={22} />
            </div>
            <div>
              <h3 className="section-title">Daily Wellness Goals</h3>
              <p className="section-subtitle">Set safe, achievable daily milestones</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs font-bold text-muted block mb-1">Daily Steps Target</label>
              <input
                type="number"
                value={formDataGoals.stepsGoal}
                onChange={(e) => setFormDataGoals({ ...formDataGoals, stepsGoal: Number(e.target.value) })}
                className="setting-input-field"
                step="500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Water Goal (Glasses)</label>
              <input
                type="number"
                value={formDataGoals.waterGlassesGoal}
                onChange={(e) => setFormDataGoals({ ...formDataGoals, waterGlassesGoal: Number(e.target.value) })}
                className="setting-input-field"
                min="4"
                max="16"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Active Movement (mins)</label>
              <input
                type="number"
                value={formDataGoals.activeMinutesGoal}
                onChange={(e) => setFormDataGoals({ ...formDataGoals, activeMinutesGoal: Number(e.target.value) })}
                className="setting-input-field"
                min="10"
                max="120"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Calorie Burn Goal (kcal)</label>
              <input
                type="number"
                value={formDataGoals.caloriesBurnGoal}
                onChange={(e) => setFormDataGoals({ ...formDataGoals, caloriesBurnGoal: Number(e.target.value) })}
                className="setting-input-field"
                step="50"
              />
            </div>
          </div>
        </section>

        {/* ======================================================================
            3. Member Profile & Emergency Caregiver Contact
            ====================================================================== */}
        <section className="card settings-section-card" aria-label="Profile and Emergency Contacts">
          <div className="settings-card-header">
            <div className="settings-icon-circle bg-coral-100 text-danger">
              <Phone size={22} />
            </div>
            <div>
              <h3 className="section-title">Profile & Emergency Contacts</h3>
              <p className="section-subtitle">Notified immediately upon triggering 1-Tap SOS</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <div>
              <label className="text-xs font-bold text-muted block mb-1">Member Full Name</label>
              <input
                type="text"
                value={formDataUser.name}
                onChange={(e) => setFormDataUser({ ...formDataUser, name: e.target.value })}
                className="setting-input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted block mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={formDataUser.emergencyContact.name}
                  onChange={(e) => setFormDataUser({
                    ...formDataUser,
                    emergencyContact: { ...formDataUser.emergencyContact, name: e.target.value }
                  })}
                  className="setting-input-field"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Contact Relationship</label>
                <input
                  type="text"
                  value={formDataUser.emergencyContact.relation}
                  onChange={(e) => setFormDataUser({
                    ...formDataUser,
                    emergencyContact: { ...formDataUser.emergencyContact, relation: e.target.value }
                  })}
                  className="setting-input-field"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Emergency Phone Number</label>
              <input
                type="tel"
                value={formDataUser.emergencyContact.phone}
                onChange={(e) => setFormDataUser({
                  ...formDataUser,
                  emergencyContact: { ...formDataUser.emergencyContact, phone: e.target.value }
                })}
                className="setting-input-field"
                required
              />
            </div>
          </div>
        </section>

        {/* Save & Reset Actions */}
        <div className="settings-actions-footer">
          <button type="submit" className="btn btn-primary">
            <Save size={20} />
            <span>Save Preferences</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn btn-secondary"
          >
            <RotateCcw size={18} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </form>

      <style>{`
        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-section-card {
          padding: 1.75rem;
        }

        .settings-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        .settings-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-amber-100 { background-color: var(--accent-amber-light); }

        .settings-options-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .option-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .font-size-button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .setting-toggle-btn {
          padding: 0.45rem 1rem;
          font-size: var(--text-xs);
          min-height: 42px;
        }

        .setting-toggle-btn.active {
          background-color: var(--primary-600);
          color: white;
          border-color: var(--primary-600);
        }

        .setting-input-field {
          width: 100%;
          min-height: 46px;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border-medium);
          font-family: inherit;
          font-size: var(--text-base);
          font-weight: 600;
          background-color: var(--bg-surface);
          color: var(--text-primary);
        }

        .setting-input-field:focus {
          outline: none;
          border-color: var(--primary-500);
        }

        .settings-actions-footer {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};
