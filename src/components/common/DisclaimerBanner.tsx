import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  return (
    <aside
      className={`disclaimer-banner ${compact ? 'compact' : ''}`}
      role="note"
      aria-label="Medical Disclaimer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: compact ? '0.5rem 0.85rem' : '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-bg-card-subtle)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--text-xs)',
        lineHeight: 1.4,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)',
          flexShrink: 0,
        }}
      >
        {compact ? <Info size={16} aria-hidden="true" /> : <ShieldAlert size={20} aria-hidden="true" />}
      </div>
      <div>
        <strong style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>Wellness Guidance Only: </strong>
        These recommendations are general wellness guidance and are not a substitute for professional medical advice, diagnosis, or individualized clinical treatment. Always consult your physician or licensed physical therapist before beginning any new physical regimen.
      </div>
    </aside>
  );
};
