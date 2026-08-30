import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Clock,
  Apple
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { DietaryPreference, MealType } from '../../types/health';

interface MealRecipeTemplate {
  id: string;
  name: string;
  mealType: MealType;
  dietaryCategory: DietaryPreference[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes: number;
  ingredients: string[];
  recipeTip: string;
  allergens?: string[];
}

const MEAL_RECIPES_CATALOG: MealRecipeTemplate[] = [
  {
    id: 'rec-b-1',
    name: 'Avocado & Poached Egg Protein Sourdough',
    mealType: 'breakfast',
    dietaryCategory: ['balanced', 'high_protein', 'mediterranean'],
    calories: 420,
    protein: 22,
    carbs: 36,
    fat: 20,
    prepTimeMinutes: 10,
    ingredients: ['2 slices whole grain sourdough', '1/2 ripe avocado', '2 organic eggs', 'Chia seeds', 'Chili flakes'],
    recipeTip: 'Poach eggs in simmering water with a dash of white vinegar for perfect silky yolks.'
  },
  {
    id: 'rec-b-2',
    name: 'Vanilla Berry Chia Seed Overnight Oats',
    mealType: 'breakfast',
    dietaryCategory: ['vegetarian', 'vegan', 'balanced'],
    calories: 380,
    protein: 16,
    carbs: 58,
    fat: 10,
    prepTimeMinutes: 5,
    ingredients: ['Rolled oats', 'Almond milk', 'Chia seeds', 'Fresh blueberries', 'Organic maple syrup'],
    recipeTip: 'Prep the night before in a mason jar for a grab-and-go morning boost.'
  },
  {
    id: 'rec-l-1',
    name: 'Grilled Lemon Herb Chicken & Quinoa Nourish Bowl',
    mealType: 'lunch',
    dietaryCategory: ['balanced', 'high_protein', 'mediterranean'],
    calories: 540,
    protein: 46,
    carbs: 48,
    fat: 18,
    prepTimeMinutes: 20,
    ingredients: ['160g chicken breast', '1 cup cooked quinoa', 'Cucumber', 'Cherry tomatoes', 'Tahini dressing'],
    recipeTip: 'Marinate chicken in fresh lemon juice, rosemary, and garlic for 15 mins before grilling.'
  },
  {
    id: 'rec-l-2',
    name: 'Mediterranean Chickpea & Crisp Veggie Wrap',
    mealType: 'lunch',
    dietaryCategory: ['vegetarian', 'vegan', 'balanced'],
    calories: 480,
    protein: 20,
    carbs: 65,
    fat: 16,
    prepTimeMinutes: 10,
    ingredients: ['Whole wheat tortilla', 'Spiced chickpeas', 'Hummus', 'Shredded carrots', 'Arugula'],
    recipeTip: 'Warm the tortilla on a dry skillet for 30 seconds before rolling.'
  },
  {
    id: 'rec-d-1',
    name: 'Pan-Seared Wild Salmon with Garlic Asparagus',
    mealType: 'dinner',
    dietaryCategory: ['balanced', 'keto', 'high_protein', 'mediterranean', 'low_carb'],
    calories: 520,
    protein: 44,
    carbs: 12,
    fat: 32,
    prepTimeMinutes: 18,
    ingredients: ['180g wild salmon fillet', 'Fresh asparagus spears', 'Extra virgin olive oil', 'Lemon wedges', 'Garlic'],
    recipeTip: 'Sear salmon skin-side down for 4 minutes for crispy skin, then flip for 2 minutes.'
  },
  {
    id: 'rec-d-2',
    name: 'Tofu & Edamame Sesame Teriyaki Stir-Fry',
    mealType: 'dinner',
    dietaryCategory: ['vegetarian', 'vegan', 'high_protein'],
    calories: 460,
    protein: 32,
    carbs: 45,
    fat: 16,
    prepTimeMinutes: 15,
    ingredients: ['Organic firm tofu', 'Edamame', 'Broccoli florets', 'Bell peppers', 'Low-sodium tamari'],
    recipeTip: 'Press tofu for 10 minutes with a paper towel to achieve crispy pan-seared cubes.'
  },
  {
    id: 'rec-s-1',
    name: 'Greek Yogurt with Raw Walnuts & Honey',
    mealType: 'snack',
    dietaryCategory: ['balanced', 'vegetarian', 'high_protein', 'mediterranean'],
    calories: 260,
    protein: 20,
    carbs: 18,
    fat: 12,
    prepTimeMinutes: 3,
    ingredients: ['Plain Greek yogurt (0% or 2%)', 'Raw crushed walnuts', '1 tsp raw honey', 'Cinnamon'],
    recipeTip: 'High casein protein makes this an ideal late afternoon or post-workout recovery snack.'
  }
];

export const MealTracker: React.FC = () => {
  const { profile, todayLog, addMeal, deleteMeal, toggleMealCompleted, goalSettings } = useHealth();

  const [selectedDiet, setSelectedDiet] = useState<DietaryPreference>(profile.dietaryPreference || 'balanced');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customType, setCustomType] = useState<MealType>('lunch');
  const [customCal, setCustomCal] = useState<number>(450);
  const [customProt, setCustomProt] = useState<number>(30);
  const [customCarbs, setCustomCarbs] = useState<number>(45);
  const [customFat, setCustomFat] = useState<number>(15);

