import React, { useState, useEffect } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { Modal } from '../common/Modal';
import type { MobilityLevel, ActivityLevel, DietaryPreference, Gender } from '../../types/user';
import { calculateBMI } from '../../services/bmiService';
import { wellnessService } from '../../services/wellnessService';
import { Save, RefreshCw } from 'lucide-react';

const MOBILITY_OPTIONS: MobilityLevel[] = [
  'Wheelchair user',
  'Limited mobility',
  'Assisted walking',
  'Independent walking',
  'Upper-body mobility',
  'Bed-rest / Low mobility',
  'Other'
];

const ACTIVITY_OPTIONS: ActivityLevel[] = ['Sedentary', 'Low', 'Moderate', 'Active'];

const DIET_OPTIONS: DietaryPreference[] = [
  'Vegetarian',
  'Vegan',
  'Non-Vegetarian',
  'Low-Sodium',
  'Gluten-Free',
  'Diabetic-Friendly',
  'Balanced'
];

const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];

export const EditProfileModal: React.FC = () => {
  const { userProfile, updateUserProfile, isEditProfileOpen, setIsEditProfileOpen } = useWellness();

  const [formData, setFormData] = useState({
    name: userProfile.name,
    age: userProfile.age,
    gender: userProfile.gender,
    heightCm: userProfile.heightCm,
    weightKg: userProfile.weightKg,
    disabilityType: userProfile.disabilityType,
    mobilityLevel: userProfile.mobilityLevel,
    activityLevel: userProfile.activityLevel,
    dietaryPreference: userProfile.dietaryPreference,
    dailyWaterTargetMl: userProfile.dailyWaterTargetMl,
    dailyActivityTargetMin: userProfile.dailyActivityTargetMin,
    notes: userProfile.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditProfileOpen) {
      setFormData({
        name: userProfile.name,
        age: userProfile.age,
        gender: userProfile.gender,
        heightCm: userProfile.heightCm,
        weightKg: userProfile.weightKg,
        disabilityType: userProfile.disabilityType,
        mobilityLevel: userProfile.mobilityLevel,
        activityLevel: userProfile.activityLevel,
        dietaryPreference: userProfile.dietaryPreference,
        dailyWaterTargetMl: userProfile.dailyWaterTargetMl,
        dailyActivityTargetMin: userProfile.dailyActivityTargetMin,
        notes: userProfile.notes || ''
      });
      setErrors({});
    }
  }, [isEditProfileOpen, userProfile]);

  // Live BMI Preview in the modal
  const liveBmi = calculateBMI(Number(formData.weightKg), Number(formData.heightCm));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'heightCm' || name === 'weightKg' || name === 'dailyWaterTargetMl' || name === 'dailyActivityTargetMin'
        ? Number(value)
        : value
    }));
  };

  const handleAutoRecalculateTargets = () => {
    const recWater = wellnessService.calculateRecommendedWater(Number(formData.weightKg), formData.activityLevel as ActivityLevel);
    const recActivity = wellnessService.calculateRecommendedActivityMin(formData.mobilityLevel as MobilityLevel, formData.activityLevel as ActivityLevel);
    setFormData((prev) => ({
      ...prev,
      dailyWaterTargetMl: recWater,
      dailyActivityTargetMin: recActivity
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (formData.age < 1 || formData.age > 120) errs.age = 'Enter a valid age (1-120)';
    if (formData.heightCm < 50 || formData.heightCm > 260) errs.heightCm = 'Enter valid height (50-260 cm)';
    if (formData.weightKg < 20 || formData.weightKg > 300) errs.weightKg = 'Enter valid weight (20-300 kg)';
    if (formData.dailyWaterTargetMl < 500 || formData.dailyWaterTargetMl > 6000) errs.dailyWaterTargetMl = 'Water target between 500ml - 6000ml';
    if (formData.dailyActivityTargetMin < 5 || formData.dailyActivityTargetMin > 180) errs.dailyActivityTargetMin = 'Activity target between 5 - 180 min';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    updateUserProfile({
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender as Gender,
      heightCm: Number(formData.heightCm),
      weightKg: Number(formData.weightKg),
      previousWeightKg: userProfile.weightKg !== Number(formData.weightKg) ? userProfile.weightKg : userProfile.previousWeightKg,
      disabilityType: formData.disabilityType.trim(),
      mobilityLevel: formData.mobilityLevel as MobilityLevel,
      activityLevel: formData.activityLevel as ActivityLevel,
      dietaryPreference: formData.dietaryPreference as DietaryPreference,
      dailyWaterTargetMl: Number(formData.dailyWaterTargetMl),
      dailyActivityTargetMin: Number(formData.dailyActivityTargetMin),
      notes: formData.notes.trim()
    });

    setIsEditProfileOpen(false);
  };

  return (
    <Modal
      isOpen={isEditProfileOpen}
      onClose={() => setIsEditProfileOpen(false)}
      title="Edit Wellness Profile"
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Live Calculation Preview Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary-text)' }}>
              Live Computed BMI:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {liveBmi.bmiValue}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: liveBmi.category === 'Healthy range' ? 'var(--color-healthy)' : 'var(--color-warning)' }}>
                ({liveBmi.category})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoRecalculateTargets}
            className="btn-secondary"
            style={{ fontSize: 'var(--text-xs)', padding: '0.4rem 0.75rem', minHeight: '34px' }}
            title="Auto-calculate recommended water and activity based on weight and mobility"
          >
            <RefreshCw size={13} />
            <span>Auto-Calculate Targets</span>
          </button>
        </div>

        {/* Row 1: Name, Age, Gender */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor="edit-name" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Full Name *
            </label>
            <input
              id="edit-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${errors.name ? 'var(--color-alert)' : 'var(--color-border)'}`,
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            />
            {errors.name && <span style={{ fontSize: '11px', color: 'var(--color-alert)' }}>{errors.name}</span>}
          </div>

          <div>
            <label htmlFor="edit-age" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Age (Years) *
            </label>
            <input
              id="edit-age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${errors.age ? 'var(--color-alert)' : 'var(--color-border)'}`,
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            />
            {errors.age && <span style={{ fontSize: '11px', color: 'var(--color-alert)' }}>{errors.age}</span>}
          </div>

          <div>
            <label htmlFor="edit-gender" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Gender
            </label>
            <select
              id="edit-gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Height & Weight */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor="edit-height" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Height (cm) *
            </label>
            <input
              id="edit-height"
              type="number"
              name="heightCm"
              value={formData.heightCm}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${errors.heightCm ? 'var(--color-alert)' : 'var(--color-border)'}`,
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            />
            {errors.heightCm && <span style={{ fontSize: '11px', color: 'var(--color-alert)' }}>{errors.heightCm}</span>}
          </div>

          <div>
            <label htmlFor="edit-weight" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Weight (kg) *
            </label>
            <input
              id="edit-weight"
              type="number"
              step="0.1"
              name="weightKg"
              value={formData.weightKg}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${errors.weightKg ? 'var(--color-alert)' : 'var(--color-border)'}`,
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            />
            {errors.weightKg && <span style={{ fontSize: '11px', color: 'var(--color-alert)' }}>{errors.weightKg}</span>}
          </div>
        </div>

        {/* Row 3: Mobility Level & Activity Level */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor="edit-mobility" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Mobility Level *
            </label>
            <select
              id="edit-mobility"
              name="mobilityLevel"
              value={formData.mobilityLevel}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            >
              {MOBILITY_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-activity" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Daily Activity Level
            </label>
            <select
              id="edit-activity"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            >
              {ACTIVITY_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: Dietary Preference & Disability Type Description */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor="edit-diet" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Dietary Preference
            </label>
            <select
              id="edit-diet"
              name="dietaryPreference"
              value={formData.dietaryPreference}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            >
              {DIET_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-disability" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Disability / Accommodation Details
            </label>
            <input
              id="edit-disability"
              type="text"
              name="disabilityType"
              value={formData.disabilityType}
              onChange={handleChange}
              placeholder="e.g. Spinal cord mobility, Low vision, Joint care"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            />
          </div>
        </div>

        {/* Row 5: Custom Water & Activity Targets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor="edit-water-target" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Daily Water Target (ml)
            </label>
            <input
              id="edit-water-target"
              type="number"
              step="100"
              name="dailyWaterTargetMl"
              value={formData.dailyWaterTargetMl}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${errors.dailyWaterTargetMl ? 'var(--color-alert)' : 'var(--color-border)'}`,
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            />
            {errors.dailyWaterTargetMl && <span style={{ fontSize: '11px', color: 'var(--color-alert)' }}>{errors.dailyWaterTargetMl}</span>}
          </div>

          <div>
            <label htmlFor="edit-activity-target" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Daily Movement Target (Minutes)
            </label>
            <input
              id="edit-activity-target"
              type="number"
              step="5"
              name="dailyActivityTargetMin"
              value={formData.dailyActivityTargetMin}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${errors.dailyActivityTargetMin ? 'var(--color-alert)' : 'var(--color-border)'}`,
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            />
            {errors.dailyActivityTargetMin && <span style={{ fontSize: '11px', color: 'var(--color-alert)' }}>{errors.dailyActivityTargetMin}</span>}
          </div>
        </div>

        {/* Row 6: Personal Focus Notes */}
        <div>
          <label htmlFor="edit-notes" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.35rem' }}>
            Personal Focus / Accessibility Preferences
          </label>
          <textarea
            id="edit-notes"
            name="notes"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any specific instructions or preferences for your daily wellness flow..."
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-sm)',
              backgroundColor: 'var(--color-bg-card)',
              color: 'var(--color-text-main)',
              fontFamily: 'var(--font-base)',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Modal Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border)'
          }}
        >
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            <Save size={16} />
            <span>Save & Recalculate Dashboard</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
