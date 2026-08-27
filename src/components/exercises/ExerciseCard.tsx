import React, { useState } from 'react';
import type { Exercise } from '../../types/exercise';
import { useWellness } from '../../context/WellnessContext';
import { Clock, ShieldAlert, Play, CheckCircle2, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const { setActiveExercise } = useWellness();
  const [showHowTo, setShowHowTo] = useState<boolean>(false);

  return (
    <article
      className="wellness-card"
      aria-label={`${exercise.title}, ${exercise.durationMinutes} minutes, ${exercise.difficulty} difficulty`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <div>
        {/* Exercise Photo Header */}
        <div style={{ position: 'relative', width: '100%', height: '175px', overflow: 'hidden', backgroundColor: 'var(--color-bg-card-subtle)' }}>
          <img
            src={exercise.image}
            alt={exercise.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, transparent 50%)'
            }}
          />

          {/* Difficulty & Mobility Badges */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
            <span
              style={{
                backgroundColor: 'var(--color-healthy)',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {exercise.difficulty}
            </span>
            <span
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff',
                backdropFilter: 'blur(4px)',
                fontSize: '10px',
                fontWeight: 600,
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {exercise.mobilityRequirement}
            </span>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '10px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-full)'
            }}
          >
            <Clock size={12} />
            <span>{exercise.durationMinutes} min</span>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
            {exercise.title}
          </h3>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            {exercise.shortDescription}
          </p>

          {/* Key Benefits */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
              Benefits:
            </span>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {exercise.benefits.slice(0, 2).map((b, idx) => (
                <li key={idx} style={{ fontSize: '11px', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={12} color="var(--color-healthy)" style={{ flexShrink: 0 }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Toggleable How-to-Perform Guide */}
          <button
            type="button"
            onClick={() => setShowHowTo(!showHowTo)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-card-subtle)',
              border: '1px solid var(--color-border)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-primary-text)',
              marginBottom: '0.75rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={13} color="var(--color-primary)" /> How to Do This Exercise & Form Tips
            </span>
            {showHowTo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showHowTo && (
            <div
              style={{
                backgroundColor: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                marginBottom: '0.75rem',
                fontSize: '11px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                animation: 'fadeIn 0.2s ease'
              }}
            >
              <div>
                <strong style={{ color: 'var(--color-primary-text)' }}>Posture Setup: </strong>
                {exercise.howToPerformGuide.postureSetup}
              </div>
              <div>
                <strong style={{ color: 'var(--color-primary-text)' }}>Breathing: </strong>
                {exercise.howToPerformGuide.breathingRhythm}
              </div>
              <div>
                <strong style={{ color: 'var(--color-primary-text)' }}>Target Muscles: </strong>
                {exercise.howToPerformGuide.targetMuscles.join(', ')}
              </div>
              <div>
                <strong style={{ color: 'var(--color-warning)' }}>Watch Out: </strong>
                {exercise.howToPerformGuide.commonMistakes}
              </div>
            </div>
          )}

          {/* Equipment Note */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-card-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.6rem',
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ShieldAlert size={12} color="var(--color-warning)" style={{ flexShrink: 0 }} />
            <span><strong>Equipment:</strong> {exercise.equipment}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div style={{ padding: '0 1.25rem 1.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveExercise(exercise)}
          className="btn-primary"
          style={{ width: '100%', minHeight: '44px' }}
          aria-label={`Start guided routine for ${exercise.title}`}
        >
          <Play size={16} />
          <span>Start Guided Routine</span>
        </button>
      </div>
    </article>
  );
};
