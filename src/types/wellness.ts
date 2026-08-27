export interface WaterLog {
  id: string;
  amountMl: number;
  timestamp: string; // ISO string
}

export interface NutritionGoal {
  balancedMeals: boolean;
  proteinAdequate: boolean;
  fruitsAndVeg: boolean;
  healthyHydration: boolean;
}

export interface DailyGoalStatus {
  date: string; // YYYY-MM-DD
  waterTargetMl: number;
  waterCurrentMl: number;
  waterCompleted: boolean;
  activityTargetMin: number;
  activityCurrentMin: number;
  activityCompleted: boolean;
  nutritionTargetCount: number;
  nutritionCurrentCount: number;
  nutritionCompleted: boolean;
  allCompleted: boolean;
}

export interface DayProgress {
  dayName: string; // 'Mon', 'Tue', etc.
  date: string; // YYYY-MM-DD
  waterMl: number;
  waterTargetMl: number;
  activityMin: number;
  activityTargetMin: number;
  goalsAchievedCount: number; // 0 to 3
  isToday: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
  criteria: string;
  category: 'water' | 'activity' | 'nutrition' | 'streak' | 'general';
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
  weeklyDays: {
    day: string;
    date: string;
    completed: boolean;
    isToday: boolean;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'water' | 'activity' | 'meal' | 'general' | 'streak';
  timestamp: string;
  read: boolean;
  icon: string;
}
