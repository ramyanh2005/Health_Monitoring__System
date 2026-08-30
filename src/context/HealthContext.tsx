import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  DailyLog,
  GoalSettings,
  ReminderItem,
  AchievementBadge,
  MealItem,
  WorkoutItem,
  SleepLog,
  WaterLogEntry,
  FitnessGoal,
  ActivityLevel
} from '../types/health';
import { calculateHealthScore, calculateBMRAndTDEE } from '../utils/calculations';
import { sound } from '../utils/audio';
import { reminderEngine, ActiveNotification } from '../services/reminderEngine';

const STORAGE_KEY = 'healthy_me_male_clean_v3_store';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: 0,
  gender: 'male',
  heightCm: 0,
  weightKg: 0,
  targetWeightKg: 0,
  fitnessGoal: 'muscle_gain',
  activityLevel: 'moderately_active',
  dietaryPreference: 'high_protein',
  allergies: [],
  theme: 'light',
  soundEnabled: true,
  notificationsEnabled: true,
  avatarUrl: '', // No fake human face photo
  isProfileSetup: false, // Triggers Onboarding Modal on first launch
  publicDeploymentUrl: ''
};

const DEFAULT_GOALS: GoalSettings = {
  waterMl: 3000,
  steps: 10000,
  exerciseMinutes: 30,
  sleepHours: 8,
  calories: 2200,
  proteinGrams: 140,
  carbsGrams: 220,
  fatGrams: 65
};

const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-water',
    type: 'water',
    title: '💧 Hydration Check',
    message: 'Drink 250-350ml of water to keep athletic performance and metabolic recovery sharp.',
    intervalMinutes: 60,
    time: '10:30',
    enabled: true
  },
  {
    id: 'rem-breakfast',
    type: 'breakfast',
    title: '🍳 High-Protein Breakfast',
    message: 'Fuel your morning with eggs, oats, and quality amino acids.',
    time: '08:00',
    enabled: true
  },
  {
    id: 'rem-lunch',
    type: 'lunch',
    title: '🥗 Nutritious Power Lunch',
    message: 'Lean chicken or fish with complex carbs for steady energy and vitality.',
    time: '13:00',
    enabled: true
  },
  {
    id: 'rem-exercise',
    type: 'exercise',
    title: '🏋️ Workout Session',
    message: 'Time for strength resistance training or high-intensity conditioning.',
    time: '17:30',
    enabled: true
  },
  {
    id: 'rem-dinner',
    type: 'dinner',
    title: '🥩 Muscle Recovery Dinner',
    message: 'Clean protein and antioxidant greens to repair muscle tissue overnight.',
    time: '20:00',
    enabled: true
  },
  {
    id: 'rem-sleep',
    type: 'sleep',
    title: '🌙 Circadian Sleep Prep',
    message: 'Dim lights and disconnect from screens for restorative sleep.',
    time: '22:45',
    enabled: true
  }
];

const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'badge-water-master',
    title: 'Hydration Hero',
    description: 'Drank 3.0L or more water in a single day',
    icon: '💧',
    category: 'hydration',
    unlocked: false,
    currentProgress: 0,
    maxProgress: 3000,
    unit: 'ml'
  },
  {
    id: 'badge-step-champion',
    title: '10K Steps Master',
    description: 'Reached 10,000 steps in one day',
    icon: '👟',
    category: 'fitness',
    unlocked: false,
    currentProgress: 0,
    maxProgress: 10000,
    unit: 'steps'
  },
  {
    id: 'badge-workout-streak',
    title: 'Male Vitality Warrior',
    description: 'Logged 30+ minutes of exercise in a single day',
    icon: '🔥',
    category: 'fitness',
    unlocked: false,
    currentProgress: 0,
    maxProgress: 30,
    unit: 'min'
  },
  {
    id: 'badge-sleep-guru',
    title: 'Rest & Anabolism',
    description: 'Achieved 8+ hours of deep restorative sleep',
    icon: '🌙',
    category: 'sleep',
    unlocked: false,
    currentProgress: 0,
    maxProgress: 8,
    unit: 'hrs'
  },
  {
    id: 'badge-perfect-score',
    title: 'Peak Male Performance',
    description: 'Attained a Health Score of 90 or higher',
    icon: '👑',
    category: 'general',
    unlocked: false,
    currentProgress: 0,
    maxProgress: 90,
    unit: 'pts'
  },
  {
    id: 'badge-clean-eater',
    title: 'High-Protein Discipline',
    description: 'Logged 3 balanced meals in one day',
    icon: '🥗',
    category: 'nutrition',
    unlocked: false,
    currentProgress: 0,
    maxProgress: 3,
    unit: 'meals'
  }
];

