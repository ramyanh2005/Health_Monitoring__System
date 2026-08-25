const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../auth');

// Helper to compute BMR & Caloric Targets for arbitrary values (used in dynamic calculator)
function computeCalorieTargets(heightCm, weightKg, age = 28, gender = 'Male') {
  const hM = heightCm / 100;
  const bmi = Number((weightKg / (hM * hM)).toFixed(1));
  const minIdealWeight = Number((18.5 * hM * hM).toFixed(1));
  const maxIdealWeight = Number((24.9 * hM * hM).toFixed(1));

  // Mifflin-St Jeor formula
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender.toLowerCase() === 'female') {
    bmr -= 161;
  } else if (gender.toLowerCase() === 'male') {
    bmr += 5;
  } else {
    bmr -= 78;
  }
  bmr = Math.round(bmr);

  const tdee = Math.round(bmr * 1.4); // Moderate activity factor

  let weightDelta = 0;
  let dailyTargetBurn = 500;
  let totalCaloriesToBurnForGoal = 0;
  let goalType = 'maintain';
  let guidance = 'Maintain an active daily routine with balanced calorie intake.';

  if (bmi >= 25.0) {
    weightDelta = Number((weightKg - maxIdealWeight).toFixed(1));
    totalCaloriesToBurnForGoal = Math.round(weightDelta * 7700);
    dailyTargetBurn = 550;
    goalType = 'weight_loss';
    guidance = `Burn ~${dailyTargetBurn} kcal daily through exercise to create a healthy caloric deficit toward your optimal weight span (${minIdealWeight} - ${maxIdealWeight} kg).`;
  } else if (bmi < 18.5) {
    weightDelta = Number((minIdealWeight - weightKg).toFixed(1));
    totalCaloriesToBurnForGoal = 0;
    dailyTargetBurn = 300;
    goalType = 'weight_gain';
    guidance = `Focus on muscle building and nutrient-dense foods with ~${dailyTargetBurn} kcal/day of moderate, strength-focused exercise.`;
  } else {
    weightDelta = 0;
    totalCaloriesToBurnForGoal = 0;
    dailyTargetBurn = 450;
    goalType = 'maintain';
    guidance = `Great job staying in your healthy weight zone! Aim for ~${dailyTargetBurn} kcal of daily active movement to maintain vitality and cardiovascular endurance.`;
  }

  return {
    bmr,
    tdee,
    daily_target_burn: dailyTargetBurn,
    total_calories_to_burn_for_goal: totalCaloriesToBurnForGoal,
    weight_delta_kg: weightDelta,
    goal_type: goalType,
    guidance,
    ideal_weight_range: { min: minIdealWeight, max: maxIdealWeight, unit: 'kg' }
  };
}

// GET /api/calories/summary
// Get authenticated user's today's burnt calories, total burnt till now, daily target, and BMR/TDEE
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const summary = db.getCalorieSummary(req.user.id);
    return res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error('Error fetching calorie summary:', err);
    return res.status(500).json({ success: false, message: 'Internal server error fetching calorie summary.' });
  }
});

// GET /api/calories/logs
// Get list of all activity / calorie burn logs for user
router.get('/logs', authenticateToken, (req, res) => {
  try {
    const logs = db.getCalorieLogsByUserId(req.user.id);
    return res.json({
      success: true,
      logs
    });
  } catch (err) {
    console.error('Error fetching calorie logs:', err);
    return res.status(500).json({ success: false, message: 'Internal server error fetching calorie logs.' });
  }
});

// POST /api/calories/log
// Log a new activity with duration and calories burned
router.post('/log', authenticateToken, (req, res) => {
  try {
    const { activity, duration_mins, calories_burned, notes = '', created_at } = req.body;

    const parsedDuration = parseInt(duration_mins, 10);
    const parsedCalories = parseInt(calories_burned, 10);

    if (!activity || typeof activity !== 'string' || activity.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please specify the activity name.' });
    }

    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid activity duration in minutes.' });
    }

    if (isNaN(parsedCalories) || parsedCalories < 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid number of calories burned.' });
    }

    const log = db.addCalorieLog({
      user_id: req.user.id,
      activity: activity.trim(),
      duration_mins: parsedDuration,
      calories_burned: parsedCalories,
      notes: (notes || '').trim(),
      created_at: created_at || new Date().toISOString()
    });

    const summary = db.getCalorieSummary(req.user.id);

    // If reached daily target, send a celebratory reminder/alert
    if (summary.today_burnt >= summary.daily_target_burn && (summary.today_burnt - parsedCalories) < summary.daily_target_burn) {
      db.addNotification({
        user_id: req.user.id,
        type: 'health_alert',
        title: 'Daily Calorie Goal Crushed! 🔥',
        message: `Outstanding! You burned ${summary.today_burnt} kcal today, surpassing your target of ${summary.daily_target_burn} kcal!`,
        link: '#dashboard'
      });
    }

    db.logAudit(req.user.id, 'CALORIES_LOGGED', `Burned ${parsedCalories} kcal via ${activity.trim()} (${parsedDuration} mins)`, req.ip);

    return res.status(201).json({
      success: true,
      message: `Successfully logged ${parsedCalories} kcal burned from ${activity.trim()}!`,
      log,
      summary
    });
  } catch (err) {
    console.error('Error logging calories:', err);
    return res.status(500).json({ success: false, message: 'Internal server error logging calories.' });
  }
});

// DELETE /api/calories/log/:id
// Delete a specific calorie burn entry
router.delete('/log/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteCalorieLog(id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Calorie log entry not found or already removed.' });
    }
    const summary = db.getCalorieSummary(req.user.id);
    return res.json({
      success: true,
      message: 'Activity log deleted successfully.',
      summary
    });
  } catch (err) {
    console.error('Error deleting calorie log:', err);
    return res.status(500).json({ success: false, message: 'Internal server error deleting calorie log.' });
  }
});

// POST /api/calories/calculate
// Calculate BMR, TDEE, Daily Target Burn, and Total Goal Calories to Burn
router.post('/calculate', (req, res) => {
  try {
    const { height, weight, age = 28, gender = 'Male', unit = 'metric' } = req.body;

    let heightCm = parseFloat(height);
    let weightKg = parseFloat(weight);
    let userAge = parseInt(age, 10) || 28;

    if (unit === 'imperial') {
      heightCm = heightCm * 2.54;
      weightKg = weightKg * 0.45359237;
    }

    if (isNaN(heightCm) || heightCm < 40 || heightCm > 300) {
      return res.status(400).json({ success: false, message: 'Please provide a valid height (40 - 300 cm).' });
    }

    if (isNaN(weightKg) || weightKg < 10 || weightKg > 500) {
      return res.status(400).json({ success: false, message: 'Please provide a valid weight (10 - 500 kg).' });
    }

    const targets = computeCalorieTargets(heightCm, weightKg, userAge, gender);

    return res.json({
      success: true,
      data: {
        heightCm: Number(heightCm.toFixed(1)),
        weightKg: Number(weightKg.toFixed(1)),
        age: userAge,
        gender,
        unit,
        ...targets
      }
    });
  } catch (err) {
    console.error('Error calculating calorie targets:', err);
    return res.status(500).json({ success: false, message: 'Internal server error calculating calorie targets.' });
  }
});

module.exports = router;
