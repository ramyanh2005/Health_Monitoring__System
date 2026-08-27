import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Pill, 
  Check, 
  Clock, 
  X, 
  AlertCircle, 
  Calendar, 
  ShieldCheck,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const MedicationModal = () => {
  const { medications, toggleMedication, closeModal } = useApp();

  const slots = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];
  const takenCount = medications.filter(m => m.taken).length;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="meds-modal-title">
      <div className="modal-content meds-modal-box fade-in">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="meds-modal-icon-badge">
              <Pill size={24} className="text-accent-purple" />
            </div>
            <div>
              <h3 id="meds-modal-title" className="font-extrabold text-xl text-primary-900">
                Daily Medications & Schedule
              </h3>
              <p className="text-xs text-muted">
                {takenCount} of {medications.length} doses completed today
              </p>
            </div>
          </div>
          <button onClick={closeModal} className="modal-close-btn" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="meds-progress-track mb-4">
          <div 
            className="meds-progress-fill" 
            style={{ width: `${(takenCount / (medications.length || 1)) * 100}%` }}
          />
        </div>

        {/* Medication Slots List */}
        <div className="meds-slots-container">
          {slots.map((slot) => {
            const slotMeds = medications.filter(m => m.slot.toLowerCase() === slot.toLowerCase());
            if (slotMeds.length === 0) return null;

            return (
              <div key={slot} className="med-slot-group">
                <div className="slot-title-row">
                  <span className="slot-title-badge">{slot}</span>
                  <span className="text-xs font-semibold text-muted">
                    {slotMeds[0].time}
                  </span>
                </div>

                <div className="slot-meds-list">
                  {slotMeds.map((med) => (
                    <div 
                      key={med.id} 
                      className={`card med-item-card ${med.taken ? 'med-taken' : 'med-pending'}`}
                      onClick={() => toggleMedication(med.id)}
                    >
                      <button
                        className={`med-check-circle ${med.taken ? 'checked' : ''}`}
                        aria-label={`Mark ${med.name} as ${med.taken ? 'pending' : 'taken'}`}
                      >
                        {med.taken && <Check size={18} />}
                      </button>

                      <div className="med-item-info">
                        <div className="flex justify-between items-start">
                          <h4 className="med-name">{med.name}</h4>
                          <span className="badge badge-teal text-xs">{med.dosage}</span>
                        </div>
                        <p className="med-purpose-text">{med.purpose}</p>
                        <p className="med-instruction-text">ℹ️ {med.instructions}</p>
                        {med.refillDaysLeft <= 15 && (
                          <span className="badge badge-amber mt-2 text-xs">
                            ⚠️ Refill in {med.refillDaysLeft} days
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-light flex justify-between items-center">
          <span className="text-xs font-medium text-muted">Prescribed by Dr. Elizabeth Vance</span>
          <button onClick={closeModal} className="btn btn-primary btn-sm">
            Done
          </button>
        </div>
      </div>

      <style>{`
        .meds-modal-box {
          max-width: 580px;
          max-height: 85vh;
        }

        .meds-modal-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background-color: var(--accent-purple-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .meds-progress-track {
          height: 8px;
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .meds-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-purple), var(--primary-500));
          transition: width 0.4s ease-in-out;
        }

        .meds-slots-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-height: 52vh;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .slot-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .slot-title-badge {
          font-size: var(--text-xs);
          font-weight: 800;
          color: var(--primary-700);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .slot-meds-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .med-item-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.25rem;
          cursor: pointer;
          transition: all var(--trans-fast);
        }

        .med-item-card.med-taken {
          background-color: var(--primary-50);
          border-color: var(--primary-200);
          opacity: 0.9;
        }

        .med-check-circle {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 50%;
          border: 2px solid var(--border-medium);
          background-color: var(--bg-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-top: 2px;
          transition: all var(--trans-fast);
        }

        .med-check-circle.checked {
          background-color: var(--primary-500);
          border-color: var(--primary-500);
        }

        .med-item-info {
          flex: 1;
        }

        .med-name {
          font-size: var(--text-base);
          font-weight: 800;
          color: var(--text-primary);
        }

        .med-purpose-text {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          font-weight: 600;
          margin-top: 0.15rem;
        }

        .med-instruction-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
        }
      `}</style>
    </div>
  );
};
