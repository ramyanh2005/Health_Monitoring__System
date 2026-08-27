import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressRing } from '../common/ProgressRing';
import { 
  Timer, 
  Play, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  Activity, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const SuggestedExercises = () => {
  const { 
    exercises, 
    dailyGoals, 
    setActiveTab, 
    openExerciseCoach 
  } = useApp();

  const suggestedList = exercises.filter(e => e.isSuggested);
  const minutesRemaining = Math.max(dailyGoals.activeMinutesGoal - dailyGoals.activeMinutesCurrent, 0);

  return (
    <div className="exercises-container fade-in">
      {/* Header Row */}
      <div className="exercises-header-row">
        <div>
          <h2 className="page-title">Suggested Exercises</h2>
          <p className="page-subtitle">Safe, low-impact routines tailored for mobility, joint comfort, and balance</p>
        </div>
        <button
          onClick={() => setActiveTab('catalog')}
          className="btn btn-secondary"
          id="ex-btn-view-catalog"
        >
          <span>View All Exercises</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ======================================================================
          1. Daily Goal Progress Ring Banner (EX-1)
          ====================================================================== */}
      <section className="card card-accent-green exercise-goal-banner" aria-label="Daily Exercise Target">
        <div className="goal-banner-ring-col">
          <ProgressRing
            value={dailyGoals.activeMinutesCurrent}
            max={dailyGoals.activeMinutesGoal}
            size={135}
            strokeWidth={12}
            color="#2D6A4F"
            secondaryColor="#d8eee2"
            icon={Timer}
            label="Active Time"
            unit="mins"
            sublabel={`${minutesRemaining > 0 ? `${minutesRemaining} mins to goal` : 'Goal reached!'}`}
          />
        </div>

        <div className="goal-banner-text-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-green">
              <Sparkles size={14} /> Senior Fitness Plan
            </span>
          </div>
          <h3 className="goal-banner-title">
            {minutesRemaining === 0 
              ? "🎉 Outstanding! You completed your 30-minute daily activity target!" 
              : `Complete ${minutesRemaining} more minutes of gentle exercise today`}
          </h3>
          <p className="goal-banner-desc">
            Even 10-15 minutes of seated movement or light stretching stimulates circulation, reduces fall risks, and lubricates joint cartilage.
          </p>

          <div className="goal-stats-pills-row">
            <div className="stat-pill">
              <Flame size={16} className="text-accent-coral" />
              <span><strong>{dailyGoals.caloriesBurnCurrent} kcal</strong> burned</span>
            </div>
            <div className="stat-pill">
              <ShieldCheck size={16} className="text-primary-600" />
              <span>Certified Joint-Safe</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          2. Curated Suggested Activities Cards (EX-2, EX-3, EX-4)
          ====================================================================== */}
      <section className="suggested-list-section" aria-label="Curated Daily Exercises">
        <div className="section-header">
          <div>
            <h3 className="section-title">Recommended for You Today</h3>
            <p className="section-subtitle">Specially selected based on your mobility and energy profile</p>
          </div>
          <span className="text-sm font-semibold text-muted">{suggestedList.length} Routines</span>
        </div>

        <div className="grid-suggested-cards">
          {suggestedList.map((exercise) => {
            const isGentle = exercise.difficulty.toLowerCase().includes('gentle') || exercise.difficultyLevel === 'easy';
            return (
              <div key={exercise.id} className="card exercise-card">
                <div className="exercise-card-image-wrap">
                  <img 
                    src={exercise.image} 
                    alt={exercise.title} 
                    className="exercise-card-img" 
                  />
                  <div className="exercise-badges-overlay">
                    <span className="badge badge-amber">{exercise.duration} mins</span>
                    {/* EX-4: Text labels paired with accessible colors */}
                    <span className={`badge ${isGentle ? 'badge-teal' : 'badge-coral'}`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>

                <div className="exercise-card-body">
                  <span className="exercise-category-tag">{exercise.category}</span>
                  <h4 className="exercise-title-heading">{exercise.title}</h4>
                  <p className="exercise-benefits-text">{exercise.benefits}</p>

                  <div className="exercise-safety-box">
                    <ShieldCheck size={16} className="text-primary-600 shrink-0" />
                    <span className="text-xs text-secondary font-medium">{exercise.safetyTip}</span>
                  </div>

                  <div className="exercise-card-footer">
                    <span className="exercise-kcal-estimate">
                      <Flame size={14} className="text-accent-coral inline mr-1" />
                      ~{exercise.caloriesBurn} kcal
                    </span>

                    {/* EX-6: Start Exercise CTA with Guided Timer Modal */}
                    <button
                      onClick={() => openExerciseCoach(exercise)}
                      className="btn btn-primary btn-sm exercise-start-btn"
                      aria-label={`Start ${exercise.title}`}
                    >
                      <Play size={16} />
                      <span>Start Exercise</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================================
          3. "View More Exercises" Extended Catalog Teaser (EX-5)
          ====================================================================== */}
      <section className="card card-accent-amber catalog-teaser-banner">
        <div className="teaser-content">
          <h4 className="teaser-heading">Looking for more variety in your routine?</h4>
          <p className="teaser-desc">
            Explore resistance band strength, indoor cardio walking, balance stability, and relaxing deep breathing in our complete exercise library.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('catalog')}
          className="btn btn-primary"
        >
          <span>Explore Extended Catalog</span>
          <ArrowRight size={18} />
        </button>
      </section>

      <style>{`
        .exercises-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .exercises-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        /* Goal Banner */
        .exercise-goal-banner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          padding: 2rem;
          align-items: center;
        }

        @media (min-width: 768px) {
          .exercise-goal-banner {
            grid-template-columns: auto 1fr;
          }
        }

        .goal-banner-ring-col {
          display: flex;
          justify-content: center;
        }

        .goal-banner-title {
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--primary-900);
          line-height: 1.3;
          margin-bottom: 0.5rem;
        }

        .goal-banner-desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
        }

        .goal-stats-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.85rem;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Suggested Cards Grid */
        .grid-suggested-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        @media (min-width: 640px) {
          .grid-suggested-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1100px) {
          .grid-suggested-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .exercise-card {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .exercise-card-image-wrap {
          position: relative;
          height: 190px;
          overflow: hidden;
        }

        .exercise-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--trans-normal);
        }

        .exercise-card:hover .exercise-card-img {
          transform: scale(1.04);
        }

        .exercise-badges-overlay {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
        }

        .exercise-card-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .exercise-category-tag {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--primary-600);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .exercise-title-heading {
          font-size: var(--text-lg);
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.25;
        }

        .exercise-benefits-text {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-top: 0.4rem;
          flex: 1;
        }

        .exercise-safety-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.85rem;
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-sm);
          margin: 1rem 0;
          border-left: 3px solid var(--primary-500);
        }

        .exercise-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-light);
        }

        .exercise-kcal-estimate {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-muted);
        }

        .exercise-start-btn {
          min-height: 42px;
          padding: 0.5rem 1.25rem;
        }

        /* Catalog Teaser */
        .catalog-teaser-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          padding: 1.75rem 2rem;
        }

        .teaser-heading {
          font-size: var(--text-lg);
          font-weight: 800;
          color: var(--text-primary);
        }

        .teaser-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-top: 0.25rem;
          max-width: 650px;
        }
      `}</style>
    </div>
  );
};
