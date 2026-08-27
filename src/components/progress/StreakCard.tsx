import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { Flame, Trophy, Check, Star } from 'lucide-react';

export const StreakCard: React.FC = () => {
  const { streakData, dailyGoalStatus } = useWellness();

  return (
    <section aria-labelledby="streak-heading" className="wellness-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-notice-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-notice)'
              }}
            >
              <Flame size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 id="streak-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                Your Wellness Streak
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Consistent daily self-care habit tracker
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'var(--color-warning-bg)',
              color: 'var(--color-warning)',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700
            }}
          >
            <Trophy size={14} />
            <span>Best: {streakData.bestStreak} Days</span>
          </div>
        </div>

        {/* Big Streak Counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1.25rem',
            backgroundColor: 'var(--color-bg-card-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            marginBottom: '1.25rem'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(234, 88, 12, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-notice)'
            }}
          >
            <Flame size={32} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {streakData.currentStreak}
              </span>
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-notice)' }}>
                Day Streak 🔥
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {dailyGoalStatus.allCompleted
                ? "Today's self-care goals completed! Streak sustained."
                : 'Keep completing water, movement, or meals to sustain your streak today.'}
            </p>
          </div>
        </div>

        {/* Weekly Calendar Dots (Mon - Sun) */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
            Weekly Activity Log (Mon - Sun):
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.35rem',
              textAlign: 'center'
            }}
          >
            {streakData.weeklyDays.map((d, index) => {
              const isCompleted = d.completed || (d.isToday && dailyGoalStatus.waterCompleted);

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600, color: d.isToday ? 'var(--color-primary)' : 'var(--color-text-light)' }}>
                    {d.day}
                  </span>
                  <div
                    role="img"
                    aria-label={`${d.day}: ${isCompleted ? 'Completed' : 'Pending'}`}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted
                        ? 'var(--color-healthy-bg)'
                        : d.isToday
                        ? 'var(--color-primary-light)'
                        : 'var(--color-bg-card-subtle)',
                      border: `2px solid ${
                        isCompleted
                          ? 'var(--color-healthy)'
                          : d.isToday
                          ? 'var(--color-primary)'
                          : 'var(--color-border)'
                      }`,
                      color: isCompleted ? 'var(--color-healthy)' : 'var(--color-text-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '11px'
                    }}
                  >
                    {isCompleted ? <Check size={16} /> : d.isToday ? 'Today' : '•'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '11px',
          color: 'var(--color-text-muted)'
        }}
      >
        <Star size={14} color="var(--color-warning)" style={{ flexShrink: 0 }} />
        <span>Consistency rewards your body through steady rhythm.</span>
      </div>
    </section>
  );
};
