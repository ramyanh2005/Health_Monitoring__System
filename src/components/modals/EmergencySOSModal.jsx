import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertTriangle, 
  PhoneCall, 
  X, 
  MapPin, 
  User, 
  ShieldAlert, 
  CheckCircle,
  FileHeart,
  PhoneForwarded
} from 'lucide-react';

export const EmergencySOSModal = () => {
  const { user, closeModal, showToast } = useApp();

  const [countdown, setCountdown] = useState(5);
  const [isAlertDispatched, setIsAlertDispatched] = useState(false);
  const [countdownPaused, setCountdownPaused] = useState(false);

  useEffect(() => {
    let timer = null;
    if (!isAlertDispatched && !countdownPaused && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !isAlertDispatched) {
      triggerEmergencyDispatch();
    }
    return () => clearTimeout(timer);
  }, [countdown, isAlertDispatched, countdownPaused]);

  const triggerEmergencyDispatch = () => {
    setIsAlertDispatched(true);
    showToast(`🚨 Emergency Alert dispatched to ${user.emergencyContact.name} and local responders!`, 'error');
  };

  const handleCancel = () => {
    closeModal();
    showToast("Emergency alert was safely cancelled.", "info");
  };

  return (
    <div className="modal-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="emergency-modal-title">
      <div className="modal-content emergency-modal-box fade-in">
        {/* Header */}
        <div className="emergency-modal-header">
          <div className="emergency-beacon-circle pulse-emergency-ring">
            <AlertTriangle size={36} className="text-white" />
          </div>
          <h3 id="emergency-modal-title" className="emergency-title">
            {isAlertDispatched ? "Emergency Help is On the Way" : "Emergency Assistance Requested"}
          </h3>
          <p className="emergency-subtitle">
            {isAlertDispatched 
              ? "Your live location and medical profile have been transmitted." 
              : `Dispatching automated alert in ${countdown} seconds...`}
          </p>
        </div>

        {!isAlertDispatched ? (
          /* ======================================================================
             1. Countdown & Immediate Trigger / Cancel Controls
             ====================================================================== */
          <div className="emergency-body">
            <div className="countdown-display-circle">
              <span className="countdown-giant-num">{countdown}</span>
              <span className="text-xs font-bold uppercase text-danger">Seconds</span>
            </div>

            <div className="flex flex-col gap-3 my-4">
              <button
                onClick={triggerEmergencyDispatch}
                className="btn btn-emergency w-full text-lg py-3"
                id="emergency-btn-trigger-now"
              >
                <PhoneCall size={22} />
                <span>Call Emergency (911) Now</span>
              </button>

              <button
                onClick={handleCancel}
                className="btn btn-secondary w-full"
                id="emergency-btn-cancel"
              >
                <X size={18} />
                <span>Cancel Alert (I Am Safe)</span>
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================================
             2. Dispatched Confirmation & Status
             ====================================================================== */
          <div className="dispatched-body fade-in">
            <div className="dispatched-alert-card">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-primary-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-primary-900">Caregiver Notified</h4>
                  <p className="text-xs text-secondary">
                    SMS and automated phone call sent to <strong>{user.emergencyContact.name} ({user.emergencyContact.phone})</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="dispatched-alert-card mt-3">
              <div className="flex items-center gap-3">
                <MapPin size={24} className="text-danger shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-primary-900">Current GPS Location Shared</h4>
                  <p className="text-xs text-secondary">
                    Evergreen Senior Living, Apt 4B • High-accuracy GPS lock
                  </p>
                </div>
              </div>
            </div>

            {/* Medical ID Summary for First Responders */}
            <div className="medical-id-card mt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileHeart size={18} className="text-danger" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted">First Responder Medical Card</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p><strong>Member:</strong> {user.name} ({user.age})</p>
                <p><strong>Blood Type:</strong> {user.bloodType}</p>
                <p><strong>Allergies:</strong> {user.allergies.join(', ')}</p>
                <p><strong>Doctor:</strong> {user.doctor.split(',')[0]}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <a
                href={`tel:${user.emergencyContact.phone}`}
                className="btn btn-primary flex-1"
              >
                <PhoneForwarded size={18} />
                <span>Call {user.emergencyContact.name.split(' ')[0]}</span>
              </a>
              <button
                onClick={closeModal}
                className="btn btn-secondary flex-1"
              >
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .emergency-modal-box {
          max-width: 500px;
          border: 2px solid var(--danger-border);
          padding: 2rem;
          text-align: center;
        }

        .emergency-beacon-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--danger-main), #a00019);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
        }

        .emergency-title {
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--danger-main);
          line-height: 1.2;
        }

        .emergency-subtitle {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .countdown-display-circle {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background-color: var(--danger-light);
          border: 3px solid var(--danger-border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 1.5rem auto;
        }

        .countdown-giant-num {
          font-family: var(--font-heading);
          font-size: 3.2rem;
          font-weight: 800;
          color: var(--danger-main);
          line-height: 1;
        }

        .dispatched-alert-card {
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-md);
          padding: 1rem;
          border: 1px solid var(--border-light);
          text-align: left;
        }

        .medical-id-card {
          background-color: #fff1f2;
          border: 1.5px solid #fecdd3;
          border-radius: var(--radius-md);
          padding: 1rem;
          text-align: left;
        }
      `}</style>
    </div>
  );
};
