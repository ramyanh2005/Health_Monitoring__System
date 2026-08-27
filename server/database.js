const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { initialDishes, initialMealCombinations, initialExercises, initialClinics } = require('./seedData');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'bloom.db');
const db = new sqlite3.Database(dbPath);

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function initDb() {
  // 1. Dishes Table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      prep_time_minutes INTEGER DEFAULT 15,
      calories INTEGER NOT NULL,
      protein_g REAL DEFAULT 0,
      carbs_g REAL DEFAULT 0,
      fat_g REAL DEFAULT 0,
      folate_mcg REAL DEFAULT 0,
      iron_mg REAL DEFAULT 0,
      calcium_mg REAL DEFAULT 0,
      dha_mg REAL DEFAULT 0,
      trimester_recommendation TEXT,
      dietary_tags TEXT,
      image_url TEXT,
      recipe_steps TEXT,
      ingredients TEXT,
      is_favorite INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Meal Logs Table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS meal_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER,
      dish_name TEXT NOT NULL,
      category TEXT,
      calories INTEGER NOT NULL,
      protein_g REAL DEFAULT 0,
      folate_mcg REAL DEFAULT 0,
      iron_mg REAL DEFAULT 0,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      date TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(dish_id) REFERENCES dishes(id) ON DELETE SET NULL
    )
  `);

  // 3. Daily Metrics Table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS daily_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      steps INTEGER DEFAULT 6420,
      step_goal INTEGER DEFAULT 8000,
      water_liters REAL DEFAULT 1.5,
      water_goal_liters REAL DEFAULT 2.5,
      active_calories INTEGER DEFAULT 420,
      active_calories_goal INTEGER DEFAULT 500,
      active_minutes INTEGER DEFAULT 35
    )
  `);

  // 4. User Profile Table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT DEFAULT 'Sarah Miller',
      avatar_url TEXT DEFAULT '/assets/sarah-avatar.png',
      pregnancy_month INTEGER DEFAULT 6,
      pregnancy_week INTEGER DEFAULT 24,
      trimester INTEGER DEFAULT 2,
      due_date TEXT DEFAULT 'Nov 15, 2026',
      baby_comparison TEXT DEFAULT 'an ear of corn',
      weight_lbs REAL DEFAULT 142,
      height TEXT DEFAULT '5'' 6"',
      age INTEGER DEFAULT 31,
      daily_insights_enabled INTEGER DEFAULT 1,
      language TEXT DEFAULT 'English',
      units TEXT DEFAULT 'Imperial'
    )
  `);

  try {
    await runAsync(`ALTER TABLE user_profile ADD COLUMN pregnancy_month INTEGER DEFAULT 6`);
  } catch (e) {
    // Column already exists
  }

  // Check if dishes need initial seeding
  const existingCount = await getAsync('SELECT COUNT(*) as count FROM dishes');
  if (!existingCount || existingCount.count === 0) {
    console.log('🌱 Seeding initial prenatal dishes into SQLite database...');
    for (const dish of initialDishes) {
      await runAsync(
        `INSERT INTO dishes (
          name, category, description, prep_time_minutes, calories,
          protein_g, carbs_g, fat_g, folate_mcg, iron_mg, calcium_mg, dha_mg,
          trimester_recommendation, dietary_tags, image_url, recipe_steps,
          ingredients, is_favorite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dish.name, dish.category, dish.description, dish.prep_time_minutes, dish.calories,
          dish.protein_g, dish.carbs_g, dish.fat_g, dish.folate_mcg, dish.iron_mg, dish.calcium_mg, dish.dha_mg,
          dish.trimester_recommendation, dish.dietary_tags, dish.image_url, dish.recipe_steps,
          dish.ingredients, dish.is_favorite
        ]
      );
    }
    console.log(`✅ Seeded ${initialDishes.length} prenatal dishes successfully.`);
  }

  // 5. Notifications Table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      action_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6. Fetal Kick Sessions Table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS kick_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_date TEXT NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      kick_count INTEGER NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 7. Daily Wellness & Mood Check-in Table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS wellness_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      mood TEXT,
      symptoms TEXT,
      energy_level INTEGER DEFAULT 4,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed Initial Notifications if empty
  const notifCount = await getAsync('SELECT COUNT(*) as count FROM notifications');
  if (!notifCount || notifCount.count === 0) {
    await runAsync(
      `INSERT INTO notifications (title, message, category, type, is_read, action_type)
       VALUES 
       ('Hydration Reminder 💧', 'You are 1.0 L away from your daily pregnancy hydration goal.', 'hydration', 'reminder', 0, 'add_water'),
       ('Folate Target on Track! 🥗', 'Great job logging your morning Avocado toast (195µg folate recorded).', 'nutrition', 'success', 0, 'view_nutrition'),
       ('Week 24 Fetal Movement 👶', 'Sarah, baby is most active after meals. Time for a 5-minute kick count session.', 'wellness', 'info', 0, 'start_kick_count')`
    );
  }

  // Seed Initial Kick Count Session if empty
  const kickCount = await getAsync('SELECT COUNT(*) as count FROM kick_sessions');
  if (!kickCount || kickCount.count === 0) {
    const today = new Date().toISOString().split('T')[0];
    await runAsync(
      `INSERT INTO kick_sessions (session_date, duration_seconds, kick_count, notes)
       VALUES (?, 420, 10, 'Active morning movements after breakfast')`,
      [today]
    );
  }

  // Seed Initial Wellness check-in if empty
  const wellnessRow = await getAsync('SELECT * FROM wellness_logs WHERE date = ?', [new Date().toISOString().split('T')[0]]);
  if (!wellnessRow) {
    const today = new Date().toISOString().split('T')[0];
    await runAsync(
      `INSERT INTO wellness_logs (date, mood, symptoms, energy_level, notes)
       VALUES (?, 'Energized', 'Gentle flutters, slight lower back warmth', 4, 'Feeling connected to baby today.')`,
      [today]
    );
  }

  // 8. Prenatal Meal Combinations Table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS meal_combinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subtitle TEXT,
      category TEXT DEFAULT 'Lunch',
      synergy_benefit TEXT NOT NULL,
      calories INTEGER DEFAULT 500,
      protein_g REAL DEFAULT 25.0,
      folate_mcg REAL DEFAULT 200.0,
      iron_mg REAL DEFAULT 5.0,
      calcium_mg REAL DEFAULT 200.0,
      dha_mg REAL DEFAULT 0.0,
      main_dish_name TEXT,
      main_dish_id INTEGER,
      side_item_name TEXT,
      side_item_image TEXT,
      image_url TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed Meal Combinations if empty
  const comboCount = await getAsync('SELECT COUNT(*) as count FROM meal_combinations');
  if (!comboCount || comboCount.count === 0) {
    console.log('🌱 Seeding prenatal meal combinations into SQLite...');
    for (const combo of initialMealCombinations) {
      await runAsync(
        `INSERT INTO meal_combinations (
          name, subtitle, category, synergy_benefit, calories,
          protein_g, folate_mcg, iron_mg, calcium_mg, dha_mg,
          main_dish_name, main_dish_id, side_item_name, side_item_image,
          image_url, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          combo.name, combo.subtitle, combo.category, combo.synergy_benefit, combo.calories,
          combo.protein_g, combo.folate_mcg, combo.iron_mg, combo.calcium_mg, combo.dha_mg,
          combo.main_dish_name, combo.main_dish_id, combo.side_item_name, combo.side_item_image,
          combo.image_url, combo.tags
        ]
      );
    }
    console.log(`✅ Seeded ${initialMealCombinations.length} prenatal meal combinations.`);
  }

  // Ensure all initial dishes exist in DB
  for (const dish of initialDishes) {
    const existing = await getAsync('SELECT id FROM dishes WHERE name = ?', [dish.name]);
    if (!existing) {
      await runAsync(
        `INSERT INTO dishes (
          name, category, description, prep_time_minutes, calories,
          protein_g, carbs_g, fat_g, folate_mcg, iron_mg, calcium_mg, dha_mg,
          trimester_recommendation, dietary_tags, image_url, recipe_steps,
          ingredients, is_favorite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dish.name, dish.category, dish.description, dish.prep_time_minutes, dish.calories,
          dish.protein_g, dish.carbs_g, dish.fat_g, dish.folate_mcg, dish.iron_mg, dish.calcium_mg, dish.dha_mg,
          dish.trimester_recommendation, dish.dietary_tags, dish.image_url, dish.recipe_steps,
          dish.ingredients, dish.is_favorite
        ]
      );
    }
  }

  // 9. Exercises Table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      trimester_safe TEXT DEFAULT 'All Trimesters',
      duration_minutes INTEGER DEFAULT 5,
      intensity TEXT DEFAULT 'Gentle',
      equipment TEXT DEFAULT 'Yoga Mat',
      benefits TEXT NOT NULL,
      cues TEXT NOT NULL,
      steps TEXT NOT NULL,
      safety_tips TEXT,
      calories_burn INTEGER DEFAULT 25,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 10. Workout Logs Table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER,
      exercise_name TEXT NOT NULL,
      category TEXT,
      duration_minutes INTEGER DEFAULT 5,
      calories_burned INTEGER DEFAULT 25,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed Exercises if empty
  const exCount = await getAsync('SELECT COUNT(*) as count FROM exercises');
  if (!exCount || exCount.count === 0) {
    console.log('🧘 Seeding prenatal exercise routines into SQLite...');
    for (const ex of initialExercises) {
      await runAsync(
        `INSERT INTO exercises (
          name, category, trimester_safe, duration_minutes, intensity,
          equipment, benefits, cues, steps, safety_tips, calories_burn, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ex.name, ex.category, ex.trimester_safe, ex.duration_minutes, ex.intensity,
          ex.equipment, ex.benefits, ex.cues, ex.steps, ex.safety_tips, ex.calories_burn, ex.image_url
        ]
      );
    }
    console.log(`✅ Seeded ${initialExercises.length} prenatal exercise routines.`);
  }

  // 11. Clinics & Care Team Table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS clinics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      doctor_name TEXT,
      specialty TEXT,
      clinic_type TEXT DEFAULT 'OB/GYN',
      phone TEXT,
      emergency_phone TEXT,
      address TEXT,
      website TEXT,
      next_appointment TEXT,
      appointment_purpose TEXT,
      notes TEXT,
      is_primary INTEGER DEFAULT 0,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed initial clinics if empty
  const clinicCount = await getAsync('SELECT COUNT(*) as count FROM clinics');
  if (!clinicCount || clinicCount.count === 0) {
    console.log('🏥 Seeding prenatal clinics & healthcare team into SQLite...');
    for (const c of initialClinics) {
      await runAsync(
        `INSERT INTO clinics (
          name, doctor_name, specialty, clinic_type, phone, emergency_phone,
          address, website, next_appointment, appointment_purpose, notes, is_primary, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.name, c.doctor_name, c.specialty, c.clinic_type, c.phone, c.emergency_phone,
          c.address, c.website, c.next_appointment, c.appointment_purpose, c.notes, c.is_primary, c.image_url
        ]
      );
    }
    console.log(`✅ Seeded ${initialClinics.length} prenatal clinics.`);
  }

  // Ensure today's metrics row exists
  const today = new Date().toISOString().split('T')[0];
  const metricsRow = await getAsync('SELECT * FROM daily_metrics WHERE date = ?', [today]);
  if (!metricsRow) {
    await runAsync(
      `INSERT INTO daily_metrics (date, steps, step_goal, water_liters, water_goal_liters, active_calories, active_calories_goal, active_minutes)
       VALUES (?, 6420, 8000, 1.5, 2.5, 420, 500, 35)`,
      [today]
    );

    // Seed initial breakfast meal log for today demo
    const toastDish = await getAsync('SELECT * FROM dishes WHERE name LIKE ? LIMIT 1', ['%Avocado%']);
    if (toastDish) {
      await runAsync(
        `INSERT INTO meal_logs (dish_id, dish_name, category, calories, protein_g, folate_mcg, iron_mg, date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [toastDish.id, toastDish.name, toastDish.category, toastDish.calories, toastDish.protein_g, toastDish.folate_mcg, toastDish.iron_mg, today, 'Breakfast - Nourishing start to the morning']
      );
    }
  }
}

module.exports = {
  db,
  initDb,
  runAsync,
  getAsync,
  allAsync
};
