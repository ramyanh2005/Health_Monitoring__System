import React, { useState, useEffect } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Modal } from '../common/Modal';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, ShieldAlert, CheckCircle2, Award } from 'lucide-react';

export const ExercisePlayerModal: React.FC = () => {
  const { activeExercise, setActiveExercise, logActivityMinutes } = useWellness();
  const { speakText } = useAccessibility();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const steps = activeExercise?.steps || [];
  const currentStep = steps[currentStepIndex];

  // Reset step timer when exercise or step changes
  useEffect(() => {
    if (currentStep) {
      setSecondsRemaining(currentStep.durationSec);
      setIsActive(false);
      setIsCompleted(false);
    }
  }, [currentStepIndex, activeExercise]);

  // Countdown timer effect
  useEffect(() => {
    let interval: number | null = null;

    if (isActive && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setIsActive(false);
        setIsCompleted(true);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining, currentStepIndex, steps.length]);

  if (!activeExercise || !currentStep) return null;

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setSecondsRemaining(currentStep.durationSec);
    setIsActive(false);
  };

  const handleReadAloud = () => {
    speakText(`Step ${currentStep.stepNumber}: ${currentStep.title}. ${currentStep.instruction}. ${currentStep.tip ? 'Tip: ' + currentStep.tip : ''}`);
  };

  const handleFinishRoutine = () => {
    logActivityMinutes(activeExercise.durationMinutes, activeExercise.title);
    setActiveExercise(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Modal
      isOpen={!!activeExercise}
      onClose={() => setActiveExercise(null)}
      title={activeExercise.title}
      maxWidth="680px"
    >
      {isCompleted ? (
        /* Completion Screen */
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-healthy-bg)',
              color: 'var(--color-healthy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 0 8px var(--color-healthy-bg)'
            }}
          >
            <Award size={36} />
          </div>

          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
            Wonderful Effort! 🎉
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            You completed <strong>{activeExercise.durationMinutes} minutes</strong> of gentle movement. Your joints and circulation thank you!
          </p>

          <div
            style={{
              backgroundColor: 'var(--color-bg-card-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-healthy)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
              <CheckCircle2 size={16} /> Added +{activeExercise.durationMinutes} min to Today's Movement Goal
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinishRoutine}
            className="btn-primary"
            style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
          >
            Record & Close Routine
          </button>
        </div>
      ) : (
        /* Active Exercise Player */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Visual Exercise Demonstration Banner */}
          <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '190px' }}>
            <img
              src={activeExercise.image}
              alt={activeExercise.title}
              style={{ width: '100%', height: '190px', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff',
                backdropFilter: 'blur(4px)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Step {currentStepIndex + 1} of {steps.length}
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff',
                backdropFilter: 'blur(4px)',
                fontSize: '11px',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Target: {activeExercise.howToPerformGuide.targetMuscles.join(', ')}
            </div>
          </div>

          {/* Step indicator header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
              Current Step Instructions
            </span>
            <button
              type="button"
              onClick={handleReadAloud}
              className="btn-secondary"
              style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.65rem', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              aria-label="Read step instructions aloud"
            >
              <Volume2 size={14} color="var(--color-primary)" />
              <span>Voice Guide</span>
            </button>
          </div>

          {/* Step Title & Instructions */}
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
              {currentStep.title}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              {currentStep.instruction}
            </p>
            {currentStep.tip && (
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary-light)',
                  borderLeft: '3px solid var(--color-primary)',
                  fontSize: '11px',
                  color: 'var(--color-primary-text)'
                }}
              >
                <strong>Form & Comfort Tip: </strong> {currentStep.tip}
              </div>
            )}
          </div>

          {/* Countdown Timer Display */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-card-subtle)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              role="timer"
              aria-label={`${formatTime(secondsRemaining)} remaining in this step`}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-4xl)',
                fontWeight: 800,
                color: 'var(--color-primary)',
                letterSpacing: '0.05em'
              }}
            >
              {formatTime(secondsRemaining)}
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', marginTop: '2px' }}>
              {isActive ? 'Step in progress...' : 'Paused / Ready'}
            </span>

            {/* Timer Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="btn-secondary"
                aria-label="Previous step"
                style={{ padding: '0.6rem', borderRadius: '50%', minHeight: 'auto' }}
              >
                <SkipBack size={18} />
              </button>

              <button
                type="button"
                onClick={toggleTimer}
                className="btn-primary"
                aria-label={isActive ? 'Pause timer' : 'Start timer'}
                style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', minHeight: '48px', fontSize: 'var(--text-sm)' }}
              >
                {isActive ? <Pause size={18} /> : <Play size={18} />}
                <span>{isActive ? 'Pause' : 'Start Step'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary"
                aria-label="Reset step timer"
                style={{ padding: '0.6rem', borderRadius: '50%', minHeight: 'auto' }}
              >
                <RotateCcw size={18} />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="btn-secondary"
                aria-label="Next step"
                style={{ padding: '0.6rem', borderRadius: '50%', minHeight: 'auto' }}
              >
                <SkipForward size={18} />
              </button>
            </div>
          </div>

          {/* Safety Reminder */}
          <div
            role="alert"
            style={{
              backgroundColor: 'var(--color-alert-bg)',
              border: '1px solid var(--color-alert)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              fontSize: '11px',
              color: 'var(--color-alert)'
            }}
          >
            <ShieldAlert size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Safety Reminder: </strong>
              Stop immediately if you experience pain, dizziness, or breathing difficulty. Consult a healthcare professional before starting new physical activity if you have medical restrictions.
            </div>
          </div>

          {/* Bottom Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              onClick={() => setActiveExercise(null)}
              className="btn-secondary"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              Exit Routine
            </button>
            <button
              type="button"
              onClick={handleFinishRoutine}
              className="btn-primary"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              <CheckCircle2 size={15} />
              <span>Mark As Completed</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
