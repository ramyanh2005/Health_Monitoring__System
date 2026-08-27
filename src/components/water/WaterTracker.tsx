import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { CircularProgress } from '../common/CircularProgress';
import { wellnessService } from '../../services/wellnessService';
import { Droplet, Plus, Sparkles, History, GlassWater, Wine, CircleDot } from 'lucide-react';

type WaterViewMode = 'glass' | 'bottle' | 'ring' | 'timeline';

export const WaterTracker: React.FC = () => {
  const { dailyGoalStatus, addWater, waterLogs } = useWellness();
  const [viewMode, setViewMode] = useState<WaterViewMode>('glass');
  const [customMl, setCustomMl] = useState<string>('');
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const currentMl = dailyGoalStatus.waterCurrentMl;
  const targetMl = dailyGoalStatus.waterTargetMl;
  const percentage = Math.round((currentMl / targetMl) * 100);
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const remainingMl = Math.max(0, targetMl - currentMl);
  const isTargetAchieved = currentMl >= targetMl;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMl, 10);
    if (!isNaN(val) && val > 0 && val <= 2000) {
      addWater(val);
      setCustomMl('');
      setShowCustom(false);
    }
  };

  return (
    <section aria-labelledby="water-tracker-title" className="wellness-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Header & Visualization Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-water-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-water)'
              }}
            >
              <Droplet size={22} aria-hidden="true" />
            </div>
            <div>
              <h2 id="water-tracker-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                Hydration Tracker
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Target: {wellnessService.formatLiters(targetMl)} daily
              </p>
            </div>
          </div>

          {/* Visual Style Selector Tabs */}
          <div
            role="tablist"
            aria-label="Water progress visualization views"
            style={{
              display: 'flex',
              gap: '0.2rem',
              backgroundColor: 'var(--color-bg-card-subtle)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}
          >
            <button
              role="tab"
              aria-selected={viewMode === 'glass'}
              onClick={() => setViewMode('glass')}
              className={viewMode === 'glass' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.3rem 0.6rem', fontSize: '11px', minHeight: '30px' }}
              title="Animated Glass View"
            >
              <GlassWater size={13} />
              <span>Glass</span>
            </button>

            <button
              role="tab"
              aria-selected={viewMode === 'bottle'}
              onClick={() => setViewMode('bottle')}
              className={viewMode === 'bottle' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.3rem 0.6rem', fontSize: '11px', minHeight: '30px' }}
              title="Animated Bottle View"
            >
              <Wine size={13} />
              <span>Bottle</span>
            </button>

            <button
              role="tab"
              aria-selected={viewMode === 'ring'}
              onClick={() => setViewMode('ring')}
              className={viewMode === 'ring' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.3rem 0.6rem', fontSize: '11px', minHeight: '30px' }}
              title="Circular Gauge View"
            >
              <CircleDot size={13} />
              <span>Ring</span>
            </button>
          </div>
        </div>

        {/* --- DYNAMIC VISUALIZATION CANVAS --- */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-card-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '1.25rem 1rem',
            margin: '0.75rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* VIEW MODE 1: ANIMATED FILLING WATER GLASS */}
          {viewMode === 'glass' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Glass Container */}
              <div
                style={{
                  width: '90px',
                  height: '160px',
                  border: '3px solid #0284c7',
                  borderTop: 'none',
                  borderRadius: '0 0 16px 16px',
                  position: 'relative',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}
              >
                {/* Measurement Tick Marks */}
                <div style={{ position: 'absolute', top: '25%', left: '4px', right: '4px', borderTop: '1px dashed rgba(2, 132, 199, 0.4)', fontSize: '8px', color: '#0369a1' }}>75%</div>
                <div style={{ position: 'absolute', top: '50%', left: '4px', right: '4px', borderTop: '1px dashed rgba(2, 132, 199, 0.4)', fontSize: '8px', color: '#0369a1' }}>50%</div>
                <div style={{ position: 'absolute', top: '75%', left: '4px', right: '4px', borderTop: '1px dashed rgba(2, 132, 199, 0.4)', fontSize: '8px', color: '#0369a1' }}>25%</div>

                {/* Animated Rising Water Liquid */}
                <div
                  style={{
                    width: '100%',
                    height: `${clampedPercentage}%`,
                    background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 60%, #0369a1 100%)',
                    transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}
                >
                  {/* Surface Wave ripple */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      left: 0,
                      right: 0,
                      height: '10px',
                      background: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '50%'
                    }}
                  />
                </div>
              </div>

              {/* Numerical Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Glass Fill Status
                </span>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-water)' }}>
                  {wellnessService.formatLiters(currentMl)}
                </div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {percentage}% of {wellnessService.formatLiters(targetMl)} Daily Target
                </span>
                <div style={{ fontSize: '11px', color: isTargetAchieved ? 'var(--color-healthy)' : 'var(--color-text-light)', fontWeight: 600, marginTop: '4px' }}>
                  {isTargetAchieved ? '🎉 Full Target Reached!' : `${wellnessService.formatLiters(remainingMl)} remaining`}
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: ANIMATED WATER BOTTLE */}
          {viewMode === 'bottle' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Bottle Graphic */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Bottle Cap */}
                <div
                  style={{
                    width: '34px',
                    height: '16px',
                    backgroundColor: '#0369a1',
                    borderRadius: '4px 4px 0 0',
                    border: '2px solid #0284c7',
                    borderBottom: 'none'
                  }}
                />
                {/* Bottle Body */}
                <div
                  style={{
                    width: '74px',
                    height: '150px',
                    border: '3px solid #0284c7',
                    borderRadius: '12px 12px 20px 20px',
                    position: 'relative',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end'
                  }}
                >
                  {/* Measurement lines */}
                  <div style={{ position: 'absolute', top: '20%', right: '4px', fontSize: '7px', color: '#0369a1', fontWeight: 700 }}>2.0L -</div>
                  <div style={{ position: 'absolute', top: '40%', right: '4px', fontSize: '7px', color: '#0369a1', fontWeight: 700 }}>1.5L -</div>
                  <div style={{ position: 'absolute', top: '60%', right: '4px', fontSize: '7px', color: '#0369a1', fontWeight: 700 }}>1.0L -</div>
                  <div style={{ position: 'absolute', top: '80%', right: '4px', fontSize: '7px', color: '#0369a1', fontWeight: 700 }}>0.5L -</div>

                  {/* Bottle Liquid */}
                  <div
                    style={{
                      width: '100%',
                      height: `${clampedPercentage}%`,
                      background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 60%, #075985 100%)',
                      transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                </div>
              </div>

              {/* Bottle Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Bottle Level Tracker
                </span>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-water)' }}>
                  {percentage}%
                </div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {currentMl} ml / {targetMl} ml
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {isTargetAchieved ? 'Goal accomplished! Superb!' : `${remainingMl} ml left to fill`}
                </span>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: PRECISION CIRCULAR RING */}
          {viewMode === 'ring' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <CircularProgress
                percentage={percentage}
                size={135}
                strokeWidth={12}
                color="var(--color-water)"
                backgroundColor="var(--color-water-light)"
                ariaLabel={`Hydration progress: ${currentMl} ml of ${targetMl} ml (${percentage}%)`}
              >
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                  {percentage}%
                </span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                  Target
                </span>
              </CircularProgress>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Consumed Today
                </span>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-water)' }}>
                  {wellnessService.formatLiters(currentMl)}
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {isTargetAchieved ? 'Target achieved!' : `Remaining: ${wellnessService.formatLiters(remainingMl)}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Goal Achievement Celebration Alert */}
        {isTargetAchieved && (
          <div
            role="status"
            style={{
              backgroundColor: 'var(--color-healthy-bg)',
              border: '1px solid var(--color-healthy)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-healthy)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              marginBottom: '1rem',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>Great! You've reached today's hydration goal 🎉</span>
          </div>
        )}

        {/* Toggleable Drink History */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '11px', minHeight: 'auto' }}
          >
            <History size={12} />
            <span>{showHistory ? 'Hide Drink Log' : "View Today's Log"}</span>
          </button>
        </div>

        {showHistory && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '0.75rem',
              marginBottom: '1rem',
              maxHeight: '120px',
              overflowY: 'auto'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-light)', display: 'block', marginBottom: '0.35rem' }}>
              Drink History:
            </span>
            {waterLogs.length === 0 ? (
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>No water logged yet today.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {waterLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: 'var(--color-text-main)',
                      padding: '0.2rem 0',
                      borderBottom: '1px dashed var(--color-border)'
                    }}
                  >
                    <span>+ {log.amountMl} ml</span>
                    <span style={{ color: 'var(--color-text-light)' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Buttons */}
      <div>
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
          Quick Log Water (Fills Glass / Bottle):
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button
            onClick={() => addWater(250)}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.25rem', fontSize: 'var(--text-xs)', flexDirection: 'column', gap: '2px', minHeight: '48px' }}
            aria-label="Add 250 milliliters of water"
          >
            <Plus size={14} color="var(--color-water)" />
            <span>+250 ml</span>
          </button>

          <button
            onClick={() => addWater(500)}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.25rem', fontSize: 'var(--text-xs)', flexDirection: 'column', gap: '2px', minHeight: '48px' }}
            aria-label="Add 500 milliliters of water"
          >
            <Plus size={14} color="var(--color-water)" />
            <span>+500 ml</span>
          </button>

          <button
            onClick={() => addWater(750)}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.25rem', fontSize: 'var(--text-xs)', flexDirection: 'column', gap: '2px', minHeight: '48px' }}
            aria-label="Add 750 milliliters of water"
          >
            <Plus size={14} color="var(--color-water)" />
            <span>+750 ml</span>
          </button>

          <button
            onClick={() => setShowCustom(!showCustom)}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.25rem', fontSize: 'var(--text-xs)', flexDirection: 'column', gap: '2px', minHeight: '48px' }}
            aria-label="Add custom milliliters of water"
          >
            <Plus size={14} color="var(--color-water)" />
            <span>Custom</span>
          </button>
        </div>

        {/* Custom Input Form */}
        {showCustom && (
          <form onSubmit={handleAddCustom} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="number"
              placeholder="e.g. 350 ml"
              value={customMl}
              onChange={(e) => setCustomMl(e.target.value)}
              aria-label="Enter custom water amount in milliliters"
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', minHeight: 'auto' }}>
              Add
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
