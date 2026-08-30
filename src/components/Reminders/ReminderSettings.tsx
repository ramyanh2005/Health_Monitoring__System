import React, { useState } from 'react';
import { 
  Bell, 
  Droplets, 
  Dumbbell, 
  UtensilsCrossed, 
  Moon, 
  Volume2, 
  Plus, 
  Trash2, 
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { ReminderItem } from '../../types/health';

export const ReminderSettings: React.FC = () => {
  const { 
    reminders, 
    toggleReminder, 
    updateReminder, 
    addReminder, 
    deleteReminder, 
    triggerReminderTest, 
    requestNotificationPermission 
  } = useHealth();

  const [permissionGranted, setPermissionGranted] = useState<boolean>(
    'Notification' in window && Notification.permission === 'granted'
  );

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('15:00');
  const [newType, setNewType] = useState<any>('custom');

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addReminder({
      type: newType,
      title: newTitle,
      message: newMessage || 'Time to complete your health activity!',
      time: newTime,
      enabled: true
    });

    setNewTitle('');
    setNewMessage('');
    setShowAddForm(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'water':
        return <Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'exercise':
        return <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'breakfast':
      case 'lunch':
      case 'dinner':
        return <UtensilsCrossed className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'sleep':
        return <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      
      {/* 1. Header */}
      <div className="health-card p-6 border-cyan-200 dark:border-cyan-900/60 bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-white dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center border border-cyan-200 dark:border-cyan-500/30 shadow-sm">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">Reminders & Alerts</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled chime notifications for hydration, meals, exercise & sleep</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!permissionGranted ? (
            <button
              onClick={handleRequestPermission}
              className="btn-secondary text-xs py-2 px-3 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700"
            >
              Enable Browser Alerts
            </button>
          ) : (
            <span className="badge badge-emerald text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Browser Alerts Active
            </span>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Reminder
          </button>
        </div>
      </div>

      {/* 2. Custom Reminder Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="health-card p-6 border-cyan-300 dark:border-cyan-700 animate-slide-in space-y-4 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Create Custom Health Reminder</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-500 hover:text-slate-900">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Reminder Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Afternoon Water Break"
                className="glass-input w-full"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Category</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value)}
                className="glass-input w-full"
              >
                <option value="water">💧 Hydration</option>
                <option value="exercise">🏃 Exercise</option>
                <option value="breakfast">🍳 Breakfast</option>
                <option value="lunch">🥗 Lunch</option>
                <option value="dinner">🍲 Dinner</option>
                <option value="sleep">🌙 Sleep Wind-down</option>
                <option value="custom">🔔 Custom</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Scheduled Time</label>
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="glass-input w-full font-mono text-center font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">Notification Message</label>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="e.g. Take 5 deep breaths and drink a 250ml glass of water."
              className="glass-input w-full"
            />
          </div>

          <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold">
            Save Schedule
          </button>
        </form>
      )}

      {/* 3. Configured Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map((rem: ReminderItem) => (
          <div
            key={rem.id}
            className={`health-card p-5 border transition flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900 ${
              rem.enabled
                ? 'border-slate-200 dark:border-slate-800'
                : 'border-slate-200 dark:border-slate-800 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    rem.enabled ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-900 border-slate-200'
                  }`}>
                    {getIcon(rem.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rem.title}</h4>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {rem.time ? `Scheduled at ${rem.time}` : `Every ${rem.intervalMinutes || 60} mins`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleReminder(rem.id)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    rem.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label={rem.enabled ? 'Disable reminder' : 'Enable reminder'}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                      rem.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {rem.message}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={rem.time || '12:00'}
                  onChange={(e) => updateReminder({ ...rem, time: e.target.value })}
                  className="glass-input text-xs py-1 px-2 w-24 font-mono text-center font-bold"
                />
                <span className="text-[11px] text-slate-500">Daily</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerReminderTest(rem.type)}
                  className="btn-secondary py-1 px-2.5 text-[11px] flex items-center gap-1"
                  title="Test Sound & Alert"
                >
                  <Volume2 className="w-3 h-3 text-emerald-600" /> Test
                </button>
                {rem.type === 'custom' && (
                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
