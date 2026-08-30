import React from 'react';
import { Bell, Droplets, Dumbbell, UtensilsCrossed, Moon, X, Check } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { ActiveNotification } from '../../services/reminderEngine';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification, addWater } = useHealth();

  if (notifications.length === 0) return null;

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
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notif: ActiveNotification) => (
        <div
          key={notif.id}
          className="pointer-events-auto health-card p-4 shadow-xl border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 rounded-2xl flex items-start gap-3 transform transition-all duration-300 animate-slide-in"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
            {getIcon(notif.type)}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h4>
              <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{notif.message}</p>

            {notif.actionText && (
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (notif.type === 'water') {
                      addWater(notif.actionPayload?.amountMl || 250);
                    }
                    dismissNotification(notif.id);
                  }}
                  className="btn-primary py-1 px-2.5 text-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  {notif.actionText}
                </button>
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1"
                >
                  Later
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => dismissNotification(notif.id)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
