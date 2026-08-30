import React, { useState } from 'react';
import { HealthProvider } from './context/HealthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { BadgeModal } from './components/common/BadgeModal';
import { QuickLogModal } from './components/common/QuickLogModal';
import { AIAssistantWidget } from './components/AI/AIAssistantWidget';

// Views
import { DashboardHome } from './components/Dashboard/DashboardHome';
import { WaterTracker } from './components/Water/WaterTracker';
import { ExerciseTracker } from './components/Exercise/ExerciseTracker';
import { MealTracker } from './components/Meals/MealTracker';
import { ProgressDashboard } from './components/Progress/ProgressDashboard';
import { SleepTracker } from './components/Sleep/SleepTracker';
import { DailyGoals } from './components/Goals/DailyGoals';
import { ReminderSettings } from './components/Reminders/ReminderSettings';
import { AIAssistantPage } from './components/AI/AIAssistantPage';
import { ProfileSettings } from './components/Profile/ProfileSettings';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [quickLogOpen, setQuickLogOpen] = useState<boolean>(false);
  const [quickLogInitialTab, setQuickLogInitialTab] = useState<'water' | 'steps' | 'workout' | 'meal' | 'sleep'>('water');

  const openQuickLog = (tab?: 'water' | 'steps' | 'workout' | 'meal' | 'sleep') => {
    if (tab) setQuickLogInitialTab(tab);
    setQuickLogOpen(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome setActiveTab={setActiveTab} onOpenQuickLog={openQuickLog} />;
      case 'water':
        return <WaterTracker />;
      case 'exercise':
        return <ExerciseTracker />;
      case 'meals':
        return <MealTracker />;
      case 'progress':
        return <ProgressDashboard />;
      case 'sleep':
        return <SleepTracker />;
      case 'goals':
        return <DailyGoals />;
      case 'reminders':
        return <ReminderSettings />;
      case 'ai':
        return <AIAssistantPage />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <DashboardHome setActiveTab={setActiveTab} onOpenQuickLog={openQuickLog} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white font-body relative">
      
      {/* 1. Left Sidebar (Fixed 260px) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 2. Main Content Area (Occupies full remaining viewport) */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuickLog={() => openQuickLog('water')}
          onToggleMobileSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 w-full max-w-[1600px] mx-auto min-w-0">
          {renderActiveView()}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 4. Global Modals & Floating Widgets */}
      <ToastContainer />
      <BadgeModal />
      <QuickLogModal
        isOpen={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
        initialTab={quickLogInitialTab}
      />
      <AIAssistantWidget />

    </div>
  );
}

export default function App() {
  return (
    <HealthProvider>
      <AppContent />
    </HealthProvider>
  );
}
