import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Footprints, 
  PlusCircle, 
  X, 
  Flame, 
  Timer, 
  Check,
  TreePine,
  Sparkles,
  Dumbbell
} from 'lucide-react';

export const ActivityLogModal = () => {
  const { logCustomActivity, closeModal } = useApp();

  const [activityType, setActivityType] = useState('Neighborhood Walk');
  const [durationMins, setDurationMins] = useState(20);
  const [stepsCount, setStepsCount] = useState(1500);
  const [caloriesBurn, setCaloriesBurn] = useState(90);

  const quickActivities = [
    { name: 'Neighborhood Walk', defaultMins: 20, defaultSteps: 1600, defaultKcal: 85 },
    { name: 'Gentle Gardening', defaultMins: 30, defaultSteps: 800, defaultKcal: 110 },
    { name: 'Chair Exercise', defaultMins: 15, defaultSteps: 300, defaultKcal: 55 },
    { name: 'Grocery Stroll', defaultMins: 25, defaultSteps: 1400, defaultKcal: 75 }
  ];

  const handleSelectQuick = (item) => {
    setActivityType(item.name);
    setDurationMins(item.defaultMins);
    setStepsCount(item.defaultSteps);
    setCaloriesBurn(item.defaultKcal);
  };

  const handleDurationChange = (val) => {
    const mins = Number(val);
    setDurationMins(mins);
    // Dynamic estimate
    setStepsCount(Math.round(mins * 75));
    setCaloriesBurn(Math.round(mins * 4.2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    logCustomActivity(activityType, durationMins, stepsCount, caloriesBurn);
    closeModal();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="activity-modal-title">
      <div className="modal-content activity-modal-box fade-in">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="activity-icon-badge">
              <PlusCircle size={24} className="text-primary-600" />
            </div>
            <div>
              <h3 id="activity-modal-title" className="font-extrabold text-xl text-primary-900">
                Log Movement / Activity
              </h3>
              <p className="text-xs text-muted">Record daily strolls, gardening, and light exercises</p>
            </div>
          </div>
          <button onClick={closeModal} className="modal-close-btn" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="quick-presets-section mb-4">
          <span className="text-xs font-bold text-muted block mb-2 uppercase tracking-wider">Quick Suggestions:</span>
          <div className="flex flex-wrap gap-2">
            {quickActivities.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuick(item)}
                className={`btn btn-secondary quick-activity-btn ${activityType === item.name ? 'active' : ''}`}
              >
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="activity-form-fields flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-muted block mb-1">Activity Name</label>
            <input
              type="text"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="activity-input-control"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-muted block mb-1">Duration (min)</label>
              <input
                type="number"
                value={durationMins}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="activity-input-control"
                min="1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted block mb-1">Steps Added</label>
              <input
                type="number"
                value={stepsCount}
                onChange={(e) => setStepsCount(Number(e.target.value))}
                className="activity-input-control"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted block mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={caloriesBurn}
                onChange={(e) => setCaloriesBurn(Number(e.target.value))}
                className="activity-input-control"
                min="0"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4">
            <Check size={18} />
            <span>Add to Today's Movement</span>
          </button>
        </form>
      </div>

      <style>{`
        .activity-modal-box {
          max-width: 500px;
        }

        .activity-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background-color: var(--primary-100);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-activity-btn {
          font-size: var(--text-xs);
          padding: 0.4rem 0.85rem;
          min-height: 38px;
        }

        .quick-activity-btn.active {
          background-color: var(--primary-500);
          color: white;
          border-color: var(--primary-500);
        }

        .activity-input-control {
          width: 100%;
          min-height: 44px;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border-medium);
          font-family: inherit;
          font-size: var(--text-base);
          font-weight: 600;
          background-color: var(--bg-surface);
          color: var(--text-primary);
        }

        .activity-input-control:focus {
          outline: none;
          border-color: var(--primary-500);
        }
      `}</style>
    </div>
  );
};
