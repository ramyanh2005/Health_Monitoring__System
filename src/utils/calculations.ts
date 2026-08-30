import { DailyLog, UserProfile } from '../types/health';

/**
 * Calculates BMI and returns category, color, ideal weight range & male health insight
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: 'Underweight' | 'Healthy' | 'Overweight' | 'Obese';
  color: string;
  idealWeightRange: { min: number; max: number };
  message: string;
} {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) {
    return { 
      bmi: 0, 
      category: 'Healthy', 
      color: '#64748b', 
      idealWeightRange: { min: 0, max: 0 },
      message: 'Enter your height in cm and weight in kg to calculate your Body Mass Index.'
    };
  }
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  const minWeight = parseFloat((18.5 * heightM * heightM).toFixed(1));
  const maxWeight = parseFloat((24.9 * heightM * heightM).toFixed(1));

  let category: 'Underweight' | 'Healthy' | 'Overweight' | 'Obese' = 'Healthy';
  let color = '#10b981';
  let message = '';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#0284c7';
    message = 'Your BMI is below healthy range. Consider a nutrient-dense, high-protein nutrition plan with progressive strength training to build lean muscle mass.';
  } else if (bmi <= 24.9) {
    category = 'Healthy';
    color = '#10b981';
    message = 'Great job! Optimal healthy weight zone (18.5 – 24.9). Excellent foundation for athletic performance, cardio stamina, and metabolic vitality.';
  } else if (bmi <= 29.9) {
    category = 'Overweight';
    color = '#f59e0b';
    message = 'Slightly elevated BMI. If you are training heavily with weights, note that muscle mass increases BMI. Incorporate consistent Zone 2 cardio and a slight caloric deficit.';
  } else {
    category = 'Obese';
    color = '#e11d48';
    message = 'Higher metabolic risk category. Prioritize daily hydration, 10,000 steps, lean protein, and structured strength sessions to accelerate fat loss.';
  }

  return { 
    bmi, 
    category, 
    color, 
    idealWeightRange: { min: minWeight, max: maxWeight },
    message
  };
}

/**
 * Calculates BMR (Mifflin-St Jeor) and TDEE for Men
 */
export function calculateBMRAndTDEE(profile: UserProfile): { bmr: number; tdee: number; recommendedCalories: number } {
  const { weightKg, heightCm, age, gender, activityLevel, fitnessGoal } = profile;
  
  if (!weightKg || !heightCm || !age || weightKg <= 0 || heightCm <= 0 || age <= 0) {
    return { bmr: 0, tdee: 0, recommendedCalories: 2200 };
  }

  // Mifflin-St Jeor formula: Male: 10*W + 6.25*H - 5*A + 5
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5; // default male focus
  }
  bmr = Math.round(bmr);

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725
  };

  const mult = multipliers[activityLevel] || 1.55;
  const tdee = Math.round(bmr * mult);

  let recommendedCalories = tdee;
  if (fitnessGoal === 'weight_loss') {
    recommendedCalories = Math.max(1500, tdee - 500);
  } else if (fitnessGoal === 'muscle_gain') {
    recommendedCalories = tdee + 400;
  } else if (fitnessGoal === 'stamina') {
    recommendedCalories = tdee + 200;
  }

  return { bmr, tdee, recommendedCalories };
}

/**
 * Calculates Overall Daily Health Score (0 - 100)
 */
