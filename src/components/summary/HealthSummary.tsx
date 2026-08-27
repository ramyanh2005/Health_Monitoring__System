import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { calculateBMI } from '../../services/bmiService';
import { Scale, Ruler, Activity, Heart, Info, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export const HealthSummary: React.FC = () => {
  const { userProfile, setIsEditProfileOpen } = useWellness();
  const bmiInfo = calculateBMI(userProfile.weightKg, userProfile.heightCm);

  const weightDiff = userProfile.previousWeightKg
    ? parseFloat((userProfile.weightKg - userProfile.previousWeightKg).toFixed(1))
    : 0;

  // Convert height cm to feet/inches
  const totalInches = userProfile.heightCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);

  return (
    <section aria-labelledby="health-summary-title" style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2
            id="health-summary-title"
            style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-main)' }}
          >
            Health & Biometric Overview
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Dynamic screening indicators adapted to your mobility profile
          </p>
        </div>
        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="btn-secondary"
          style={{ padding: '0.45rem 0.85rem', fontSize: 'var(--text-xs)' }}
        >
          Update Metrics
        </button>
      </div>

      {/* Grid of 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* Card 1: BMI Metric & Gauge */}
        <div className="wellness-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', letterSpacing: '0.05em' }}>
                Body Mass Index (BMI)
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary)'
                }}
              >
                <Scale size={18} aria-hidden="true" />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {bmiInfo.bmiValue}
              </span>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: bmiInfo.category === 'Healthy range' ? 'var(--color-healthy-bg)' : 'var(--color-warning-bg)',
                  color: bmiInfo.category === 'Healthy range' ? 'var(--color-healthy)' : 'var(--color-warning)'
                }}
              >
                {bmiInfo.category}
              </span>
            </div>

            {/* Visual BMI Gauge Meter */}
            <div style={{ margin: '0.85rem 0' }}>
              <div
                role="meter"
                aria-label={`BMI gauge indicator: ${bmiInfo.bmiValue} (${bmiInfo.category})`}
                aria-valuenow={bmiInfo.bmiValue}
                aria-valuemin={15}
                aria-valuemax={35}
                style={{
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(to right, #38bdf8 0%, #34d399 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%)',
                  position: 'relative'
                }}
              >
                {/* Pointer indicator */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    left: `${Math.min(96, Math.max(4, bmiInfo.gaugePercentage))}%`,
                    transform: 'translateX(-50%)',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#ffffff',
                    border: '3px solid var(--color-primary)',
                    borderRadius: '50%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-light)', marginTop: '6px' }}>
                <span>15 (Under)</span>
                <span style={{ fontWeight: 600, color: 'var(--color-healthy)' }}>18.5 - 24.9 (Healthy)</span>
                <span>35+ (High)</span>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '11px',
              color: 'var(--color-text-muted)'
            }}
          >
            <Info size={13} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
            <span>General screening metric only, not a clinical diagnosis.</span>
          </div>
        </div>

        {/* Card 2: Weight */}
        <div className="wellness-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', letterSpacing: '0.05em' }}>
                Current Weight
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-water-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-water)'
                }}
              >
                <Heart size={18} aria-hidden="true" />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {userProfile.weightKg}
              </span>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                kg
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', marginLeft: '0.35rem' }}>
                ({(userProfile.weightKg * 2.20462).toFixed(1)} lbs)
              </span>
            </div>

            {/* Previous Weight Trend */}
            {userProfile.previousWeightKg && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  marginTop: '0.25rem',
                  color: weightDiff === 0 ? 'var(--color-text-muted)' : weightDiff < 0 ? 'var(--color-healthy)' : 'var(--color-notice)'
                }}
              >
                {weightDiff < 0 ? (
                  <ArrowDownRight size={14} />
                ) : weightDiff > 0 ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <Minus size={14} />
                )}
                <span>
                  {Math.abs(weightDiff)} kg {weightDiff < 0 ? 'decrease' : weightDiff > 0 ? 'increase' : 'stable'} from previous ({userProfile.previousWeightKg} kg)
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border)',
              fontSize: '11px',
              color: 'var(--color-text-muted)'
            }}
          >
            Target focus: Steady metabolic harmony & joint comfort.
          </div>
        </div>

        {/* Card 3: Height */}
        <div className="wellness-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', letterSpacing: '0.05em' }}>
                Height
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-healthy-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-healthy)'
                }}
              >
                <Ruler size={18} aria-hidden="true" />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {userProfile.heightCm}
              </span>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                cm
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', marginLeft: '0.35rem' }}>
                ({feet}' {inches}")
              </span>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
              Used to calculate calibrated baseline hydration and movement targets.
            </p>
          </div>

          <div
            style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border)',
              fontSize: '11px',
              color: 'var(--color-text-muted)'
            }}
          >
            Seated posture alignment check recommended daily.
          </div>
        </div>

        {/* Card 4: Daily Activity Level (Adapted for Mobility) */}
        <div className="wellness-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', letterSpacing: '0.05em' }}>
                Activity Level
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-secondary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-secondary)'
                }}
              >
                <Activity size={18} aria-hidden="true" />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {userProfile.activityLevel}
              </span>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)'
                }}
              >
                ({userProfile.dailyActivityTargetMin} min / day target)
              </span>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Calibrated for <strong>{userProfile.mobilityLevel}</strong>. Focuses on low-impact joint mobility and seated stamina.
            </p>
          </div>

          <div
            style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border)',
              fontSize: '11px',
              color: 'var(--color-primary-text)',
              fontWeight: 600
            }}
          >
            ✓ No conventional step-count pressure
          </div>
        </div>
      </div>
    </section>
  );
};