  const totalCaloriesLogged = (todayLog.meals || []).filter(m => m.completed).reduce((sum, m) => sum + m.calories, 0);
  const totalProteinLogged = (todayLog.meals || []).filter(m => m.completed).reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbsLogged = (todayLog.meals || []).filter(m => m.completed).reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFatLogged = (todayLog.meals || []).filter(m => m.completed).reduce((sum, m) => sum + (m.fat || 0), 0);

  const calorieGoal = todayLog.calorieGoal || goalSettings.calories || 2000;
  const remainingCalories = calorieGoal - totalCaloriesLogged;
  const caloriePercent = Math.min(100, Math.round((totalCaloriesLogged / calorieGoal) * 100));

  const filteredRecipes = MEAL_RECIPES_CATALOG.filter(rec => {
    const matchType = selectedMealType === 'all' || rec.mealType === selectedMealType;
    const matchDiet = selectedDiet === 'balanced' || rec.dietaryCategory.includes(selectedDiet);
    return matchType && matchDiet;
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addMeal({
      name: customName,
      mealType: customType,
      calories: customCal,
      protein: customProt,
      carbs: customCarbs,
      fat: customFat
    });

    setCustomName('');
    setShowCustomForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      
      {/* 1. Header Banner */}
      <div className="health-card p-6 border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-500/30 shadow-sm">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">Meal & Nutrition Planner</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Diet: {profile.dietaryPreference.toUpperCase()} • Allergens: {profile.allergies.join(', ') || 'None'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Custom Meal
        </button>
      </div>

      {/* 2. Daily Calorie & Macronutrient Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Calorie Budget Bar */}
        <div className="health-card p-5 border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 md:col-span-1 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Calorie Budget</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">{totalCaloriesLogged}</span>
              <span className="text-xs text-slate-500">/ {calorieGoal} kcal</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden my-3">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
            {remainingCalories >= 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{remainingCalories} kcal</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-bold">{Math.abs(remainingCalories)} kcal over target</span>
            )} remaining today
          </div>
        </div>

        {/* Protein Macro */}
        <div className="health-card p-5 border-cyan-200 dark:border-cyan-900/60 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Protein</span>
            <span className="badge badge-cyan text-[10px]">Muscle</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">{totalProteinLogged}g</span>
              <span className="text-xs text-slate-500">/ {goalSettings.proteinGrams || 110}g</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${Math.min(100, (totalProteinLogged / (goalSettings.proteinGrams || 110)) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400">4 kcal per gram</span>
        </div>

        {/* Carbs Macro */}
        <div className="health-card p-5 border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Carbs</span>
            <span className="badge badge-purple text-[10px]">Energy</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">{totalCarbsLogged}g</span>
              <span className="text-xs text-slate-500">/ {goalSettings.carbsGrams || 200}g</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${Math.min(100, (totalCarbsLogged / (goalSettings.carbsGrams || 200)) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400">4 kcal per gram</span>
        </div>

        {/* Fat Macro */}
        <div className="health-card p-5 border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fats</span>
            <span className="badge badge-amber text-[10px]">Hormones</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">{totalFatLogged}g</span>
              <span className="text-xs text-slate-500">/ {goalSettings.fatGrams || 60}g</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${Math.min(100, (totalFatLogged / (goalSettings.fatGrams || 60)) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400">9 kcal per gram</span>
        </div>

      </div>

      {/* 3. Custom Meal Form Drawer */}
      {showCustomForm && (
        <form onSubmit={handleCustomSubmit} className="health-card p-6 border-amber-300 dark:border-amber-700 animate-slide-in space-y-4 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Log Custom Meal</h3>
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Meal Name</label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="glass-input w-full"
                placeholder="e.g. Lentil Bowl, Protein Smoothie"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Meal Time</label>
              <select
                value={customType}
                onChange={e => setCustomType(e.target.value as MealType)}
                className="glass-input w-full"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Healthy Snack</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Calories (kcal)</label>
              <input
                type="number"
                min="10"
                value={customCal}
                onChange={e => setCustomCal(Number(e.target.value))}
                className="glass-input w-full font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Protein (g)</label>
              <input
                type="number"
                min="0"
                value={customProt}
                onChange={e => setCustomProt(Number(e.target.value))}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Carbs (g)</label>
              <input
                type="number"
                min="0"
                value={customCarbs}
                onChange={e => setCustomCarbs(Number(e.target.value))}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Fat (g)</label>
              <input
                type="number"
                min="0"
                value={customFat}
                onChange={e => setCustomFat(Number(e.target.value))}
                className="glass-input w-full"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold">
            Add to Food Log
          </button>
        </form>
      )}

      {/* 4. AI-Powered Meal Suggestions Filter & Catalog */}
      <div className="space-y-4">
        
        {/* Filter Bar */}
        <div className="health-card p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">AI Chef & Meal Suggestions</h3>
              <p className="text-xs text-slate-500">Nutrient dense, allergy-safe recipes</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <select
              value={selectedMealType}
              onChange={e => setSelectedMealType(e.target.value)}
              className="glass-input text-xs py-1.5"
            >
              <option value="all">All Meal Times</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Healthy Snacks</option>
            </select>

            <select
              value={selectedDiet}
              onChange={e => setSelectedDiet(e.target.value as DietaryPreference)}
              className="glass-input text-xs py-1.5"
            >
              <option value="balanced">Balanced Whole Food</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">100% Plant-Based / Vegan</option>
              <option value="high_protein">High-Protein</option>
              <option value="keto">Keto / Low-Carb</option>
              <option value="mediterranean">Mediterranean</option>
            </select>
          </div>
        </div>

        {/* Recipe Suggestions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecipes.map(rec => (
            <div 
              key={rec.id}
              className="health-card p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-amber text-[10px] uppercase font-bold">{rec.mealType}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {rec.prepTimeMinutes}m prep
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{rec.calories} kcal</span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">{rec.name}</h4>

                {/* Macro summary */}
                <div className="flex items-center gap-2 my-2.5">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-500/20">
                    P: {rec.protein}g
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-500/20">
                    C: {rec.carbs}g
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-500/20">
                    F: {rec.fat}g
                  </span>
                </div>

                {/* Ingredients & Tip */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/40 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p className="leading-snug">
                    <strong className="text-slate-800 dark:text-slate-200">Ingredients:</strong> {rec.ingredients.join(', ')}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-snug">
                    💡 <em>{rec.recipeTip}</em>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    addMeal({
                      name: rec.name,
                      mealType: rec.mealType,
                      calories: rec.calories,
                      protein: rec.protein,
                      carbs: rec.carbs,
                      fat: rec.fat,
                      recipeTip: rec.recipeTip,
                      ingredients: rec.ingredients
                    });
                  }}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Log This Meal
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 5. Today's Logged Meals List */}
      <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Today's Food Intake Log</h3>
          </div>
          <span className="text-xs text-slate-500">{todayLog.meals?.length || 0} meals recorded</span>
        </div>

        {(!todayLog.meals || todayLog.meals.length === 0) ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Apple className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No meals logged yet today. Click "Log This Meal" above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayLog.meals.map(m => (
              <div 
                key={m.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-amber-400 transition"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleMealCompleted(m.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                      m.completed ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {m.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{m.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="capitalize font-semibold text-amber-600 dark:text-amber-400">{m.mealType}</span> • {m.calories} kcal • P: {m.protein}g | C: {m.carbs}g | F: {m.fat}g • {m.timestamp}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteMeal(m.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                  title="Delete meal entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
