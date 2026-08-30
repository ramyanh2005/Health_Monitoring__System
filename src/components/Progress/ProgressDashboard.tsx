import React, { useState } from 'react';
import { 
  TrendingUp, 
  Award, 
  Droplets, 
  Footprints, 
  Dumbbell, 
  Moon, 
  UtensilsCrossed, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useHealth } from '../../context/HealthContext';
import { formatFriendlyDate } from '../../utils/calculations';

export const ProgressDashboard: React.FC = () => {
  const { pastLogs, todayLog, badges } = useHealth();
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [activeMetric, setActiveMetric] = useState<'score' | 'water' | 'steps' | 'exercise' | 'sleep' | 'calories'>('score');
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  const sortedDates = Object.keys(pastLogs).sort();
  
  const displayDates = timeframe === 'day' 
    ? sortedDates.slice(-1) 
    : timeframe === 'week' 
    ? sortedDates.slice(-7) 
    : sortedDates.slice(-30);

  const displayLogs = displayDates.map(d => pastLogs[d]);

  const yesterdayDate = sortedDates.length >= 2 ? sortedDates[sortedDates.length - 2] : null;
  const yesterdayLog = yesterdayDate ? pastLogs[yesterdayDate] : null;

  const scoreDelta = yesterdayLog ? todayLog.healthScore - yesterdayLog.healthScore : 0;
  const stepsDelta = yesterdayLog ? todayLog.steps - yesterdayLog.steps : 0;
  const waterDelta = yesterdayLog ? todayLog.waterIntakeMl - yesterdayLog.waterIntakeMl : 0;

  const avgScore = displayLogs.length > 0 ? Math.round(displayLogs.reduce((a, c) => a + c.healthScore, 0) / displayLogs.length) : 0;
  const avgSteps = displayLogs.length > 0 ? Math.round(displayLogs.reduce((a, c) => a + c.steps, 0) / displayLogs.length) : 0;
  const avgWater = displayLogs.length > 0 ? Math.round(displayLogs.reduce((a, c) => a + c.waterIntakeMl, 0) / displayLogs.length) : 0;
  const avgSleep = displayLogs.length > 0 ? parseFloat((displayLogs.reduce((a, c) => a + ((c.sleep?.durationMinutes || 0)/60), 0) / displayLogs.length).toFixed(1)) : 0;

  const getMetricData = (log: any) => {
    switch (activeMetric) {
      case 'score':
        return { value: log.healthScore, max: 100, unit: 'pts', color: '#10b981', label: 'Health Score' };
      case 'water':
        return { value: log.waterIntakeMl, max: log.waterGoalMl || 2500, unit: 'ml', color: '#06b6d4', label: 'Water Intake' };
      case 'steps':
        return { value: log.steps, max: log.stepGoal || 10000, unit: 'steps', color: '#10b981', label: 'Daily Steps' };
      case 'exercise':
        return { value: log.exerciseMinutes, max: log.exerciseGoalMinutes || 45, unit: 'mins', color: '#8b5cf6', label: 'Active Workout' };
      case 'sleep':
        return { value: parseFloat(((log.sleep?.durationMinutes || 0)/60).toFixed(1)), max: 9, unit: 'hrs', color: '#6366f1', label: 'Sleep Duration' };
      case 'calories':
        return { value: log.caloriesConsumed, max: log.calorieGoal || 2200, unit: 'kcal', color: '#f59e0b', label: 'Calories Consumed' };
    }
  };

  const currentMetricConfig = getMetricData(todayLog);

  const rechartsData = displayLogs.map(log => {
    const data = getMetricData(log);
    return {
      date: formatFriendlyDate(log.date),
      fullDate: log.date,
      value: data.value,
      unit: data.unit
    };
  });

  return (
    <div className="space-y-6 animate-fade-in w-full">
      
      {/* 1. Header & Timeframe Switcher */}
      <div className="health-card p-6 border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30 shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">Progress Analytics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Historical performance, day comparisons & milestone achievements</p>
            </div>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {(['day', 'week', 'month'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 text-xs font-bold capitalize rounded-lg transition ${
                timeframe === tf
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tf === 'day' ? 'Today' : tf === 'week' ? 'Past 7 Days' : 'Past 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Day-Over-Day Performance Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Score */}
        <div className="health-card p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Score</span>
            <button onClick={() => setShowFormulaModal(true)} className="text-slate-400 hover:text-emerald-600">
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">{todayLog.healthScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="flex items-center gap-1 text-xs mt-2 font-semibold">
            {scoreDelta >= 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{scoreDelta} pts vs yesterday
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" /> {scoreDelta} pts vs yesterday
              </span>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="health-card p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Steps</span>
            <Footprints className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">{todayLog.steps.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-xs mt-2 font-semibold">
            {stepsDelta >= 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{stepsDelta.toLocaleString()} vs yesterday
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" /> {stepsDelta.toLocaleString()} vs yesterday
              </span>
            )}
          </div>
        </div>

        {/* Water */}
        <div className="health-card p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hydration</span>
            <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">{todayLog.waterIntakeMl}</span>
            <span className="text-xs text-slate-400">ml</span>
          </div>
          <div className="flex items-center gap-1 text-xs mt-2 font-semibold">
            {waterDelta >= 0 ? (
              <span className="text-cyan-600 dark:text-cyan-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{waterDelta} ml vs yesterday
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" /> {waterDelta} ml vs yesterday
              </span>
            )}
          </div>
        </div>

        {/* Sleep */}
        <div className="health-card p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sleep</span>
            <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">
              {((todayLog.sleep?.durationMinutes || 0)/60).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">hours</span>
          </div>
          <div className="flex items-center gap-1 text-xs mt-2 font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Quality: {todayLog.sleep?.quality || 'Good'}</span>
          </div>
        </div>

      </div>

      {/* 3. Interactive Multi-Metric Trend Visualizer with Recharts */}
      <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        
        {/* Metric Switcher Tab */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              {currentMetricConfig.label} Trend ({timeframe === 'week' ? '7-Day View' : timeframe === 'month' ? '30-Day View' : 'Single Day'})
            </h3>
            <p className="text-xs text-slate-500">
              Period Average: <strong className="text-emerald-600 dark:text-emerald-400">{activeMetric === 'score' ? avgScore : activeMetric === 'steps' ? avgSteps.toLocaleString() : activeMetric === 'water' ? avgWater : avgSleep} {currentMetricConfig.unit}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'score', label: 'Health Score', icon: Sparkles },
              { id: 'steps', label: 'Steps', icon: Footprints },
              { id: 'water', label: 'Water', icon: Droplets },
              { id: 'exercise', label: 'Exercise', icon: Dumbbell },
              { id: 'sleep', label: 'Sleep', icon: Moon },
              { id: 'calories', label: 'Calories', icon: UtensilsCrossed },
            ].map(m => {
              const Icon = m.icon;
              const isSelected = activeMetric === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recharts Bar Chart View */}
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rechartsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
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
                formatter={(value: any) => [`${value} ${currentMetricConfig.unit}`, currentMetricConfig.label]}
              />
              <Bar 
                dataKey="value" 
                fill={currentMetricConfig.color} 
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* 4. Achievement Badges & Milestones Showcase */}
      <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Achievements & Milestone Badges</h3>
              <p className="text-xs text-slate-500">Unlock awards by maintaining consistent daily health routines</p>
            </div>
          </div>
          <span className="badge badge-amber text-xs">
            {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map(b => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                b.unlocked
                  ? 'bg-amber-50/50 dark:bg-slate-800/80 border-amber-300 dark:border-amber-500/40 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border ${
                b.unlocked
                  ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-800'
                  : 'bg-slate-200 dark:bg-slate-800 border-slate-300 text-slate-400'
              }`}>
                {b.unlocked ? b.icon : <Lock className="w-5 h-5 text-slate-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{b.title}</h4>
                  {b.unlocked && (
                    <span className="badge badge-emerald text-[9px] py-0 px-1.5 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Unlocked
                    </span>
                  )}
                </div>
                
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">{b.description}</p>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.unlocked ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((b.currentProgress / b.maxProgress) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
                  <span>Progress</span>
                  <span>{b.currentProgress} / {b.maxProgress} {b.unit || ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Health Score Algorithm Breakdown Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="health-card max-w-lg w-full p-6 border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Health Score Formula (100 pts)</h3>
              </div>
              <button onClick={() => setShowFormulaModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="space-y-3 my-4 text-xs text-slate-700 dark:text-slate-300">
              <p>Your Health Score is dynamically calculated across 5 balanced pillars (20 points each):</p>
              
              <div className="p-2.5 bg-cyan-50 dark:bg-slate-800/60 rounded-xl border border-cyan-200 dark:border-cyan-500/20">
                <strong className="text-cyan-700 dark:text-cyan-300">1. Hydration (20 Pts):</strong> Proportional to daily water goal completion.
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-slate-800/60 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                <strong className="text-emerald-700 dark:text-emerald-300">2. Daily Steps (20 Pts):</strong> Calculated against your step target.
              </div>
              <div className="p-2.5 bg-purple-50 dark:bg-slate-800/60 rounded-xl border border-purple-200 dark:border-purple-500/20">
                <strong className="text-purple-700 dark:text-purple-300">3. Active Exercise (20 Pts):</strong> Based on completed workout minutes.
              </div>
              <div className="p-2.5 bg-indigo-50 dark:bg-slate-800/60 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                <strong className="text-indigo-700 dark:text-indigo-300">4. Sleep Duration & Quality (20 Pts):</strong> Full points for 7-9 hours of restorative rest.
              </div>
              <div className="p-2.5 bg-amber-50 dark:bg-slate-800/60 rounded-xl border border-amber-200 dark:border-amber-500/20">
                <strong className="text-amber-700 dark:text-amber-300">5. Nutrition (20 Pts):</strong> Awarded for logging balanced meals & staying within calorie targets.
              </div>
            </div>

            <button onClick={() => setShowFormulaModal(false)} className="btn-primary w-full py-2 text-xs font-bold">
              Got it!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
