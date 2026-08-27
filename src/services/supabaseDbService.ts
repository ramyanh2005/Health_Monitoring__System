import { supabase } from './supabaseClient';
import type { UserProfile } from '../types/user';
import type { DailyGoalStatus, WaterLog } from '../types/wellness';

export const supabaseDbService = {
  /**
   * Upsert User Profile to Supabase
   */
  async syncUserProfile(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: profile.id,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height_cm: profile.heightCm,
        weight_kg: profile.weightKg,
        previous_weight_kg: profile.previousWeightKg,
        disability_type: profile.disabilityType,
        mobility_level: profile.mobilityLevel,
        activity_level: profile.activityLevel,
        dietary_preference: profile.dietaryPreference,
        daily_water_target_ml: profile.dailyWaterTargetMl,
        daily_exercise_target_mins: profile.dailyActivityTargetMin,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase profile sync note:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Log water intake record to Supabase
   */
  async syncWaterLog(userId: string, log: WaterLog): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: log.id,
        user_id: userId,
        amount_ml: log.amountMl,
        logged_at: log.timestamp
      };

      const { error } = await supabase
        .from('water_logs')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase water log sync note:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Sync Daily Goals & Status to Supabase
   */
  async syncDailyStatus(
    userId: string,
    status: DailyGoalStatus,
    loggedMeals: string[],
    activeStreakDays: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        id: `${userId}_${today}`,
        user_id: userId,
        log_date: today,
        water_current_ml: status.waterCurrentMl,
        water_target_ml: status.waterTargetMl,
        exercise_current_mins: status.activityCurrentMin,
        exercise_target_mins: status.activityTargetMin,
        logged_meals: loggedMeals,
        active_streak_days: activeStreakDays,
        updated_at: new Date().toISOString()
      };


      const { error } = await supabase
        .from('daily_wellness_logs')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase daily status sync note:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Sync Food Photo Log to Supabase
   */
  async syncFoodPhoto(
    userId: string,
    mealType: string,
    dishName: string,
    photoUrl: string,
    estimatedCalories?: number,
    estimatedProtein?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: `food_${Date.now()}`,
        user_id: userId,
        meal_type: mealType,
        dish_name: dishName,
        photo_url: photoUrl,
        estimated_calories: estimatedCalories || null,
        estimated_protein_g: estimatedProtein || null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('food_photo_logs').insert(payload);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase food photo sync note:', err.message);
      return { success: false, error: err.message };
    }
  }
};
