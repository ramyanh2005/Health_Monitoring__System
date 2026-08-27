import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile } from '../types/user';
import type { DailyGoalStatus, WaterLog, Badge, StreakData, NotificationItem, DayProgress } from '../types/wellness';
import type { Exercise } from '../types/exercise';
import { storageService } from '../services/storageService';
import { wellnessService } from '../services/wellnessService';
import { supabaseDbService } from '../services/supabaseDbService';
import { useAccessibility } from './AccessibilityContext';


interface WellnessContextType {
  userProfile: UserProfile;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  dailyGoalStatus: DailyGoalStatus;
  waterLogs: WaterLog[];
  addWater: (amountMl: number) => void;
  streakData: StreakData;
  badges: Badge[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  loggedMeals: string[];
  toggleMealLogged: (mealId: string) => void;
  weeklyProgress: DayProgress[];
  logActivityMinutes: (minutes: number, exerciseTitle?: string) => void;
  
  // Modals & UI Triggers
  activeExercise: Exercise | null;
  setActiveExercise: (exercise: Exercise | null) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  isAccessibilityModalOpen: boolean;
  setIsAccessibilityModalOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  unlockedBadgeCelebration: Badge | null;
  setUnlockedBadgeCelebration: (badge: Badge | null) => void;
  resetToDemoDefaults: () => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export const WellnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { announce } = useAccessibility();

  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => storageService.getWaterLogs());
  const [dailyGoalStatus, setDailyGoalStatus] = useState<DailyGoalStatus>(() => storageService.getDailyGoalStatus(userProfile));
  const [streakData, setStreakData] = useState<StreakData>(() => storageService.getStreakData());
  const [badges, setBadges] = useState<Badge[]>(() => storageService.getBadges());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storageService.getNotifications());
  const [loggedMeals, setLoggedMeals] = useState<string[]>(() => storageService.getLoggedMeals());
  const [weeklyProgress, setWeeklyProgress] = useState<DayProgress[]>(() => storageService.getWeeklyProgress());

  // Modal State
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [unlockedBadgeCelebration, setUnlockedBadgeCelebration] = useState<Badge | null>(null);

  // Sync to storage & cloud Supabase
  useEffect(() => {
    storageService.saveUserProfile(userProfile);
    supabaseDbService.syncUserProfile(userProfile).catch(() => {});
  }, [userProfile]);


  useEffect(() => {
    storageService.saveWaterLogs(waterLogs);
  }, [waterLogs]);

  useEffect(() => {
    storageService.saveDailyGoalStatus(dailyGoalStatus);
  }, [dailyGoalStatus]);

  useEffect(() => {
    storageService.saveStreakData(streakData);
  }, [streakData]);

  useEffect(() => {
    storageService.saveBadges(badges);
  }, [badges]);

  useEffect(() => {
    storageService.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    storageService.saveLoggedMeals(loggedMeals);
  }, [loggedMeals]);

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updated };
      // Recalculate default recommended targets if height/weight/activity changed and target was standard
      if (updated.weightKg || updated.activityLevel) {
        const newWaterTarget = wellnessService.calculateRecommendedWater(next.weightKg, next.activityLevel);
        const newActivityTarget = wellnessService.calculateRecommendedActivityMin(next.mobilityLevel, next.activityLevel);
        next.dailyWaterTargetMl = updated.dailyWaterTargetMl || newWaterTarget;
        next.dailyActivityTargetMin = updated.dailyActivityTargetMin || newActivityTarget;
      }
      announce('Profile updated successfully.');
      return next;
    });
  };

  const unlockBadge = (badgeId: string) => {
    setBadges((prev) =>
      prev.map((b) => {
        if (b.id === badgeId && !b.unlocked) {
          const unlockedBadge = { ...b, unlocked: true, unlockedAt: storageService.getTodayString(), progress: 100 };
          setUnlockedBadgeCelebration(unlockedBadge);
          wellnessService.celebrateGoal();
          announce(`Congratulations! You unlocked the ${b.title} badge!`);
          return unlockedBadge;
        }
        return b;
      })
    );
  };

  const addWater = (amountMl: number) => {
    const newLog: WaterLog = {
      id: 'w_' + Date.now(),
      amountMl,
      timestamp: new Date().toISOString()
    };

    setWaterLogs((prev) => [newLog, ...prev]);

    setDailyGoalStatus((prev) => {
      const newTotal = prev.waterCurrentMl + amountMl;
      const reachedGoal = newTotal >= prev.waterTargetMl;
      const justCompleted = reachedGoal && !prev.waterCompleted;

      if (justCompleted) {
        wellnessService.celebrateGoal();
        announce(`Great! You reached today's hydration target of ${wellnessService.formatLiters(prev.waterTargetMl)}!`);
        unlockBadge('badge_water_hero');
      } else {
        announce(`Added ${amountMl} ml of water. Total today: ${wellnessService.formatLiters(newTotal)}`);
      }

      // Update weekly chart today entry
      setWeeklyProgress((wPrev) =>
        wPrev.map((d) => (d.isToday ? { ...d, waterMl: newTotal } : d))
      );

      return {
        ...prev,
        waterCurrentMl: newTotal,
        waterCompleted: reachedGoal,
        allCompleted: reachedGoal && prev.activityCompleted && prev.nutritionCompleted
      };
    });
  };

  const logActivityMinutes = (minutes: number, exerciseTitle?: string) => {
    setDailyGoalStatus((prev) => {
      const newMinutes = prev.activityCurrentMin + minutes;
      const reachedGoal = newMinutes >= prev.activityTargetMin;
      const justCompleted = reachedGoal && !prev.activityCompleted;

      if (justCompleted) {
        wellnessService.celebrateGoal();
        announce(`Awesome work! You reached today's movement goal of ${prev.activityTargetMin} minutes!`);
        unlockBadge('badge_active_starter');
      } else {
        announce(`Logged ${minutes} minutes of ${exerciseTitle || 'activity'}. Total: ${newMinutes} minutes.`);
      }

      // Unlock Mindful Mover badge
      unlockBadge('badge_mindful_mover');

      // Update weekly chart today entry
      setWeeklyProgress((wPrev) =>
        wPrev.map((d) => (d.isToday ? { ...d, activityMin: newMinutes } : d))
      );

      return {
        ...prev,
        activityCurrentMin: newMinutes,
        activityCompleted: reachedGoal,
        allCompleted: prev.waterCompleted && reachedGoal && prev.nutritionCompleted
      };
    });
  };

  const toggleMealLogged = (mealId: string) => {
    setLoggedMeals((prev) => {
      const isAlready = prev.includes(mealId);
      const next = isAlready ? prev.filter((id) => id !== mealId) : [...prev, mealId];
      
      const count = next.length;
      const reachedGoal = count >= 3;

      setDailyGoalStatus((dPrev) => {
        const justCompleted = reachedGoal && !dPrev.nutritionCompleted;
        if (justCompleted) {
          wellnessService.celebrateGoal();
          announce("Great! You've logged your nourishing meals for today.");
          unlockBadge('badge_healthy_choice');
        }
        return {
          ...dPrev,
          nutritionCurrentCount: count,
          nutritionCompleted: reachedGoal,
          allCompleted: dPrev.waterCompleted && dPrev.activityCompleted && reachedGoal
        };
      });

      announce(isAlready ? 'Meal un-logged' : 'Meal logged successfully');
      return next;
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    announce('All notifications marked as read');
  };

  const resetToDemoDefaults = () => {
    storageService.resetAllDemoData();
    setUserProfile(storageService.getUserProfile());
    setWaterLogs(storageService.getWaterLogs());
    setDailyGoalStatus(storageService.getDailyGoalStatus(storageService.getUserProfile()));
    setStreakData(storageService.getStreakData());
    setBadges(storageService.getBadges());
    setNotifications(storageService.getNotifications());
    setLoggedMeals(storageService.getLoggedMeals());
    setWeeklyProgress(storageService.getWeeklyProgress());
    announce('Demo data reset to initial default state.');
  };

  return (
    <WellnessContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        dailyGoalStatus,
        waterLogs,
        addWater,
        streakData,
        badges,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        loggedMeals,
        toggleMealLogged,
        weeklyProgress,
        logActivityMinutes,
        activeExercise,
        setActiveExercise,
        isEditProfileOpen,
        setIsEditProfileOpen,
        isAccessibilityModalOpen,
        setIsAccessibilityModalOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        unlockedBadgeCelebration,
        setUnlockedBadgeCelebration,
        resetToDemoDefaults
      }}
    >
      {children}
    </WellnessContext.Provider>
  );
};

export const useWellness = (): WellnessContextType => {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
};
