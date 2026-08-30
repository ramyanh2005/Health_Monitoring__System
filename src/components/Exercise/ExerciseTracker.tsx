import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Filter, 
  Plus, 
  Trash2,
  Activity
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { 
  FitnessGoal, 
  ExerciseCategory, 
  DifficultyLevel 
} from '../../types/health';
import { sound } from '../../utils/audio';

interface ExerciseTemplate {
  id: string;
  name: string;
  category: ExerciseCategory;
  defaultDuration: number;
  caloriesPerMinute: number;
  difficulty: DifficultyLevel;
  targetMuscles: string;
  suitableGoals: FitnessGoal[];
  instructions: string[];
  equipment: string;
}

const EXERCISE_CATALOG: ExerciseTemplate[] = [
  {
    id: 'ex-walk',
    name: 'Brisk Incline Walking & Posture Drill',
    category: 'walking',
    defaultDuration: 20,
    caloriesPerMinute: 5.5,
    difficulty: 'Beginner',
    targetMuscles: 'Legs, Core, Cardiovascular',
    suitableGoals: ['weight_loss', 'general_health', 'stamina'],
    equipment: 'None',
    instructions: [
      'Maintain an upright posture, engage your core muscles.',
      'Pump arms naturally at 90-degree angles.',
      'Take brisk, purposeful steps keeping heart rate in Zone 2 (~110-125 bpm).',
      'Finish with deep abdominal breathing.'
    ]
  },
  {
    id: 'ex-run',
    name: 'Interval Jogging & Sprint Bursts',
    category: 'running',
    defaultDuration: 20,
    caloriesPerMinute: 10.5,
    difficulty: 'Intermediate',
    targetMuscles: 'Full Body, Calves, Glutes, Heart',
    suitableGoals: ['weight_loss', 'stamina'],
    equipment: 'Running Shoes',
    instructions: [
      '3 minutes light warm-up jog.',
      'Alternate 60 seconds moderate run with 30 seconds brisk walk for 12 cycles.',
      'Maintain soft forefoot landings to reduce knee strain.',
      'Cool down with 2 minutes slow walk.'
    ]
  },
  {
    id: 'ex-yoga',
    name: 'Vinyasa Flow for Core & Spinal Mobility',
    category: 'yoga',
    defaultDuration: 25,
    caloriesPerMinute: 4.5,
    difficulty: 'Beginner',
    targetMuscles: 'Spine, Shoulders, Hamstrings, Core',
    suitableGoals: ['flexibility', 'general_health'],
    equipment: 'Yoga Mat',
    instructions: [
      'Start in Mountain Pose (Tadasana) focusing on steady nasal breaths.',
      'Flow smoothly through 4 rounds of Sun Salutation A.',
      'Hold Warrior II and Triangle pose for 5 deep breaths per side.',
      'Conclude in Child’s Pose and Corpse Pose (Savasana).'
    ]
  },
  {
    id: 'ex-stretch',
    name: 'Full Body Desk & Posture Relief Stretch',
    category: 'stretching',
    defaultDuration: 15,
    caloriesPerMinute: 3.5,
    difficulty: 'Beginner',
    targetMuscles: 'Neck, Chest, Hip Flexors, Lower Back',
    suitableGoals: ['flexibility', 'general_health'],
    equipment: 'None',
    instructions: [
      'Neck lateral tilts and shoulder rolls (2 mins).',
      'Doorway pectoral stretch to open chest (2 mins).',
      'Kneeling hip flexor lunge and glute bridges (5 mins).',
      'Seated spinal twist and forward fold (6 mins).'
    ]
  },
  {
    id: 'ex-strength',
    name: 'Bodyweight Calisthenics Strength Circuit',
    category: 'strength',
    defaultDuration: 30,
    caloriesPerMinute: 7.5,
    difficulty: 'Intermediate',
    targetMuscles: 'Chest, Quads, Lats, Triceps',
    suitableGoals: ['muscle_gain', 'weight_loss', 'stamina'],
    equipment: 'Bodyweight or Dumbbells',
    instructions: [
      'Standard or Incline Pushups: 3 sets of 12 reps.',
      'Bodyweight Squats / Jump Squats: 3 sets of 15 reps.',
      'Pike Pushups or Shoulder Taps: 3 sets of 10 reps.',
      'Walking Lunges: 3 sets of 10 reps per leg.'
    ]
  },
  {
    id: 'ex-hiit',
    name: 'Metabolic Fat Burn Home HIIT',
    category: 'hiit',
    defaultDuration: 20,
    caloriesPerMinute: 11.0,
    difficulty: 'Advanced',
    targetMuscles: 'Full Body, Heart, Core',
    suitableGoals: ['weight_loss', 'stamina'],
    equipment: 'None',
    instructions: [
      'Work for 40 seconds, rest for 20 seconds.',
      'Round 1: High Knees & Shadow Boxing.',
      'Round 2: Mountain Climbers.',
      'Round 3: Squat Thrusts / Burpees.',
      'Round 4: Bicycle Crunches & Plank Hold.',
      'Repeat circuit for 4 total rounds.'
    ]
  },
  {
    id: 'ex-meditation',
    name: 'Mindful Breathwork & Stress Recovery',
    category: 'meditation',
    defaultDuration: 15,
    caloriesPerMinute: 2.0,
    difficulty: 'Beginner',
    targetMuscles: 'Nervous System, Vagus Nerve',
    suitableGoals: ['general_health', 'flexibility'],
    equipment: 'Quiet Space',
    instructions: [
      'Sit in a comfortable upright position with spine lengthened.',
      'Close eyes and practice Box Breathing: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s.',
      'Observe thoughts without judgment, returning focus to breath sensation.',
      'Cultivate gratitude and mental clarity.'
    ]
  }
];

