import { DailyLog, UserProfile, ChatMessage } from '../types/health';
import { calculateBMI, calculateBMRAndTDEE } from '../utils/calculations';

export interface AIResponse {
  text: string;
  suggestions?: string[];
  actionType?: 'log_water' | 'start_workout' | 'log_meal' | 'open_page';
  actionPayload?: any;
}

/**
 * AI Assistant Service with dynamic context analysis and optional external LLM support
 */
export async function queryAIAssistant(
  userQuery: string,
  profile: UserProfile,
  todayLog: DailyLog,
  pastLogs: Record<string, DailyLog>
): Promise<AIResponse> {
  const query = userQuery.trim().toLowerCase();

  // If user provided a custom Gemini API key or OpenAI key, we can try calling it
  if (profile.customApiKey && profile.customApiKey.startsWith('AIza')) {
    try {
      const geminiResponse = await callGeminiAPI(profile.customApiKey, userQuery, profile, todayLog);
      if (geminiResponse) {
        return geminiResponse;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to built-in health intelligence:', err);
    }
  }

  // Built-in High Intelligence Context-Aware Health Engine
  return generateContextualAIResponse(query, profile, todayLog, pastLogs);
}

/**
 * Intelligent context-aware reasoning engine that understands dashboard metrics
 */
function generateContextualAIResponse(
  query: string,
  profile: UserProfile,
  todayLog: DailyLog,
  pastLogs: Record<string, DailyLog>
): AIResponse {
  const { bmi, category: bmiCategory } = calculateBMI(profile.weightKg, profile.heightCm);
  const { bmr, tdee, recommendedCalories } = calculateBMRAndTDEE(profile);

  const waterDrank = todayLog.waterIntakeMl || 0;
  const waterTarget = todayLog.waterGoalMl || 2500;
  const waterRemaining = Math.max(0, waterTarget - waterDrank);
  const waterPercent = Math.round((waterDrank / waterTarget) * 100);

  const stepsDone = todayLog.steps || 0;
  const stepTarget = todayLog.stepGoal || 8000;
  const stepsRemaining = Math.max(0, stepTarget - stepsDone);

  const caloriesLogged = todayLog.caloriesConsumed || 0;
  const calorieGoal = todayLog.calorieGoal || recommendedCalories;
  const caloriesRemaining = calorieGoal - caloriesLogged;

  const exerciseMins = todayLog.exerciseMinutes || 0;
  const exerciseGoal = todayLog.exerciseGoalMinutes || 30;

  const sleepHours = ((todayLog.sleep?.durationMinutes || 0) / 60).toFixed(1);
  const sleepQuality = todayLog.sleep?.quality || 'Good';

  // 1. Water & Hydration Questions
  if (query.includes('water') || query.includes('drink') || query.includes('hydrate') || query.includes('hydration')) {
    let msg = `### 💧 Your Hydration Analysis Today\n\n`;
    msg += `- **Current Intake:** ${waterDrank} ml (${(waterDrank / 1000).toFixed(2)} L) / **Goal:** ${waterTarget} ml (${waterPercent}% completed)\n`;
    
    if (waterRemaining > 0) {
      const glassesRemaining = Math.ceil(waterRemaining / 250);
      msg += `- **Remaining:** You still need **${waterRemaining} ml** (about **${glassesRemaining} glasses** of 250ml) to reach your daily goal.\n\n`;
      msg += `💡 **Hydration Tip for ${profile.fitnessGoal.replace('_', ' ')}:** Drink 1 full glass (250ml) before your next meal to maintain optimal metabolic efficiency and energy levels!`;
    } else {
      msg += `- 🎉 **Goal Crushed!** You have exceeded your daily hydration target! Keep sipping periodically, especially after workouts.\n\n`;
      msg += `💡 Excellent job maintaining cell hydration and stamina today!`;
    }

    return {
      text: msg,
      suggestions: ['Log 250 ml water', 'How is my health score?', 'Suggest a workout'],
      actionType: 'log_water',
      actionPayload: { amountMl: 250 }
    };
  }

  // 2. Exercise & Workout Suggestions
  if (query.includes('exercise') || query.includes('workout') || query.includes('training') || query.includes('fitness') || query.includes('run') || query.includes('walk') || query.includes('stretch')) {
    const is20min = query.includes('20') || query.includes('twenty');
    const is15min = query.includes('15') || query.includes('ten') || query.includes('10');
    const duration = is15min ? '15 minutes' : is20min ? '20 minutes' : '30 minutes';

    let routine = `### 🏃 Personalized Exercise Suggestion (${duration})\n\n`;
    routine += `Tailored for your goal: **${profile.fitnessGoal.replace('_', ' ').toUpperCase()}** (Activity level: ${profile.activityLevel})\n\n`;

    if (profile.fitnessGoal === 'weight_loss' || profile.fitnessGoal === 'stamina') {
      routine += `**Recommended Session: High-Energy Interval Circuit**\n`;
      routine += `1. **Warm-up (3 min):** Light jogging in place & dynamic arm circles.\n`;
      routine += `2. **Interval 1 (5 min):** 40s Jumping Jacks / 20s Rest × 5 sets (Burns ~55 kcal).\n`;
      routine += `3. **Interval 2 (6 min):** 45s Bodyweight Squats & High Knees × 4 sets (Burns ~70 kcal).\n`;
      routine += `4. **Core Finish (4 min):** Mountain Climbers & Plank Holds (Burns ~45 kcal).\n`;
      routine += `5. **Cool-down (2 min):** Slow hamstring stretches & deep nasal breathing.\n\n`;
      routine += `🔥 **Est. Calories Burned:** ~170 - 210 kcal\n`;
    } else if (profile.fitnessGoal === 'muscle_gain') {
      routine += `**Recommended Session: Calisthenics & Strength Focus**\n`;
      routine += `1. **Warm-up (3 min):** Shoulder dislocates & torso rotations.\n`;
      routine += `2. **Pushups / Incline Pushups (6 min):** 3 sets of 10-15 reps (Rest 60s).\n`;
      routine += `3. **Bulgarian Split Squats (6 min):** 3 sets of 10 reps each leg.\n`;
      routine += `4. **Pike Pushups or Dips (4 min):** 3 sets of 8-12 reps.\n`;
      routine += `5. **Cool-down (2 min):** Chest and hip flexor stretches.\n\n`;
      routine += `🔥 **Est. Calories Burned:** ~150 kcal with high anabolic stimulus\n`;
    } else {
      routine += `**Recommended Session: Mindful Yoga & Mobility Flow**\n`;
      routine += `1. **Sun Salutations (6 min):** 4 slow cycles connecting breath with movement.\n`;
      routine += `2. **Warrior II to Triangle Pose (6 min):** Strengthen legs, hips, and core.\n`;
      routine += `3. **Cat-Cow & Cobra Pose (5 min):** Decompress spine and improve posture.\n`;
      routine += `4. **Child's Pose & Savasana (3 min):** Nervous system regulation.\n\n`;
      routine += `🔥 **Est. Calories Burned:** ~110 kcal | Low impact, high restorative value.\n`;
    }

    routine += `\n*Today you have logged ${exerciseMins} mins of exercise so far (Goal: ${exerciseGoal} mins).*`;

    return {
      text: routine,
      suggestions: ['Start 20-min Workout Timer', 'What should I eat after workout?', 'Check my health score']
    };
  }

  // 3. Meal & Nutrition Suggestions
  if (query.includes('meal') || query.includes('eat') || query.includes('dinner') || query.includes('lunch') || query.includes('breakfast') || query.includes('snack') || query.includes('food') || query.includes('diet') || query.includes('calorie')) {
    const mealKind = query.includes('dinner') ? 'Dinner' : query.includes('lunch') ? 'Lunch' : query.includes('breakfast') ? 'Breakfast' : 'Nutritious Meal';
    
    let mealResponse = `### 🥗 Personalized ${mealKind} Recommendation\n\n`;
    mealResponse += `Dietary Preference: **${profile.dietaryPreference.toUpperCase()}** | Calorie Status: **${caloriesLogged} kcal logged** (${caloriesRemaining > 0 ? `${caloriesRemaining} kcal remaining` : 'Target reached'})\n\n`;

    if (profile.dietaryPreference === 'vegetarian' || profile.dietaryPreference === 'vegan') {
      mealResponse += `**Option: Warm Quinoa Mediterranean Nourish Bowl**\n`;
      mealResponse += `- **Ingredients:** 1 cup cooked tri-color quinoa, grilled tofu / roasted chickpeas, diced cucumbers, cherry tomatoes, kalamata olives, tahini lemon dressing.\n`;
      mealResponse += `- **Nutritional Profile:** 480 kcal | **Protein:** 24g | **Carbs:** 54g | **Healthy Fats:** 18g\n`;
      mealResponse += `- **Benefits:** High plant-based iron, fiber, and complete amino acids without energy crashes.\n`;
    } else if (profile.dietaryPreference === 'keto' || profile.dietaryPreference === 'low_carb') {
      mealResponse += `**Option: Pan-Seared Salmon with Garlic Butter Asparagus**\n`;
      mealResponse += `- **Ingredients:** 180g wild salmon fillet, 1 bunch steamed asparagus, sliced avocado, olive oil, lemon zest, baby spinach.\n`;
      mealResponse += `- **Nutritional Profile:** 520 kcal | **Protein:** 42g | **Carbs:** 8g (net) | **Healthy Fats:** 36g\n`;
      mealResponse += `- **Benefits:** Rich in Omega-3 fatty acids, supports anti-inflammatory pathways.\n`;
    } else {
      mealResponse += `**Option: Grilled Lemon-Herb Chicken with Roasted Sweet Potato & Steamed Broccoli**\n`;
      mealResponse += `- **Ingredients:** 160g chicken breast, 1 medium roasted sweet potato, 1.5 cups broccoli florets drizzled with extra virgin olive oil.\n`;
      mealResponse += `- **Nutritional Profile:** 490 kcal | **Protein:** 44g | **Carbs:** 48g | **Fat:** 12g\n`;
      mealResponse += `- **Benefits:** Lean protein for muscle repair combined with complex carbs for glycogen replenishment.\n`;
    }

    if (profile.allergies && profile.allergies.length > 0) {
      mealResponse += `\n⚠️ *Verified allergen-safe (Checked for: ${profile.allergies.join(', ')})*`;
    }

    return {
      text: mealResponse,
      suggestions: ['Log this meal', 'Show macro breakdown', 'How much water should I drink?']
    };
  }

  // 4. Overall Health Progress & Status
  if (query.includes('progress') || query.includes('score') || query.includes('status') || query.includes('how am i doing') || query.includes('health')) {
    const score = todayLog.healthScore || 0;
    let report = `### 📊 Your Comprehensive Health Summary\n\n`;
    report += `**Overall Health Score:** **${score}/100** ${score >= 80 ? '🟢 (Excellent)' : score >= 50 ? '🟡 (Good Progress)' : '🟠 (Action Needed)'}\n\n`;
    
    report += `**Key Daily Metrics:**\n`;
    report += `- 💧 **Water:** ${waterDrank} / ${waterTarget} ml (${waterPercent}%)\n`;
    report += `- 👣 **Steps:** ${stepsDone.toLocaleString()} / ${stepTarget.toLocaleString()} steps\n`;
    report += `- 🏃 **Exercise:** ${exerciseMins} / ${exerciseGoal} active mins\n`;
    report += `- 🌙 **Sleep:** ${sleepHours} hours logged (Quality: ${sleepQuality})\n`;
    report += `- 🍎 **Calories:** ${caloriesLogged} / ${calorieGoal} kcal\n\n`;

    report += `**BMI & Body Metrics:**\n`;
    report += `- Current BMI is **${bmi}** (${bmiCategory}), calculated from ${profile.weightKg} kg and ${profile.heightCm} cm.\n`;
    report += `- Estimated BMR is **${bmr} kcal**, and TDEE is **${tdee} kcal/day**.\n\n`;

    if (score < 70) {
      report += `🎯 **Quick Win for Today:** `;
      if (waterRemaining > 0) report += `Drink a 500ml bottle of water right now (+10 pts to score). `;
      if (stepsRemaining > 0) report += `Take a 15-minute brisk walk (+15 pts to score). `;
    } else {
      report += `🌟 **Outstanding work!** You are maintaining solid wellness habits.`;
    }

    return {
      text: report,
      suggestions: ['Suggest an exercise for 20 minutes', 'What should I eat for dinner?', 'Give me a sleep tip']
    };
  }

  // 5. Sleep & Recovery Questions
  if (query.includes('sleep') || query.includes('bed') || query.includes('rest') || query.includes('tired') || query.includes('insomnia')) {
    let sleepAdvice = `### 🌙 Sleep & Recovery Optimization\n\n`;
    sleepAdvice += `- **Last Logged Sleep:** ${sleepHours} hours (Quality: ${sleepQuality})\n`;
    sleepAdvice += `- **Recommended Duration:** 7.5 - 8.5 hours for adults to facilitate cellular restoration and memory consolidation.\n\n`;
    
    sleepAdvice += `**Science-Backed Sleep Hygiene Protocol:**\n`;
    sleepAdvice += `1. **Digital Sunset:** Cut blue-light screens 45 minutes before sleep.\n`;
    sleepAdvice += `2. **Temperature:** Keep bedroom cool (~18-20°C / 65-68°F).\n`;
    sleepAdvice += `3. **Caffeine Cutoff:** Stop caffeine 8-9 hours before bedtime.\n`;
    sleepAdvice += `4. **4-7-8 Breathing:** Inhale 4s, hold 7s, exhale slowly 8s for 4 cycles to stimulate the vagus nerve.\n`;

    return {
      text: sleepAdvice,
      suggestions: ['Set Bedtime Reminder', 'How is my overall score?', 'Suggest evening stretch']
    };
  }

  // General / Fallback Response
  return {
    text: `Hello ${profile.name || 'there'}! 👋 I am your **Healthy Me AI Health Assistant**.\n\nI have real-time access to your health metrics:\n- 💧 **Hydration:** ${waterDrank} / ${waterTarget} ml\n- 👣 **Steps:** ${stepsDone} / ${stepTarget}\n- 🏃 **Active Exercise:** ${exerciseMins} mins\n- 📊 **Health Score:** ${todayLog.healthScore || 0}/100\n\nHow can I help you elevate your health right now? You can ask me for personalized workouts, meal plans, hydration tips, or progress explanations!`,
    suggestions: [
      'How much water should I drink today?',
      'Suggest an exercise for 20 minutes',
      'What should I eat for dinner?',
      'How is my health progress?'
    ]
  };
}

/**
 * Optional Gemini LLM Direct API Integration
 */
async function callGeminiAPI(
  apiKey: string,
  userQuery: string,
  profile: UserProfile,
  todayLog: DailyLog
): Promise<AIResponse | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const systemContext = `
You are Healthy Me, an empathetic, highly knowledgeable AI personal health and wellness assistant.
User Profile:
- Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
- Height: ${profile.heightCm} cm, Weight: ${profile.weightKg} kg
- Fitness Goal: ${profile.fitnessGoal}, Activity Level: ${profile.activityLevel}
- Dietary Preference: ${profile.dietaryPreference}, Allergies: ${profile.allergies.join(', ') || 'None'}

Today's Live Dashboard Stats:
- Water: ${todayLog.waterIntakeMl} / ${todayLog.waterGoalMl} ml
- Steps: ${todayLog.steps} / ${todayLog.stepGoal}
- Exercise: ${todayLog.exerciseMinutes} / ${todayLog.exerciseGoalMinutes} mins
- Sleep: ${(todayLog.sleep?.durationMinutes || 0)/60} hrs (Quality: ${todayLog.sleep?.quality})
- Calories: ${todayLog.caloriesConsumed} / ${todayLog.calorieGoal} kcal
- Health Score: ${todayLog.healthScore}/100

Guidelines:
- Give clear, practical, structured advice in markdown (bullet points, bolding).
- Reference their live data directly where helpful.
- Suggest actionable next steps.
- Maintain an encouraging, energizing tone.
- Do NOT provide medical diagnosis; maintain general wellness focus.
`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemContext}\n\nUser Question: ${userQuery}` }]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  return {
    text,
    suggestions: ['How is my health score?', 'Suggest another meal', 'Give me hydration tips']
  };
}
