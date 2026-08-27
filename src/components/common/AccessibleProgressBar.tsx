import React from 'react';

interface AccessibleProgressBarProps {
  value: number; // current value
  max: number; // max value
  label: string;
  unit?: string;
  color?: string;
  height?: number;
  showText?: boolean;
}

export const AccessibleProgressBar: React.FC<AccessibleProgressBarProps> = ({
  value,
  max,
  label,
  unit = '',
  color = 'var(--color-primary)',
  height = 10,
  showText = true
}) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;

  return (
    <div style={{ width: '100%' }}>
      {showText && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.35rem',
            fontSize: 'var(--text-sm)',
            fontWeight: 600
          }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
          <span style={{ color: 'var(--color-text-main)' }}>
            {value} {unit} <span style={{ color: 'var(--color-text-light)', fontWeight: 400 }}>/ {max} {unit} ({percentage}%)</span>
          </span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${value} of ${max} ${unit} completed (${percentage} percent)`}
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--color-bg-card-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
};
