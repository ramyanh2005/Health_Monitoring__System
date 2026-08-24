const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../auth');

// Helper to evaluate BMI category and recommendations
function evaluateBmi(heightCm, weightKg) {
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal';
  let categoryDetail = 'Normal weight';
  let color = '#10b981'; // Green
  let badgeClass = 'badge-normal';
  let summary = 'You are in a healthy weight range. Keep up your active lifestyle and nutritious diet!';
  let recommendations = [];

  // Calculate ideal weight range (BMI 18.5 - 24.9)
  const minIdealWeight = Number((18.5 * heightM * heightM).toFixed(1));
  const maxIdealWeight = Number((24.9 * heightM * heightM).toFixed(1));

  let weightDelta = 0;
  let targetAction = 'Maintain';

  if (bmi < 18.5) {
    category = 'Underweight';
    categoryDetail = 'Underweight (BMI < 18.5)';
    color = '#3b82f6'; // Blue
    badgeClass = 'badge-underweight';
    summary = 'Your BMI indicates that you are underweight. Consider nutrient-dense foods and strength training.';
    weightDelta = Number((minIdealWeight - weightKg).toFixed(1));
    targetAction = `Gain +${weightDelta} kg to reach healthy minimum (${minIdealWeight} kg)`;
    recommendations = [
      'Increase caloric intake with nutrient-dense foods like nuts, avocados, whole grains, and lean proteins.',
      'Incorporate progressive resistance / strength training to build healthy muscle mass.',
      'Eat 5-6 smaller, frequent meals throughout the day.',
      'Consult a certified nutritionist or healthcare provider if fatigue or weakness occurs.'
    ];
  } else if (bmi >= 18.5 && bmi < 25.0) {
    category = 'Normal';
    categoryDetail = 'Normal / Healthy Weight (BMI 18.5 - 24.9)';
    color = '#10b981'; // Emerald Green
    badgeClass = 'badge-normal';
    summary = 'Congratulations! Your BMI is within the ideal healthy range.';
    weightDelta = 0;
    targetAction = `Maintain current range (${minIdealWeight} kg - ${maxIdealWeight} kg)`;
    recommendations = [
      'Maintain balanced nutrition rich in leafy vegetables, lean proteins, fruits, and whole grains.',
      'Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous exercise weekly.',
      'Stay consistently hydrated with 2.5 to 3 liters of water daily.',
      'Get 7-9 hours of restful sleep every night to support recovery.'
    ];
  } else if (bmi >= 25.0 && bmi < 30.0) {
    category = 'Overweight';
    categoryDetail = 'Overweight (BMI 25.0 - 29.9)';
    color = '#f59e0b'; // Amber / Orange
    badgeClass = 'badge-overweight';
    summary = 'Your BMI suggests you are in the overweight range. Small lifestyle modifications can make a big impact.';
    weightDelta = Number((weightKg - maxIdealWeight).toFixed(1));
    targetAction = `Lose -${weightDelta} kg to reach healthy upper bound (${maxIdealWeight} kg)`;
    recommendations = [
      'Focus on a modest caloric deficit: limit sugary drinks, processed snacks, and excess refined carbs.',
      'Engage in regular cardiovascular exercise (brisk walking, swimming, cycling) 30-45 mins daily.',
      'Practice mindful portion control and prioritize high-fiber vegetables with meals.',
      'Track your weekly fitness metrics and celebrate consistent positive habits.'
    ];
  } else {
    category = 'Obese';
    categoryDetail = bmi >= 35 ? 'Severe Obesity (BMI >= 35.0)' : 'Obesity (BMI 30.0 - 34.9)';
    color = '#ef4444'; // Red
    badgeClass = 'badge-obese';
    summary = 'Your BMI falls into the obesity category. Structured lifestyle support and guidance are recommended.';
    weightDelta = Number((weightKg - maxIdealWeight).toFixed(1));
    targetAction = `Target healthy range (${minIdealWeight} kg - ${maxIdealWeight} kg)`;
    recommendations = [
      'Consult with a healthcare physician or registered dietitian for a personalized, safe plan.',
      'Begin low-impact workouts (swimming, stationary cycling, walking) to protect your joints.',
      'Focus on whole foods, eliminating ultra-processed foods and liquid sugars.',
      'Monitor blood pressure, blood glucose, and other vital wellness parameters periodically.'
    ];
  }

  return {
    bmi,
    category,
    categoryDetail,
    color,
    badgeClass,
    summary,
    idealWeightRange: {
      min: minIdealWeight,
      max: maxIdealWeight,
      unit: 'kg'
    },
    weightDelta,
    targetAction,
    recommendations
  };
}

