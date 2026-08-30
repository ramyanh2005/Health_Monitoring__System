export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'maintain' | 'stamina' | 'flexibility' | 'general_health';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type DietaryPreference = 'balanced' | 'vegetarian' | 'vegan' | 'keto' | 'high_protein' | 'mediterranean' | 'low_carb';
export type SleepQuality = 'Poor' | 'Fair' | 'Good' | 'Excellent';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ExerciseCategory = 'walking' | 'running' | 'yoga' | 'stretching' | 'strength' | 'hiit' | 'meditation' | 'custom';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  allergies: string[];
  customApiKey?: string;
  theme: 'dark' | 'light' | 'emerald';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  avatarUrl?: string;
  isProfileSetup?: boolean;
  publicDeploymentUrl?: string;
}

export interface WaterLogEntry {
  id: string;
  amountMl: number;
  timestamp: string;
}

export interface MealItem {
  id: string;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  completed: boolean;
  timestamp: string;
  recipeTip?: string;
  ingredients?: string[];
}

export interface WorkoutItem {
  id: string;
  name: string;
  category: ExerciseCategory;
  durationMinutes: number;
  caloriesBurned: number;
  difficulty: DifficultyLevel;
  instructions: string[];
  completed: boolean;
  timestamp: string;
  targetMuscles?: string;
}

export interface SleepLog {
  sleepTime: string; // e.g. "23:00"
  wakeTime: string;  // e.g. "07:00"
  durationMinutes: number;
  quality: SleepQuality;
  notes?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  waterIntakeMl: number;
  waterGoalMl: number;
  waterEntries: WaterLogEntry[];
  steps: number;
  stepGoal: number;
  exerciseMinutes: number;
  exerciseGoalMinutes: number;
  sleep: SleepLog;
  sleepGoalHours: number;
  caloriesConsumed: number;
  calorieGoal: number;
  meals: MealItem[];
  workouts: WorkoutItem[];
  healthScore: number;
  scoreBreakdown?: {
    water: number;
    steps: number;
    exercise: number;
    sleep: number;
    nutrition: number;
  };
}

export interface GoalSettings {
  waterMl: number;
  steps: number;
  exerciseMinutes: number;
  sleepHours: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface ReminderItem {
  id: string;
  type: 'water' | 'exercise' | 'breakfast' | 'lunch' | 'dinner' | 'sleep' | 'custom';
  title: string;
  message: string;
  time?: string; // HH:MM for fixed
  intervalMinutes?: number; // for periodic (e.g. water 60m)
  enabled: boolean;
  lastTriggered?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'hydration' | 'fitness' | 'nutrition' | 'sleep' | 'streak' | 'general';
  unlocked: boolean;
  unlockedDate?: string;
  currentProgress: number;
  maxProgress: number;
  unit?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestions?: string[];
  actionType?: 'log_water' | 'start_workout' | 'log_meal' | 'open_page';
  actionPayload?: any;
}
