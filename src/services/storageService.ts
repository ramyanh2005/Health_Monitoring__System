import type { UserProfile } from '../types/user';
import { DEMO_USER } from '../data/demoUser';
import type { DailyGoalStatus, WaterLog, Badge, StreakData, NotificationItem, DayProgress } from '../types/wellness';
import { INITIAL_BADGES } from '../data/badgesData';
import { INITIAL_NOTIFICATIONS } from '../data/notificationsData';
import { DEFAULT_ACCESSIBILITY_SETTINGS } from '../types/accessibility';
import type { AccessibilitySettings } from '../types/accessibility';

const KEYS = {
  USER_PROFILE: 'nutritrack_disabled_user_profile',
  WATER_LOGS: 'nutritrack_disabled_water_logs',
  DAILY_STATUS: 'nutritrack_disabled_daily_status',
  STREAK_DATA: 'nutritrack_disabled_streak_data',
  BADGES_DATA: 'nutritrack_disabled_badges_data',
  NOTIFICATIONS: 'nutritrack_disabled_notifications',
  ACCESSIBILITY: 'nutritrack_disabled_accessibility',
  WEEKLY_PROGRESS: 'nutritrack_disabled_weekly_progress',
  LOGGED_MEALS: 'nutritrack_disabled_logged_meals'
};

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const storageService = {
  getTodayString,

  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  },

  getWaterLogs(): WaterLog[] {
    try {
      const data = localStorage.getItem(KEYS.WATER_LOGS);
      return data ? JSON.parse(data) : [
        { id: 'w1', amountMl: 500, timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
        { id: 'w2', amountMl: 500, timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
        { id: 'w3', amountMl: 400, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      ];
    } catch {
      return [];
    }
  },

  saveWaterLogs(logs: WaterLog[]): void {
    try {
      localStorage.setItem(KEYS.WATER_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save water logs', e);
    }
  },

  getDailyGoalStatus(user: UserProfile): DailyGoalStatus {
    const today = getTodayString();
    try {
      const data = localStorage.getItem(KEYS.DAILY_STATUS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.date === today) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    // Default initial status for demo
    const initial: DailyGoalStatus = {
      date: today,
      waterTargetMl: user.dailyWaterTargetMl || 2200,
      waterCurrentMl: 1400,
      waterCompleted: false,
      activityTargetMin: user.dailyActivityTargetMin || 20,
      activityCurrentMin: 15,
      activityCompleted: false,
      nutritionTargetCount: 3,
      nutritionCurrentCount: 2,
      nutritionCompleted: false,
      allCompleted: false
    };
    return initial;
  },

  saveDailyGoalStatus(status: DailyGoalStatus): void {
    try {
      localStorage.setItem(KEYS.DAILY_STATUS, JSON.stringify(status));
    } catch (e) {
      console.error('Failed to save daily goal status', e);
    }
  },

  getStreakData(): StreakData {
    try {
      const data = localStorage.getItem(KEYS.STREAK_DATA);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }

    return {
      currentStreak: 7,
      bestStreak: 12,
      lastActiveDate: getTodayString(),
      weeklyDays: [
        { day: 'Mon', date: '2026-08-18', completed: true, isToday: false },
        { day: 'Tue', date: '2026-08-19', completed: true, isToday: false },
        { day: 'Wed', date: '2026-08-20', completed: true, isToday: false },
        { day: 'Thu', date: '2026-08-21', completed: true, isToday: false },
        { day: 'Fri', date: '2026-08-22', completed: true, isToday: false },
        { day: 'Sat', date: '2026-08-23', completed: true, isToday: false },
        { day: 'Sun', date: '2026-08-24', completed: true, isToday: true }
      ]
    };
  },

  saveStreakData(streak: StreakData): void {
    try {
      localStorage.setItem(KEYS.STREAK_DATA, JSON.stringify(streak));
    } catch (e) {
      console.error('Failed to save streak', e);
    }
  },

  getBadges(): Badge[] {
    try {
      const data = localStorage.getItem(KEYS.BADGES_DATA);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_BADGES;
  },

  saveBadges(badges: Badge[]): void {
    try {
      localStorage.setItem(KEYS.BADGES_DATA, JSON.stringify(badges));
    } catch (e) {
      console.error('Failed to save badges', e);
    }
  },

  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  },

  saveNotifications(notifications: NotificationItem[]): void {
    try {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  },

  getWeeklyProgress(): DayProgress[] {
    try {
      const data = localStorage.getItem(KEYS.WEEKLY_PROGRESS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }

    return [
      { dayName: 'Mon', date: '2026-08-18', waterMl: 2200, waterTargetMl: 2200, activityMin: 25, activityTargetMin: 20, goalsAchievedCount: 3, isToday: false },
      { dayName: 'Tue', date: '2026-08-19', waterMl: 2300, waterTargetMl: 2200, activityMin: 20, activityTargetMin: 20, goalsAchievedCount: 3, isToday: false },
      { dayName: 'Wed', date: '2026-08-20', waterMl: 2000, waterTargetMl: 2200, activityMin: 15, activityTargetMin: 20, goalsAchievedCount: 2, isToday: false },
      { dayName: 'Thu', date: '2026-08-21', waterMl: 2400, waterTargetMl: 2200, activityMin: 30, activityTargetMin: 20, goalsAchievedCount: 3, isToday: false },
      { dayName: 'Fri', date: '2026-08-22', waterMl: 2200, waterTargetMl: 2200, activityMin: 20, activityTargetMin: 20, goalsAchievedCount: 3, isToday: false },
      { dayName: 'Sat', date: '2026-08-23', waterMl: 2500, waterTargetMl: 2200, activityMin: 25, activityTargetMin: 20, goalsAchievedCount: 3, isToday: false },
      { dayName: 'Sun', date: '2026-08-24', waterMl: 1400, waterTargetMl: 2200, activityMin: 15, activityTargetMin: 20, goalsAchievedCount: 1, isToday: true }
    ];
  },

  getLoggedMeals(): string[] {
    try {
      const data = localStorage.getItem(KEYS.LOGGED_MEALS);
      return data ? JSON.parse(data) : ['breakfast', 'lunch'];
    } catch {
      return ['breakfast', 'lunch'];
    }
  },

  saveLoggedMeals(loggedIds: string[]): void {
    try {
      localStorage.setItem(KEYS.LOGGED_MEALS, JSON.stringify(loggedIds));
    } catch (e) {
      console.error('Failed to save logged meals', e);
    }
  },

  getAccessibilitySettings(): AccessibilitySettings {
    try {
      const data = localStorage.getItem(KEYS.ACCESSIBILITY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  },

  saveAccessibilitySettings(settings: AccessibilitySettings): void {
    try {
      localStorage.setItem(KEYS.ACCESSIBILITY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save accessibility settings', e);
    }
  },

  resetAllDemoData(): void {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  }
};
