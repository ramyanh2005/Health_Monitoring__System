import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Helper to check if cloud sync is ready
const getClient = () => {
  if (!isSupabaseConfigured()) return null;
  return getSupabase();
};

export const supabaseService = {
  // ==========================================================================
  // Profiles
  // ==========================================================================
  async fetchProfile(userId = 'member-1') {
    const supabase = getClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      return {
        name: data.name,
        age: data.age,
        tier: data.tier,
        avatar: data.avatar,
        doctor: data.doctor,
        primaryClinic: data.primary_clinic,
        medicalConditions: data.medical_conditions || [],
        allergies: data.allergies || [],
        bloodType: data.blood_type,
        emergencyContact: data.emergency_contact || {}
      };
    } catch (err) {
      console.warn('Supabase fetchProfile error:', err);
      return null;
    }
  },

  async updateProfile(userId = 'member-1', profile) {
    const supabase = getClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: profile.name,
          age: profile.age,
          tier: profile.tier,
          avatar: profile.avatar,
          doctor: profile.doctor,
          primary_clinic: profile.primaryClinic,
          medical_conditions: profile.medicalConditions,
          allergies: profile.allergies,
          blood_type: profile.bloodType,
          emergency_contact: profile.emergencyContact,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase updateProfile error:', err);
      return false;
    }
  },

  // ==========================================================================
  // Daily Goals
  // ==========================================================================
  async fetchDailyGoals(userId = 'member-1') {
    const supabase = getClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      return {
        stepsGoal: data.steps_goal,
        stepsCurrent: data.steps_current,
        caloriesBurnGoal: data.calories_burn_goal,
        caloriesBurnCurrent: data.calories_burn_current,
        waterGlassesGoal: data.water_glasses_goal,
        waterGlassesCurrent: data.water_glasses_current,
        activeMinutesGoal: data.active_minutes_goal,
        activeMinutesCurrent: data.active_minutes_current
      };
    } catch (err) {
      console.warn('Supabase fetchDailyGoals error:', err);
      return null;
    }
  },

  async updateDailyGoals(userId = 'member-1', goals) {
    const supabase = getClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('daily_goals')
        .upsert({
          id: `goals-${userId}`,
          user_id: userId,
          steps_goal: goals.stepsGoal,
          steps_current: goals.stepsCurrent,
          calories_burn_goal: goals.caloriesBurnGoal,
          calories_burn_current: goals.caloriesBurnCurrent,
          water_glasses_goal: goals.waterGlassesGoal,
          water_glasses_current: goals.waterGlassesCurrent,
          active_minutes_goal: goals.activeMinutesGoal,
          active_minutes_current: goals.activeMinutesCurrent,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase updateDailyGoals error:', err);
      return false;
    }
  },

  // ==========================================================================
  // Meals
  // ==========================================================================
  async fetchMeals(userId = 'member-1') {
    const supabase = getClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase fetchMeals error:', err);
      return null;
    }
  },

  async insertMeal(meal, userId = 'member-1') {
    const supabase = getClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('meals')
        .insert({
          id: meal.id || `meal-${Date.now()}`,
          user_id: userId,
          title: meal.title,
          type: meal.type,
          time: meal.time,
          description: meal.description,
          calories: meal.calories,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          fiber: meal.fiber || 0,
          image: meal.image,
          recipe: meal.recipe
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase insertMeal error:', err);
      return false;
    }
  },

  async deleteMeal(mealId) {
    const supabase = getClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase deleteMeal error:', err);
      return false;
    }
  },

  // ==========================================================================
  // Medications
  // ==========================================================================
  async fetchMedications(userId = 'member-1') {
    const supabase = getClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .order('time', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data.map(m => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        time: m.time,
        slot: m.slot,
        purpose: m.purpose,
        instructions: m.instructions,
        taken: m.taken,
        refillDaysLeft: m.refill_days_left
      }));
    } catch (err) {
      console.warn('Supabase fetchMedications error:', err);
      return null;
    }
  },

  async updateMedicationStatus(medId, taken) {
    const supabase = getClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('medications')
        .update({ taken, updated_at: new Date().toISOString() })
        .eq('id', medId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase updateMedicationStatus error:', err);
      return false;
    }
  },

  // ==========================================================================
  // Vitals Logs
  // ==========================================================================
  async fetchLatestVitals(userId = 'member-1') {
    const supabase = getClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('vitals_logs')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      return {
        heartRate: data.heart_rate,
        bloodPressure: data.blood_pressure,
        spo2: data.spo2,
        status: data.status,
        lastChecked: new Date(data.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } catch (err) {
      console.warn('Supabase fetchLatestVitals error:', err);
      return null;
    }
  },

  async insertVitals(vitals, userId = 'member-1') {
    const supabase = getClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('vitals_logs')
        .insert({
          user_id: userId,
          heart_rate: vitals.heartRate,
          blood_pressure: vitals.bloodPressure,
          spo2: vitals.spo2,
          status: vitals.status
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase insertVitals error:', err);
      return false;
    }
  },

  // ==========================================================================
  // Milestones
  // ==========================================================================
  async fetchMilestones(userId = 'member-1') {
    const supabase = getClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data.map(m => ({
        id: m.id,
        title: m.title,
        desc: m.desc,
        date: m.date,
        category: m.category,
        icon: m.icon,
        achieved: m.achieved,
        rewardText: m.reward_text
      }));
    } catch (err) {
      console.warn('Supabase fetchMilestones error:', err);
      return null;
    }
  }
};