export const ExerciseTracker: React.FC = () => {
  const { profile, todayLog, addWorkout, deleteWorkout, toggleWorkoutCompleted } = useHealth();

  // Filter States
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>(profile.fitnessGoal || 'weight_loss');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTime, setSelectedTime] = useState<number>(20);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Active Workout Timer State
  const [activeWorkout, setActiveWorkout] = useState<ExerciseTemplate | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [totalTimerDuration, setTotalTimerDuration] = useState<number>(0);

  // Custom Workout Form State
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customCat, setCustomCat] = useState<ExerciseCategory>('strength');
  const [customDur, setCustomDur] = useState<number>(30);
  const [customCal, setCustomCal] = useState<number>(180);

  // Timer interval effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            sound.playAlarm();
            setIsTimerRunning(false);
            return 0;
          }
          if (prev % 60 === 0 || prev === 3 || prev === 2 || prev === 1) {
            sound.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  // Start workout routine
  const startWorkoutSession = (ex: ExerciseTemplate) => {
    const durationMinutes = selectedTime || ex.defaultDuration;
    setActiveWorkout(ex);
    setTotalTimerDuration(durationMinutes * 60);
    setTimerSecondsLeft(durationMinutes * 60);
    setIsTimerRunning(true);
    sound.playSuccess();
  };

  const completeActiveWorkout = () => {
    if (!activeWorkout) return;
    const durationMinutes = Math.round(totalTimerDuration / 60);
    const caloriesBurned = Math.round(durationMinutes * activeWorkout.caloriesPerMinute);

    addWorkout({
      name: activeWorkout.name,
      category: activeWorkout.category,
      durationMinutes,
      caloriesBurned,
      difficulty: activeWorkout.difficulty,
      instructions: activeWorkout.instructions,
      targetMuscles: activeWorkout.targetMuscles
    });

    setActiveWorkout(null);
    setIsTimerRunning(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addWorkout({
      name: customName,
      category: customCat,
      durationMinutes: customDur,
      caloriesBurned: customCal,
      difficulty: 'Intermediate',
      instructions: ['Custom workout session']
    });

    setCustomName('');
    setShowCustomForm(false);
  };

  // Filter exercises
  const filteredExercises = EXERCISE_CATALOG.filter(ex => {
    const matchCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchDifficulty = selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty;
    return matchCategory && matchDifficulty;
  });

  return (
    <div className="space-y-6 animate-fade-in w-full">
      
      {/* 1. Header Banner */}
      <div className="health-card p-6 border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-white dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-500/30 shadow-sm">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">Exercise & Workout Hub</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personalized routines for {profile.name} • Goal: {profile.fitnessGoal.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-xs font-bold text-purple-700 dark:text-purple-300">
            {todayLog.exerciseMinutes} / {todayLog.exerciseGoalMinutes} mins completed
          </div>
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Log Custom
          </button>
        </div>
      </div>

      {/* 2. Active Workout Live Timer Overlay */}
      {activeWorkout && (
        <div className="health-card p-6 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-slate-900 shadow-xl animate-scale-up">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="badge badge-emerald text-xs">Active Session</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">{activeWorkout.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Target: {activeWorkout.targetMuscles} • Est. Burn: ~{Math.round((totalTimerDuration / 60) * activeWorkout.caloriesPerMinute)} kcal
              </p>
            </div>

            {/* Countdown Display */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 font-heading tracking-widest">
                  {Math.floor(timerSecondsLeft / 60).toString().padStart(2, '0')}:{(timerSecondsLeft % 60).toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Remaining Time</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-3.5 rounded-2xl font-bold flex items-center justify-center transition shadow-md ${
                    isTimerRunning
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                      : 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600'
                  }`}
                  title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
                >
                  {isTimerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                </button>

                <button
                  onClick={() => {
                    setTimerSecondsLeft(totalTimerDuration);
                    setIsTimerRunning(false);
                  }}
                  className="btn-icon"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={completeActiveWorkout}
                  className="btn-primary py-3 px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Finish & Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Custom Workout Form Drawer */}
      {showCustomForm && (
        <form onSubmit={handleCustomSubmit} className="health-card p-6 border-purple-300 dark:border-purple-700 animate-slide-in space-y-4 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Log Custom Workout</h3>
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Workout Name</label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="glass-input w-full"
                placeholder="e.g. Swimming, Pilates, Heavy Squats"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Category</label>
              <select
                value={customCat}
                onChange={e => setCustomCat(e.target.value as any)}
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
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Duration (mins)</label>
              <input
                type="number"
                min="1"
                value={customDur}
                onChange={e => setCustomDur(Number(e.target.value))}
                className="glass-input w-full"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Calories Burned</label>
              <input
                type="number"
                min="0"
                value={customCal}
                onChange={e => setCustomCal(Number(e.target.value))}
                className="glass-input w-full"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold">
            Add to Today's Exercises
          </button>
        </form>
      )}

      {/* 4. Filter & Personalization Bar */}
      <div className="health-card p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Personalize Exercise Recommendations</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Fitness Goal</label>
            <select
              value={selectedGoal}
              onChange={e => setSelectedGoal(e.target.value as any)}
              className="glass-input w-full text-xs"
            >
              <option value="weight_loss">Weight Loss / Fat Burn</option>
              <option value="muscle_gain">Muscle Building</option>
              <option value="stamina">Stamina & Cardio</option>
              <option value="flexibility">Flexibility & Recovery</option>
              <option value="general_health">General Longevity</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Exercise Type</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="glass-input w-full text-xs"
            >
              <option value="all">All Exercise Types</option>
              <option value="walking">Walking</option>
              <option value="running">Running</option>
              <option value="yoga">Yoga</option>
              <option value="stretching">Stretching</option>
              <option value="strength">Strength Training</option>
              <option value="hiit">Home HIIT</option>
              <option value="meditation">Meditation</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Available Time</label>
            <select
              value={selectedTime}
              onChange={e => setSelectedTime(Number(e.target.value))}
              className="glass-input w-full text-xs"
            >
              <option value={10}>10 Minutes (Quick Boost)</option>
              <option value={15}>15 Minutes (Express)</option>
              <option value={20}>20 Minutes (Standard)</option>
              <option value={30}>30 Minutes (Full Routine)</option>
              <option value={45}>45 Minutes (Intense)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Difficulty Level</label>
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="glass-input w-full text-xs"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner Friendly</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Recommended Exercises Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">AI Recommended Routines</h3>
          <span className="text-xs text-slate-500">{filteredExercises.length} tailored workouts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExercises.map(ex => {
            const duration = selectedTime || ex.defaultDuration;
            const estCalories = Math.round(duration * ex.caloriesPerMinute);

            return (
              <div 
                key={ex.id}
                className="health-card p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-400 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-purple text-[10px] uppercase font-bold">{ex.category}</span>
                      <span className="text-[11px] font-semibold text-slate-500">• {ex.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span>~{estCalories} kcal</span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">{ex.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Muscles: <strong className="text-slate-700 dark:text-slate-300">{ex.targetMuscles}</strong> | Equipment: {ex.equipment}
                  </p>

                  {/* Step Instructions */}
                  <div className="mt-3 space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/40">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Key Steps:</span>
                    {ex.instructions.map((ins, i) => (
                      <p key={i} className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug flex items-start gap-1.5">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                        <span>{ins}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>{duration} mins</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        addWorkout({
                          name: ex.name,
                          category: ex.category,
                          durationMinutes: duration,
                          caloriesBurned: estCalories,
                          difficulty: ex.difficulty,
                          instructions: ex.instructions,
                          targetMuscles: ex.targetMuscles
                        });
                      }}
                      className="btn-secondary text-xs py-1.5 px-3"
                      title="Quick mark complete"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Log Complete
                    </button>

                    <button
                      onClick={() => startWorkoutSession(ex)}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Timer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Completed Workouts for Today */}
      <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Today's Completed Exercises</h3>
          </div>
          <span className="text-xs text-slate-500">{todayLog.workouts.length} recorded</span>
        </div>

        {todayLog.workouts.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Dumbbell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No workouts logged yet today. Start a routine above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayLog.workouts.map(w => (
              <div 
                key={w.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-purple-400 transition"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleWorkoutCompleted(w.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                      w.completed ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {w.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{w.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {w.durationMinutes} mins • ~{w.caloriesBurned} kcal burned • {w.timestamp}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="badge badge-purple text-[10px] hidden sm:inline-flex">{w.category}</span>
                  <button
                    onClick={() => deleteWorkout(w.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                    title="Delete workout entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
