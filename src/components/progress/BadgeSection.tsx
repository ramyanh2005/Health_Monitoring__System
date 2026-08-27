import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { Modal } from '../common/Modal';
import { Droplet, Sparkles, Leaf, Flame, Award, HeartHandshake, Wind, Waves, Lock, CheckCircle2 } from 'lucide-react';

export const BadgeSection: React.FC = () => {
  const { badges, unlockedBadgeCelebration, setUnlockedBadgeCelebration } = useWellness();

  const getBadgeIcon = (iconName: string, size = 24, unlocked = true) => {
    const color = unlocked ? '#ffffff' : 'var(--color-text-light)';
    switch (iconName) {
      case 'Droplet':
        return <Droplet size={size} color={color} />;
      case 'Sparkles':
        return <Sparkles size={size} color={color} />;
      case 'Leaf':
        return <Leaf size={size} color={color} />;
      case 'Flame':
        return <Flame size={size} color={color} />;
      case 'Award':
        return <Award size={size} color={color} />;
      case 'HeartHandshake':
        return <HeartHandshake size={size} color={color} />;
      case 'Wind':
        return <Wind size={size} color={color} />;
      case 'Waves':
        return <Waves size={size} color={color} />;
      default:
        return <Award size={size} color={color} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'water':
        return 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)';
      case 'activity':
        return 'linear-gradient(135deg, #059669 0%, #34d399 100%)';
      case 'nutrition':
        return 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)';
      case 'streak':
        return 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)';
      default:
        return 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)';
    }
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <section aria-labelledby="badges-heading" className="wellness-card" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-warning-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-warning)'
            }}
          >
            <Award size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 id="badges-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Wellness Milestones & Badges
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Celebrating your consistency and positive self-care habits
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            border: '1px solid var(--color-warning)'
          }}
        >
          {unlockedCount} of {badges.length} Badges Unlocked 🏆
        </span>
      </div>

      {/* Badges Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}
      >
        {badges.map((badge) => {
          return (
            <div
              key={badge.id}
              role="article"
              aria-label={`${badge.title} badge: ${badge.unlocked ? 'Unlocked' : `Locked (${badge.progress}% progress)`}`}
              style={{
                borderRadius: 'var(--radius-md)',
                border: badge.unlocked ? '1px solid var(--color-border)' : '1px dashed var(--color-border)',
                backgroundColor: badge.unlocked ? 'var(--color-bg-card)' : 'var(--color-bg-card-subtle)',
                padding: '1rem',
                display: 'flex',
                gap: '0.85rem',
                opacity: badge.unlocked ? 1 : 0.75,
                boxShadow: badge.unlocked ? 'var(--shadow-sm)' : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Badge Icon Emblem */}
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: badge.unlocked ? getCategoryColor(badge.category) : 'var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: badge.unlocked ? '0 4px 10px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                {badge.unlocked ? (
                  getBadgeIcon(badge.iconName, 22, true)
                ) : (
                  <Lock size={20} color="var(--color-text-light)" />
                )}
              </div>

              {/* Badge Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {badge.title}
                  </h3>
                  {badge.unlocked && (
                    <span style={{ color: 'var(--color-healthy)', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <CheckCircle2 size={12} /> Earned
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                  {badge.description}
                </p>

                {/* Progress or Unlock Date */}
                {badge.unlocked ? (
                  <span style={{ fontSize: '10px', color: 'var(--color-text-light)', fontWeight: 600 }}>
                    Earned on: {badge.unlockedAt || 'Recent'}
                  </span>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-light)', marginBottom: '3px' }}>
                      <span>{badge.criteria}</span>
                      <span>{badge.progress}%</span>
                    </div>
                    <div
                      style={{
                        height: '4px',
                        backgroundColor: 'var(--color-border)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${badge.progress}%`,
                          height: '100%',
                          backgroundColor: 'var(--color-warning)'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unlock Celebration Modal */}
      {unlockedBadgeCelebration && (
        <Modal
          isOpen={!!unlockedBadgeCelebration}
          onClose={() => setUnlockedBadgeCelebration(null)}
          title="New Badge Unlocked! 🎉"
          maxWidth="440px"
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: getCategoryColor(unlockedBadgeCelebration.category),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 0 0 8px rgba(13, 148, 136, 0.15)'
              }}
            >
              {getBadgeIcon(unlockedBadgeCelebration.iconName, 36, true)}
            </div>

            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
              {unlockedBadgeCelebration.title}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              {unlockedBadgeCelebration.description}
            </p>

            <button
              onClick={() => setUnlockedBadgeCelebration(null)}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Awesome! Keep Going
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
};
