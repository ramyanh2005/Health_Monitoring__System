import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { AccessibleProgressBar } from '../common/AccessibleProgressBar';
import { Droplet, Activity, Utensils, CheckCircle, Sparkles, Plus, Play } from 'lucide-react';

export const DailyGoals: React.FC = () => {
  const {
    dailyGoalStatus,
    userProfile,
    addWater,
    logActivityMinutes
  } = useWellness();

  const waterPercent = Math.min(100, Math.round((dailyGoalStatus.waterCurrentMl / dailyGoalStatus.waterTargetMl) * 100));
  const activityPercent = Math.min(100, Math.round((dailyGoalStatus.activityCurrentMin / dailyGoalStatus.activityTargetMin) * 100));


  const totalGoalsCompleted =
    (dailyGoalStatus.waterCompleted ? 1 : 0) +
    (dailyGoalStatus.activityCompleted ? 1 : 0) +
    (dailyGoalStatus.nutritionCompleted ? 1 : 0);

  return (
    <section aria-labelledby="daily-goals-heading" style={{ width: '100%' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 id="daily-goals-heading" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Today's Wellness Goals
            </h2>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: totalGoalsCompleted === 3 ? 'var(--color-healthy-bg)' : 'var(--color-bg-card-subtle)',
                color: totalGoalsCompleted === 3 ? 'var(--color-healthy)' : 'var(--color-text-muted)',
                border: '1px solid var(--color-border)'
              }}
            >
              {totalGoalsCompleted} / 3 Completed
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Personalized low-impact targets calibrated for your daily vitality
          </p>
        </div>

        {totalGoalsCompleted === 3 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-healthy)',
              fontWeight: 700,
              fontSize: 'var(--text-xs)',
              backgroundColor: 'var(--color-healthy-bg)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-healthy)'
            }}
          >
            <Sparkles size={16} />
            <span>All Daily Targets Achieved! 🔥</span>
          </div>
        )}
      </div>

      {/* 3 Large Accessible Goal Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* Goal 1: Hydration */}
        <div className="wellness-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-water-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-water)'
                  }}
                >
                  <Droplet size={20} aria-hidden="true" />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    Hydration Target
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                    Steady cellular hydration
                  </span>
                </div>
              </div>

              {dailyGoalStatus.waterCompleted ? (
                <span style={{ color: 'var(--color-healthy)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                  <CheckCircle size={16} /> Completed
                </span>
              ) : (
                <span style={{ color: 'var(--color-water)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                  {waterPercent}%
                </span>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <AccessibleProgressBar
                value={dailyGoalStatus.waterCurrentMl}
                max={dailyGoalStatus.waterTargetMl}
                label="Water Consumed"
                unit="ml"
                color="var(--color-water)"
                height={10}
              />
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
              Drink steady amounts throughout the day to support joint lubrication and metabolic comfort.
            </p>
          </div>

          <div
            style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '0.5rem'
            }}
          >
            <button
              onClick={() => addWater(250)}
              className="btn-secondary"
              style={{ flex: 1, padding: '0.5rem', fontSize: 'var(--text-xs)', minHeight: '40px' }}
              aria-label="Quick log 250ml water"
            >
              <Plus size={14} color="var(--color-water)" />
              <span>+250 ml</span>
            </button>
            <button
              onClick={() => addWater(500)}
              className="btn-secondary"
              style={{ flex: 1, padding: '0.5rem', fontSize: 'var(--text-xs)', minHeight: '40px' }}
              aria-label="Quick log 500ml water"
            >
              <Plus size={14} color="var(--color-water)" />
              <span>+500 ml</span>
            </button>
          </div>
        </div>

        {/* Goal 2: Adaptive Activity Goal */}
        <div className="wellness-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-healthy-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-healthy)'
                  }}
                >
                  <Activity size={20} aria-hidden="true" />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    Movement & Mobility
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                    Low-impact gentle activity
                  </span>
                </div>
              </div>

              {dailyGoalStatus.activityCompleted ? (
                <span style={{ color: 'var(--color-healthy)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                  <CheckCircle size={16} /> Completed
                </span>
              ) : (
                <span style={{ color: 'var(--color-healthy)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                  {activityPercent}%
                </span>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <AccessibleProgressBar
                value={dailyGoalStatus.activityCurrentMin}
                max={dailyGoalStatus.activityTargetMin}
                label="Movement Completed"
                unit="min"
                color="var(--color-healthy)"
                height={10}
              />
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
              Focus for {userProfile.mobilityLevel}: Seated shoulder mobility, diaphragmatic breathing, and joint release.
            </p>
          </div>

          <div
            style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '0.5rem'
            }}
          >
            <button
              onClick={() => logActivityMinutes(5, 'Quick Seated Stretch')}
              className="btn-secondary"
              style={{ flex: 1, padding: '0.5rem', fontSize: 'var(--text-xs)', minHeight: '40px' }}
              aria-label="Log 5 minutes gentle movement"
            >
              <Plus size={14} color="var(--color-healthy)" />
              <span>+5 min</span>
            </button>
            <a
              href="#exercises-section"
              className="btn-primary"
              style={{ flex: 1.2, padding: '0.5rem', fontSize: 'var(--text-xs)', textDecoration: 'none', minHeight: '40px' }}
            >
              <Play size={14} />
              <span>Start Routine</span>
            </a>
          </div>
        </div>

        {/* Goal 3: Wholesome Nutrition */}
        <div className="wellness-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-notice-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-notice)'
                  }}
                >
                  <Utensils size={20} aria-hidden="true" />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    Wholesome Nutrition
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                    {userProfile.dietaryPreference} nourishment
                  </span>
                </div>
              </div>

              {dailyGoalStatus.nutritionCompleted ? (
                <span style={{ color: 'var(--color-healthy)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                  <CheckCircle size={16} /> Completed
                </span>
              ) : (
                <span style={{ color: 'var(--color-notice)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                  {dailyGoalStatus.nutritionCurrentCount} / {dailyGoalStatus.nutritionTargetCount} Meals
                </span>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <AccessibleProgressBar
                value={dailyGoalStatus.nutritionCurrentCount}
                max={dailyGoalStatus.nutritionTargetCount}
                label="Nourishing Meals"
                unit="meals"
                color="var(--color-notice)"
                height={10}
              />
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
              Nourish your body with adequate protein, wholesome fiber, and balanced seasonal produce.
            </p>
          </div>

          <div
            style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex'
            }}
          >
            <a
              href="#meals-section"
              className="btn-secondary"
              style={{ width: '100%', padding: '0.5rem', fontSize: 'var(--text-xs)', textDecoration: 'none', minHeight: '40px' }}
            >
              <Utensils size={14} color="var(--color-notice)" />
              <span>Explore Today's Meal Plan</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
