import React, { useState } from 'react';
import { 
  HeartPulse, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Scale, 
  Droplets, 
  Footprints, 
  Target, 
  Activity, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { FitnessGoal, ActivityLevel } from '../../types/health';
import { ProfilePhotoManager } from '../Profile/ProfilePhotoManager';
import { calculateBMI } from '../../utils/calculations';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, updateGoalSettings, setBmiMetrics } = useHealth();

  const [name, setName] = useState<string>(profile.name || '');
  const [age, setAge] = useState<string>(profile.age > 0 ? String(profile.age) : '');
  const [heightCm, setHeightCm] = useState<string>(profile.heightCm > 0 ? String(profile.heightCm) : '');
  const [weightKg, setWeightKg] = useState<string>(profile.weightKg > 0 ? String(profile.weightKg) : '');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile.fitnessGoal || 'muscle_gain');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'moderately_active');
  const [waterGoalMl, setWaterGoalMl] = useState<number>(3000);
  const [stepGoal, setStepGoal] = useState<number>(10000);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatarUrl || '');

  if (!isOpen) return null;

  const hVal = Number(heightCm) || 0;
  const wVal = Number(weightKg) || 0;
  const { bmi, category } = calculateBMI(wVal, hVal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }

    const parsedAge = Number(age) || 28;
    const parsedH = Number(heightCm) || 175;
    const parsedW = Number(weightKg) || 75;

    // Save profile with isProfileSetup: true
    updateProfile({
      name: name.trim(),
      age: parsedAge,
      gender: 'male',
      heightCm: parsedH,
      weightKg: parsedW,
      targetWeightKg: Math.round(parsedW * 0.95),
      fitnessGoal,
      activityLevel,
      avatarUrl,
      isProfileSetup: true
    });

    // Update goals
    updateGoalSettings({
      waterMl: waterGoalMl,
      steps: stepGoal
    });

    // Sync BMI
    setBmiMetrics(parsedH, parsedW);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="health-card max-w-2xl w-full p-6 sm:p-8 border-2 border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 shadow-2xl my-8 relative">
        
        {/* Header */}
        <div className="text-center pb-5 border-b border-slate-100 dark:border-slate-800 space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <HeartPulse className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to Healthy Me
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
              Set Up Your Health Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Please enter your real measurements. We use this data to calculate your personalized BMI, daily caloric needs, and vitality index.
            </p>
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-5">
          
          {/* 1. Profile Photo (Take Photo or Upload) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <ProfilePhotoManager onPhotoUpdated={(url) => setAvatarUrl(url)} />
          </div>

          {/* 2. Personal Information & Biometrics */}
          <div className="space-y-3">
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              1. Basic Information & Biometrics
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="glass-input w-full font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Age (Years) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="12"
                  max="110"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 28"
                  className="glass-input w-full font-bold text-sm text-center"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Height (cm) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="100"
                  max="240"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 175"
                  className="glass-input w-full font-bold text-sm text-center"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Weight (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 74"
                  className="glass-input w-full font-bold text-sm text-center"
                  required
                />
              </div>

              {/* Real-time Calculated BMI Callout */}
              <div className="sm:col-span-3 p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Calculated BMI:</span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 ml-2">
                    {bmi > 0 ? `${bmi} (${category})` : 'Enter height & weight'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Weight / (Height in m)²</span>
              </div>

            </div>
          </div>

          {/* 3. Fitness Goals & Daily Targets */}
          <div className="space-y-3">
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              2. Goals & Daily Targets
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Primary Fitness Goal
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                  className="glass-input w-full text-xs font-bold"
                >
                  <option value="muscle_gain">Muscle Building & Hypertrophy</option>
                  <option value="weight_loss">Fat Reduction & Weight Loss</option>
                  <option value="stamina">Cardio Stamina & Endurance</option>
                  <option value="maintain">Weight Maintenance</option>
                  <option value="general_health">Overall Longevity & Health</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="glass-input w-full text-xs font-bold"
                >
                  <option value="sedentary">Sedentary (Desk job, minimal activity)</option>
                  <option value="lightly_active">Lightly Active (1-2 workouts/week)</option>
                  <option value="moderately_active">Moderately Active (3-5 workouts/week)</option>
                  <option value="very_active">Very Active (6+ intense workouts/week)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-1 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" /> Daily Water Goal (ml)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="6000"
                  step="100"
                  value={waterGoalMl}
                  onChange={(e) => setWaterGoalMl(Number(e.target.value))}
                  className="glass-input w-full text-xs font-bold text-center"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-0.5 text-center">
                  ({(waterGoalMl / 1000).toFixed(1)} Litres daily)
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5" /> Daily Step Target
                </label>
                <input
                  type="number"
                  min="2000"
                  max="30000"
                  step="500"
                  value={stepGoal}
                  onChange={(e) => setStepGoal(Number(e.target.value))}
                  className="glass-input w-full text-xs font-bold text-center"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-0.5 text-center">
                  Recommended: 8,000 – 10,000 steps
                </span>
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              * Saved securely in your browser cache.
            </span>

            <button
              type="submit"
              className="btn-primary py-3 px-6 text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <span>Save & Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
