import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { calculateBMI } from '../../services/bmiService';
import { User, Edit3 } from 'lucide-react';

export const WellnessProfileCard: React.FC = () => {
  const { userProfile, setIsEditProfileOpen } = useWellness();
  const bmiInfo = calculateBMI(userProfile.weightKg, userProfile.heightCm);

  return (
    <section aria-labelledby="profile-card-title" className="wellness-card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
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
            <User size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 id="profile-card-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Your Wellness Profile
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Personalized attributes & mobility parameters
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="btn-primary"
          style={{ padding: '0.45rem 0.85rem', fontSize: 'var(--text-xs)', minHeight: '38px' }}
          aria-label="Edit your wellness profile"
        >
          <Edit3 size={14} aria-hidden="true" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Details List */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          backgroundColor: 'var(--color-bg-card-subtle)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: '1rem'
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
            Name & Age
          </span>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
            {userProfile.name} ({userProfile.age} yrs, {userProfile.gender})
          </p>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
            Height & Weight
          </span>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
            {userProfile.heightCm} cm &bull; {userProfile.weightKg} kg
          </p>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
            BMI Status
          </span>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
            {bmiInfo.bmiValue} ({bmiInfo.category})
          </p>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
            Mobility Level
          </span>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
            {userProfile.mobilityLevel}
          </p>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
            Dietary Preference
          </span>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
            {userProfile.dietaryPreference}
          </p>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
            Hydration Target
          </span>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-water)', marginTop: '2px' }}>
            {(userProfile.dailyWaterTargetMl / 1000).toFixed(1)} L / day
          </p>
        </div>
      </div>

      {/* Special Context Note */}
      {userProfile.notes && (
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-card)',
            borderLeft: '3px solid var(--color-primary)',
            padding: '0.65rem 0.85rem',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
          }}
        >
          <strong>Personal Focus: </strong> {userProfile.notes}
        </div>
      )}
    </section>
  );
};
