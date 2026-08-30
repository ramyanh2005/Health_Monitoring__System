import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  Droplets, 
  Footprints, 
  Dumbbell, 
  Moon, 
  Target, 
  Scale, 
  Activity, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { FitnessGoal, ActivityLevel } from '../../types/health';

interface DailyStatsInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyStatsInputModal: React.FC<DailyStatsInputModalProps> = ({
  isOpen,
  onClose
}) => {
  const { profile, todayLog, updateDailyHealthData } = useHealth();

  // Form states
  const [name, setName] = useState<string>(profile.name || 'Alex Vance');
  const [age, setAge] = useState<number>(profile.age || 29);
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm || 178);
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg || 76);
  const [waterIntakeMl, setWaterIntakeMl] = useState<number>(todayLog.waterIntakeMl || 2000);
  const [steps, setSteps] = useState<number>(todayLog.steps || 7500);
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(todayLog.exerciseMinutes || 30);
  const [sleepHours, setSleepHours] = useState<number>(
    parseFloat(((todayLog.sleep?.durationMinutes || 480) / 60).toFixed(1))
  );
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile.fitnessGoal || 'muscle_gain');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'moderately_active');

  useEffect(() => {
    if (isOpen) {
      setName(profile.name || 'Alex Vance');
      setAge(profile.age || 29);
      setHeightCm(profile.heightCm || 178);
      setWeightKg(profile.weightKg || 76);
      setWaterIntakeMl(todayLog.waterIntakeMl || 0);
      setSteps(todayLog.steps || 0);
      setExerciseMinutes(todayLog.exerciseMinutes || 0);
      setSleepHours(parseFloat(((todayLog.sleep?.durationMinutes || 480) / 60).toFixed(1)));
      setFitnessGoal(profile.fitnessGoal || 'muscle_gain');
      setActivityLevel(profile.activityLevel || 'moderately_active');
    }
  }, [isOpen, profile, todayLog]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDailyHealthData({
      name,
      age: Number(age),
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      waterIntakeMl: Number(waterIntakeMl),
      steps: Number(steps),
      exerciseMinutes: Number(exerciseMinutes),
      sleepHours: Number(sleepHours),
      fitnessGoal,
      activityLevel
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="health-card max-w-2xl w-full p-6 sm:p-7 border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                Update My Health Stats
              </h3>
              <p className="text-xs text-slate-500">
                Enter your real measurements to dynamically calculate your Health Score & BMI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          
          {/* Section 1: Biometrics */}
          <div>
            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-2.5">
              1. Profile & Body Metrics
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="glass-input w-full text-xs font-bold"
                  placeholder="e.g. Marcus Vance"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Age (Years)</label>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="glass-input w-full text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Height (cm)</label>
                <input
                  type="number"
                  min="100"
                  max="230"
                  value={heightCm}
                  onChange={e => setHeightCm(Number(e.target.value))}
                  className="glass-input w-full text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Weight (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  step="0.5"
                  value={weightKg}
                  onChange={e => setWeightKg(Number(e.target.value))}
                  className="glass-input w-full text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Fitness Goal</label>
                <select
                  value={fitnessGoal}
                  onChange={e => setFitnessGoal(e.target.value as FitnessGoal)}
                  className="glass-input w-full text-xs font-bold"
                >
                  <option value="muscle_gain">Muscle Building</option>
                  <option value="weight_loss">Weight / Fat Loss</option>
                  <option value="stamina">Cardio & Stamina</option>
                  <option value="maintain">Weight Maintenance</option>
                  <option value="general_health">General Longevity</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                  className="glass-input w-full text-xs font-bold"
                >
                  <option value="sedentary">Sedentary (Desk job, minimal activity)</option>
                  <option value="lightly_active">Lightly Active (1-2 workouts/week)</option>
                  <option value="moderately_active">Moderately Active (3-5 workouts/week)</option>
                  <option value="very_active">Very Active (6+ intense workouts/week)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Today's Health Log Activity */}
          <div>
            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-2.5">
              2. Today's Health & Activity Input
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Water */}
              <div className="p-3 bg-cyan-50 dark:bg-slate-800/60 rounded-xl border border-cyan-200 dark:border-slate-700">
                <label className="text-xs font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1 mb-1">
                  <Droplets className="w-3.5 h-3.5" /> Water (ml)
                </label>
                <input
                  type="number"
                  min="0"
                  max="8000"
                  step="100"
                  value={waterIntakeMl}
                  onChange={e => setWaterIntakeMl(Number(e.target.value))}
                  className="glass-input w-full text-xs font-bold text-center"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1 text-center">
                  ({(waterIntakeMl / 1000).toFixed(1)} Litres)
                </span>
              </div>

              {/* Steps */}
              <div className="p-3 bg-emerald-50 dark:bg-slate-800/60 rounded-xl border border-emerald-200 dark:border-slate-700">
                <label className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mb-1">
                  <Footprints className="w-3.5 h-3.5" /> Steps Count
                </label>
                <input
                  type="number"
                  min="0"
                  max="60000"
                  step="250"
                  value={steps}
                  onChange={e => setSteps(Number(e.target.value))}
                  className="glass-input w-full text-xs font-bold text-center"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1 text-center">
                  Target: {profile.fitnessGoal === 'muscle_gain' ? '8k-10k' : '10k-12k'}
                </span>
              </div>

              {/* Exercise */}
              <div className="p-3 bg-purple-50 dark:bg-slate-800/60 rounded-xl border border-purple-200 dark:border-slate-700">
                <label className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1 mb-1">
                  <Dumbbell className="w-3.5 h-3.5" /> Exercise (Mins)
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  step="5"
                  value={exerciseMinutes}
                  onChange={e => setExerciseMinutes(Number(e.target.value))}
                  className="glass-input w-full text-xs font-bold text-center"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1 text-center">
                  Active training
                </span>
              </div>

              {/* Sleep */}
              <div className="p-3 bg-indigo-50 dark:bg-slate-800/60 rounded-xl border border-indigo-200 dark:border-slate-700">
                <label className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1 mb-1">
                  <Moon className="w-3.5 h-3.5" /> Sleep (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  max="16"
                  step="0.5"
                  value={sleepHours}
                  onChange={e => setSleepHours(Number(e.target.value))}
                  className="glass-input w-full text-xs font-bold text-center"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1 text-center">
                  Optimal: 7.5 - 8.5h
                </span>
              </div>

            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              * Health Score & BMI recalculate immediately on submit
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Save & Update Dashboard
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
