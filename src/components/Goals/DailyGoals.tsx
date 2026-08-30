import React, { useState } from 'react';
import { 
  Target, 
  Droplets, 
  Footprints, 
  Dumbbell, 
  Moon, 
  Flame, 
  CheckCircle2, 
  RotateCcw
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { GoalSettings } from '../../types/health';

export const DailyGoals: React.FC = () => {
  const { goalSettings, updateGoalSettings, todayLog } = useHealth();
  const [form, setForm] = useState<GoalSettings>(goalSettings);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoalSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const resetToRecommended = () => {
    const recommended: GoalSettings = {
      waterMl: 2500,
      steps: 10000,
      exerciseMinutes: 30,
      sleepHours: 8,
      calories: 2000,
      proteinGrams: 120,
      carbsGrams: 200,
      fatGrams: 60
    };
    setForm(recommended);
  };

  const waterProgress = Math.min(100, Math.round(((todayLog.waterIntakeMl || 0) / form.waterMl) * 100));
  const stepsProgress = Math.min(100, Math.round(((todayLog.steps || 0) / form.steps) * 100));
  const exerciseProgress = Math.min(100, Math.round(((todayLog.exerciseMinutes || 0) / form.exerciseMinutes) * 100));
  const sleepHours = parseFloat(((todayLog.sleep?.durationMinutes || 0)/60).toFixed(1));
  const sleepProgress = Math.min(100, Math.round((sleepHours / form.sleepHours) * 100));
  const calorieProgress = Math.min(100, Math.round(((todayLog.caloriesConsumed || 0) / form.calories) * 100));

  return (
    <div className="space-y-6 animate-fade-in w-full">
      
      {/* 1. Header */}
      <div className="health-card p-6 border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30 shadow-sm">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">Daily Health Targets</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Customize your personal goals and benchmark milestones</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="badge badge-emerald text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Goals Saved!
            </span>
          )}
          <button
            onClick={resetToRecommended}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Recommended Presets
          </button>
        </div>
      </div>

      {/* 2. Goal Progress Overview Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Water */}
        <div className="health-card p-4 border-cyan-200 dark:border-cyan-900/60 bg-white dark:bg-slate-900 text-center">
          <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center mx-auto mb-2">
            <Droplets className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase">Water Target</span>
          <p className="text-lg font-black text-slate-900 dark:text-white font-heading mt-0.5">{form.waterMl} ml</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${waterProgress}%` }} />
          </div>
          <span className="text-[10px] text-cyan-600 font-semibold">{waterProgress}% done today</span>
        </div>

        {/* Steps */}
        <div className="health-card p-4 border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 text-center">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <Footprints className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase">Steps Target</span>
          <p className="text-lg font-black text-slate-900 dark:text-white font-heading mt-0.5">{form.steps.toLocaleString()}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stepsProgress}%` }} />
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">{stepsProgress}% done today</span>
        </div>

        {/* Exercise */}
        <div className="health-card p-4 border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 text-center">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center mx-auto mb-2">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase">Exercise Target</span>
          <p className="text-lg font-black text-slate-900 dark:text-white font-heading mt-0.5">{form.exerciseMinutes} mins</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${exerciseProgress}%` }} />
          </div>
          <span className="text-[10px] text-purple-600 font-semibold">{exerciseProgress}% done today</span>
        </div>

        {/* Sleep */}
        <div className="health-card p-4 border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 text-center">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
            <Moon className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase">Sleep Target</span>
          <p className="text-lg font-black text-slate-900 dark:text-white font-heading mt-0.5">{form.sleepHours} hrs</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${sleepProgress}%` }} />
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold">{sleepProgress}% done today</span>
        </div>

        {/* Calories */}
        <div className="health-card p-4 border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 text-center col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase">Calories Target</span>
          <p className="text-lg font-black text-slate-900 dark:text-white font-heading mt-0.5">{form.calories} kcal</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${calorieProgress}%` }} />
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">{calorieProgress}% done today</span>
        </div>

      </div>

      {/* 3. Goal Customization Form */}
      <form onSubmit={handleSubmit} className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Configure Daily Targets</h3>
          <p className="text-xs text-slate-500">Updating targets dynamically updates your daily Health Score formulas</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Water */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="text-xs font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
              <Droplets className="w-4 h-4" /> Daily Water Goal (ml)
            </label>
            <input
              type="number"
              min="1000"
              max="6000"
              step="100"
              value={form.waterMl}
              onChange={e => setForm({ ...form, waterMl: Number(e.target.value) })}
              className="glass-input w-full font-bold"
              required
            />
            <span className="text-[11px] text-slate-500 block">{(form.waterMl / 1000).toFixed(1)} Litres (~{Math.round(form.waterMl / 250)} glasses)</span>
          </div>

          {/* Steps */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <Footprints className="w-4 h-4" /> Daily Step Target
            </label>
            <input
              type="number"
              min="2000"
              max="30000"
              step="500"
              value={form.steps}
              onChange={e => setForm({ ...form, steps: Number(e.target.value) })}
              className="glass-input w-full font-bold"
              required
            />
            <span className="text-[11px] text-slate-500 block">Recommended: 8,000 - 10,000 steps</span>
          </div>

          {/* Exercise */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4" /> Active Exercise (Minutes)
            </label>
            <input
              type="number"
              min="10"
              max="180"
              step="5"
              value={form.exerciseMinutes}
              onChange={e => setForm({ ...form, exerciseMinutes: Number(e.target.value) })}
              className="glass-input w-full font-bold"
              required
            />
            <span className="text-[11px] text-slate-500 block">Standard: 30 minutes daily</span>
          </div>

          {/* Sleep */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Moon className="w-4 h-4" /> Sleep Target (Hours)
            </label>
            <input
              type="number"
              min="5"
              max="12"
              step="0.5"
              value={form.sleepHours}
              onChange={e => setForm({ ...form, sleepHours: Number(e.target.value) })}
              className="glass-input w-full font-bold"
              required
            />
            <span className="text-[11px] text-slate-500 block">Optimal rest: 7.5 - 8.5 hours</span>
          </div>

          {/* Calories */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> Daily Calorie Target (kcal)
            </label>
            <input
              type="number"
              min="1200"
              max="5000"
              step="50"
              value={form.calories}
              onChange={e => setForm({ ...form, calories: Number(e.target.value) })}
              className="glass-input w-full font-bold"
              required
            />
            <span className="text-[11px] text-slate-500 block">Calculated from BMR & Activity level</span>
          </div>

          {/* Protein */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="text-xs font-bold text-cyan-700 dark:text-cyan-300 block">
              Protein Target (Grams)
            </label>
            <input
              type="number"
              min="30"
              max="300"
              step="5"
              value={form.proteinGrams || 110}
              onChange={e => setForm({ ...form, proteinGrams: Number(e.target.value) })}
              className="glass-input w-full font-bold"
              required
            />
            <span className="text-[11px] text-slate-500 block">~1.6 - 2.0g per kg bodyweight</span>
          </div>

        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button type="submit" className="btn-primary py-2.5 px-6 font-bold text-sm">
            Save Daily Targets
          </button>
        </div>
      </form>

    </div>
  );
};
