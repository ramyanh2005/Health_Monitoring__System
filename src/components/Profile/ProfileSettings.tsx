import React, { useState } from 'react';
import { 
  UserCircle2, 
  Activity, 
  Flame, 
  Scale, 
  Key, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { UserProfile, FitnessGoal, ActivityLevel, DietaryPreference } from '../../types/health';
import { calculateBMI, calculateBMRAndTDEE } from '../../utils/calculations';
import { ProfilePhotoManager } from './ProfilePhotoManager';

export const ProfileSettings: React.FC = () => {
  const { 
    profile, 
    updateProfile, 
    exportData, 
    importData, 
    resetToDefaults 
  } = useHealth();

  const [form, setForm] = useState<UserProfile>(profile);
  const [allergiesInput, setAllergiesInput] = useState<string>((profile.allergies || []).join(', '));
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string>('');

  const { bmi, category: bmiCategory, color: bmiColor, idealWeightRange } = calculateBMI(form.weightKg, form.heightCm);
  const { bmr, tdee, recommendedCalories } = calculateBMRAndTDEE(form);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAllergies = allergiesInput.split(',').map(s => s.trim()).filter(Boolean);

    updateProfile({
      ...form,
      allergies: parsedAllergies,
      isProfileSetup: true
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthy_me_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportStatus('Data backup successfully restored!');
        setTimeout(() => setImportStatus(''), 4000);
      } else {
        setImportStatus('Error importing file. Invalid backup format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      
      {/* 1. Header */}
      <div className="health-card p-6 border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <UserCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">User Profile & Biometrics</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Personalize biometrics, camera photo & metabolic targets</p>
          </div>
        </div>

        {isSaved && (
          <span className="badge badge-emerald text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Profile Updated!
          </span>
        )}
      </div>

      {/* 2. Profile Photo Section (Take Photo / Upload from Gallery) */}
      <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <ProfilePhotoManager onPhotoUpdated={(url) => setForm(f => ({ ...f, avatarUrl: url }))} />
      </div>

      {/* 3. Live Biometrics & Metabolism Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* BMI Card */}
        <div className="health-card p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Body Mass Index (BMI)</span>
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">
                {bmi > 0 ? bmi : '--'}
              </span>
              {bmi > 0 && (
                <span className="badge text-xs font-bold" style={{ backgroundColor: `${bmiColor}15`, color: bmiColor, borderColor: `${bmiColor}40` }}>
                  {bmiCategory}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {idealWeightRange.min > 0 ? `Ideal weight: ${idealWeightRange.min} - ${idealWeightRange.max} kg` : 'Enter height and weight'}
            </p>
          </div>
          <span className="text-[10px] text-slate-400">WHO standard classification</span>
        </div>

        {/* BMR Card */}
        <div className="health-card p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Basal Metabolic Rate</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">{bmr}</span>
              <span className="text-xs text-slate-500">kcal/day</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Calories burned at rest (Mifflin-St Jeor)
            </p>
          </div>
          <span className="text-[10px] text-slate-400">Essential baseline metabolism</span>
        </div>

        {/* TDEE Card */}
        <div className="health-card p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Energy (TDEE)</span>
            <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">{tdee}</span>
              <span className="text-xs text-slate-500">kcal/day</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Target for goal: <strong className="text-emerald-600 dark:text-emerald-400">{recommendedCalories} kcal</strong>
            </p>
          </div>
          <span className="text-[10px] text-slate-400">Includes daily physical activity</span>
        </div>

      </div>

      {/* 4. Main Profile Editing Form */}
      <form onSubmit={handleSubmit} className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Personal Information & Preferences</h3>
          <p className="text-xs text-slate-500">Used by the AI Assistant to personalize workout intensities, diets, and calorie budgets</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Alex Morgan"
              className="glass-input w-full font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Age (Years)</label>
            <input
              type="number"
              min="10"
              max="120"
              value={form.age > 0 ? form.age : ''}
              onChange={e => setForm({ ...form, age: Number(e.target.value) })}
              placeholder="e.g. 28"
              className="glass-input w-full font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Gender</label>
            <select
              value={form.gender}
              onChange={e => setForm({ ...form, gender: e.target.value as any })}
              className="glass-input w-full"
            >
              <option value="male">Male (♂)</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Height (cm)</label>
            <input
              type="number"
              min="80"
              max="250"
              value={form.heightCm > 0 ? form.heightCm : ''}
              onChange={e => setForm({ ...form, heightCm: Number(e.target.value) })}
              placeholder="e.g. 175"
              className="glass-input w-full font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Current Weight (kg)</label>
            <input
              type="number"
              min="20"
              max="300"
              step="0.5"
              value={form.weightKg > 0 ? form.weightKg : ''}
              onChange={e => setForm({ ...form, weightKg: Number(e.target.value) })}
              placeholder="e.g. 74"
              className="glass-input w-full font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Target Weight (kg)</label>
            <input
              type="number"
              min="20"
              max="300"
              step="0.5"
              value={form.targetWeightKg > 0 ? form.targetWeightKg : ''}
              onChange={e => setForm({ ...form, targetWeightKg: Number(e.target.value) })}
              placeholder="e.g. 70"
              className="glass-input w-full font-bold"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Primary Fitness Goal</label>
            <select
              value={form.fitnessGoal}
              onChange={e => setForm({ ...form, fitnessGoal: e.target.value as FitnessGoal })}
              className="glass-input w-full"
            >
              <option value="muscle_gain">Muscle Building & Strength</option>
              <option value="weight_loss">Weight Loss & Fat Reduction</option>
              <option value="maintain">Weight Maintenance</option>
              <option value="stamina">Cardio Stamina & Endurance</option>
              <option value="flexibility">Flexibility & Posture</option>
              <option value="general_health">Overall Vitality & Longevity</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Daily Activity Level</label>
            <select
              value={form.activityLevel}
              onChange={e => setForm({ ...form, activityLevel: e.target.value as ActivityLevel })}
              className="glass-input w-full"
            >
              <option value="sedentary">Sedentary (Desk job, minimal exercise)</option>
              <option value="lightly_active">Lightly Active (1-3 days/week exercise)</option>
              <option value="moderately_active">Moderately Active (3-5 days/week exercise)</option>
              <option value="very_active">Very Active (6-7 days intense exercise)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Dietary Preference</label>
            <select
              value={form.dietaryPreference}
              onChange={e => setForm({ ...form, dietaryPreference: e.target.value as DietaryPreference })}
              className="glass-input w-full"
            >
              <option value="high_protein">High-Protein (Muscle Preservation)</option>
              <option value="balanced">Balanced Whole Foods</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">100% Plant-Based (Vegan)</option>
              <option value="keto">Ketogenic (Keto)</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="low_carb">Low-Carb</option>
            </select>
          </div>

        </div>

        <div>
          <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">
            Allergies or Foods to Avoid (comma-separated)
          </label>
          <input
            type="text"
            value={allergiesInput}
            onChange={e => setAllergiesInput(e.target.value)}
            placeholder="e.g. Peanuts, Dairy, Gluten, Shellfish"
            className="glass-input w-full"
          />
        </div>

        {/* Optional Gemini API Key */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-amber-500" />
            Optional Gemini API Key (for Live Cloud LLM Streaming)
          </label>
          <input
            type="password"
            value={form.customApiKey || ''}
            onChange={e => setForm({ ...form, customApiKey: e.target.value })}
            placeholder="AIzaSy... (Leave empty to use built-in offline health intelligence)"
            className="glass-input w-full font-mono text-xs"
          />
          <p className="text-[11px] text-slate-500">
            Healthy Me includes a complete context-aware AI reasoning engine out of the box. Adding an API key enables direct Gemini 1.5 cloud generative chat.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button type="submit" className="btn-primary py-2.5 px-6 font-bold text-sm">
            Save Profile Changes
          </button>
        </div>
      </form>

      {/* 5. Data Backup, Export & Factory Reset */}
      <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Data Management & Backup</h3>
          <p className="text-xs text-slate-500">Export your health tracking history or restore from an existing JSON backup file</p>
        </div>

        {importStatus && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
          >
            <Download className="w-4 h-4" /> Export Backup (JSON)
          </button>

          <label className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 cursor-pointer">
            <Upload className="w-4 h-4" /> Restore Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Reset all health logs and restore factory defaults?')) {
                resetToDefaults();
              }
            }}
            className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 ml-auto"
          >
            <RotateCcw className="w-4 h-4" /> Reset All Data
          </button>
        </div>
      </div>

    </div>
  );
};
