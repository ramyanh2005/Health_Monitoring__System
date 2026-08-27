import React from 'react';
import { AccessibilityProvider } from '../../context/AccessibilityContext';
import { WellnessProvider, useWellness } from '../../context/WellnessContext';
import { DashboardHeader } from '../../components/header/DashboardHeader';
import { NotificationDrawer } from '../../components/header/NotificationDrawer';
import { DisclaimerBanner } from '../../components/common/DisclaimerBanner';
import { ScreenReaderLive } from '../../components/common/ScreenReaderLive';
import { HealthSummary } from '../../components/summary/HealthSummary';
import { WellnessProfileCard } from '../../components/profile/WellnessProfileCard';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { DailyGoals } from '../../components/goals/DailyGoals';
import { WaterTracker } from '../../components/water/WaterTracker';
import { QuickActions } from '../../components/quickActions/QuickActions';
import { AIWellnessInsights } from '../../components/ai/AIWellnessInsights';
import { ExerciseSection } from '../../components/exercises/ExerciseSection';
import { MealSuggestions } from '../../components/meals/MealSuggestions';
import { StreakCard } from '../../components/progress/StreakCard';
import { WeeklyProgressChart } from '../../components/progress/WeeklyProgressChart';
import { BadgeSection } from '../../components/progress/BadgeSection';
import { AccessibilitySettingsModal } from '../../components/accessibility/AccessibilitySettingsModal';
import { NutriBotChat } from '../../components/chatbot/NutriBotChat';
import { HeartPulse } from 'lucide-react';
import './DisabledDashboard.css';


/**
 * Inner Dashboard Component that accesses the live WellnessContext
 */
const DashboardContent: React.FC = () => {
  const { isNotificationDrawerOpen, setIsNotificationDrawerOpen } = useWellness();

  return (
    <div className="dashboard-container">
      {/* Top Banner & Header */}
      <DashboardHeader />

      {/* Screen Reader Live Announcements */}
      <ScreenReaderLive />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />

      {/* Main Dashboard Layout */}
      <main id="main-content" className="dashboard-main" role="main">
        {/* Medical & Wellness Disclaimer Banner */}
        <DisclaimerBanner />

        {/* 1. Health & Biometric Summary (BMI gauge, Weight, Height, Activity) */}
        <HealthSummary />

        {/* 2. Today's Daily Goals & Dedicated Water Tracker */}
        <div className="dashboard-grid-2col">
          <DailyGoals />
          <WaterTracker />
        </div>

        {/* 3. Quick Actions */}
        <QuickActions />

        {/* 4. AI Wellness Insights */}
        <AIWellnessInsights />

        {/* 5. Streak & Personalized Wellness Profile */}
        <div className="dashboard-grid-equal">
          <StreakCard />
          <WellnessProfileCard />
        </div>

        {/* 6. Recommended Activities (Seated, Mobility, Breathing & Step-by-Step Player) */}
        <ExerciseSection />

        {/* 7. Today's Wholesome Meal Suggestions */}
        <MealSuggestions />

        {/* 8. Weekly Progress & Consistency Chart */}
        <WeeklyProgressChart />

        {/* 9. Milestones & Badges */}
        <BadgeSection />
      </main>

      {/* Global Modals & AI Chatbot */}
      <EditProfileModal />
      <AccessibilitySettingsModal />
      <NutriBotChat />

      {/* Footer */}

      <footer className="dashboard-footer" role="contentinfo">
        <div className="dashboard-footer-inner">
          <DisclaimerBanner compact />

          <div className="dashboard-footer-bottom">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HeartPulse size={18} color="var(--color-primary)" />
              <span><strong>NutriTrack AI</strong> &bull; Disabled Citizen Health & Wellness Module</span>
            </div>

            <div>
              <span>Designed with WCAG AA/AAA Accessibility, Low-Impact Routines & Universal Inclusivity.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/**
 * DisabledDashboard Module Entry Point
 * Self-contained with its own Context Providers for seamless merging into the team repository.
 */
export const DisabledDashboard: React.FC = () => {
  return (
    <AccessibilityProvider>
      <WellnessProvider>
        <DashboardContent />
      </WellnessProvider>
    </AccessibilityProvider>
  );
};

export default DisabledDashboard;
