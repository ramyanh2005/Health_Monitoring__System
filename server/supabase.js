// Bloom Health — Supabase Cloud Database Client & Synchronization Module
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { initialDishes, initialMealCombinations, initialTip } = require('./seedData');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
let isConnected = false;

if (SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL !== 'https://your-project.supabase.co') {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    isConnected = true;
    console.log(`⚡ Connected to Supabase Cloud Database at: ${SUPABASE_URL}`);
  } catch (err) {
    console.warn('⚠️ Could not initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set in .env. Falling back to high-performance local SQLite database.');
}

/**
 * Check if Supabase connection is currently active and healthy
 */
async function checkSupabaseHealth() {
  if (!supabase) return { connected: false, message: 'Supabase URL or Key not configured in .env' };
  try {
    const { data, error } = await supabase.from('dishes').select('id').limit(1);
    if (error) throw error;
    return { connected: true, url: SUPABASE_URL, message: 'Supabase connected and operational' };
  } catch (err) {
    return { connected: false, url: SUPABASE_URL, message: err.message };
  }
}

/**
 * Seed initial dishes and combinations to Supabase if empty
 */
async function syncSeedDataToSupabase() {
  if (!supabase) return false;
  try {
    // 1. Check & Seed dishes
    const { count, error } = await supabase.from('dishes').select('*', { count: 'exact', head: true });
    if (!error && (count === 0 || count === null)) {
      console.log('🌱 Seeding initial prenatal dishes to Supabase...');
      const formattedDishes = initialDishes.map(d => ({
        name: d.name,
        category: d.category,
        description: d.description,
        prep_time_minutes: d.prep_time_minutes,
        calories: d.calories,
        protein_g: d.protein_g,
        carbs_g: d.carbs_g,
        fat_g: d.fat_g,
        folate_mcg: d.folate_mcg,
        iron_mg: d.iron_mg,
        calcium_mg: d.calcium_mg,
        dha_mg: d.dha_mg,
        trimester_recommendation: d.trimester_recommendation,
        dietary_tags: d.dietary_tags,
        image_url: d.image_url,
        recipe_steps: JSON.parse(d.recipe_steps || '[]'),
        ingredients: JSON.parse(d.ingredients || '[]'),
        is_favorite: d.is_favorite
      }));
      await supabase.from('dishes').insert(formattedDishes);
      console.log(`✅ Seeded ${formattedDishes.length} dishes to Supabase.`);
    }

    // 2. Check & Seed meal combinations
    const { count: comboCount } = await supabase.from('meal_combinations').select('*', { count: 'exact', head: true });
    if (comboCount === 0 || comboCount === null) {
      console.log('🌱 Seeding prenatal meal combinations to Supabase...');
      await supabase.from('meal_combinations').insert(initialMealCombinations);
      console.log(`✅ Seeded ${initialMealCombinations.length} meal combinations to Supabase.`);
    }

    // 3. Check & Seed initial user profile
    const { data: profile } = await supabase.from('user_profile').select('*').limit(1);
    if (!profile || profile.length === 0) {
      await supabase.from('user_profile').insert([{
        id: 1,
        name: 'Sarah Miller',
        pregnancy_week: 24,
        trimester: 2,
        due_date: 'Nov 15, 2026',
        baby_comparison: 'an ear of corn',
        weight_lbs: 142.0,
        height: "5' 6\"",
        age: 31
      }]);
    }

    return true;
  } catch (err) {
    console.warn('⚠️ Supabase auto-seed warning (tables may need creation first):', err.message);
    return false;
  }
}

module.exports = {
  supabase,
  isConnected,
  checkSupabaseHealth,
  syncSeedDataToSupabase
};
