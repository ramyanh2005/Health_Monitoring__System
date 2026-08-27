export type MobilityLevel =
  | 'Wheelchair user'
  | 'Limited mobility'
  | 'Assisted walking'
  | 'Independent walking'
  | 'Upper-body mobility'
  | 'Bed-rest / Low mobility'
  | 'Other';

export type ActivityLevel = 'Sedentary' | 'Low' | 'Moderate' | 'Active';

export type DietaryPreference =
  | 'Vegetarian'
  | 'Vegan'
  | 'Non-Vegetarian'
  | 'Low-Sodium'
  | 'Gluten-Free'
  | 'Diabetic-Friendly'
  | 'Balanced';

export type Gender = 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number; // in cm
  weightKg: number; // in kg
  previousWeightKg?: number;
  userCategory: 'Disabled Citizen';
  disabilityType: string;
  mobilityLevel: MobilityLevel;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  dailyWaterTargetMl: number;
  dailyActivityTargetMin: number;
  notes?: string;
}
