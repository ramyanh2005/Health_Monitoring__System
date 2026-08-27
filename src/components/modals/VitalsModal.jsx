import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Heart, 
  Activity, 
  Check, 
  X, 
  ShieldCheck, 
  RefreshCw, 
  Wind, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const VitalsModal = () => {
  const { vitals, updateVitalsData, closeModal } = useApp();

  const [isMeasuring, setIsMeasuring] = useState(false);
  const [currentBpm, setCurrentBpm] = useState(vitals.heartRate);
  const [systolic, setSystolic] = useState(122);
  const [diastolic, setDiastolic] = useState(78);
  const [spo2, setSpo2] = useState(98);

  const startLivePulseCheck = () => {
    setIsMeasuring(true);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setCurrentBpm(Math.floor(70 + Math.random() * 5));
      if (count > 6) {
        clearInterval(interval);
        setIsMeasuring(false);
        updateVitalsData({
          heartRate: 72,
          bloodPressure: `${systolic}/${diastolic}`,
          spo2: spo2,
          status: "Optimal & Calm"
        });
      }
    }, 500);
  };

  const handleSaveManual = (e) => {
    e.preventDefault();
    updateVitalsData({
      heartRate: Number(currentBpm),
      bloodPressure: `${systolic}/${diastolic}`,
      spo2: Number(spo2),
      status: Number(currentBpm) > 100 ? "Elevated" : "Optimal"
    });
    closeModal();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="vitals-modal-title">
      <div className="modal-content vitals-modal-box fade-in">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="vitals-modal-icon-badge">
              <Heart size={24} className="text-accent-coral" />
            </div>
            <div>
              <h3 id="vitals-modal-title" className="font-extrabold text-xl text-primary-900">
                Heart Rate & Daily Vitals
              </h3>
              <p className="text-xs text-muted">
                Last checked: {vitals.lastChecked} • Safe senior range
              </p>
            </div>
          </div>
          <button onClick={closeModal} className="modal-close-btn" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Live Pulse Monitor Card */}
        <div className="live-pulse-monitor-card">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              {isMeasuring ? 'Measuring Pulse Live...' : 'Resting Heart Rate'}
            </span>
            <span className="badge badge-green font-bold">Normal Range: 60-100</span>
          </div>

          <div className="pulse-big-number-row">
            <span className={`pulse-giant-num ${isMeasuring ? 'animate-pulse text-accent-coral' : ''}`}>
              {currentBpm}
            </span>
            <span className="pulse-unit">BPM</span>
          </div>

          {/* Animated SVG ECG Waveform */}
          <div className="ecg-waveform-wrap">
            <svg viewBox="0 0 500 80" className="ecg-svg-line">
              <path
                d="M 0 40 L 100 40 L 115 20 L 130 65 L 145 10 L 160 55 L 175 40 L 260 40 L 275 20 L 290 65 L 305 10 L 320 55 L 335 40 L 500 40"
                fill="none"
                stroke="#E76F51"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ecg-animated-path"
              />
            </svg>
          </div>

          <button
            onClick={startLivePulseCheck}
            disabled={isMeasuring}
            className="btn btn-primary w-full mt-3"
          >
            <RefreshCw size={18} className={isMeasuring ? 'animate-spin' : ''} />
            <span>{isMeasuring ? 'Measuring Pulse...' : 'Check Pulse Now'}</span>
          </button>
        </div>

        {/* Secondary Vitals (Blood Pressure & SpO2) */}
        <form onSubmit={handleSaveManual} className="vitals-inputs-section mt-4">
          <h4 className="font-bold text-sm text-primary-900 mb-2">Update Vital Signs:</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="vital-input-group">
              <label className="text-xs font-bold text-muted block mb-1">Blood Pressure (mmHg)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="vital-input-field"
                  placeholder="120"
                />
                <span className="text-muted font-bold">/</span>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="vital-input-field"
                  placeholder="80"
                />
              </div>
            </div>

            <div className="vital-input-group">
              <label className="text-xs font-bold text-muted block mb-1">Blood Oxygen SpO2 (%)</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="vital-input-field w-full"
                placeholder="98"
                min="80"
                max="100"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-secondary w-full mt-4">
            <Check size={18} />
            <span>Save & Log Readings</span>
          </button>
        </form>
      </div>

      <style>{`
        .vitals-modal-box {
          max-width: 500px;
        }

        .vitals-modal-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background-color: var(--accent-coral-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .live-pulse-monitor-card {
          background: linear-gradient(145deg, var(--accent-coral-light), var(--bg-surface));
          border: 1.5px solid #fbd3cb;
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          text-align: center;
        }

        .pulse-big-number-row {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.4rem;
        }

        .pulse-giant-num {
          font-family: var(--font-heading);
          font-size: 3.8rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .pulse-unit {
          font-size: var(--text-base);
          font-weight: 800;
          color: var(--accent-coral);
        }

        .ecg-waveform-wrap {
          height: 60px;
          overflow: hidden;
          margin: 0.5rem 0;
        }

        .ecg-svg-line {
          width: 100%;
          height: 100%;
        }

        .ecg-animated-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: ecgDash 3s linear infinite;
        }

        @keyframes ecgDash {
          to { stroke-dashoffset: 0; }
        }

        .vital-input-field {
          width: 100%;
          min-height: 42px;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border-medium);
          font-family: inherit;
          font-weight: 700;
          font-size: var(--text-sm);
          background-color: var(--bg-surface);
          color: var(--text-primary);
          text-align: center;
        }

        .vital-input-field:focus {
          outline: none;
          border-color: var(--primary-500);
        }
      `}</style>
    </div>
  );
};
