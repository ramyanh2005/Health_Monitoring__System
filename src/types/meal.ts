import type { DietaryPreference } from './user';

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MealItem {
  id: string;
  name: string;
  portion: string;
  benefits: string;
}

export interface MealSuggestion {
  id: string;
  type: MealType;
  title: string;
  suggestedTime: string;
  image: string; // URL / asset path to attractive dish photo
  items: MealItem[];
  caloriesApprox?: number;
  dietaryTags: DietaryPreference[];
  guidanceTip: string;
  isLogged: boolean;
  userPhotoUrl?: string; // User-uploaded food photo
  userPhotoTimestamp?: string;
  aiNutritionAnalysis?: {
    estimatedCalories: number;
    proteinGrams: number;
    fiberRating: string;
    wellnessNote: string;
  };
}
