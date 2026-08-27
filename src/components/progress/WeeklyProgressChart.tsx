import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { BarChart3, Droplet, Activity, CheckCircle2, Table } from 'lucide-react';

export const WeeklyProgressChart: React.FC = () => {
  const { weeklyProgress } = useWellness();
  const [viewMetric, setViewMetric] = useState<'water' | 'activity' | 'goals'>('water');
  const [showTable, setShowTable] = useState<boolean>(false);

  const maxWater = 3000;
  const maxActivity = 40;

  return (
    <section aria-labelledby="weekly-chart-heading" className="wellness-card" style={{ width: '100%' }}>
      {/* Header with Metric Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}
          >
            <BarChart3 size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 id="weekly-chart-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Weekly Wellness Progress
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              7-Day consistency across hydration, movement, and nutrition
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div
            role="tablist"
            aria-label="Chart view metric"
            style={{
              display: 'flex',
              gap: '0.25rem',
              backgroundColor: 'var(--color-bg-card-subtle)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}
          >
            <button
              role="tab"
              aria-selected={viewMetric === 'water'}
              onClick={() => setViewMetric('water')}
              className={viewMetric === 'water' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.35rem 0.65rem', fontSize: 'var(--text-xs)', minHeight: '32px' }}
            >
              <Droplet size={12} />
              <span>Water</span>
            </button>
            <button
              role="tab"
              aria-selected={viewMetric === 'activity'}
              onClick={() => setViewMetric('activity')}
              className={viewMetric === 'activity' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.35rem 0.65rem', fontSize: 'var(--text-xs)', minHeight: '32px' }}
            >
              <Activity size={12} />
              <span>Activity</span>
            </button>
            <button
              role="tab"
              aria-selected={viewMetric === 'goals'}
              onClick={() => setViewMetric('goals')}
              className={viewMetric === 'goals' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.35rem 0.65rem', fontSize: 'var(--text-xs)', minHeight: '32px' }}
            >
              <CheckCircle2 size={12} />
              <span>Goals</span>
            </button>
          </div>

          <button
            onClick={() => setShowTable(!showTable)}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.65rem', fontSize: 'var(--text-xs)', minHeight: '32px' }}
            aria-label="Toggle accessible tabular data table view"
          >
            <Table size={14} />
            <span>{showTable ? 'View Chart' : 'View Table'}</span>
          </button>
        </div>
      </div>

      {showTable ? (
        /* Accessible Table View */
        <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'var(--text-xs)',
              textAlign: 'left'
            }}
          >
            <caption className="sr-only">Weekly Wellness Progress Data Table</caption>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: 'var(--color-bg-card-subtle)' }}>
                <th style={{ padding: '0.6rem 0.75rem' }}>Day</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>Water Intake</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>Activity Minutes</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>Goals Completed</th>
              </tr>
            </thead>
            <tbody>
              {weeklyProgress.map((row) => (
                <tr key={row.dayName} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: row.isToday ? 700 : 500, color: row.isToday ? 'var(--color-primary)' : 'inherit' }}>
                    {row.dayName} {row.isToday && '(Today)'}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>{row.waterMl} ml / {row.waterTargetMl} ml</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>{row.activityMin} min / {row.activityTargetMin} min</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>{row.goalsAchievedCount} / 3 goals</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Visual High-Contrast Accessible Bar Chart */
        <div style={{ margin: '1.5rem 0' }}>
          <div
            role="region"
            aria-label={`Weekly ${viewMetric} bar chart`}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.75rem',
              alignItems: 'flex-end',
              height: '180px',
              padding: '1rem 0.5rem 0',
              borderBottom: '2px solid var(--color-border)'
            }}
          >
            {weeklyProgress.map((day) => {
              let heightPercent = 0;
              let labelText = '';
              let barColor = 'var(--color-primary)';

              if (viewMetric === 'water') {
                heightPercent = Math.min(100, Math.round((day.waterMl / maxWater) * 100));
                labelText = `${day.waterMl} ml`;
                barColor = 'var(--color-water)';
              } else if (viewMetric === 'activity') {
                heightPercent = Math.min(100, Math.round((day.activityMin / maxActivity) * 100));
                labelText = `${day.activityMin} min`;
                barColor = 'var(--color-healthy)';
              } else {
                heightPercent = Math.min(100, Math.round((day.goalsAchievedCount / 3) * 100));
                labelText = `${day.goalsAchievedCount}/3`;
                barColor = 'var(--color-secondary)';
              }


              return (
                <div
                  key={day.dayName}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    gap: '0.35rem'
                  }}
                >
                  {/* Tooltip text value above bar */}
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    {labelText}
                  </span>

                  {/* Accessible Bar with Pattern */}
                  <div
                    role="img"
                    aria-label={`${day.dayName}: ${labelText}`}
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${Math.max(8, heightPercent)}%`,
                      backgroundColor: barColor,
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      transition: 'height 0.5s ease',
                      border: day.isToday ? '2px solid var(--color-text-main)' : 'none',
                      boxShadow: day.isToday ? '0 0 8px rgba(0,0,0,0.15)' : 'none'
                    }}
                  />

                  {/* Day Label below axis */}
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: day.isToday ? 800 : 600,
                      color: day.isToday ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      marginTop: '4px'
                    }}
                  >
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '11px', color: 'var(--color-text-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>Solid bars represent logged daily values. Outlined bar indicates Today.</span>
            <span>Target base: {viewMetric === 'water' ? '2.2L / day' : viewMetric === 'activity' ? '20 min / day' : '3 goals / day'}</span>
          </div>
        </div>
      )}
    </section>
  );
};
