import React from 'react';
import type { MealSuggestion } from '../../types/meal';
import { Modal } from '../common/Modal';
import { CheckCircle2, Clock, Camera } from 'lucide-react';

interface MealDetailModalProps {
  meal: MealSuggestion | null;
  onClose: () => void;
  isLogged: boolean;
  onToggleLog: () => void;
  onOpenUpload: (meal: MealSuggestion) => void;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  meal,
  onClose,
  isLogged,
  onToggleLog,
  onOpenUpload
}) => {
  if (!meal) return null;

  return (
    <Modal isOpen={!!meal} onClose={onClose} title={meal.title} maxWidth="580px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Dish Hero Image */}
        <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '220px' }}>
          <img
            src={meal.userPhotoUrl || meal.image}
            alt={meal.title}
            style={{ width: '100%', height: '220px', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {meal.userPhotoUrl ? '📸 Your Uploaded Photo' : '✨ NutriTrack AI Recommendation'}
          </div>
        </div>

        {/* Timing & Tags */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
            <Clock size={14} />
            <span>Suggested Time: {meal.suggestedTime}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {meal.dietaryTags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-text)',
                  border: '1px solid var(--color-primary-border)'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Nutritional Guidance Tip */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-card-subtle)',
            borderLeft: '3px solid var(--color-notice)',
            padding: '0.75rem 1rem',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-main)'
          }}
        >
          <strong style={{ color: 'var(--color-notice)', display: 'block', marginBottom: '2px' }}>Wellness Insight:</strong>
          {meal.guidanceTip}
        </div>

        {/* Meal Components List */}
        <div>
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>
            Wholesome Meal Ingredients & Portions:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {meal.items.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-main)', display: 'block' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-healthy)', fontWeight: 600 }}>
                    {item.benefits}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-bg-card-subtle)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    flexShrink: 0
                  }}
                >
                  {item.portion}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Calories approximation */}
        {meal.caloriesApprox && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'right' }}>
            Estimated energy density: ~{meal.caloriesApprox} kcal (General wellness estimate)
          </div>
        )}

        {/* Action Toggle & Upload Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenUpload(meal);
            }}
            className="btn-secondary"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            <Camera size={15} color="var(--color-primary)" />
            <span>{meal.userPhotoUrl ? 'Update Photo' : 'Upload Food Photo'}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ fontSize: 'var(--text-xs)' }}>
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleLog();
                onClose();
              }}
              className={isLogged ? 'btn-secondary' : 'btn-primary'}
              style={{ fontSize: 'var(--text-xs)' }}
            >
              <CheckCircle2 size={16} color={isLogged ? 'var(--color-healthy)' : '#fff'} />
              <span>{isLogged ? 'Logged as Enjoyed ✓' : 'Mark Meal as Eaten'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
