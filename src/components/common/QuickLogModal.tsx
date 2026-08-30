import React, { useState } from 'react';
import { 
  X, 
  Droplets, 
  Footprints, 
  Dumbbell, 
  UtensilsCrossed, 
  Moon, 
  Plus, 
  Check 
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { MealType, ExerciseCategory, SleepQuality } from '../../types/health';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'water' | 'steps' | 'workout' | 'meal' | 'sleep';
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'water'
}) => {
  const { addWater, addSteps, setSteps, addWorkout, addMeal, updateSleep, todayLog } = useHealth();
  const [activeTab, setActiveTab] = useState<'water' | 'steps' | 'workout' | 'meal' | 'sleep'>(initialTab);

  const [customWater, setCustomWater] = useState<string>('300');
  const [customSteps, setCustomSteps] = useState<string>('2000');
  const [stepMode, setStepMode] = useState<'add' | 'set'>('add');

  const [workoutName, setWorkoutName] = useState<string>('Brisk Outdoor Walk');
  const [workoutCategory, setWorkoutCategory] = useState<ExerciseCategory>('walking');
  const [workoutDuration, setWorkoutDuration] = useState<number>(25);
  const [workoutCalories, setWorkoutCalories] = useState<number>(140);
  const [workoutDifficulty, setWorkoutDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  const [mealName, setMealName] = useState<string>('Grilled Chicken Salad');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [mealCalories, setMealCalories] = useState<number>(450);
  const [mealProtein, setMealProtein] = useState<number>(35);
  const [mealCarbs, setMealCarbs] = useState<number>(25);
  const [mealFat, setMealFat] = useState<number>(12);

  const [sleepBedtime, setSleepBedtime] = useState<string>('23:00');
  const [sleepWakeTime, setSleepWakeTime] = useState<string>('07:00');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>('Good');
  const [sleepNotes, setSleepNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleWaterSubmit = (amount: number) => {
    addWater(amount);
    onClose();
  };

  const handleStepsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customSteps) || 0;
    if (stepMode === 'add') {
      addSteps(val);
    } else {
      setSteps(val);
    }
    onClose();
  };

  const handleWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWorkout({
      name: workoutName,
      category: workoutCategory,
      durationMinutes: workoutDuration,
      caloriesBurned: workoutCalories || workoutDuration * 6,
      difficulty: workoutDifficulty,
      instructions: ['Custom user logged session']
    });
    onClose();
  };

  const handleMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMeal({
      name: mealName,
      mealType,
      calories: mealCalories,
      protein: mealProtein,
      carbs: mealCarbs,
      fat: mealFat
    });
    onClose();
  };

  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [bH, bM] = sleepBedtime.split(':').map(Number);
    const [wH, wM] = sleepWakeTime.split(':').map(Number);
    let bedMins = bH * 60 + bM;
    let wakeMins = wH * 60 + wM;
    if (wakeMins < bedMins) wakeMins += 24 * 60;
    const durationMinutes = wakeMins - bedMins;

    updateSleep({
      sleepTime: sleepBedtime,
      wakeTime: sleepWakeTime,
      durationMinutes,
      quality: sleepQuality,
      notes: sleepNotes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="health-card max-w-lg w-full p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Quick Log Activity</h3>
              <p className="text-xs text-slate-500">Update your daily health metrics instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl my-4 border border-slate-200 dark:border-slate-700">
          {[
            { id: 'water', label: 'Water', icon: Droplets, color: 'text-cyan-600 dark:text-cyan-400' },
            { id: 'steps', label: 'Steps', icon: Footprints, color: 'text-emerald-600 dark:text-emerald-400' },
            { id: 'workout', label: 'Workout', icon: Dumbbell, color: 'text-purple-600 dark:text-purple-400' },
            { id: 'meal', label: 'Meal', icon: UtensilsCrossed, color: 'text-amber-600 dark:text-amber-400' },
            { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-600 dark:text-indigo-400' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                <span className="text-[11px] truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Water */}
        {activeTab === 'water' && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Current intake today: <span className="font-bold text-cyan-600 dark:text-cyan-400">{todayLog.waterIntakeMl} ml</span> / {todayLog.waterGoalMl} ml
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleWaterSubmit(250)}
                className="btn-secondary py-3 flex-col gap-1 border-cyan-200 hover:border-cyan-400"
              >
                <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">+250 ml</span>
                <span className="text-[10px] text-slate-500">1 Glass</span>
              </button>
              <button
                onClick={() => handleWaterSubmit(500)}
                className="btn-secondary py-3 flex-col gap-1 border-cyan-200 hover:border-cyan-400"
              >
                <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">+500 ml</span>
                <span className="text-[10px] text-slate-500">1 Bottle</span>
              </button>
              <button
                onClick={() => handleWaterSubmit(750)}
                className="btn-secondary py-3 flex-col gap-1 border-cyan-200 hover:border-cyan-400"
              >
                <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">+750 ml</span>
                <span className="text-[10px] text-slate-500">Large Flask</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs text-slate-500 mb-1.5 block">Or enter custom amount (ml):</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customWater}
                  onChange={e => setCustomWater(e.target.value)}
                  className="glass-input flex-1 font-bold"
                  placeholder="e.g. 350"
                />
                <button
                  onClick={() => handleWaterSubmit(parseInt(customWater) || 0)}
                  className="btn-primary px-4"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Steps */}
        {activeTab === 'steps' && (
          <form onSubmit={handleStepsSubmit} className="space-y-4 py-2">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Current steps: <span className="font-bold text-emerald-600 dark:text-emerald-400">{todayLog.steps.toLocaleString()}</span> / {todayLog.stepGoal.toLocaleString()}
            </p>

            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setStepMode('add')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${stepMode === 'add' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
              >
                + Add Steps
              </button>
              <button
                type="button"
                onClick={() => setStepMode('set')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${stepMode === 'set' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
              >
                Set Total Steps
              </button>
            </div>

            {stepMode === 'add' && (
              <div className="grid grid-cols-3 gap-2">
                {[1000, 2500, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { addSteps(val); onClose(); }}
                    className="btn-secondary py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                  >
                    +{val.toLocaleString()} Steps
                  </button>
                ))}
              </div>
            )}

            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">
                {stepMode === 'add' ? 'Custom steps to add:' : 'Enter exact total steps today:'}
              </label>
              <input
                type="number"
                value={customSteps}
                onChange={e => setCustomSteps(e.target.value)}
                className="glass-input w-full font-bold"
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full py-2.5">
              <Check className="w-4 h-4" /> Save Steps
            </button>
          </form>
        )}

        {/* Tab 3: Workout */}
        {activeTab === 'workout' && (
          <form onSubmit={handleWorkoutSubmit} className="space-y-3 py-1">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Exercise Name</label>
              <input
                type="text"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                className="glass-input w-full"
                placeholder="e.g. 30-min HIIT, Evening Run"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Category</label>
                <select
                  value={workoutCategory}
                  onChange={e => setWorkoutCategory(e.target.value as ExerciseCategory)}
                  className="glass-input w-full"
                >
                  <option value="walking">Walking</option>
                  <option value="running">Running</option>
                  <option value="yoga">Yoga</option>
                  <option value="stretching">Stretching</option>
                  <option value="strength">Strength Training</option>
                  <option value="hiit">Home HIIT</option>
                  <option value="meditation">Meditation</option>
                  <option value="custom">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Difficulty</label>
                <select
                  value={workoutDifficulty}
                  onChange={e => setWorkoutDifficulty(e.target.value as any)}
                  className="glass-input w-full"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Duration (mins)</label>
                <input
                  type="number"
                  min="1"
                  value={workoutDuration}
                  onChange={e => setWorkoutDuration(parseInt(e.target.value) || 0)}
                  className="glass-input w-full font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Est. Calories Burned</label>
                <input
                  type="number"
                  min="0"
                  value={workoutCalories}
                  onChange={e => setWorkoutCalories(parseInt(e.target.value) || 0)}
                  className="glass-input w-full font-bold"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-2.5 mt-2">
              <Check className="w-4 h-4" /> Log Completed Workout
            </button>
          </form>
        )}

        {/* Tab 4: Meal */}
        {activeTab === 'meal' && (
          <form onSubmit={handleMealSubmit} className="space-y-3 py-1">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Food Name</label>
              <input
                type="text"
                value={mealName}
                onChange={e => setMealName(e.target.value)}
                className="glass-input w-full"
                placeholder="e.g. Oatmeal with Fruit, Salmon Bowl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Meal Time</label>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value as MealType)}
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
                  value={mealCalories}
                  onChange={e => setMealCalories(parseInt(e.target.value) || 0)}
                  className="glass-input w-full font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Protein (g)</label>
                <input
                  type="number"
                  value={mealProtein}
                  onChange={e => setMealProtein(parseInt(e.target.value) || 0)}
                  className="glass-input w-full font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Carbs (g)</label>
                <input
                  type="number"
                  value={mealCarbs}
                  onChange={e => setMealCarbs(parseInt(e.target.value) || 0)}
                  className="glass-input w-full font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Fat (g)</label>
                <input
                  type="number"
                  value={mealFat}
                  onChange={e => setMealFat(parseInt(e.target.value) || 0)}
                  className="glass-input w-full font-bold"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-2.5 mt-2">
              <Check className="w-4 h-4" /> Log Meal
            </button>
          </form>
        )}

        {/* Tab 5: Sleep */}
        {activeTab === 'sleep' && (
          <form onSubmit={handleSleepSubmit} className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Bedtime</label>
                <input
                  type="time"
                  value={sleepBedtime}
                  onChange={e => setSleepBedtime(e.target.value)}
                  className="glass-input w-full font-mono text-center font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Wake-up</label>
                <input
                  type="time"
                  value={sleepWakeTime}
                  onChange={e => setSleepWakeTime(e.target.value)}
                  className="glass-input w-full font-mono text-center font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Sleep Quality</label>
              <select
                value={sleepQuality}
                onChange={e => setSleepQuality(e.target.value as SleepQuality)}
                className="glass-input w-full"
              >
                <option value="Excellent">⭐ Excellent (Deep & Restorative)</option>
                <option value="Good">🟢 Good (Well rested)</option>
                <option value="Fair">🟡 Fair (Light or slightly broken)</option>
                <option value="Poor">🔴 Poor (Interrupted / Groggy)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Notes</label>
              <input
                type="text"
                value={sleepNotes}
                onChange={e => setSleepNotes(e.target.value)}
                className="glass-input w-full"
                placeholder="e.g. Took chamomile tea"
              />
            </div>

            <button type="submit" className="btn-primary w-full py-2.5 mt-2">
              <Check className="w-4 h-4" /> Log Sleep
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
