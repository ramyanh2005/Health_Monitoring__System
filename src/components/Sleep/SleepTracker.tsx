import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  CheckCircle2, 
  Sparkles, 
  Calendar
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
import { SleepQuality } from '../../types/health';
import { formatFriendlyDate } from '../../utils/calculations';

export const SleepTracker: React.FC = () => {
  const { todayLog, updateSleep, pastLogs, goalSettings } = useHealth();

  const [bedtime, setBedtime] = useState<string>(todayLog.sleep?.sleepTime || '23:00');
  const [wakeTime, setWakeTime] = useState<string>(todayLog.sleep?.wakeTime || '07:00');
  const [quality, setQuality] = useState<SleepQuality>(todayLog.sleep?.quality || 'Good');
  const [notes, setNotes] = useState<string>(todayLog.sleep?.notes || '');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const calculateDurationHours = (bed: string, wake: string) => {
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    let bedMins = bH * 60 + bM;
    let wakeMins = wH * 60 + wM;
    if (wakeMins < bedMins) wakeMins += 24 * 60;
    return parseFloat(((wakeMins - bedMins) / 60).toFixed(1));
  };

  const currentDurationHours = calculateDurationHours(bedtime, wakeTime);
  const sleepGoal = todayLog.sleepGoalHours || goalSettings.sleepHours || 8;
  const sleepPercent = Math.min(100, Math.round((currentDurationHours / sleepGoal) * 100));

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    const durationMinutes = Math.round(currentDurationHours * 60);

    updateSleep({
      sleepTime: bedtime,
      wakeTime,
      durationMinutes,
      quality,
      notes
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const last7Days = Object.keys(pastLogs)
    .sort()
    .slice(-7)
    .map(dateKey => {
      const log = pastLogs[dateKey];
      return {
        date: formatFriendlyDate(dateKey),
        hours: parseFloat(((log.sleep?.durationMinutes || 0) / 60).toFixed(1)),
        quality: log.sleep?.quality || 'Good'
      };
    });

  return (
    <div className="space-y-6 animate-fade-in w-full">
      
      {/* 1. Header */}
      <div className="health-card p-6 border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-white dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shadow-sm">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">Sleep & Recovery Hub</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Circadian rhythm tracking & restorative sleep analytics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-purple text-xs">
            Goal: {sleepGoal} hrs / night
          </span>
        </div>
      </div>

      {/* 2. Main Sleep Entry & Progress Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: Sleep & Wake Input */}
        <form onSubmit={handleSaveSleep} className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Log Sleep Times</h3>
              {isSaved && (
                <span className="badge badge-emerald text-[10px] animate-fade-in flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved!
                </span>
              )}
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1 font-semibold">
                    <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Bedtime
                  </label>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={e => setBedtime(e.target.value)}
                    className="glass-input w-full font-mono text-center font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1 font-semibold">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Wake-up
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className="glass-input w-full font-mono text-center font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50 dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Sleep:</span>
                <span className="text-lg font-black text-indigo-700 dark:text-indigo-400 font-heading">
                  {currentDurationHours} Hours
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block font-semibold">Sleep Quality</label>
                <select
                  value={quality}
                  onChange={e => setQuality(e.target.value as SleepQuality)}
                  className="glass-input w-full text-xs"
                >
                  <option value="Excellent">⭐ Excellent (Deep & refreshing)</option>
                  <option value="Good">🟢 Good (Well rested)</option>
                  <option value="Fair">🟡 Fair (Interrupted)</option>
                  <option value="Poor">🔴 Poor (Fatigued)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block font-semibold">Bedtime Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Read book, no screens"
                  className="glass-input w-full text-xs"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-2.5 mt-4 text-xs font-bold">
            Save Sleep Entry
          </button>
        </form>

        {/* Right: Sleep Progress & Sleep Science Insights */}
        <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:col-span-2 flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sleep Debt / Target</span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading mt-0.5">
                  {currentDurationHours >= sleepGoal ? 'Goal Satisfied' : `${(sleepGoal - currentDurationHours).toFixed(1)}h sleep deficit`}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-heading">{sleepPercent}%</span>
                <span className="text-[10px] text-slate-500 block">of {sleepGoal}h Target</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${sleepPercent}%` }}
              />
            </div>

            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI Sleep Hygiene Recommendations
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <strong className="text-indigo-700 dark:text-indigo-300 font-bold block">1. Natural Melatonin Trigger:</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Dim screens and lights 45 minutes prior to your {bedtime} target bedtime.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <strong className="text-indigo-700 dark:text-indigo-300 font-bold block">2. Thermal Regulation:</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Keep bedroom temperature around 18°C - 20°C (65°F - 68°F).
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <strong className="text-indigo-700 dark:text-indigo-300 font-bold block">3. Adenosine Clearance:</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Avoid caffeine after 2:00 PM for optimal sleep architecture.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <strong className="text-indigo-700 dark:text-indigo-300 font-bold block">4. Consistent Sleep Window:</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Waking up at {wakeTime} stabilizes your biological circadian clock.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Weekly Sleep History Chart with Recharts */}
      <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Past 7 Days Sleep History</h3>
          </div>
          <span className="text-xs text-slate-500">
            Weekly Average: {parseFloat((last7Days.reduce((a, c) => a + c.hours, 0) / last7Days.length).toFixed(1))} hrs
          </span>
        </div>

        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#ffffff', fontSize: '12px' }}
                formatter={(value: any) => [`${value} hrs`, 'Sleep Duration']}
              />
              <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
