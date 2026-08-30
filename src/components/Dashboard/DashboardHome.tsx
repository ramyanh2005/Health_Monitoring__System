import React, { useState } from 'react';
import { 
  Droplets, 
  Footprints, 
  Dumbbell, 
  UtensilsCrossed, 
  Moon, 
  Sparkles, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  UserCheck, 
  Bot, 
  UserPlus, 
  Activity,
  Lightbulb,
  Heart,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useHealth } from '../../context/HealthContext';
import { getMotivationalMessage, formatFriendlyDate, calculateBMI } from '../../utils/calculations';
import { ProfileSummaryCard } from './ProfileSummaryCard';
import { BmiCalculatorCard } from './BmiCalculatorCard';
import { DailyStatsInputModal } from './DailyStatsInputModal';

interface DashboardHomeProps {
  setActiveTab: (tab: string) => void;
  onOpenQuickLog: (tab?: 'water' | 'steps' | 'workout' | 'meal' | 'sleep') => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ setActiveTab, onOpenQuickLog }) => {
  const { profile, todayLog, pastLogs, addWater, addSteps } = useHealth();
  const [customWaterInput, setCustomWaterInput] = useState<string>('350');
  const [showCustomWater, setShowCustomWater] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  const motivational = getMotivationalMessage(todayLog.healthScore, profile.name);
  const { bmi, category: bmiCategory, color: bmiColor } = calculateBMI(profile.weightKg, profile.heightCm);

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate percentages based on real user data
  const waterGoalL = ((todayLog.waterGoalMl || 3000) / 1000).toFixed(1);
  const waterDrankL = ((todayLog.waterIntakeMl || 0) / 1000).toFixed(1);
  const waterPercent = Math.min(100, Math.round(((todayLog.waterIntakeMl || 0) / (todayLog.waterGoalMl || 3000)) * 100));
  
  const stepPercent = Math.min(100, Math.round(((todayLog.steps || 0) / (todayLog.stepGoal || 10000)) * 100));
  const exercisePercent = Math.min(100, Math.round(((todayLog.exerciseMinutes || 0) / (todayLog.exerciseGoalMinutes || 35)) * 100));
  
  const sleepHours = parseFloat(((todayLog.sleep?.durationMinutes || 0) / 60).toFixed(1));
  const sleepGoalH = todayLog.sleepGoalHours || 8;
  const sleepPercent = Math.min(100, Math.round((sleepHours / sleepGoalH) * 100));
  
  const caloriePercent = Math.min(100, Math.round(((todayLog.caloriesConsumed || 0) / (todayLog.calorieGoal || 2200)) * 100));

  // Past 7 Days actual data formatted for Recharts
  const chartData = Object.keys(pastLogs)
    .sort()
    .slice(-7)
    .map(dateKey => {
      const log = pastLogs[dateKey];
      return {
        date: formatFriendlyDate(dateKey),
        fullDate: dateKey,
        score: log.healthScore,
        waterL: parseFloat(((log.waterIntakeMl || 0) / 1000).toFixed(1)),
        steps: log.steps,
        exercise: log.exerciseMinutes
      };
    });

  const hasAnyActivity = Object.values(pastLogs).some(
    l => (l.waterIntakeMl || 0) > 0 || (l.steps || 0) > 0 || (l.exerciseMinutes || 0) > 0 || (l.meals?.length || 0) > 0
  );

  const handleCustomWaterAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customWaterInput) || 0;
    if (val > 0) {
      addWater(val);
      setShowCustomWater(false);
    }
  };

  // Male health tips
  const healthTips = [
    { title: 'Morning Hydration', desc: 'Drink 500ml of water immediately upon waking to trigger metabolic thermogenesis and cellular hydration.' },
    { title: 'Protein Distribution', desc: 'Aim for 30-40g of quality protein per meal to optimize muscle protein synthesis and preserve lean mass.' },
    { title: 'Post-Meal Walking', desc: 'A 10-minute walk after meals blunts blood glucose spikes by up to 22%.' },
  ];

  return (
    <div className="space-y-6 animate-fade-in w-full">
      
      {/* 1. Main Dashboard Header: Male Healthy Dashboard */}
      <div className="health-card p-6 sm:p-8 border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-white dark:to-slate-900 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                {todayDateStr}
              </span>
              <span className="badge badge-emerald text-[11px] py-0.5 px-2.5 font-bold">
                ♂ Male Health & Fitness
              </span>
              {bmi > 0 ? (
                <span className="badge text-[11px] py-0.5 px-2.5 font-bold" style={{ backgroundColor: `${bmiColor}15`, color: bmiColor, borderColor: `${bmiColor}40` }}>
                  BMI: {bmi} ({bmiCategory})
                </span>
              ) : (
                <span className="badge text-[11px] py-0.5 px-2.5 font-bold text-slate-500 bg-slate-100 dark:bg-slate-800">
                  BMI: Setup in Profile
                </span>
              )}
            </div>

            {/* Prominent Visible Title */}
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
              Male Healthy Dashboard
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              "{motivational.quote}"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={() => setShowStatsModal(true)}
              className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 flex-1 md:flex-initial shadow-md shadow-emerald-500/20"
            >
              <UserCheck className="w-4 h-4" />
              <span>Update Daily Stats</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className="btn-secondary py-2.5 px-3.5 text-xs font-bold flex items-center justify-center gap-1.5 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300"
            >
              <Bot className="w-4 h-4" />
              <span>AI Coach</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Small "My Profile Summary" Card with Edit Profile Navigation */}
      <ProfileSummaryCard onEditProfile={() => setActiveTab('profile')} />

      {/* 3. Overall Health Score & Weekly Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prominent Health Score Card (1 col) */}
        <div className="health-card p-6 border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Male Vitality Score
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading mt-0.5">
                Daily Performance Index
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('progress')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Circular Progress Gauge */}
          <div className="my-6 flex items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${todayLog.healthScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-slate-900 dark:text-white font-heading leading-none">
                  {todayLog.healthScore}
                </span>
                <span className="text-xs font-extrabold text-slate-400 uppercase mt-1">/ 100 pts</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Vitality Status:</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              {todayLog.healthScore >= 80 
                ? '🏆 Elite Vitality' 
                : todayLog.healthScore >= 50 
                ? '⚡ Strong Momentum' 
                : todayLog.healthScore > 0 
                ? '🚀 Needs Hydration/Steps' 
                : 'Enter info to start tracking'}
            </span>
          </div>
        </div>

        {/* Weekly Progress Chart (2 cols) */}
        <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:col-span-2 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                  Weekly Vitality Trend
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated from real daily hydration, steps, workouts, sleep, and nutrition
              </p>
            </div>
            <button
              onClick={() => setActiveTab('progress')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Full Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recharts Area Visualization */}
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`${value} pts`, 'Vitality Score']}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Dynamic Formula: Water 20% + Steps 20% + Exercise 20% + Sleep 20% + Nutrition 20%</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {hasAnyActivity 
                ? `7-Day Avg: ${Math.round(chartData.reduce((a, c) => a + c.score, 0) / chartData.length)} pts` 
                : 'No activity recorded yet'}
            </span>
          </div>
        </div>

      </div>

      {/* 4. VISIBLE BMI CALCULATOR SECTION */}
      <BmiCalculatorCard />

      {/* 5. Five Health Metric Progress Cards (Water, Steps, Exercise, Sleep, Nutrition) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Card 1: Water Intake */}
        <div className="health-card p-5 border-cyan-200 dark:border-cyan-900/60 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="badge badge-cyan text-xs font-bold">{waterPercent}%</span>
            </div>

            <div className="mt-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Water Intake
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                  {waterDrankL} L
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / {waterGoalL} L ({todayLog.waterIntakeMl || 0} ml)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden my-3">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {todayLog.waterIntakeMl === 0
                  ? 'No water logged yet today'
                  : todayLog.waterIntakeMl < todayLog.waterGoalMl 
                  ? `${Math.max(0, todayLog.waterGoalMl - todayLog.waterIntakeMl)} ml remaining` 
                  : 'Daily hydration goal completed!'}
              </p>
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => addWater(250)}
                className="flex-1 py-1.5 bg-cyan-50 dark:bg-cyan-500/15 hover:bg-cyan-100 dark:hover:bg-cyan-500/25 border border-cyan-200 dark:border-cyan-500/30 rounded-lg text-xs font-bold text-cyan-700 dark:text-cyan-300 transition text-center"
              >
                +250 ml
              </button>
              <button
                onClick={() => addWater(500)}
                className="flex-1 py-1.5 bg-cyan-50 dark:bg-cyan-500/15 hover:bg-cyan-100 dark:hover:bg-cyan-500/25 border border-cyan-200 dark:border-cyan-500/30 rounded-lg text-xs font-bold text-cyan-700 dark:text-cyan-300 transition text-center"
              >
                +500 ml
              </button>
            </div>

            {showCustomWater ? (
              <form onSubmit={handleCustomWaterAdd} className="flex gap-1 pt-1">
                <input
                  type="number"
                  value={customWaterInput}
                  onChange={e => setCustomWaterInput(e.target.value)}
                  className="glass-input text-xs py-1 px-2 w-full text-center font-bold"
                  placeholder="350"
                  autoFocus
                />
                <button type="submit" className="btn-primary py-1 px-2 text-xs font-bold">
                  Add
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowCustomWater(true)}
                className="w-full py-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline text-center"
              >
                + Custom amount
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Steps */}
        <div className="health-card p-5 border-emerald-200 dark:border-emerald-900/60 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Footprints className="w-5 h-5" />
              </div>
              <span className="badge badge-emerald text-xs font-bold">{stepPercent}%</span>
            </div>

            <div className="mt-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Daily Steps
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                  {(todayLog.steps || 0).toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / {(todayLog.stepGoal || 10000).toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden my-3">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${stepPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {todayLog.steps === 0 
                  ? 'No steps recorded yet' 
                  : todayLog.steps < todayLog.stepGoal 
                  ? `${(todayLog.stepGoal - todayLog.steps).toLocaleString()} steps left` 
                  : 'Step goal accomplished!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => addSteps(1000)}
              className="flex-1 py-1.5 bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 transition text-center"
            >
              +1,000 Steps
            </button>
            <button
              onClick={() => onOpenQuickLog('steps')}
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Set Custom Steps"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 3: Exercise */}
        <div className="health-card p-5 border-purple-200 dark:border-purple-900/60 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Dumbbell className="w-5 h-5" />
              </div>
              <span className="badge badge-purple text-xs font-bold">{exercisePercent}%</span>
            </div>

            <div className="mt-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Exercise & Workouts
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                  {todayLog.exerciseMinutes || 0} m
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / {todayLog.exerciseGoalMinutes || 35} mins
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden my-3">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${exercisePercent}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {todayLog.workouts?.length === 0 
                  ? 'No workouts logged yet today' 
                  : `${todayLog.workouts.length} workouts completed`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('exercise')}
              className="flex-1 py-1.5 bg-purple-50 dark:bg-purple-500/15 hover:bg-purple-100 dark:hover:bg-purple-500/25 border border-purple-200 dark:border-purple-500/30 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-300 transition text-center"
            >
              Open Workouts
            </button>
          </div>
        </div>

        {/* Card 4: Sleep */}
        <div className="health-card p-5 border-indigo-200 dark:border-indigo-900/60 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <span className="badge badge-purple text-xs font-bold">{sleepHours > 0 ? (todayLog.sleep?.quality || 'Good') : 'No Log'}</span>
            </div>

            <div className="mt-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Sleep & Recovery
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                  {sleepHours} h
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / {sleepGoalH} hrs
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden my-3">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${sleepPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {sleepHours === 0 
                  ? 'No sleep logged yet today' 
                  : sleepHours >= sleepGoalH 
                  ? 'Rest target satisfied' 
                  : `${(sleepGoalH - sleepHours).toFixed(1)}h deficit`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('sleep')}
              className="flex-1 py-1.5 bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 border border-indigo-200 dark:border-indigo-500/30 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 transition text-center"
            >
              Sleep History
            </button>
          </div>
        </div>

        {/* Card 5: Meals / Nutrition */}
        <div className="health-card p-5 border-amber-200 dark:border-amber-900/60 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="badge badge-amber text-xs font-bold">{todayLog.meals?.length || 0} meals</span>
            </div>

            <div className="mt-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Meal Tracking
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                  {todayLog.caloriesConsumed || 0}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / {todayLog.calorieGoal || 2200} kcal
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden my-3">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {(todayLog.caloriesConsumed || 0) === 0
                  ? 'No meals logged yet today'
                  : `${Math.max(0, todayLog.calorieGoal - todayLog.caloriesConsumed)} kcal remaining`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('meals')}
              className="flex-1 py-1.5 bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/25 border border-amber-200 dark:border-amber-500/30 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 transition text-center"
            >
              Meal Planner
            </button>
          </div>
        </div>

      </div>

      {/* 6. Exercise & Meal Suggestions Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Exercise Suggestions & Today's Workouts */}
        <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Exercise Suggestions & Workouts
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('exercise')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
            >
              View All Routines <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800/40 text-xs">
              <span className="font-extrabold text-purple-900 dark:text-purple-200 block mb-0.5">Push Power (Chest & Shoulders)</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">4 sets Bench Press, Dumbbell Overhead Press, Dips. 40 mins.</p>
            </div>
            <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800/40 text-xs">
              <span className="font-extrabold text-purple-900 dark:text-purple-200 block mb-0.5">High-Intensity Sprint Intervals</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">8 rounds of 30s sprint / 60s recovery. Boosts VO2 max.</p>
            </div>
          </div>

          {(!todayLog.workouts || todayLog.workouts.length === 0) ? (
            <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <p className="text-xs text-slate-500">No workouts logged yet today.</p>
              <button
                onClick={() => onOpenQuickLog('workout')}
                className="btn-primary text-xs py-1.5 px-3"
              >
                + Log Completed Workout
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Logged Today:</span>
              {todayLog.workouts.map(w => (
                <div key={w.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{w.name} ({w.durationMinutes}m)</span>
                  <span className="badge badge-purple text-[10px]">~{w.caloriesBurned} kcal</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meal Suggestions & Nutrition Planner */}
        <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Meal Suggestions & Nutrition
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('meals')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
            >
              Meal Planner <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs">
              <span className="font-extrabold text-amber-900 dark:text-amber-200 block mb-0.5">High-Protein Power Bowl</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Grilled chicken breast, quinoa, avocado & spinach. ~45g Protein.</p>
            </div>
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs">
              <span className="font-extrabold text-amber-900 dark:text-amber-200 block mb-0.5">Anabolic Recovery Shake</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Whey isolate, banana, oats, peanut butter & almond milk. 38g Protein.</p>
            </div>
          </div>

          {(!todayLog.meals || todayLog.meals.length === 0) ? (
            <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <p className="text-xs text-slate-500">No meals logged yet today.</p>
              <button
                onClick={() => onOpenQuickLog('meal')}
                className="btn-primary text-xs py-1.5 px-3"
              >
                + Log Meal
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Logged Today:</span>
              {todayLog.meals.map(m => (
                <div key={m.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                  <span className="badge badge-amber text-[10px]">{m.calories} kcal ({m.protein}g P)</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 7. Health Tips & Motivational Insights */}
      <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            Male Health Tips & Protocol Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {healthTips.map((tip, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {tip.title}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Real User Daily Stats Input Modal */}
      <DailyStatsInputModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />

    </div>
  );
};
