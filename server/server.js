require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb, runAsync, getAsync, allAsync } = require('./database');
const { initPgDb } = require('./postgresDb');
const { initialTip, initialExercises, prenatalExerciseGuidelines, initialClinics } = require('./seedData');
const { generateChatResponse, getWeekDetails } = require('./aiChatbot');
const { supabase, isConnected, checkSupabaseHealth, syncSeedDataToSupabase } = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Initialize Databases
initDb()
  .then(async () => {
    // Attempt direct PostgreSQL connection if configured
    await initPgDb().catch(e => console.warn('Postgres connection info:', e.message));

    // Attempt Supabase REST sync if configured
    if (isConnected) {
      syncSeedDataToSupabase().catch(e => console.warn('Supabase sync notice:', e.message));
    }
  })
  .catch(err => console.error('Database initialization error:', err));

// Helper: today YYYY-MM-DD
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// -------------------------------------------------------------
// SUPABASE CLOUD STATUS & SYNC ENDPOINTS
// -------------------------------------------------------------

// GET /api/supabase/status - check connectivity
app.get('/api/supabase/status', async (req, res) => {
  try {
    const health = await checkSupabaseHealth();
    res.json({ success: true, ...health });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/supabase/sync - manually trigger sync to Supabase
app.post('/api/supabase/sync', async (req, res) => {
  try {
    const synced = await syncSeedDataToSupabase();
    res.json({ success: synced, message: synced ? 'Synced data to Supabase successfully' : 'Could not sync (check .env credentials and SQL schema)' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// DISHES ENDPOINTS
// -------------------------------------------------------------

// GET /api/dishes - list dishes with filtering and search
app.get('/api/dishes', async (req, res) => {
  try {
    const { category, search, trimester, tag, favorite } = req.query;
    let sql = 'SELECT * FROM dishes WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (favorite === '1') {
      sql += ' AND is_favorite = 1';
    }

    if (trimester) {
      sql += ' AND (trimester_recommendation LIKE ? OR trimester_recommendation = "All Trimesters")';
      params.push(`%Trimester ${trimester}%`);
    }

    if (tag) {
      sql += ' AND dietary_tags LIKE ?';
      params.push(`%${tag}%`);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR dietary_tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY is_favorite DESC, id ASC';
    const dishes = await allAsync(sql, params);

    const formattedDishes = dishes.map(dish => ({
      ...dish,
      recipe_steps: dish.recipe_steps ? JSON.parse(dish.recipe_steps) : [],
      ingredients: dish.ingredients ? JSON.parse(dish.ingredients) : []
    }));

    res.json({ success: true, count: formattedDishes.length, dishes: formattedDishes });
  } catch (err) {
    console.error('Error fetching dishes:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/dishes/next-meal - time-of-day smart recommendation
app.get('/api/dishes/next-meal', async (req, res) => {
  try {
    const hour = new Date().getHours();
    let category = 'Breakfast';
    if (hour >= 5 && hour < 11) category = 'Breakfast';
    else if (hour >= 11 && hour < 16) category = 'Lunch';
    else if (hour >= 16 && hour < 19) category = 'Snack';
    else category = 'Dinner';

    let dish = await getAsync(
      'SELECT * FROM dishes WHERE category = ? ORDER BY is_favorite DESC, RANDOM() LIMIT 1',
      [category]
    );

    if (!dish) {
      dish = await getAsync('SELECT * FROM dishes ORDER BY is_favorite DESC, id ASC LIMIT 1');
    }

    if (dish) {
      dish.recipe_steps = JSON.parse(dish.recipe_steps || '[]');
      dish.ingredients = JSON.parse(dish.ingredients || '[]');
    }

    res.json({ success: true, category, dish });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/dishes/smart-suggest?vibe=iron|nausea|energy|dha|folate
app.get('/api/dishes/smart-suggest', async (req, res) => {
  try {
    const { vibe } = req.query;
    let sql = 'SELECT * FROM dishes WHERE 1=1';
    const params = [];

    if (vibe === 'iron') {
      sql += ' AND (iron_mg >= 3.0 OR dietary_tags LIKE "%Iron%")';
    } else if (vibe === 'nausea') {
      sql += ' AND (dietary_tags LIKE "%Gentle%" OR description LIKE "%digestion%" OR name LIKE "%Oatmeal%" OR name LIKE "%Smoothie%")';
    } else if (vibe === 'dha') {
      sql += ' AND (dha_mg > 0 OR dietary_tags LIKE "%DHA%")';
    } else if (vibe === 'energy') {
      sql += ' AND (protein_g >= 15 OR calories >= 350)';
    } else if (vibe === 'folate') {
      sql += ' AND (folate_mcg >= 140 OR dietary_tags LIKE "%Folate%")';
    }

    sql += ' ORDER BY is_favorite DESC, RANDOM() LIMIT 4';
    const dishes = await allAsync(sql, params);

    const formatted = dishes.map(d => ({
      ...d,
      recipe_steps: JSON.parse(d.recipe_steps || '[]'),
      ingredients: JSON.parse(d.ingredients || '[]')
    }));

    res.json({ success: true, vibe, count: formatted.length, dishes: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/dishes/:id - single recipe details
app.get('/api/dishes/:id', async (req, res) => {
  try {
    const dish = await getAsync('SELECT * FROM dishes WHERE id = ?', [req.params.id]);
    if (!dish) {
      return res.status(404).json({ success: false, error: 'Dish not found' });
    }

    dish.recipe_steps = dish.recipe_steps ? JSON.parse(dish.recipe_steps) : [];
    dish.ingredients = dish.ingredients ? JSON.parse(dish.ingredients) : [];

    res.json({ success: true, dish });
  } catch (err) {
    console.error('Error fetching dish:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/dishes - create a custom dish
app.post('/api/dishes', async (req, res) => {
  try {
    const {
      name,
      category = 'Lunch',
      description = '',
      prep_time_minutes = 15,
      calories = 350,
      protein_g = 15,
      carbs_g = 35,
      fat_g = 12,
      folate_mcg = 100,
      iron_mg = 3.0,
      calcium_mg = 100,
      dha_mg = 0,
      trimester_recommendation = 'Trimester 2',
      dietary_tags = '',
      image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      recipe_steps = [],
      ingredients = []
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Dish name is required' });
    }

    const stepsJson = Array.isArray(recipe_steps) ? JSON.stringify(recipe_steps) : JSON.stringify([recipe_steps]);
    const ingredientsJson = Array.isArray(ingredients) ? JSON.stringify(ingredients) : JSON.stringify([ingredients]);

    const result = await runAsync(
      `INSERT INTO dishes (
        name, category, description, prep_time_minutes, calories,
        protein_g, carbs_g, fat_g, folate_mcg, iron_mg, calcium_mg, dha_mg,
        trimester_recommendation, dietary_tags, image_url, recipe_steps,
        ingredients, is_favorite
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, category, description, prep_time_minutes, calories,
        protein_g, carbs_g, fat_g, folate_mcg, iron_mg, calcium_mg, dha_mg,
        trimester_recommendation, dietary_tags, image_url, stepsJson,
        ingredientsJson, 0
      ]
    );

    const newDish = await getAsync('SELECT * FROM dishes WHERE id = ?', [result.lastID]);
    newDish.recipe_steps = JSON.parse(newDish.recipe_steps);
    newDish.ingredients = JSON.parse(newDish.ingredients);

    res.status(201).json({ success: true, message: 'Dish created successfully', dish: newDish });
  } catch (err) {
    console.error('Error creating dish:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/dishes/:id - update dish / toggle favorite
app.put('/api/dishes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getAsync('SELECT * FROM dishes WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Dish not found' });
    }

    const updates = req.body;
    let sql = 'UPDATE dishes SET ';
    const params = [];
    const fields = [];

    const allowedFields = [
      'name', 'category', 'description', 'prep_time_minutes', 'calories',
      'protein_g', 'carbs_g', 'fat_g', 'folate_mcg', 'iron_mg', 'calcium_mg', 'dha_mg',
      'trimester_recommendation', 'dietary_tags', 'image_url', 'is_favorite'
    ];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(updates[key]);
      }
    }

    if (updates.recipe_steps !== undefined) {
      fields.push('recipe_steps = ?');
      params.push(JSON.stringify(updates.recipe_steps));
    }

    if (updates.ingredients !== undefined) {
      fields.push('ingredients = ?');
      params.push(JSON.stringify(updates.ingredients));
    }

    if (fields.length === 0) {
      return res.json({ success: true, message: 'No changes provided' });
    }

    sql += fields.join(', ') + ' WHERE id = ?';
    params.push(id);

    await runAsync(sql, params);
    const updated = await getAsync('SELECT * FROM dishes WHERE id = ?', [id]);
    updated.recipe_steps = JSON.parse(updated.recipe_steps || '[]');
    updated.ingredients = JSON.parse(updated.ingredients || '[]');

    res.json({ success: true, message: 'Dish updated successfully', dish: updated });
  } catch (err) {
    console.error('Error updating dish:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/dishes/:id - delete custom dish
app.delete('/api/dishes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await runAsync('DELETE FROM dishes WHERE id = ?', [id]);
    res.json({ success: true, message: 'Dish deleted successfully' });
  } catch (err) {
    console.error('Error deleting dish:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// MEAL LOGS ENDPOINTS
// -------------------------------------------------------------

// GET /api/meal-logs/today - retrieve today's logs & nutrition totals
app.get('/api/meal-logs/today', async (req, res) => {
  try {
    const today = getTodayString();
    const logs = await allAsync(
      `SELECT ml.*, d.image_url, d.dietary_tags 
       FROM meal_logs ml
       LEFT JOIN dishes d ON ml.dish_id = d.id
       WHERE ml.date = ?
       ORDER BY ml.id DESC`,
      [today]
    );

    const totals = logs.reduce(
      (acc, log) => {
        acc.calories += log.calories || 0;
        acc.protein_g += log.protein_g || 0;
        acc.folate_mcg += log.folate_mcg || 0;
        acc.iron_mg += log.iron_mg || 0;
        return acc;
      },
      { calories: 0, protein_g: 0, folate_mcg: 0, iron_mg: 0 }
    );

    res.json({ success: true, date: today, count: logs.length, logs, totals });
  } catch (err) {
    console.error('Error fetching today meal logs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/meal-logs - log a dish consumption
app.post('/api/meal-logs', async (req, res) => {
  try {
    const {
      dish_id,
      dish_name,
      category = 'Meal',
      calories = 350,
      protein_g = 0,
      folate_mcg = 0,
      iron_mg = 0,
      notes = ''
    } = req.body;

    const today = getTodayString();

    let finalName = dish_name;
    let finalCategory = category;
    let finalCalories = calories;
    let finalProtein = protein_g;
    let finalFolate = folate_mcg;
    let finalIron = iron_mg;

    // If dish_id was passed, fill in from dish table
    if (dish_id) {
      const dish = await getAsync('SELECT * FROM dishes WHERE id = ?', [dish_id]);
      if (dish) {
        finalName = dish.name;
        finalCategory = dish.category;
        finalCalories = dish.calories;
        finalProtein = dish.protein_g;
        finalFolate = dish.folate_mcg;
        finalIron = dish.iron_mg;
      }
    }

    if (!finalName) {
      return res.status(400).json({ success: false, error: 'Dish name or dish_id required' });
    }

    const result = await runAsync(
      `INSERT INTO meal_logs (dish_id, dish_name, category, calories, protein_g, folate_mcg, iron_mg, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dish_id || null, finalName, finalCategory, finalCalories, finalProtein, finalFolate, finalIron, today, notes]
    );

    const newLog = await getAsync('SELECT * FROM meal_logs WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: `Logged ${finalName} (${finalCalories} kcal) to today's journal!`,
      log: newLog
    });
  } catch (err) {
    console.error('Error logging meal:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/meal-logs/:id - delete a logged meal
app.delete('/api/meal-logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await runAsync('DELETE FROM meal_logs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Meal log entry removed' });
  } catch (err) {
    console.error('Error deleting meal log:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// DASHBOARD & METRICS ENDPOINTS
// -------------------------------------------------------------

// GET /api/dashboard - complete dashboard state
app.get('/api/dashboard', async (req, res) => {
  try {
    const today = getTodayString();

    // 1. Profile
    let profile = await getAsync('SELECT * FROM user_profile LIMIT 1');
    if (!profile) {
      profile = {
        name: 'Sarah Miller',
        pregnancy_week: 24,
        trimester: 2,
        due_date: 'Nov 15, 2026',
        baby_comparison: 'an ear of corn',
        weight_lbs: 142,
        height: "5' 6\"",
        age: 31
      };
    }

    // 2. Metrics
    let metrics = await getAsync('SELECT * FROM daily_metrics WHERE date = ?', [today]);
    if (!metrics) {
      await runAsync(
        `INSERT INTO daily_metrics (date, steps, step_goal, water_liters, water_goal_liters, active_calories, active_calories_goal, active_minutes)
         VALUES (?, 6420, 8000, 1.5, 2.5, 420, 500, 35)`,
        [today]
      );
      metrics = await getAsync('SELECT * FROM daily_metrics WHERE date = ?', [today]);
    }

    // 3. Recommended Next Meal
    const hour = new Date().getHours();
    let nextCategory = hour >= 5 && hour < 11 ? 'Breakfast' : (hour >= 11 && hour < 16 ? 'Lunch' : (hour >= 16 && hour < 19 ? 'Snack' : 'Dinner'));
    let nextMeal = await getAsync('SELECT * FROM dishes WHERE category = ? ORDER BY is_favorite DESC, RANDOM() LIMIT 1', [nextCategory]);
    if (!nextMeal) {
      nextMeal = await getAsync('SELECT * FROM dishes ORDER BY id ASC LIMIT 1');
    }
    if (nextMeal) {
      nextMeal.recipe_steps = JSON.parse(nextMeal.recipe_steps || '[]');
      nextMeal.ingredients = JSON.parse(nextMeal.ingredients || '[]');
    }

    // 4. Today's Logged Meals
    const todayLogs = await allAsync(
      `SELECT ml.*, d.image_url, d.dietary_tags 
       FROM meal_logs ml
       LEFT JOIN dishes d ON ml.dish_id = d.id
       WHERE ml.date = ?
       ORDER BY ml.id DESC`,
      [today]
    );

    const nutritionTotals = todayLogs.reduce(
      (acc, log) => {
        acc.calories += log.calories || 0;
        acc.protein_g += log.protein_g || 0;
        acc.folate_mcg += log.folate_mcg || 0;
        acc.iron_mg += log.iron_mg || 0;
        return acc;
      },
      { calories: 0, protein_g: 0, folate_mcg: 0, iron_mg: 0 }
    );

    // 5. Weekly Step Chart Data
    const weeklyData = [
      { day: 'Mon', steps: 6100, goal: 8000, heightPercent: 76, isToday: false },
      { day: 'Tue', steps: 7400, goal: 8000, heightPercent: 92, isToday: false },
      { day: 'Wed', steps: 5800, goal: 8000, heightPercent: 72, isToday: false },
      { day: 'Thu', steps: 8200, goal: 8000, heightPercent: 100, isToday: false },
      { day: 'Fri', steps: 6900, goal: 8000, heightPercent: 86, isToday: false },
      { day: 'Sat', steps: metrics.steps, goal: metrics.step_goal, heightPercent: Math.round((metrics.steps / metrics.step_goal) * 100), isToday: true },
      { day: 'Sun', steps: 0, goal: 8000, heightPercent: 15, isToday: false }
    ];

    // 6. Notifications & Alerts
    const notifications = await allAsync('SELECT * FROM notifications ORDER BY id DESC LIMIT 10');
    const unreadNotifCount = notifications.filter(n => !n.is_read).length;

    // 7. Today's Kick Count Session
    const todayKickSession = await getAsync('SELECT * FROM kick_sessions WHERE session_date = ? ORDER BY id DESC LIMIT 1', [today]);

    // 8. Today's Wellness Log
    const todayWellness = await getAsync('SELECT * FROM wellness_logs WHERE date = ? LIMIT 1', [today]);

    // 9. Prenatal Meal Combinations
    const mealCombinations = await allAsync('SELECT * FROM meal_combinations ORDER BY id ASC LIMIT 6');

    // 10. Primary Clinic & Next Upcoming Appointment
    const primaryClinic = await getAsync('SELECT * FROM clinics WHERE is_primary = 1 LIMIT 1') || await getAsync('SELECT * FROM clinics ORDER BY id ASC LIMIT 1');
    const upcomingClinics = await allAsync('SELECT * FROM clinics WHERE next_appointment IS NOT NULL AND next_appointment != "" ORDER BY next_appointment ASC LIMIT 3');

    res.json({
      success: true,
      profile,
      metrics,
      nextMeal,
      todayLogs,
      nutritionTotals,
      weeklyData,
      notifications,
      unreadNotifCount,
      todayKickSession,
      todayWellness,
      mealCombinations,
      primaryClinic,
      upcomingClinics,
      tip: initialTip
    });
  } catch (err) {
    console.error('Error compiling dashboard:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// PRENATAL MEAL COMBINATIONS & PAIRINGS ENDPOINTS
// -------------------------------------------------------------

// GET /api/meal-combinations - list curated power pairings
app.get('/api/meal-combinations', async (req, res) => {
  try {
    const { category, tag, search } = req.query;
    let sql = 'SELECT * FROM meal_combinations WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (tag) {
      sql += ' AND (tags LIKE ? OR synergy_benefit LIKE ?)';
      params.push(`%${tag}%`, `%${tag}%`);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR subtitle LIKE ? OR synergy_benefit LIKE ? OR main_dish_name LIKE ? OR side_item_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    sql += ' ORDER BY id ASC';
    const combinations = await allAsync(sql, params);
    res.json({ success: true, count: combinations.length, combinations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/meal-combinations/:id
app.get('/api/meal-combinations/:id', async (req, res) => {
  try {
    const combo = await getAsync('SELECT * FROM meal_combinations WHERE id = ?', [req.params.id]);
    if (!combo) {
      return res.status(404).json({ success: false, error: 'Meal combination not found' });
    }
    res.json({ success: true, combination: combo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/meal-combinations/:id/log - log entire meal combination
app.post('/api/meal-combinations/:id/log', async (req, res) => {
  try {
    const combo = await getAsync('SELECT * FROM meal_combinations WHERE id = ?', [req.params.id]);
    if (!combo) {
      return res.status(404).json({ success: false, error: 'Meal combination not found' });
    }

    const today = getTodayString();
    const result = await runAsync(
      `INSERT INTO meal_logs (dish_id, dish_name, category, calories, protein_g, folate_mcg, iron_mg, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        combo.main_dish_id || null,
        `${combo.name} (${combo.main_dish_name} + ${combo.side_item_name})`,
        combo.category || 'Lunch',
        combo.calories,
        combo.protein_g,
        combo.folate_mcg,
        combo.iron_mg,
        today,
        `Logged full synergy pair: ${combo.synergy_benefit}`
      ]
    );

    // Also push a celebratory notification
    await runAsync(
      `INSERT INTO notifications (title, message, category, type, is_read)
       VALUES (?, ?, 'nutrition', 'success', 0)`,
      [
        'Power Combo Logged! 🥗✨',
        `Logged "${combo.name}" (+${combo.calories} kcal, +${combo.folate_mcg}µg Folate, +${combo.iron_mg}mg Iron). Synergy active!`
      ]
    );

    res.status(201).json({
      success: true,
      message: `Logged "${combo.name}" with synergy benefits!`,
      logId: result.lastID,
      combination: combo
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// NOTIFICATIONS & ALERTS ENDPOINTS
// -------------------------------------------------------------

// GET /api/notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await allAsync('SELECT * FROM notifications ORDER BY id DESC');
    const unreadCount = notifications.filter(n => !n.is_read).length;
    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/:id/read - mark single notification as read
app.post('/api/notifications/:id/read', async (req, res) => {
  try {
    await runAsync('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/read-all - mark all notifications as read
app.post('/api/notifications/read-all', async (req, res) => {
  try {
    await runAsync('UPDATE notifications SET is_read = 1');
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications - create a new alert
app.post('/api/notifications', async (req, res) => {
  try {
    const { title, message, category = 'general', type = 'info', action_type = null } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required' });
    }
    const result = await runAsync(
      `INSERT INTO notifications (title, message, category, type, is_read, action_type)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [title, message, category, type, action_type]
    );
    const newNotif = await getAsync('SELECT * FROM notifications WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, notification: newNotif });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// KICK COUNTER & FETAL MOVEMENT ENDPOINTS
// -------------------------------------------------------------

// GET /api/kicks - retrieve kick sessions
app.get('/api/kicks', async (req, res) => {
  try {
    const sessions = await allAsync('SELECT * FROM kick_sessions ORDER BY id DESC LIMIT 20');
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/kicks - save a kick session
app.post('/api/kicks', async (req, res) => {
  try {
    const { kick_count = 10, duration_seconds = 300, notes = '' } = req.body;
    const today = getTodayString();
    const result = await runAsync(
      `INSERT INTO kick_sessions (session_date, duration_seconds, kick_count, notes)
       VALUES (?, ?, ?, ?)`,
      [today, duration_seconds, kick_count, notes]
    );

    // Also trigger a celebratory notification in the background
    await runAsync(
      `INSERT INTO notifications (title, message, category, type, is_read)
       VALUES (?, ?, 'wellness', 'success', 0)`,
      [
        'Kick Session Recorded ✨',
        `Recorded ${kick_count} baby kicks in ${Math.round(duration_seconds / 60)} minutes. Fetal movement is healthy!`
      ]
    );

    const newSession = await getAsync('SELECT * FROM kick_sessions WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, message: `Recorded ${kick_count} baby kicks!`, session: newSession });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// WELLNESS & MOOD LOG ENDPOINTS
// -------------------------------------------------------------

// GET /api/wellness/today
app.get('/api/wellness/today', async (req, res) => {
  try {
    const today = getTodayString();
    let log = await getAsync('SELECT * FROM wellness_logs WHERE date = ?', [today]);
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/wellness - check in mood & symptoms
app.post('/api/wellness', async (req, res) => {
  try {
    const today = getTodayString();
    const { mood = 'Energized', symptoms = '', energy_level = 4, notes = '' } = req.body;

    const existing = await getAsync('SELECT * FROM wellness_logs WHERE date = ?', [today]);
    if (existing) {
      await runAsync(
        `UPDATE wellness_logs SET mood = ?, symptoms = ?, energy_level = ?, notes = ? WHERE date = ?`,
        [mood, symptoms, energy_level, notes, today]
      );
    } else {
      await runAsync(
        `INSERT INTO wellness_logs (date, mood, symptoms, energy_level, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [today, mood, symptoms, energy_level, notes]
      );
    }

    const updated = await getAsync('SELECT * FROM wellness_logs WHERE date = ?', [today]);
    res.json({ success: true, message: `Check-in recorded: Feeling ${mood}`, log: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// SMART DISH SUGGESTION & CRAVING ASSISTANT
// -------------------------------------------------------------

// GET /api/dishes/smart-suggest?vibe=iron|nausea|energy|dha|sweet
app.get('/api/dishes/smart-suggest', async (req, res) => {
  try {
    const { vibe } = req.query;
    let sql = 'SELECT * FROM dishes WHERE 1=1';
    const params = [];

    if (vibe === 'iron') {
      sql += ' AND (iron_mg >= 3.5 OR dietary_tags LIKE "%Iron%")';
    } else if (vibe === 'nausea') {
      sql += ' AND (dietary_tags LIKE "%Gentle%" OR description LIKE "%digestion%" OR name LIKE "%Oatmeal%" OR name LIKE "%Smoothie%")';
    } else if (vibe === 'dha') {
      sql += ' AND (dha_mg > 0 OR dietary_tags LIKE "%DHA%")';
    } else if (vibe === 'energy') {
      sql += ' AND (protein_g >= 15 OR calories >= 350)';
    } else if (vibe === 'folate') {
      sql += ' AND (folate_mcg >= 140 OR dietary_tags LIKE "%Folate%")';
    }

    sql += ' ORDER BY is_favorite DESC, RANDOM() LIMIT 4';
    const dishes = await allAsync(sql, params);

    const formatted = dishes.map(d => ({
      ...d,
      recipe_steps: JSON.parse(d.recipe_steps || '[]'),
      ingredients: JSON.parse(d.ingredients || '[]')
    }));

    res.json({ success: true, vibe, count: formatted.length, dishes: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/metrics - adjust step goal, calories goal, water, etc.
app.put('/api/metrics', async (req, res) => {
  try {
    const today = getTodayString();
    const { steps, step_goal, water_liters, water_goal_liters, active_calories, active_calories_goal, active_minutes } = req.body;

    let metrics = await getAsync('SELECT * FROM daily_metrics WHERE date = ?', [today]);
    if (!metrics) {
      await runAsync(
        `INSERT INTO daily_metrics (date, steps, step_goal, water_liters, water_goal_liters, active_calories, active_calories_goal, active_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [today, steps || 6420, step_goal || 8000, water_liters || 1.5, water_goal_liters || 2.5, active_calories || 420, active_calories_goal || 500, active_minutes || 35]
      );
    } else {
      const updates = [];
      const params = [];
      if (steps !== undefined) { updates.push('steps = ?'); params.push(steps); }
      if (step_goal !== undefined) { updates.push('step_goal = ?'); params.push(step_goal); }
      if (water_liters !== undefined) { updates.push('water_liters = ?'); params.push(water_liters); }
      if (water_goal_liters !== undefined) { updates.push('water_goal_liters = ?'); params.push(water_goal_liters); }
      if (active_calories !== undefined) { updates.push('active_calories = ?'); params.push(active_calories); }
      if (active_calories_goal !== undefined) { updates.push('active_calories_goal = ?'); params.push(active_calories_goal); }
      if (active_minutes !== undefined) { updates.push('active_minutes = ?'); params.push(active_minutes); }

      if (updates.length > 0) {
        params.push(today);
        await runAsync(`UPDATE daily_metrics SET ${updates.join(', ')} WHERE date = ?`, params);
      }
    }

    const updated = await getAsync('SELECT * FROM daily_metrics WHERE date = ?', [today]);
    res.json({ success: true, metrics: updated });
  } catch (err) {
    console.error('Error updating metrics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/metrics/water/add - quick add water (+0.25L)
app.post('/api/metrics/water/add', async (req, res) => {
  try {
    const today = getTodayString();
    const amount = req.body.amount || 0.25;
    await runAsync(
      `UPDATE daily_metrics SET water_liters = MIN(ROUND(water_liters + ?, 2), 5.0) WHERE date = ?`,
      [amount, today]
    );
    const metrics = await getAsync('SELECT * FROM daily_metrics WHERE date = ?', [today]);
    res.json({ success: true, water_liters: metrics.water_liters, message: `Added ${amount}L of water` });
  } catch (err) {
    console.error('Error adding water:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/profile & PUT /api/profile
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await getAsync('SELECT * FROM user_profile LIMIT 1');
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    let { 
      name, 
      avatar_url, 
      pregnancy_month, 
      pregnancy_week, 
      trimester, 
      due_date, 
      baby_comparison, 
      weight_lbs, 
      height, 
      age, 
      daily_insights_enabled, 
      language, 
      units 
    } = req.body;

    // Auto-calculate week/month/trimester sync
    if (pregnancy_month !== undefined && pregnancy_week === undefined) {
      const monthNum = parseInt(pregnancy_month, 10) || 6;
      pregnancy_week = Math.round(monthNum * 4.4);
    }

    if (pregnancy_week !== undefined) {
      const details = getWeekDetails(pregnancy_week);
      if (pregnancy_month === undefined) pregnancy_month = details.month;
      if (trimester === undefined) trimester = details.trimester;
      if (baby_comparison === undefined || !baby_comparison) baby_comparison = details.size;
    }

    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (avatar_url !== undefined) { updates.push('avatar_url = ?'); params.push(avatar_url); }
    if (pregnancy_month !== undefined) { updates.push('pregnancy_month = ?'); params.push(pregnancy_month); }
    if (pregnancy_week !== undefined) { updates.push('pregnancy_week = ?'); params.push(pregnancy_week); }
    if (trimester !== undefined) { updates.push('trimester = ?'); params.push(trimester); }
    if (due_date !== undefined) { updates.push('due_date = ?'); params.push(due_date); }
    if (baby_comparison !== undefined) { updates.push('baby_comparison = ?'); params.push(baby_comparison); }
    if (weight_lbs !== undefined) { updates.push('weight_lbs = ?'); params.push(weight_lbs); }
    if (height !== undefined) { updates.push('height = ?'); params.push(height); }
    if (age !== undefined) { updates.push('age = ?'); params.push(age); }
    if (daily_insights_enabled !== undefined) { updates.push('daily_insights_enabled = ?'); params.push(daily_insights_enabled); }
    if (language !== undefined) { updates.push('language = ?'); params.push(language); }
    if (units !== undefined) { updates.push('units = ?'); params.push(units); }

    if (updates.length > 0) {
      await runAsync(`UPDATE user_profile SET ${updates.join(', ')} WHERE id = 1`, params);

      // Create notification alert
      await runAsync(
        `INSERT INTO notifications (title, message, category, type, is_read, action_type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'Pregnancy Timeline Updated 🌸',
          `Profile saved: Week ${pregnancy_week || 24} (Month ${pregnancy_month || 6}, Trimester ${trimester || 2}) • Baby is the size of ${baby_comparison || 'an ear of corn'}.`,
          'profile',
          'success',
          0,
          null
        ]
      );
    }

    const profile = await getAsync('SELECT * FROM user_profile LIMIT 1');
    res.json({ success: true, message: 'Profile updated successfully', profile });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// AI MATERNAL HEALTH CHATBOT (AI DOULA & MIDWIFE ASSISTANT)
// -------------------------------------------------------------

// POST /api/chat - ask questions to AI Doula
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const profile = await getAsync('SELECT * FROM user_profile LIMIT 1') || {};
    const primaryClinic = await getAsync('SELECT * FROM clinics WHERE is_primary = 1 LIMIT 1');
    if (primaryClinic) {
      profile.primary_clinic_name = primaryClinic.name;
    }

    const aiResponse = generateChatResponse(message, profile);

    res.json({
      success: true,
      query: message,
      ...aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error handling chat message:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// PRENATAL EXERCISE & MOVEMENT GUIDELINES ENDPOINTS
// -------------------------------------------------------------

// GET /api/exercises/guidelines - ACOG & RCOG clinical guidelines
app.get('/api/exercises/guidelines', (req, res) => {
  res.json({ success: true, guidelines: prenatalExerciseGuidelines });
});

// GET /api/exercises - list exercises with filtering
app.get('/api/exercises', async (req, res) => {
  try {
    const { category, intensity, search } = req.query;
    let sql = 'SELECT * FROM exercises WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (intensity && intensity !== 'All') {
      sql += ' AND intensity = ?';
      params.push(intensity);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR benefits LIKE ? OR equipment LIKE ? OR cues LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY id ASC';
    const exercises = await allAsync(sql, params);
    const parsed = exercises.map(ex => ({
      ...ex,
      steps: JSON.parse(ex.steps || '[]')
    }));

    res.json({ success: true, count: parsed.length, exercises: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/exercises/:id - single exercise details
app.get('/api/exercises/:id', async (req, res) => {
  try {
    const ex = await getAsync('SELECT * FROM exercises WHERE id = ?', [req.params.id]);
    if (!ex) {
      return res.status(404).json({ success: false, error: 'Exercise not found' });
    }
    ex.steps = JSON.parse(ex.steps || '[]');
    res.json({ success: true, exercise: ex });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/exercises/:id/log - log completed workout session
app.post('/api/exercises/:id/log', async (req, res) => {
  try {
    const ex = await getAsync('SELECT * FROM exercises WHERE id = ?', [req.params.id]);
    if (!ex) {
      return res.status(404).json({ success: false, error: 'Exercise not found' });
    }

    const { duration_minutes, notes } = req.body || {};
    const duration = duration_minutes || ex.duration_minutes || 5;
    const calories = Math.round((ex.calories_burn / ex.duration_minutes) * duration) || ex.calories_burn || 20;
    const today = getTodayString();

    // 1. Insert into workout_logs
    const result = await runAsync(
      `INSERT INTO workout_logs (exercise_id, exercise_name, category, duration_minutes, calories_burned, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ex.id, ex.name, ex.category, duration, calories, today]
    );

    // 2. Increment active_minutes and active_calories in today's daily_metrics
    await runAsync(
      `UPDATE daily_metrics 
       SET active_minutes = active_minutes + ?, active_calories = active_calories + ?
       WHERE date = ?`,
      [duration, calories, today]
    );

    // 3. Create congratulatory notification
    await runAsync(
      `INSERT INTO notifications (title, message, category, type, is_read, action_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'Movement Goal Celebrated! 🌸',
        `Completed ${duration} mins of ${ex.name} (+${calories} kcal). Wonderful maternal stamina!`,
        'exercise',
        'success',
        0,
        null
      ]
    );

    const updatedMetrics = await getAsync('SELECT * FROM daily_metrics WHERE date = ?', [today]);

    res.json({
      success: true,
      message: `Great job! Logged ${duration} mins of "${ex.name}" (+${calories} kcal).`,
      logId: result.lastID,
      metrics: updatedMetrics
    });
  } catch (err) {
    console.error('Error logging workout:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/workout-logs - get today's workout history
app.get('/api/workout-logs', async (req, res) => {
  try {
    const today = getTodayString();
    const logs = await allAsync('SELECT * FROM workout_logs WHERE date = ? ORDER BY id DESC', [today]);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// CLINICS & PRENATAL HEALTHCARE PROVIDERS ENDPOINTS
// -------------------------------------------------------------

// GET /api/clinics - list clinics with type and search filters
app.get('/api/clinics', async (req, res) => {
  try {
    const { type, search } = req.query;
    let sql = 'SELECT * FROM clinics WHERE 1=1';
    const params = [];

    if (type && type !== 'All') {
      sql += ' AND clinic_type = ?';
      params.push(type);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR doctor_name LIKE ? OR specialty LIKE ? OR address LIKE ? OR notes LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    sql += ' ORDER BY is_primary DESC, id ASC';
    const clinics = await allAsync(sql, params);
    res.json({ success: true, count: clinics.length, clinics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/clinics/:id - single clinic
app.get('/api/clinics/:id', async (req, res) => {
  try {
    const clinic = await getAsync('SELECT * FROM clinics WHERE id = ?', [req.params.id]);
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    res.json({ success: true, clinic });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/clinics - add new clinic
app.post('/api/clinics', async (req, res) => {
  try {
    const {
      name,
      doctor_name = '',
      specialty = 'Maternal Health Specialist',
      clinic_type = 'OB/GYN',
      phone = '',
      emergency_phone = '',
      address = '',
      website = '',
      next_appointment = '',
      appointment_purpose = '',
      notes = '',
      is_primary = 0,
      image_url = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Clinic name is required' });
    }

    // If marked as primary, unmark others
    if (is_primary) {
      await runAsync('UPDATE clinics SET is_primary = 0');
    }

    const result = await runAsync(
      `INSERT INTO clinics (
        name, doctor_name, specialty, clinic_type, phone, emergency_phone,
        address, website, next_appointment, appointment_purpose, notes, is_primary, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, doctor_name, specialty, clinic_type, phone, emergency_phone,
        address, website, next_appointment, appointment_purpose, notes, is_primary ? 1 : 0, image_url
      ]
    );

    // Create notification alert
    await runAsync(
      `INSERT INTO notifications (title, message, category, type, is_read, action_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'New Clinic Added 🏥',
        `Added "${name}" (${doctor_name || specialty}) to your care team directory.`,
        'clinic',
        'info',
        0,
        null
      ]
    );

    const newClinic = await getAsync('SELECT * FROM clinics WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, message: `Successfully added ${name}`, clinic: newClinic });
  } catch (err) {
    console.error('Error adding clinic:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/clinics/:id - edit/change clinic data
app.put('/api/clinics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getAsync('SELECT * FROM clinics WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }

    const {
      name,
      doctor_name,
      specialty,
      clinic_type,
      phone,
      emergency_phone,
      address,
      website,
      next_appointment,
      appointment_purpose,
      notes,
      is_primary,
      image_url
    } = req.body;

    if (is_primary) {
      await runAsync('UPDATE clinics SET is_primary = 0');
    }

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (doctor_name !== undefined) { updates.push('doctor_name = ?'); params.push(doctor_name); }
    if (specialty !== undefined) { updates.push('specialty = ?'); params.push(specialty); }
    if (clinic_type !== undefined) { updates.push('clinic_type = ?'); params.push(clinic_type); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (emergency_phone !== undefined) { updates.push('emergency_phone = ?'); params.push(emergency_phone); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (website !== undefined) { updates.push('website = ?'); params.push(website); }
    if (next_appointment !== undefined) { updates.push('next_appointment = ?'); params.push(next_appointment); }
    if (appointment_purpose !== undefined) { updates.push('appointment_purpose = ?'); params.push(appointment_purpose); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (is_primary !== undefined) { updates.push('is_primary = ?'); params.push(is_primary ? 1 : 0); }
    if (image_url !== undefined) { updates.push('image_url = ?'); params.push(image_url); }

    if (updates.length > 0) {
      params.push(id);
      await runAsync(`UPDATE clinics SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updatedClinic = await getAsync('SELECT * FROM clinics WHERE id = ?', [id]);
    res.json({ success: true, message: `Updated details for ${updatedClinic.name}`, clinic: updatedClinic });
  } catch (err) {
    console.error('Error updating clinic:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/clinics/:id - delete clinic
app.delete('/api/clinics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getAsync('SELECT * FROM clinics WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }

    await runAsync('DELETE FROM clinics WHERE id = ?', [id]);
    res.json({ success: true, message: `Removed "${existing.name}" from clinics directory` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/clinics/:id/appointment - quick change / schedule next appointment
app.post('/api/clinics/:id/appointment', async (req, res) => {
  try {
    const { id } = req.params;
    const { next_appointment, appointment_purpose, notes } = req.body;
    const clinic = await getAsync('SELECT * FROM clinics WHERE id = ?', [id]);
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }

    await runAsync(
      `UPDATE clinics SET next_appointment = ?, appointment_purpose = COALESCE(?, appointment_purpose), notes = COALESCE(?, notes) WHERE id = ?`,
      [next_appointment, appointment_purpose, notes, id]
    );

    // Add appointment reminder notification
    await runAsync(
      `INSERT INTO notifications (title, message, category, type, is_read, action_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'Appointment Scheduled 📅',
        `Upcoming visit at ${clinic.name} set for ${next_appointment} (${appointment_purpose || 'Prenatal Checkup'}).`,
        'clinic',
        'reminder',
        0,
        null
      ]
    );

    const updated = await getAsync('SELECT * FROM clinics WHERE id = ?', [id]);
    res.json({ success: true, message: `Appointment saved for ${next_appointment}`, clinic: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback to index.html for SPA client-side routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🌸 Bloom Health Server running smoothly at http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is currently in use, switching to port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
