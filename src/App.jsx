import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Header } from './components/layout/Header';
import { DailyDashboard } from './components/dashboard/DailyDashboard';
import { DailyMeals } from './components/meals/DailyMeals';
import { SuggestedExercises } from './components/exercises/SuggestedExercises';
import { ExtendedCatalog } from './components/exercises/ExtendedCatalog';
import { ProgressDashboard } from './components/progress/ProgressDashboard';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { EmergencySOSModal } from './components/modals/EmergencySOSModal';
import { MedicationModal } from './components/modals/MedicationModal';
import { VitalsModal } from './components/modals/VitalsModal';
import { RecipeModal } from './components/modals/RecipeModal';
import { ActivityLogModal } from './components/modals/ActivityLogModal';
import { ExerciseCoachModal } from './components/exercises/ExerciseCoachModal';
import { SupabaseConnectModal } from './components/modals/SupabaseConnectModal';

export const App = () => {
  const { activeTab, activeModal, toastMessage } = useApp();

  return (
    <div className="app-container">
      {/* Persistent Left Nav Rail & Mobile Bottom Tab Bar */}
      <Navbar />

      {/* Main App Body */}
      <div className="main-wrapper">
        <Header />

        <main className="content-area">
          {activeTab === 'dashboard' && <DailyDashboard />}
          {activeTab === 'exercises' && <SuggestedExercises />}
          {activeTab === 'catalog' && <ExtendedCatalog />}
          {activeTab === 'meals' && <DailyMeals />}
          {activeTab === 'progress' && <ProgressDashboard />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Dynamic Modals */}
      {activeModal === 'emergency' && <EmergencySOSModal />}
      {activeModal === 'medication' && <MedicationModal />}
      {activeModal === 'vitals' && <VitalsModal />}
      {activeModal === 'recipe' && <RecipeModal />}
      {activeModal === 'activityLog' && <ActivityLogModal />}
      {activeModal === 'exerciseCoach' && <ExerciseCoachModal />}
      {activeModal === 'supabase' && <SupabaseConnectModal />}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`toast-banner-container toast-${toastMessage.type || 'info'} fade-in`}>
          <div className="toast-content">
            <span className="toast-text">{toastMessage.message}</span>
          </div>
        </div>
      )}

      <style>{`
        .toast-banner-container {
          position: fixed;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--primary-900);
          color: #ffffff;
          padding: 0.85rem 1.75rem;
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-xl), 0 4px 20px rgba(0, 0, 0, 0.25);
          z-index: 1100;
          font-weight: 700;
          font-size: var(--text-sm);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          max-width: 90vw;
          text-align: center;
        }

        @media (min-width: 1024px) {
          .toast-banner-container {
            bottom: 32px;
          }
        }

        .toast-celebration {
          background: linear-gradient(135deg, var(--primary-700), var(--primary-900));
          border: 1.5px solid var(--primary-300);
        }

        .toast-error {
          background: linear-gradient(135deg, var(--danger-main), #850014);
          border: 1.5px solid #ff8090;
        }
      `}</style>
    </div>
  );
};
export default App;
