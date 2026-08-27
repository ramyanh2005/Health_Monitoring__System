import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useWellness } from '../../context/WellnessContext';
import { Modal } from '../common/Modal';
import type { FontSizeOption } from '../../types/accessibility';
import { Sliders, Type, Contrast, ZapOff, Volume2, Eye } from 'lucide-react';

export const AccessibilitySettingsModal: React.FC = () => {
  const {
    settings,
    setFontSize,
    setHighContrast,
    setReduceMotion,
    setSimplifiedUI,
    setAudioFeedback
  } = useAccessibility();


  const { isAccessibilityModalOpen, setIsAccessibilityModalOpen } = useWellness();

  return (
    <Modal
      isOpen={isAccessibilityModalOpen}
      onClose={() => setIsAccessibilityModalOpen(false)}
      title="Accessibility & Display Preferences"
      maxWidth="580px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Intro banner */}
        <div
          style={{
            backgroundColor: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-primary-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Sliders size={18} style={{ flexShrink: 0 }} />
          <span>
            Customize your visual comfort, text scaling, motion, and audio guidance. Changes apply immediately and are saved locally.
          </span>
        </div>

        {/* 1. Font Size Scaling */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Type size={16} color="var(--color-primary)" />
            <span>Text & Font Size</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {(['normal', 'large', 'extralarge'] as FontSizeOption[]).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={settings.fontSize === size ? 'btn-primary' : 'btn-secondary'}
                style={{
                  padding: '0.75rem 0.5rem',
                  fontSize: size === 'normal' ? '14px' : size === 'large' ? '16px' : '18px',
                  fontWeight: 700,
                  textTransform: 'capitalize'
                }}
                aria-pressed={settings.fontSize === size}
              >
                {size === 'normal' ? 'Standard' : size === 'large' ? 'Large (115%)' : 'Extra Large (130%)'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. High Contrast Mode (WCAG AAA) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--color-bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <Contrast size={20} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, display: 'block', color: 'var(--color-text-main)' }}>
                High Contrast Theme
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                WCAG AAA compliant dark high-contrast mode with bold borders and enhanced visibility.
              </span>
            </div>
          </div>

          <button
            onClick={() => setHighContrast(!settings.highContrast)}
            className={settings.highContrast ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.45rem 1rem', fontSize: 'var(--text-xs)', minHeight: '38px' }}
            aria-pressed={settings.highContrast}
          >
            {settings.highContrast ? 'Active ✓' : 'Turn On'}
          </button>
        </div>

        {/* 3. Reduce Motion */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--color-bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <ZapOff size={20} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, display: 'block', color: 'var(--color-text-main)' }}>
                Reduce Motion & Animations
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Eliminates layout transitions and pulsing for users sensitive to motion.
              </span>
            </div>
          </div>

          <button
            onClick={() => setReduceMotion(!settings.reduceMotion)}
            className={settings.reduceMotion ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.45rem 1rem', fontSize: 'var(--text-xs)', minHeight: '38px' }}
            aria-pressed={settings.reduceMotion}
          >
            {settings.reduceMotion ? 'Reduced ✓' : 'Enable'}
          </button>
        </div>

        {/* 4. Audio Feedback / Voice Guidance */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--color-bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <Volume2 size={20} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, display: 'block', color: 'var(--color-text-main)' }}>
                Voice & Audio Guidance
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Speaks exercise step instructions and goal milestone announcements out loud.
              </span>
            </div>
          </div>

          <button
            onClick={() => setAudioFeedback(!settings.audioFeedback)}
            className={settings.audioFeedback ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.45rem 1rem', fontSize: 'var(--text-xs)', minHeight: '38px' }}
            aria-pressed={settings.audioFeedback}
          >
            {settings.audioFeedback ? 'Enabled ✓' : 'Enable'}
          </button>
        </div>

        {/* 5. Simplified Interface */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--color-bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <Eye size={20} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, display: 'block', color: 'var(--color-text-main)' }}>
                Simplified Interface
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Hides ambient decorative badges and maximizes high-priority actionable focus cards.
              </span>
            </div>
          </div>

          <button
            onClick={() => setSimplifiedUI(!settings.simplifiedUI)}
            className={settings.simplifiedUI ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.45rem 1rem', fontSize: 'var(--text-xs)', minHeight: '38px' }}
            aria-pressed={settings.simplifiedUI}
          >
            {settings.simplifiedUI ? 'Simplified ✓' : 'Enable'}
          </button>
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setIsAccessibilityModalOpen(false)}
            className="btn-primary"
            style={{ width: '100%', maxWidth: '160px' }}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
