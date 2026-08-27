import React from 'react';

export const ProgressRing = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = '#2D6A4F',
  secondaryColor = '#e2ece7',
  icon: Icon,
  label = '',
  unit = '',
  displayValue = null,
  sublabel = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value / (max || 1)) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-ring-card">
      <div 
        className="progress-ring-container" 
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${value} of ${max} ${unit}`}
      >
        <svg
          width={size}
          height={size}
          className="progress-ring-svg"
        >
          {/* Background Track */}
          <circle
            className="progress-ring-bg"
            stroke={secondaryColor}
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Animated Progress Stroke */}
          <circle
            className="progress-ring-circle"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        <div className="progress-ring-inner">
          {Icon && (
            <div className="progress-icon-badge" style={{ color: color }}>
              <Icon size={size > 110 ? 22 : 18} />
            </div>
          )}
          <span className="ring-value-text">
            {displayValue !== null ? displayValue : Number(value).toLocaleString()}
          </span>
          {unit && <span className="ring-unit-text">{unit}</span>}
        </div>
      </div>

      <div className="progress-ring-label-box">
        <p className="ring-title">{label}</p>
        <p className="ring-subtext">
          {sublabel || `Goal: ${Number(max).toLocaleString()} ${unit}`}
        </p>
      </div>

      <style>{`
        .progress-ring-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.85rem;
        }

        .ring-value-text {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: ${size > 110 ? 'var(--text-lg)' : 'var(--text-base)'};
          line-height: 1.1;
          color: var(--text-primary);
          margin-top: 0.15rem;
        }

        .ring-unit-text {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-muted);
          text-transform: lowercase;
        }

        .progress-icon-badge {
          margin-bottom: 0.1rem;
        }

        .progress-ring-label-box {
          line-height: 1.3;
        }

        .ring-title {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--text-primary);
        }

        .ring-subtext {
          font-size: var(--text-xs);
          color: var(--text-muted);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