// POST /api/bmi/calculate
// Calculate BMI without mandatory authentication (can be used as public quick tool or by logged in users)
router.post('/calculate', (req, res) => {
  try {
    const { height, weight, unit = 'metric' } = req.body;

    let heightCm = parseFloat(height);
    let weightKg = parseFloat(weight);

    // Convert imperial (inches/lbs) if requested
    if (unit === 'imperial') {
      // height in inches or total inches, weight in lbs
      heightCm = heightCm * 2.54;
      weightKg = weightKg * 0.45359237;
    }

    if (isNaN(heightCm) || heightCm < 40 || heightCm > 300) {
      return res.status(400).json({ success: false, message: 'Please provide a valid height (40 - 300 cm).' });
    }

    if (isNaN(weightKg) || weightKg < 10 || weightKg > 500) {
      return res.status(400).json({ success: false, message: 'Please provide a valid weight (10 - 500 kg).' });
    }

    const result = evaluateBmi(heightCm, weightKg);

    return res.json({
      success: true,
      data: {
        heightCm: Number(heightCm.toFixed(1)),
        weightKg: Number(weightKg.toFixed(1)),
        unit,
        ...result
      }
    });
  } catch (err) {
    console.error('BMI Calculation error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error calculating BMI.' });
  }
});

// POST /api/bmi/save
// Save calculated BMI to authenticated user's history and optionally update user profile
router.post('/save', authenticateToken, (req, res) => {
  try {
    const { height, weight, notes = '', sync_profile = true } = req.body;

    const heightCm = parseFloat(height);
    const weightKg = parseFloat(weight);

    if (isNaN(heightCm) || heightCm < 40 || heightCm > 300) {
      return res.status(400).json({ success: false, message: 'Invalid height.' });
    }

    if (isNaN(weightKg) || weightKg < 10 || weightKg > 500) {
      return res.status(400).json({ success: false, message: 'Invalid weight.' });
    }

    const result = evaluateBmi(heightCm, weightKg);

    const log = db.addBmiLog({
      user_id: req.user.id,
      height: heightCm,
      weight: weightKg,
      bmi_value: result.bmi,
      category: result.category,
      notes: notes.trim()
    });

    if (sync_profile) {
      db.updateUser(req.user.id, {
        height: heightCm,
        weight: weightKg
      });
    }

    // Trigger notification if milestone reached
    if (result.category === 'Normal') {
      db.addNotification({
        user_id: req.user.id,
        type: 'health_alert',
        title: 'BMI Check Recorded ✨',
        message: `Your BMI is ${result.bmi} (${result.category}). You are right in the optimal healthy weight zone!`,
        link: '#history'
      });
    } else {
      db.addNotification({
        user_id: req.user.id,
        type: 'reminder',
        title: 'BMI Record Saved 📊',
        message: `New entry logged: BMI ${result.bmi} (${result.category}). Check recommendations in your fitness hub.`,
        link: '#calculator'
      });
    }

    db.logAudit(req.user.id, 'BMI_LOGGED', `BMI logged: ${result.bmi} (${result.category})`, req.ip);

    return res.status(201).json({
      success: true,
      message: 'Fitness record saved successfully!',
      log,
      analysis: result
    });
  } catch (err) {
    console.error('BMI save error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error saving BMI record.' });
  }
});

// GET /api/bmi/history
// Get logged in user's BMI calculation history & progression analytics
router.get('/history', authenticateToken, (req, res) => {
  try {
    const logs = db.getBmiLogsByUserId(req.user.id);

    // Compute basic statistics
    let stats = {
      total_records: logs.length,
      latest_bmi: logs.length > 0 ? logs[0].bmi_value : null,
      latest_category: logs.length > 0 ? logs[0].category : null,
      latest_weight: logs.length > 0 ? logs[0].weight : null,
      min_bmi: logs.length > 0 ? Math.min(...logs.map(l => l.bmi_value)) : null,
      max_bmi: logs.length > 0 ? Math.max(...logs.map(l => l.bmi_value)) : null,
      weight_change: null
    };

    if (logs.length >= 2) {
      const earliest = logs[logs.length - 1];
      const latest = logs[0];
      stats.weight_change = Number((latest.weight - earliest.weight).toFixed(1));
    }

    return res.json({
      success: true,
      logs,
      stats
    });
  } catch (err) {
    console.error('BMI history error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error fetching BMI history.' });
  }
});

// DELETE /api/bmi/history/:id
// Delete a specific BMI log entry
router.delete('/history/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteBmiLog(id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'BMI log not found or permission denied.' });
    }
    return res.json({ success: true, message: 'Log entry deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error deleting log.' });
  }
});

module.exports = router;
