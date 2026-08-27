import React, { useState } from 'react';
import { EXERCISES_DATA } from '../../data/exercisesData';
import type { ExerciseCategory } from '../../types/exercise';
import { ExerciseCard } from './ExerciseCard';
import { ExercisePlayerModal } from './ExercisePlayerModal';

export const ExerciseSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ExerciseCategory>('all');

  const filteredExercises = selectedCategory === 'all'
    ? EXERCISES_DATA
    : EXERCISES_DATA.filter((ex) => ex.category === selectedCategory);

  return (
    <section id="exercises-section" aria-labelledby="exercises-heading" style={{ width: '100%' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 id="exercises-heading" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Recommended Activities For You
            </h2>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-healthy-bg)',
                color: 'var(--color-healthy)',
                border: '1px solid var(--color-healthy)'
              }}
            >
              Adaptive & Low Impact
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Gentle routines calibrated for wheelchair users, joint comfort, and mindful circulation
          </p>
        </div>

        {/* Category Filter Pills */}
        <div
          role="tablist"
          aria-label="Exercise category filters"
          style={{
            display: 'flex',
            gap: '0.4rem',
            backgroundColor: 'var(--color-bg-card)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            flexWrap: 'wrap'
          }}
        >
          <button
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.4rem 0.85rem', fontSize: 'var(--text-xs)', minHeight: '36px' }}
          >
            All ({EXERCISES_DATA.length})
          </button>
          <button
            role="tab"
            aria-selected={selectedCategory === 'seated'}
            onClick={() => setSelectedCategory('seated')}
            className={selectedCategory === 'seated' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.4rem 0.85rem', fontSize: 'var(--text-xs)', minHeight: '36px' }}
          >
            Seated Stretches
          </button>
          <button
            role="tab"
            aria-selected={selectedCategory === 'mobility'}
            onClick={() => setSelectedCategory('mobility')}
            className={selectedCategory === 'mobility' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.4rem 0.85rem', fontSize: 'var(--text-xs)', minHeight: '36px' }}
          >
            Mobility & Joints
          </button>
          <button
            role="tab"
            aria-selected={selectedCategory === 'breathing'}
            onClick={() => setSelectedCategory('breathing')}
            className={selectedCategory === 'breathing' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.4rem 0.85rem', fontSize: 'var(--text-xs)', minHeight: '36px' }}
          >
            Breathing & Calm
          </button>
        </div>
      </div>

      {/* Exercises Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {filteredExercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {/* Global Interactive Exercise Player Modal */}
      <ExercisePlayerModal />
    </section>
  );
};