// Clean historical logs: NO fake random steps or fake water. Clean empty logs.
function generateInitialCleanLogs(goals: GoalSettings): Record<string, DailyLog> {
  const logs: Record<string, DailyLog> = {};
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const rawLog: DailyLog = {
      date: dateStr,
      waterIntakeMl: 0,
      waterGoalMl: goals.waterMl,
      waterEntries: [],
      steps: 0,
      stepGoal: goals.steps,
      exerciseMinutes: 0,
      exerciseGoalMinutes: goals.exerciseMinutes,
      sleep: {
        sleepTime: '23:00',
        wakeTime: '07:00',
        durationMinutes: 0,
        quality: 'Good',
        notes: ''
      },
      sleepGoalHours: goals.sleepHours,
      caloriesConsumed: 0,
      calorieGoal: goals.calories,
      meals: [],
      workouts: [],
      healthScore: 0
    };

    logs[dateStr] = rawLog;
  }

  return logs;
}

export interface HealthContextType {
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  todayLog: DailyLog;
  pastLogs: Record<string, DailyLog>;
  goalSettings: GoalSettings;
  updateGoalSettings: (goals: Partial<GoalSettings>) => void;
  reminders: ReminderItem[];
  toggleReminder: (id: string) => void;
  updateReminder: (reminder: ReminderItem) => void;
  addReminder: (reminder: Omit<ReminderItem, 'id'>) => void;
  deleteReminder: (id: string) => void;
  badges: AchievementBadge[];
  unlockedBadgeModal: AchievementBadge | null;
  dismissBadgeModal: () => void;
  notifications: ActiveNotification[];
  dismissNotification: (id: string) => void;
  
  // Real User Input Integration
  updateDailyHealthData: (data: {
    name?: string;
    age?: number;
    heightCm?: number;
    weightKg?: number;
    waterIntakeMl?: number;
    steps?: number;
    exerciseMinutes?: number;
    sleepHours?: number;
    fitnessGoal?: FitnessGoal;
    activityLevel?: ActivityLevel;
  }) => void;

  setBmiMetrics: (heightCm: number, weightKg: number) => void;

  // Quick Actions & Loggers
  addWater: (amountMl: number) => void;
  setWaterIntake: (amountMl: number) => void;
  removeWaterEntry: (id: string) => void;
  setWaterGoal: (amountMl: number) => void;
  addSteps: (amount: number) => void;
  setSteps: (totalSteps: number) => void;
  addWorkout: (workout: Omit<WorkoutItem, 'id' | 'timestamp' | 'completed'>) => void;
  setExerciseMinutes: (mins: number) => void;
  toggleWorkoutCompleted: (id: string) => void;
  deleteWorkout: (id: string) => void;
  addMeal: (meal: Omit<MealItem, 'id' | 'timestamp' | 'completed'>) => void;
  toggleMealCompleted: (id: string) => void;
  deleteMeal: (id: string) => void;
  updateSleep: (sleep: Partial<SleepLog>) => void;
  