export function calculateHealthScore(log: DailyLog): {
  score: number;
  breakdown: {
    water: number;
    steps: number;
    exercise: number;
    sleep: number;
    nutrition: number;
  };
} {
  // 1. Water (20 pts)
  const waterRatio = log.waterGoalMl > 0 ? Math.min(1.2, (log.waterIntakeMl || 0) / log.waterGoalMl) : 0;
  const waterScore = Math.min(20, Math.round(waterRatio * 20));

  // 2. Steps (20 pts)
  const stepRatio = log.stepGoal > 0 ? Math.min(1.2, (log.steps || 0) / log.stepGoal) : 0;
  const stepScore = Math.min(20, Math.round(stepRatio * 20));

  // 3. Exercise (20 pts)
  const exerciseRatio = log.exerciseGoalMinutes > 0 ? Math.min(1.2, (log.exerciseMinutes || 0) / log.exerciseGoalMinutes) : 0;
  const exerciseScore = Math.min(20, Math.round(exerciseRatio * 20));

  // 4. Sleep (20 pts)
  const sleepHours = (log.sleep?.durationMinutes || 0) / 60;
  let sleepScore = 0;
  if (sleepHours >= 7 && sleepHours <= 9) {
    sleepScore = 20;
  } else if (sleepHours >= 6 && sleepHours < 7) {
    sleepScore = 16;
  } else if (sleepHours > 9 && sleepHours <= 10) {
    sleepScore = 17;
  } else if (sleepHours > 0) {
    sleepScore = Math.min(15, Math.round((sleepHours / (log.sleepGoalHours || 8)) * 20));
  }

  if (log.sleep?.quality === 'Excellent') sleepScore = Math.min(20, sleepScore + 2);
  if (log.sleep?.quality === 'Poor') sleepScore = Math.max(0, sleepScore - 3);

  // 5. Nutrition / Meals (20 pts)
  let nutritionScore = 0;
  const completedMealsCount = (log.meals || []).filter(m => m.completed).length;
  if (completedMealsCount >= 3) {
    nutritionScore = 20;
  } else if (completedMealsCount === 2) {
    nutritionScore = 15;
  } else if (completedMealsCount === 1) {
    nutritionScore = 10;
  } else if (log.caloriesConsumed > 0 && log.calorieGoal > 0) {
    const diff = Math.abs(log.caloriesConsumed - log.calorieGoal);
    if (diff < 250) nutritionScore = 18;
    else if (diff < 500) nutritionScore = 14;
    else nutritionScore = 10;
  }

  const score = Math.min(100, Math.max(0, waterScore + stepScore + exerciseScore + sleepScore + nutritionScore));

  return {
    score,
    breakdown: {
      water: waterScore,
      steps: stepScore,
      exercise: exerciseScore,
      sleep: sleepScore,
      nutrition: nutritionScore
    }
  };
}

/**
 * Calculates current consecutive active streak in days
 */
export function calculateStreak(logs: Record<string, DailyLog>): number {
  const dates = Object.keys(logs).sort().reverse();
  if (dates.length === 0) return 0;

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < dates.length; i++) {
    const log = logs[dates[i]];
    if (log && (log.waterIntakeMl > 500 || log.steps > 2000 || log.exerciseMinutes > 10 || log.meals.length > 0)) {
      streak++;
    } else if (dates[i] === today) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Formats a date string nicely
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  
  return target.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Returns motivational message tailored for male vitality, stamina, and strength
 */
export function getMotivationalMessage(healthScore: number, userName: string): { title: string; quote: string; tag: string } {
  const displayName = userName || 'Champion';
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  if (healthScore >= 80) {
    return {
      title: `Dominating performance, ${displayName}! 🏆`,
      quote: "Peak male vitality achieved today. Your discipline in hydration, training, and recovery is compounding into elite performance.",
      tag: "Peak Male Vitality"
    };
  } else if (healthScore >= 50) {
    return {
      title: `Solid momentum this ${timeOfDay}, ${displayName}! ⚡`,
      quote: "You are crushing your baseline targets. Power through your remaining hydration and training to max out your vitality score.",
      tag: "Building Power"
    };
  } else if (healthScore > 0) {
    return {
      title: `Ready to elevate your game this ${timeOfDay}, ${displayName}? 🚀`,
      quote: "Consistency is what separates the average from the elite. Lock in a glass of water and hit your step target now!",
      tag: "Daily Kickstart"
    };
  } else {
    return {
      title: `Welcome to Male Healthy Dashboard, ${displayName}! 👋`,
      quote: "Enter your daily health information below or update your profile measurements to start tracking your vitality index.",
      tag: "Get Started"
    };
  }
}
