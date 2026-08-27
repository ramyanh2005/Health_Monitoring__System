import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  Award,
  Timer
} from 'lucide-react';

export const ExerciseCoachModal = () => {
  const { 
    selectedExercise, 
    closeModal, 
    completeExerciseSession 
  } = useApp();

  if (!selectedExercise) return null;

  const steps = selectedExercise.steps || [
    { name: "Gentle Warm-up Breathing", timeSec: 60, desc: "Sit or stand tall. Breathe deeply and smoothly." },
    { name: "Main Movement Routine", timeSec: 180, desc: "Perform the gentle movement with smooth, pain-free range of motion." },
    { name: "Cool Down & Recovery", timeSec: 60, desc: "Gentle arm and shoulder relaxation." }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(steps[0].timeSec);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const timerRef = useRef(null);
  const currentStep = steps[currentStepIndex];

  // Web Audio Synth for gentle chimes
  const playChime = (type = 'tick') => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'tick') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'step') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'complete') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g);
          g.connect(audioCtx.destination);
          o.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);
          g.gain.setValueAtTime(0.08, audioCtx.currentTime + idx * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.12 + 0.3);
          o.start(audioCtx.currentTime + idx * 0.12);
          o.stop(audioCtx.currentTime + idx * 0.12 + 0.3);
        });
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  // Timer Tick Effect
  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 4 && prev > 1) {
            playChime('tick');
          }
          return prev - 1;
        });
      }, 1000);
    } else if (secondsRemaining === 0) {
      // Advance to next step or complete
      if (currentStepIndex < steps.length - 1) {
        playChime('step');
        setCurrentStepIndex(prev => prev + 1);
        setSecondsRemaining(steps[currentStepIndex + 1].timeSec);
      } else {
        setIsActive(false);
        setIsCompleted(true);
        playChime('complete');
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, secondsRemaining, currentStepIndex]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setSecondsRemaining(steps[currentStepIndex + 1].timeSec);
      playChime('step');
    } else {
      setIsActive(false);
      setIsCompleted(true);
      playChime('complete');
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setSecondsRemaining(steps[currentStepIndex - 1].timeSec);
    }
  };

  const resetSession = () => {
    setIsActive(false);
    setIsCompleted(false);
    setCurrentStepIndex(0);
    setSecondsRemaining(steps[0].timeSec);
  };

  const finishAndSaveWorkout = () => {
    completeExerciseSession(selectedExercise, selectedExercise.duration);
    closeModal();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="coach-modal-title">
      <div className="modal-content coach-modal-box fade-in">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <span className="badge badge-green">Guided Session</span>
            <span className="badge badge-amber">{selectedExercise.duration} mins total</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="modal-close-btn"
              title={isMuted ? "Unmute Audio Cues" : "Mute Audio Cues"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={closeModal}
              className="modal-close-btn"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {!isCompleted ? (
          <div className="coach-session-body">
            <h3 id="coach-modal-title" className="coach-exercise-title">
              {selectedExercise.title}
            </h3>

            {/* Step Progress Bar */}
            <div className="coach-progress-track">
              <div 
                className="coach-progress-fill" 
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-xs font-bold text-muted text-center mt-1">
              Step {currentStepIndex + 1} of {steps.length}: {currentStep.name}
            </p>

            {/* Main Timer Display */}
            <div className="coach-timer-card">
              <div className="timer-giant-display">
                {formatTime(secondsRemaining)}
              </div>
              <p className="text-sm font-bold text-primary-700">
                {isActive ? '🌿 Movement in progress...' : '⏸️ Paused — Press Play to start'}
              </p>
            </div>

            {/* Step Instructions Card */}
            <div className="coach-step-card">
              <h4 className="font-bold text-base text-primary-900 mb-1">
                {currentStep.name}
              </h4>
              <p className="text-sm text-secondary leading-relaxed">
                {currentStep.desc}
              </p>
              <div className="coach-safety-note mt-3">
                <ShieldCheck size={16} className="text-primary-600 shrink-0" />
                <span className="text-xs font-semibold text-primary-800">
                  {selectedExercise.safetyTip}
                </span>
              </div>
            </div>

            {/* Timer Controls Row */}
            <div className="coach-controls-row">
              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="btn btn-secondary btn-icon-only"
                title="Previous step"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                onClick={toggleTimer}
                className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'} coach-play-btn`}
              >
                {isActive ? <Pause size={24} /> : <Play size={24} />}
                <span>{isActive ? 'Pause' : 'Start / Resume'}</span>
              </button>

              <button
                onClick={handleNextStep}
                className="btn btn-secondary btn-icon-only"
                title="Skip to next step"
              >
                <ChevronRight size={22} />
              </button>

              <button
                onClick={resetSession}
                className="btn btn-secondary btn-icon-only"
                title="Reset Routine"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================================
             Completion Celebration View
             ====================================================================== */
          <div className="coach-completed-card text-center fade-in">
            <div className="trophy-circle animate-float">
              <Award size={48} className="text-accent-amber" />
            </div>
            <h3 className="text-2xl font-extrabold text-primary-900 mt-3">
              Session Completed! 🎉
            </h3>
            <p className="text-base text-secondary mt-1 max-w-md mx-auto">
              Wonderful job! You gave your muscles and joints healthy, nourishing movement.
            </p>

            <div className="completion-stats-box my-4">
              <div className="stat-item">
                <Timer size={20} className="text-primary-600 mx-auto mb-1" />
                <span className="stat-val font-bold text-lg">{selectedExercise.duration} mins</span>
                <span className="text-xs text-muted block">Duration</span>
              </div>
              <div className="stat-item">
                <Flame size={20} className="text-accent-coral mx-auto mb-1" />
                <span className="stat-val font-bold text-lg">+{selectedExercise.caloriesBurn} kcal</span>
                <span className="text-xs text-muted block">Burned</span>
              </div>
              <div className="stat-item">
                <Sparkles size={20} className="text-accent-amber mx-auto mb-1" />
                <span className="stat-val font-bold text-lg">+1 Streak</span>
                <span className="text-xs text-muted block">Adherence</span>
              </div>
            </div>

            <button
              onClick={finishAndSaveWorkout}
              className="btn btn-primary w-full"
            >
              <Check size={20} />
              <span>Save & Log to Today's Goals</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .coach-modal-box {
          max-width: 540px;
          padding: 1.75rem;
        }

        .coach-exercise-title {
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--text-primary);
          text-align: center;
          margin-bottom: 1rem;
        }

        .coach-progress-track {
          height: 8px;
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .coach-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-400), var(--primary-600));
          transition: width 0.4s ease-in-out;
        }

        .coach-timer-card {
          background: linear-gradient(145deg, var(--primary-50), var(--bg-surface));
          border: 1.5px solid var(--primary-200);
          border-radius: var(--radius-lg);
          padding: 1.75rem 1rem;
          text-align: center;
          margin: 1.25rem 0;
        }

        .timer-giant-display {
          font-family: var(--font-heading);
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--primary-800);
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .coach-step-card {
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          border: 1px solid var(--border-light);
          margin-bottom: 1.5rem;
        }

        .coach-safety-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background-color: var(--bg-surface);
          border-radius: var(--radius-sm);
          border: 1px solid var(--primary-200);
        }

        .coach-controls-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
        }

        .coach-play-btn {
          min-width: 170px;
          min-height: 52px;
          font-size: var(--text-base);
        }

        .trophy-circle {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background-color: var(--accent-amber-light);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border: 2px solid #fed19d;
        }

        .completion-stats-box {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding: 1.25rem;
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }
      `}</style>
    </div>
  );
};
