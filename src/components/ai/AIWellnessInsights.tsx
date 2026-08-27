import React, { useEffect, useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { aiRecommendationService } from '../../services/aiRecommendationService';
import type { AIWellnessInsight } from '../../services/aiRecommendationService';
import { Bot, ArrowRight, Lightbulb, RefreshCw } from 'lucide-react';

export const AIWellnessInsights: React.FC = () => {
  const { userProfile, addWater } = useWellness();

  const [insights, setInsights] = useState<AIWellnessInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const data = await aiRecommendationService.getPersonalizedInsights(userProfile);
      setInsights(data);
    } catch {
      // safe fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [userProfile.mobilityLevel, userProfile.dietaryPreference, userProfile.weightKg]);

  const handleAction = (insight: AIWellnessInsight) => {
    if (insight.actionType === 'water') {
      addWater(250);
    } else if (insight.actionType === 'exercise') {
      const target = document.getElementById('exercises-section');
      target?.scrollIntoView({ behavior: 'smooth' });
    } else if (insight.actionType === 'meal') {
      const target = document.getElementById('meals-section');
      target?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section aria-labelledby="ai-insights-heading" className="wellness-card" style={{ width: '100%' }}>
      {/* Header */}
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
            <Bot size={22} aria-hidden="true" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 id="ai-insights-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                NutriTrack AI Wellness Insights
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-text)',
                  border: '1px solid var(--color-primary-border)'
                }}
              >
                Adaptive AI Model
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Real-time daily wellness recommendations tailored to your physical mobility and diet
            </p>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          className="btn-secondary"
          style={{ padding: '0.4rem 0.65rem', fontSize: 'var(--text-xs)', minHeight: '34px' }}
          disabled={isLoading}
          aria-label="Refresh AI wellness insights"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>{isLoading ? 'Calibrating...' : 'Refresh Insights'}</span>
        </button>
      </div>

      {/* Insights Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}
      >
        {insights.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-card-subtle)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <Lightbulb size={16} color="var(--color-primary)" />
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {item.title}
                </h3>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.35rem', lineHeight: 1.45 }}>
                {item.recommendation}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                <strong>Why it helps: </strong> {item.rationale}
              </p>
            </div>

            {item.suggestedActionLabel && (
              <button
                onClick={() => handleAction(item)}
                className="btn-secondary"
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: 'var(--text-xs)',
                  justifyContent: 'space-between',
                  minHeight: '36px',
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-primary-border)',
                  color: 'var(--color-primary-text)'
                }}
              >
                <span>{item.suggestedActionLabel}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
