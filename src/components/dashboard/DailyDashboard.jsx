import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressRing } from '../common/ProgressRing';
import { 
  Footprints, 
  Droplets, 
  Flame, 
  PlusCircle, 
  Pill, 
  Heart, 
  Utensils, 
  AlertTriangle, 
  ChevronRight, 
  Play, 
  CheckCircle2,
  Sparkles,
  Award,
  ArrowUpRight
} from 'lucide-react';

export const DailyDashboard = () => {
  const { 
    user, 
    dailyGoals, 
    medications, 
    exercises, 
    meals,
    vitals, 
    setActiveTab, 
    setActiveModal,
    openExerciseCoach,
    openRecipeModal,
    addWater
  } = useApp();

  const stepsRemaining = Math.max(dailyGoals.stepsGoal - dailyGoals.stepsCurrent, 0);
  const caloriesRemaining = Math.max(dailyGoals.caloriesBurnGoal - dailyGoals.caloriesBurnCurrent, 0);
  const waterRemaining = Math.max(dailyGoals.waterGlassesGoal - dailyGoals.waterGlassesCurrent, 0);

  // Status message based on completion
  const getEncouragingMessage = () => {
    if (stepsRemaining === 0 && waterRemaining === 0) {
      return "🌟 Outstanding achievement! You've reached all your primary daily wellness goals!";
    }
    if (dailyGoals.stepsCurrent >= 4000) {
      return "🌿 You are doing wonderful today! A gentle afternoon walk will easily finish your daily step target.";
    }
    return "☀️ Good day for light movement! Keep sipping fresh water and enjoy a relaxing mobility stretch.";
  };

  const featuredExercise = exercises.find(e => e.isSuggested) || exercises[0];
  const recentMeal = meals[0];
  const pendingMeds = medications.filter(m => !m.taken);

  return (
    <div className="dashboard-container fade-in">
      {/* ======================================================================
          1. Today's Encouragement & Summary Hero Card (DASH-1, DASH-2)
          ====================================================================== */}
      <section className="card card-accent-green dashboard-hero-card" aria-label="Today's Wellness Summary">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={18} className="text-primary-600" />
            <span>Today's Wellness Snapshot</span>
          </div>
          <h3 className="hero-heading">
            {getEncouragingMessage()}
          </h3>
          <p className="hero-subtext">
            Logged <strong>{dailyGoals.waterGlassesCurrent} glasses</strong> of water, <strong>{dailyGoals.stepsCurrent.toLocaleString()} steps</strong>, and <strong>{dailyGoals.activeMinutesCurrent} active minutes</strong> today.
          </p>

          <div className="hero-actions-row">
            {/* Quick Log Activity Button (DASH-5) */}
            <button
              onClick={() => setActiveModal('activityLog')}
              className="btn btn-primary"
              id="dash-btn-log-activity"
            >
              <PlusCircle size={20} />
              <span>Log Movement / Activity</span>
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className="btn btn-secondary"
            >
              <span>View Weekly Insights</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Highlighted Calories Burned Callout Card (DASH-3) */}
        <div className="calories-callout-card">
          <div className="callout-header">
            <div className="callout-icon-box">
              <Flame size={24} className="text-accent-coral" />
            </div>
            <div>
              <span className="callout-label">Calories Burned</span>
              <h4 className="callout-value">{dailyGoals.caloriesBurnCurrent} <span className="callout-unit">kcal</span></h4>
            </div>
          </div>
          <div className="callout-progress-bar-bg">
            <div 
              className="callout-progress-bar-fill" 
              style={{ width: `${Math.min((dailyGoals.caloriesBurnCurrent / dailyGoals.caloriesBurnGoal) * 100, 100)}%` }}
            />
          </div>
          <p className="callout-footer-text">
            {caloriesRemaining > 0 ? (
              <><strong>{caloriesRemaining} kcal</strong> left to reach {dailyGoals.caloriesBurnGoal} kcal goal</>
            ) : (
              <>🎉 Daily calorie burn goal achieved!</>
            )}
          </p>
        </div>
      </section>

      {/* ======================================================================
          2. Three Key Daily Progress Rings (DASH-4)
          ====================================================================== */}
      <section className="section-block" aria-label="Daily Progress Metrics">
        <div className="section-header">
          <div>
            <h3 className="section-title">Today's Core Goals</h3>
            <p className="section-subtitle">Real-time daily progress towards your healthy living targets</p>
          </div>
        </div>

        <div className="grid-metrics-3">
          {/* Steps Ring */}
          <div className="card metric-card">
            <ProgressRing
              value={dailyGoals.stepsCurrent}
              max={dailyGoals.stepsGoal}
              size={130}
              strokeWidth={11}
              color="#2D6A4F"
              secondaryColor="#D8EEE2"
              icon={Footprints}
              label="Daily Steps"
              unit="steps"
              sublabel={`${stepsRemaining > 0 ? `${stepsRemaining.toLocaleString()} remaining` : 'Target reached!'}`}
            />
          </div>

          {/* Water Intake Ring with 1-Tap Quick Add */}
          <div className="card metric-card water-card">
            <ProgressRing
              value={dailyGoals.waterGlassesCurrent}
              max={dailyGoals.waterGlassesGoal}
              size={130}
              strokeWidth={11}
              color="#3A86FF"
              secondaryColor="#EDF4FF"
              icon={Droplets}
              label="Hydration"
              unit="glasses"
              sublabel={`${waterRemaining > 0 ? `${waterRemaining} glasses to goal` : 'Hydrated!'}`}
            />
            <button
              onClick={addWater}
              className="btn btn-secondary btn-sm mt-3 w-full"
              aria-label="Add one glass of water"
            >
              <PlusCircle size={16} className="text-accent-blue" />
              <span>+1 Glass Water</span>
            </button>
          </div>

          {/* Calorie Burn Ring */}
          <div className="card metric-card">
            <ProgressRing
              value={dailyGoals.caloriesBurnCurrent}
              max={dailyGoals.caloriesBurnGoal}
              size={130}
              strokeWidth={11}
              color="#E76F51"
              secondaryColor="#FEEBE7"
              icon={Flame}
              label="Energy Burn"
              unit="kcal"
              sublabel={`${caloriesRemaining > 0 ? `${caloriesRemaining} kcal to go` : 'Goal finished!'}`}
            />
          </div>
        </div>
      </section>

      {/* ======================================================================
          3. Quick Actions Row (DASH-6, DASH-7)
          ====================================================================== */}
      <section className="section-block" aria-label="Quick Actions">
        <div className="section-header">
          <h3 className="section-title">Quick Actions</h3>
          <span className="text-sm font-semibold text-muted">1-Tap Essential Access</span>
        </div>

        <div className="grid-quick-actions">
          {/* Medications Action */}
          <button
            onClick={() => setActiveModal('medication')}
            className="card card-interactive action-box action-box-meds"
            id="dash-btn-medications"
          >
            <div className="action-icon-circle med-icon-bg">
              <Pill size={28} />
            </div>
            <div className="action-text-box">
              <h4 className="action-title">Medications</h4>
              <p className="action-desc">
                {pendingMeds.length > 0 ? `${pendingMeds.length} pending doses today` : 'All taken for today'}
              </p>
            </div>
            {pendingMeds.length > 0 && <span className="action-alert-badge">{pendingMeds.length}</span>}
          </button>

          {/* Heart Rate / Vitals Action */}
          <button
            onClick={() => setActiveModal('vitals')}
            className="card card-interactive action-box action-box-vitals"
            id="dash-btn-vitals"
          >
            <div className="action-icon-circle vitals-icon-bg">
              <Heart size={28} />
            </div>
            <div className="action-text-box">
              <h4 className="action-title">Heart Rate & Vitals</h4>
              <p className="action-desc">{vitals.heartRate} bpm • {vitals.bloodPressure} mmHg</p>
            </div>
          </button>

          {/* Diet Log Action */}
          <button
            onClick={() => setActiveTab('meals')}
            className="card card-interactive action-box action-box-diet"
            id="dash-btn-diet"
          >
            <div className="action-icon-circle diet-icon-bg">
              <Utensils size={28} />
            </div>
            <div className="action-text-box">
              <h4 className="action-title">Diet & Plate Log</h4>
              <p className="action-desc">{meals.length} meals logged today</p>
            </div>
          </button>

          {/* Emergency Safety Action (DASH-7: Highly prominent & distinct red) */}
          <button
            onClick={() => setActiveModal('emergency')}
            className="card card-interactive action-box action-box-emergency pulse-emergency-ring"
            id="dash-btn-emergency"
            aria-label="Emergency SOS Quick Action"
          >
            <div className="action-icon-circle emergency-icon-bg">
              <AlertTriangle size={30} />
            </div>
            <div className="action-text-box">
              <h4 className="action-title text-danger">Emergency SOS</h4>
              <p className="action-desc font-semibold">Immediate 1-Tap Alert</p>
            </div>
          </button>
        </div>
      </section>

      {/* ======================================================================
          4. Suggested Exercise of the Day & Recent Meal Highlights
          ====================================================================== */}
      <div className="grid-highlights-2">
        {/* Suggested Exercise Card */}
        <section className="card highlight-card" aria-label="Suggested Exercise">
          <div className="highlight-card-header">
            <div className="flex items-center gap-2">
              <span className="badge badge-green">Recommended for You</span>
            </div>
            <button 
              onClick={() => setActiveTab('exercises')}
              className="text-sm font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1"
            >
              See All <ChevronRight size={16} />
            </button>
          </div>

          <div className="featured-exercise-body">
            <img 
              src={featuredExercise.image} 
              alt={featuredExercise.title}
              className="featured-exercise-img"
            />
            <div className="featured-exercise-info">
              <h4 className="font-bold text-lg text-primary-900 leading-tight">
                {featuredExercise.title}
              </h4>
              <p className="text-sm text-secondary line-clamp-2 mt-1">
                {featuredExercise.benefits}
              </p>
              <div className="exercise-meta-tags mt-3">
                <span className="badge badge-amber">{featuredExercise.duration} mins</span>
                <span className="badge badge-teal">{featuredExercise.difficulty}</span>
                <span className="text-xs font-bold text-muted">~{featuredExercise.caloriesBurn} kcal</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-light flex justify-between items-center">
            <span className="text-xs font-semibold text-muted">Senior Safe • Low Impact</span>
            <button
              onClick={() => openExerciseCoach(featuredExercise)}
              className="btn btn-primary btn-sm"
            >
              <Play size={16} />
              <span>Start Session</span>
            </button>
          </div>
        </section>

        {/* Recent Meal & Hydration Status Card */}
        <section className="card highlight-card" aria-label="Recent Meal">
          <div className="highlight-card-header">
            <div className="flex items-center gap-2">
              <span className="badge badge-coral">Latest Logged Meal</span>
            </div>
            <button 
              onClick={() => setActiveTab('meals')}
              className="text-sm font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1"
            >
              Meal Tracker <ChevronRight size={16} />
            </button>
          </div>

          {recentMeal ? (
            <div className="featured-exercise-body">
              <img 
                src={recentMeal.image} 
                alt={recentMeal.title}
                className="featured-exercise-img"
              />
              <div className="featured-exercise-info">
                <div className="flex items-center justify-between">
                  <span className="badge badge-amber">{recentMeal.type}</span>
                  <span className="text-xs font-semibold text-muted">{recentMeal.time}</span>
                </div>
                <h4 className="font-bold text-lg text-primary-900 leading-tight mt-1">
                  {recentMeal.title}
                </h4>
                <p className="text-sm text-secondary line-clamp-2 mt-1">
                  {recentMeal.description}
                </p>
                <div className="exercise-meta-tags mt-3">
                  <span className="badge badge-green font-bold">{recentMeal.calories} kcal</span>
                  <span className="text-xs font-semibold text-muted">Protein: {recentMeal.protein}g</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">No meals logged yet today.</p>
          )}

          <div className="mt-4 pt-3 border-t border-light flex justify-between items-center">
            <span className="text-xs font-semibold text-muted">Wholesome Nutrition</span>
            {recentMeal && (
              <button
                onClick={() => openRecipeModal(recentMeal)}
                className="btn btn-secondary btn-sm"
              >
                <span>View Recipe & Tips</span>
              </button>
            )}
          </div>
        </section>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Hero Summary Card */
        .dashboard-hero-card {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.75rem;
          padding: 2rem;
        }

        @media (min-width: 900px) {
          .dashboard-hero-card {
            grid-template-columns: 1.6fr 1fr;
            align-items: center;
          }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.85rem;
          background-color: var(--primary-100);
          color: var(--primary-800);
          font-weight: 700;
          font-size: var(--text-xs);
          border-radius: var(--radius-full);
          margin-bottom: 0.75rem;
        }

        .hero-heading {
          font-size: var(--text-2xl);
          color: var(--primary-900);
          font-weight: 800;
          line-height: 1.25;
          margin-bottom: 0.6rem;
        }

        .hero-subtext {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .hero-actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
        }

        /* Calories Callout Box */
        .calories-callout-card {
          background-color: var(--bg-surface);
          border: 1.5px solid #fbd3cb;
          border-radius: var(--radius-md);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .callout-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .callout-icon-box {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background-color: var(--accent-coral-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .callout-label {
          font-size: var(--text-xs);
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .callout-value {
          font-size: var(--text-2xl);
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .callout-unit {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--accent-coral);
        }

        .callout-progress-bar-bg {
          height: 10px;
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 0.65rem;
        }

        .callout-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-amber), var(--accent-coral));
          border-radius: var(--radius-full);
          transition: width 1s ease-in-out;
        }

        .callout-footer-text {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }

        /* Section Layouts */
        .section-block {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding-bottom: 0.25rem;
        }

        .section-title {
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--text-primary);
        }

        .section-subtitle {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }

        /* 3-Column Metrics Grid */
        .grid-metrics-3 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 640px) {
          .grid-metrics-3 {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .metric-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.75rem 1.25rem;
        }

        .water-card {
          justify-content: space-between;
        }

        .btn-sm {
          min-height: 40px;
          padding: 0.5rem 1rem;
          font-size: var(--text-sm);
        }

        /* Quick Actions Grid */
        .grid-quick-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 600px) {
          .grid-quick-actions {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1100px) {
          .grid-quick-actions {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .action-box {
          display: flex;
          align-items: center;
          gap: 1.1rem;
          padding: 1.25rem;
          text-align: left;
          position: relative;
        }

        .action-icon-circle {
          width: 56px;
          height: 56px;
          min-width: 56px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--trans-fast);
        }

        .action-box:hover .action-icon-circle {
          transform: scale(1.08);
        }

        .med-icon-bg {
          background-color: var(--accent-purple-light);
          color: var(--accent-purple);
        }

        .vitals-icon-bg {
          background-color: var(--accent-coral-light);
          color: var(--accent-coral);
        }

        .diet-icon-bg {
          background-color: var(--primary-100);
          color: var(--primary-700);
        }

        .emergency-icon-bg {
          background-color: var(--danger-light);
          color: var(--danger-main);
        }

        .action-text-box {
          flex: 1;
        }

        .action-title {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .action-desc {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 0.2rem;
        }

        .action-box-emergency {
          border: 2px solid var(--danger-border);
          background: linear-gradient(145deg, var(--danger-light), var(--bg-surface));
        }

        .text-danger {
          color: var(--danger-main);
        }

        .action-alert-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: var(--accent-amber);
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 2-Column Highlights Grid */
        .grid-highlights-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 860px) {
          .grid-highlights-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .highlight-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .featured-exercise-body {
          display: flex;
          gap: 1.25rem;
        }

        .featured-exercise-img {
          width: 100px;
          height: 100px;
          min-width: 100px;
          border-radius: var(--radius-md);
          object-fit: cover;
        }

        .featured-exercise-info {
          flex: 1;
        }

        .exercise-meta-tags {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};
