import React from 'react';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

export const BadgeModal: React.FC = () => {
  const { unlockedBadgeModal, dismissBadgeModal } = useHealth();

  if (!unlockedBadgeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="health-card max-w-md w-full p-6 text-center relative border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 shadow-2xl animate-scale-up">
        {/* Close */}
        <button
          onClick={dismissBadgeModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Icon */}
        <div className="relative mx-auto w-24 h-24 my-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-emerald-500 flex items-center justify-center text-4xl shadow-xl text-white relative z-10 border-2 border-white">
            {unlockedBadgeModal.icon}
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Achievement Unlocked!
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
          {unlockedBadgeModal.title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-xs mx-auto">
          {unlockedBadgeModal.description}
        </p>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <button
            onClick={dismissBadgeModal}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            Claim & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
