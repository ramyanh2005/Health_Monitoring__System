import React, { useState } from 'react';
import { 
  Droplets, 
  Plus, 
  Bell, 
  BellOff, 
  Volume2, 
  Trash2, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

export const WaterTracker: React.FC = () => {
  const { 
    todayLog, 
    addWater, 
    removeWaterEntry, 
    setWaterGoal, 
    reminders, 
    toggleReminder, 
    triggerReminderTest 
  } = useHealth();

  const [customAmount, setCustomAmount] = useState<string>('300');
  const [unitMode, setUnitMode] = useState<'ml' | 'glasses'>('ml'); // 1 glass = 250ml
  const [editingGoal, setEditingGoal] = useState<boolean>(false);
  const [newGoalInput, setNewGoalInput] = useState<number>(todayLog.waterGoalMl || 2500);

  const waterDrank = todayLog.waterIntakeMl || 0;
  const waterGoal = todayLog.waterGoalMl || 2500;
  const remaining = Math.max(0, waterGoal - waterDrank);
  const percent = Math.min(100, Math.round((waterDrank / waterGoal) * 100));

  const glassesDrank = parseFloat((waterDrank / 250).toFixed(1));
  const glassesRemaining = Math.max(0, parseFloat((remaining / 250).toFixed(1)));

  const waterReminder = reminders.find(r => r.type === 'water') || {
    id: 'rem-water',
    type: 'water' as const,
    title: '💧 Hydration Check',
    message: 'Time to drink water!',
    enabled: true
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setWaterGoal(Number(newGoalInput));
    setEditingGoal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      
      {/* 1. Top Title & Controls */}
      <div className="health-card p-6 border-cyan-200 dark:border-cyan-900/60 bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-white dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center border border-cyan-200 dark:border-cyan-500/30 shadow-sm">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">Hydration Tracker</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Maintain cellular hydration & steady energy</p>
            </div>
          </div>
        </div>

        {/* Unit switch & Goal edit */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setUnitMode('ml')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                unitMode === 'ml' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Litres / ML
            </button>
            <button
              onClick={() => setUnitMode('glasses')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                unitMode === 'glasses' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Glasses (250ml)
            </button>
          </div>

          <button
            onClick={() => setEditingGoal(!editingGoal)}
            className="btn-secondary text-xs py-2 px-3 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300"
          >
            {editingGoal ? 'Cancel' : 'Edit Target'}
          </button>
        </div>
      </div>

      {/* Goal Edit Drawer */}
      {editingGoal && (
        <form onSubmit={handleSaveGoal} className="health-card p-5 border-cyan-300 dark:border-cyan-700 animate-slide-in flex items-center gap-4 flex-wrap">
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Set Daily Target (ml):</label>
          <input
            type="number"
            min="500"
            max="6000"
            step="100"
            value={newGoalInput}
            onChange={(e) => setNewGoalInput(Number(e.target.value))}
            className="glass-input w-36 font-bold"
            required
          />
          <span className="text-xs text-slate-500">({(newGoalInput / 1000).toFixed(1)} Litres or ~{Math.round(newGoalInput / 250)} glasses)</span>
          <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold">
            Save Target
          </button>
        </form>
      )}

      {/* 2. Visual Liquid Flask & Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Liquid Flask */}
        <div className="health-card p-6 flex flex-col items-center justify-between border-cyan-200 dark:border-cyan-900/60 bg-white dark:bg-slate-900">
          <div className="text-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Fill Level</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading mt-0.5">{percent}% Completed</h3>
          </div>

          {/* Water Flask */}
          <div className="relative w-44 h-72 my-4 bg-slate-100 dark:bg-slate-800 rounded-3xl border-4 border-cyan-400/40 p-1.5 shadow-inner overflow-hidden flex flex-col justify-end">
            
            {/* Markers */}
            <div className="absolute inset-0 z-20 flex flex-col justify-between py-6 px-3 pointer-events-none opacity-40">
              <div className="w-full border-b border-dashed border-slate-400 dark:border-cyan-200 text-[10px] text-slate-500 dark:text-cyan-200 text-right pr-1">100%</div>
              <div className="w-full border-b border-dashed border-slate-400 dark:border-cyan-200 text-[10px] text-slate-500 dark:text-cyan-200 text-right pr-1">75%</div>
              <div className="w-full border-b border-dashed border-slate-400 dark:border-cyan-200 text-[10px] text-slate-500 dark:text-cyan-200 text-right pr-1">50%</div>
              <div className="w-full border-b border-dashed border-slate-400 dark:border-cyan-200 text-[10px] text-slate-500 dark:text-cyan-200 text-right pr-1">25%</div>
            </div>

            {/* Liquid */}
            <div 
              className="w-full bg-gradient-to-t from-cyan-600 via-cyan-500 to-teal-400 rounded-b-2xl transition-all duration-700 ease-out relative overflow-hidden flex items-center justify-center shadow-lg"
              style={{ height: `${Math.max(8, percent)}%` }}
            >
              <div className="relative z-10 text-center font-black text-white drop-shadow-md">
                <span className="text-xl leading-none">
                  {unitMode === 'ml' ? `${waterDrank} ml` : `${glassesDrank} gl`}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full text-center py-2.5 px-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-700 dark:text-slate-300">
              {remaining > 0 ? (
                <>Need <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{unitMode === 'ml' ? `${remaining} ml` : `${glassesRemaining} glasses`}</strong> more today</>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Daily target reached!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Quick-Add Intake Buttons & Reminders */}
        <div className="health-card p-6 flex flex-col justify-between space-y-6 lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading mb-1">Quick Add Water</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Click any preset to add to your hydration log</p>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Small Cup', amount: 250, desc: '1 glass', icon: '🥛' },
                { label: 'Standard Bottle', amount: 500, desc: '1 bottle', icon: '🍶' },
                { label: 'Large Flask', amount: 750, desc: '3 glasses', icon: '💧' },
                { label: 'Mega Hydro', amount: 1000, desc: '1 Litre flask', icon: '🚰' },
              ].map(preset => (
                <button
                  key={preset.amount}
                  onClick={() => addWater(preset.amount)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 text-left transition group flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{preset.icon}</span>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
                      +{preset.amount} ml
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{preset.label}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{preset.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Custom Hydration Amount</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Log custom cup or shaker volume</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  min="50"
                  max="2000"
                  step="50"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="glass-input w-28 text-center font-bold"
                  placeholder="300"
                />
                <span className="text-xs font-semibold text-slate-500">ml</span>
                <button
                  onClick={() => {
                    const val = parseInt(customAmount) || 0;
                    if (val > 0) addWater(val);
                  }}
                  className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Reminder Controls Section */}
          <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                waterReminder.enabled ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {waterReminder.enabled ? <Bell className="w-5 h-5 animate-wiggle" /> : <BellOff className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Hydration Reminders
                  <span className={`badge text-[10px] ${waterReminder.enabled ? 'badge-cyan' : 'bg-slate-200 text-slate-600'}`}>
                    {waterReminder.enabled ? 'Active (Hourly)' : 'Disabled'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">“Time to drink water!” notification alert</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => triggerReminderTest('water')}
                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700"
                title="Test reminder sound and alert"
              >
                <Volume2 className="w-3.5 h-3.5" /> Test Sound
              </button>
              <button
                onClick={() => toggleReminder('rem-water')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                  waterReminder.enabled
                    ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                    : 'bg-cyan-600 text-white shadow-sm hover:bg-cyan-700'
                }`}
              >
                {waterReminder.enabled ? 'Disable' : 'Enable Reminders'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Daily Hydration Log Timeline */}
      <div className="health-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Today's Hydration Timeline</h3>
          </div>
          <span className="text-xs text-slate-500">{todayLog.waterEntries?.length || 0} entries logged</span>
        </div>

        {(!todayLog.waterEntries || todayLog.waterEntries.length === 0) ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Droplets className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No water logged yet today. Click +250ml above to start!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {todayLog.waterEntries.map((entry) => (
              <div 
                key={entry.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-cyan-400 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                    💧
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">+{entry.amountMl} ml</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{entry.timestamp}</p>
                  </div>
                </div>

                <button
                  onClick={() => removeWaterEntry(entry.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                  title="Remove this entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