  // Utilities
  triggerReminderTest: (type?: string) => void;
  requestNotificationPermission: () => Promise<boolean>;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  resetToDefaults: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Initial State Hydration from LocalStorage
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [goalSettings, setGoalSettings] = useState<GoalSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_goals`);
      return saved ? JSON.parse(saved) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_reminders`);
      return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
    } catch {
      return DEFAULT_REMINDERS;
    }
  });

  const [badges, setBadges] = useState<AchievementBadge[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_badges`);
      return saved ? JSON.parse(saved) : INITIAL_BADGES;
    } catch {
      return INITIAL_BADGES;
    }
  });

  const [pastLogs, setPastLogs] = useState<Record<string, DailyLog>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
      return saved ? JSON.parse(saved) : generateInitialCleanLogs(DEFAULT_GOALS);
    } catch {
      return generateInitialCleanLogs(DEFAULT_GOALS);
    }
  });

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [unlockedBadgeModal, setUnlockedBadgeModal] = useState<AchievementBadge | null>(null);
  const [notifications, setNotifications] = useState<ActiveNotification[]>([]);

  // Apply Theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
    sound.setEnabled(profile.soundEnabled);
    reminderEngine.setSoundEnabled(profile.soundEnabled);
    reminderEngine.setReminders(reminders);
  }, [profile.theme, profile.soundEnabled, reminders]);

  // Subscribe to Reminder Engine notifications
  useEffect(() => {
    const unsubscribe = reminderEngine.subscribe((notif) => {
      setNotifications(prev => [notif, ...prev.slice(0, 4)]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(goalSettings));
  }, [goalSettings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_reminders`, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_badges`, JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(pastLogs));
  }, [pastLogs]);

  // Ensure current selected date has a valid DailyLog object
  const getOrCreateLogForDate = useCallback((date: string, currentLogs: Record<string, DailyLog>): DailyLog => {
    if (currentLogs[date]) {
      return currentLogs[date];
    }
    const newLog: DailyLog = {
      date,
      waterIntakeMl: 0,
      waterGoalMl: goalSettings.waterMl,
      waterEntries: [],
      steps: 0,
      stepGoal: goalSettings.steps,
      exerciseMinutes: 0,
      exerciseGoalMinutes: goalSettings.exerciseMinutes,
      sleep: {
        sleepTime: '23:00',
        wakeTime: '07:00',
        durationMinutes: 0,
        quality: 'Good'
      },
      sleepGoalHours: goalSettings.sleepHours,
      caloriesConsumed: 0,
      calorieGoal: goalSettings.calories,
      meals: [],
      workouts: [],
      healthScore: 0
    };
    const { score, breakdown } = calculateHealthScore(newLog);
    newLog.healthScore = score;
    newLog.scoreBreakdown = breakdown;
    return newLog;
  }, [goalSettings]);

  const todayLog = pastLogs[selectedDate] || getOrCreateLogForDate(selectedDate, pastLogs);

  // Checks and triggers achievement badges
  const checkAchievements = useCallback((log: DailyLog) => {
    setBadges(prevBadges => {
      let newlyUnlocked: AchievementBadge | null = null;

      const updated = prevBadges.map(b => {
        let currentProgress = b.currentProgress;
        let unlocked = b.unlocked;

        if (b.id === 'badge-water-master') {
          currentProgress = log.waterIntakeMl;
          if (currentProgress >= b.maxProgress && !unlocked && currentProgress > 0) {
            unlocked = true;
            newlyUnlocked = { ...b, unlocked: true, unlockedDate: new Date().toLocaleDateString() };
          }
        } else if (b.id === 'badge-step-champion') {
          currentProgress = log.steps;
          if (currentProgress >= b.maxProgress && !unlocked && currentProgress > 0) {
            unlocked = true;
            newlyUnlocked = { ...b, unlocked: true, unlockedDate: new Date().toLocaleDateString() };
          }
        } else if (b.id === 'badge-workout-streak') {
          currentProgress = log.exerciseMinutes;
          if (currentProgress >= b.maxProgress && !unlocked && currentProgress > 0) {
            unlocked = true;
            newlyUnlocked = { ...b, unlocked: true, unlockedDate: new Date().toLocaleDateString() };
          }
        } else if (b.id === 'badge-sleep-guru') {
          currentProgress = parseFloat(((log.sleep?.durationMinutes || 0) / 60).toFixed(1));
          if (currentProgress >= b.maxProgress && !unlocked && currentProgress > 0) {
            unlocked = true;
            newlyUnlocked = { ...b, unlocked: true, unlockedDate: new Date().toLocaleDateString() };
          }
        } else if (b.id === 'badge-perfect-score') {
          currentProgress = log.healthScore;
          if (currentProgress >= b.maxProgress && !unlocked && currentProgress > 0) {
            unlocked = true;
            newlyUnlocked = { ...b, unlocked: true, unlockedDate: new Date().toLocaleDateString() };
          }
        } else if (b.id === 'badge-clean-eater') {
          currentProgress = log.meals.filter(m => m.completed).length;
          if (currentProgress >= b.maxProgress && !unlocked && currentProgress > 0) {
            unlocked = true;
            newlyUnlocked = { ...b, unlocked: true, unlockedDate: new Date().toLocaleDateString() };
          }
        }

        return {
          ...b,
          currentProgress,
          unlocked,
          unlockedDate: unlocked ? b.unlockedDate || new Date().toLocaleDateString() : undefined
        };
      });

      if (newlyUnlocked) {
        setUnlockedBadgeModal(newlyUnlocked);
        sound.playFanfare();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
      }

      return updated;
    });
  }, []);

  // Helper to safely mutate and recalculate a daily log
  const mutateCurrentLog = useCallback((modifier: (log: DailyLog) => void) => {
    setPastLogs(prev => {
      const current = prev[selectedDate] ? JSON.parse(JSON.stringify(prev[selectedDate])) : getOrCreateLogForDate(selectedDate, prev);
      modifier(current);
      
      const { score, breakdown } = calculateHealthScore(current);
      current.healthScore = score;
      current.scoreBreakdown = breakdown;

      checkAchievements(current);

      return {
        ...prev,
        [selectedDate]: current
      };
    });
  }, [selectedDate, getOrCreateLogForDate, checkAchievements]);

  // Profile Updates
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      const { recommendedCalories } = calculateBMRAndTDEE(updated);
      if (recommendedCalories > 0) {
        setGoalSettings(g => ({
          ...g,
          calories: recommendedCalories
        }));
      }
      return updated;
    });
    sound.playSuccess();
  }, []);

  // Sync BMI Metrics (Height & Weight)
  const setBmiMetrics = useCallback((heightCm: number, weightKg: number) => {
    updateProfile({ heightCm, weightKg });
  }, [updateProfile]);

  // Comprehensive Real User Input Handler
  const updateDailyHealthData = useCallback((data: {
    name?: string;
    age?: number;
    heightCm?: number;
    weightKg?: number;
    waterIntakeMl?: number;
    steps?: number;
    exerciseMinutes?: number;
    sleepHours?: number;
    fitnessGoal?: FitnessGoal;
    activityLevel?: ActivityLevel;
  }) => {
    const profileUpdates: Partial<UserProfile> = {};
    if (data.name !== undefined && data.name.trim()) profileUpdates.name = data.name.trim();
    if (data.age !== undefined && data.age > 0) profileUpdates.age = data.age;
    if (data.heightCm !== undefined && data.heightCm > 0) profileUpdates.heightCm = data.heightCm;
    if (data.weightKg !== undefined && data.weightKg > 0) profileUpdates.weightKg = data.weightKg;
    if (data.fitnessGoal !== undefined) profileUpdates.fitnessGoal = data.fitnessGoal;
    if (data.activityLevel !== undefined) profileUpdates.activityLevel = data.activityLevel;
    profileUpdates.isProfileSetup = true;

    if (Object.keys(profileUpdates).length > 0) {
      updateProfile(profileUpdates);
    }

    mutateCurrentLog(log => {
      if (data.waterIntakeMl !== undefined && data.waterIntakeMl >= 0) {
        log.waterIntakeMl = data.waterIntakeMl;
      }
      if (data.steps !== undefined && data.steps >= 0) {
        log.steps = data.steps;
      }
      if (data.exerciseMinutes !== undefined && data.exerciseMinutes >= 0) {
        log.exerciseMinutes = data.exerciseMinutes;
      }
      if (data.sleepHours !== undefined && data.sleepHours >= 0) {
        log.sleep = {
          ...(log.sleep || { sleepTime: '23:00', wakeTime: '07:00', quality: 'Good' }),
          durationMinutes: Math.round(data.sleepHours * 60)
        };
      }
    });

    sound.playSuccess();
  }, [updateProfile, mutateCurrentLog]);

  // Goal Updates
  const updateGoalSettings = useCallback((updates: Partial<GoalSettings>) => {
    setGoalSettings(prev => ({ ...prev, ...updates }));
    sound.playSuccess();
  }, []);

  // Reminder Management
  const toggleReminder = useCallback((id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    sound.playSuccess();
  }, []);

  const updateReminder = useCallback((updated: ReminderItem) => {
    setReminders(prev => prev.map(r => r.id === updated.id ? updated : r));
    sound.playSuccess();
  }, []);

  const addReminder = useCallback((item: Omit<ReminderItem, 'id'>) => {
    const newRem: ReminderItem = { ...item, id: `rem-${Date.now()}` };
    setReminders(prev => [...prev, newRem]);
    sound.playSuccess();
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  // Water Actions
  const addWater = useCallback((amountMl: number) => {
    mutateCurrentLog(log => {
      log.waterIntakeMl = Math.max(0, (log.waterIntakeMl || 0) + amountMl);
      const newEntry: WaterLogEntry = {
        id: `we-${Date.now()}`,
        amountMl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      log.waterEntries = [newEntry, ...(log.waterEntries || [])];
    });
    sound.playWaterSip();
  }, [mutateCurrentLog]);

  const setWaterIntake = useCallback((amountMl: number) => {
    mutateCurrentLog(log => {
      log.waterIntakeMl = Math.max(0, amountMl);
    });
    sound.playWaterSip();
  }, [mutateCurrentLog]);

  const removeWaterEntry = useCallback((id: string) => {
    mutateCurrentLog(log => {
      const entry = log.waterEntries.find(e => e.id === id);
      if (entry) {
        log.waterIntakeMl = Math.max(0, log.waterIntakeMl - entry.amountMl);
        log.waterEntries = log.waterEntries.filter(e => e.id !== id);
      }
    });
  }, [mutateCurrentLog]);

  const setWaterGoal = useCallback((amountMl: number) => {
    setGoalSettings(g => ({ ...g, waterMl: amountMl }));
    mutateCurrentLog(log => {
      log.waterGoalMl = amountMl;
    });
  }, [mutateCurrentLog]);

  // Steps Actions
  const addSteps = useCallback((amount: number) => {
    mutateCurrentLog(log => {
      log.steps = Math.max(0, (log.steps || 0) + amount);
    });
    sound.playSuccess();
  }, [mutateCurrentLog]);

  const setSteps = useCallback((totalSteps: number) => {
    mutateCurrentLog(log => {
      log.steps = Math.max(0, totalSteps);
    });
  }, [mutateCurrentLog]);

  // Workout Actions
  const addWorkout = useCallback((workoutData: Omit<WorkoutItem, 'id' | 'timestamp' | 'completed'>) => {
    const item: WorkoutItem = {
      ...workoutData,
      id: `w-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: true
    };

    mutateCurrentLog(log => {
      log.workouts = [item, ...(log.workouts || [])];
      log.exerciseMinutes = (log.exerciseMinutes || 0) + item.durationMinutes;
    });
    sound.playSuccess();
  }, [mutateCurrentLog]);

  const setExerciseMinutes = useCallback((mins: number) => {
    mutateCurrentLog(log => {
      log.exerciseMinutes = Math.max(0, mins);
    });
  }, [mutateCurrentLog]);

  const toggleWorkoutCompleted = useCallback((id: string) => {
    mutateCurrentLog(log => {
      const w = log.workouts.find(item => item.id === id);
      if (w) {
        w.completed = !w.completed;
        log.exerciseMinutes = log.workouts.filter(i => i.completed).reduce((acc, curr) => acc + curr.durationMinutes, 0);
      }
    });
  }, [mutateCurrentLog]);

  const deleteWorkout = useCallback((id: string) => {
    mutateCurrentLog(log => {
      log.workouts = log.workouts.filter(w => w.id !== id);
      log.exerciseMinutes = log.workouts.filter(i => i.completed).reduce((acc, curr) => acc + curr.durationMinutes, 0);
    });
  }, [mutateCurrentLog]);

  // Meal Actions
  const addMeal = useCallback((mealData: Omit<MealItem, 'id' | 'timestamp' | 'completed'>) => {
    const item: MealItem = {
      ...mealData,
      id: `m-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: true
    };

    mutateCurrentLog(log => {
      log.meals = [item, ...(log.meals || [])];
      log.caloriesConsumed = log.meals.filter(m => m.completed).reduce((sum, m) => sum + (m.calories || 0), 0);
    });
    sound.playSuccess();
  }, [mutateCurrentLog]);

  const toggleMealCompleted = useCallback((id: string) => {
    mutateCurrentLog(log => {
      const m = log.meals.find(item => item.id === id);
      if (m) {
        m.completed = !m.completed;
        log.caloriesConsumed = log.meals.filter(item => item.completed).reduce((sum, item) => sum + (item.calories || 0), 0);
      }
    });
  }, [mutateCurrentLog]);

  const deleteMeal = useCallback((id: string) => {
    mutateCurrentLog(log => {
      log.meals = log.meals.filter(m => m.id !== id);
      log.caloriesConsumed = log.meals.filter(m => m.completed).reduce((sum, m) => sum + (m.calories || 0), 0);
    });
  }, [mutateCurrentLog]);

  // Sleep Actions
  const updateSleep = useCallback((sleepData: Partial<SleepLog>) => {
    mutateCurrentLog(log => {
      log.sleep = {
        ...(log.sleep || { sleepTime: '23:00', wakeTime: '07:00', durationMinutes: 0, quality: 'Good' }),
        ...sleepData
      };
    });
    sound.playSuccess();
  }, [mutateCurrentLog]);

  // Notifications
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const triggerReminderTest = useCallback((type: string = 'water') => {
    reminderEngine.testReminder(type);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    return await reminderEngine.requestBrowserPermission();
  }, []);

  const dismissBadgeModal = useCallback(() => {
    setUnlockedBadgeModal(null);
  }, []);

  // Data Export & Import
  const exportData = useCallback(() => {
    const backup = {
      version: '3.0-clean',
      exportedAt: new Date().toISOString(),
      profile,
      goalSettings,
      reminders,
      badges,
      pastLogs
    };
    return JSON.stringify(backup, null, 2);
  }, [profile, goalSettings, reminders, badges, pastLogs]);

  const importData = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) setProfile(data.profile);
      if (data.goalSettings) setGoalSettings(data.goalSettings);
      if (data.reminders) setReminders(data.reminders);
      if (data.badges) setBadges(data.badges);
      if (data.pastLogs) setPastLogs(data.pastLogs);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    setGoalSettings(DEFAULT_GOALS);
    setReminders(DEFAULT_REMINDERS);
    setBadges(INITIAL_BADGES);
    setPastLogs(generateInitialCleanLogs(DEFAULT_GOALS));
  }, []);

  const value: HealthContextType = {
    profile,
    updateProfile,
    selectedDate,
    setSelectedDate,
    todayLog,
    pastLogs,
    goalSettings,
    updateGoalSettings,
    reminders,
    toggleReminder,
    updateReminder,
    addReminder,
    deleteReminder,
    badges,
    unlockedBadgeModal,
    dismissBadgeModal,
    notifications,
    dismissNotification,
    updateDailyHealthData,
    setBmiMetrics,
    addWater,
    setWaterIntake,
    removeWaterEntry,
    setWaterGoal,
    addSteps,
    setSteps,
    addWorkout,
    setExerciseMinutes,
    toggleWorkoutCompleted,
    deleteWorkout,
    addMeal,
    toggleMealCompleted,
    deleteMeal,
    updateSleep,
    triggerReminderTest,
    requestNotificationPermission,
    exportData,
    importData,
    resetToDefaults
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = (): HealthContextType => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
