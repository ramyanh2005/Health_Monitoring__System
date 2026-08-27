import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { MEALS_DATABASE } from '../../data/mealsData';
import type { MealSuggestion } from '../../types/meal';
import { MealDetailModal } from './MealDetailModal';
import { FoodPhotoUploadModal } from './FoodPhotoUploadModal';
import { CheckCircle2, Clock, Eye, Camera } from 'lucide-react';

export const MealSuggestions: React.FC = () => {
  const { userProfile, loggedMeals, toggleMealLogged } = useWellness();
  const [selectedMeal, setSelectedMeal] = useState<MealSuggestion | null>(null);
  const [uploadMeal, setUploadMeal] = useState<MealSuggestion | null>(null);
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});

  // Retrieve meals tailored for active dietary preference (with fallback to Vegetarian)
  const currentMeals = MEALS_DATABASE[userProfile.dietaryPreference] || MEALS_DATABASE['Vegetarian'];

  const handlePhotoSaved = (mealType: string, photoDataUrl: string) => {
    setUserPhotos((prev) => ({ ...prev, [mealType]: photoDataUrl }));
  };

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'Morning Breakfast';
      case 'lunch':
        return 'Balanced Lunch';
      case 'snack':
        return 'Evening Snack & Hydration';
      case 'dinner':
        return 'Light Restorative Dinner';
      default:
        return 'Meal';
    }
  };

  return (
    <section id="meals-section" aria-labelledby="meals-heading" style={{ width: '100%' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 id="meals-heading" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Today's Meal Suggestions & Visual Food Log
            </h2>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-notice-bg)',
                color: 'var(--color-notice)',
                border: '1px solid var(--color-notice)'
              }}
            >
              {userProfile.dietaryPreference}
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Wholesome nourishment &bull; Snap your plate to log with AI nutrition estimation
          </p>
        </div>

        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
          * General wellness guidelines, not clinical prescriptions
        </div>
      </div>

      {/* Meals Grid with Dish Photos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {currentMeals.map((meal) => {
          const isLogged = loggedMeals.includes(meal.type);
          const uploadedPhoto = userPhotos[meal.type] || meal.userPhotoUrl;
          const displayImage = uploadedPhoto || meal.image;

          const enrichedMeal: MealSuggestion = {
            ...meal,
            userPhotoUrl: uploadedPhoto
          };

          return (
            <article
              key={meal.id}
              className="wellness-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 0,
                overflow: 'hidden',
                borderColor: isLogged ? 'var(--color-healthy)' : 'var(--color-border)',
                backgroundColor: isLogged ? 'var(--color-healthy-bg)' : 'var(--color-bg-card)'
              }}
            >
              <div>
                {/* Food Image Banner */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '160px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-bg-card-subtle)'
                  }}
                >
                  <img
                    src={displayImage}
                    alt={meal.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, transparent 60%)'
                    }}
                  />

                  {/* Badges on Image */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      display: 'flex',
                      gap: '4px'
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {getMealTypeLabel(meal.type)}
                    </span>
                  </div>

                  {uploadedPhoto && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'var(--color-healthy)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Camera size={11} /> Photo Logged
                    </div>
                  )}

                  {/* Time badge at bottom of image */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '10px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Clock size={12} />
                    <span>{meal.suggestedTime}</span>
                  </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
                  {/* Title */}
                  <h3
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 700,
                      color: 'var(--color-text-main)',
                      marginBottom: '0.4rem'
                    }}
                  >
                    {meal.title}
                  </h3>

                  {/* Items preview */}
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
                    {meal.items.slice(0, 2).map((item) => (
                      <li
                        key={item.id}
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '0.4rem'
                        }}
                      >
                        <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>&bull;</span>
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Upload Food Photo Action Trigger */}
                  <button
                    type="button"
                    onClick={() => setUploadMeal(enrichedMeal)}
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.75rem',
                      fontSize: 'var(--text-xs)',
                      minHeight: '36px',
                      marginBottom: '0.5rem',
                      backgroundColor: uploadedPhoto ? 'var(--color-healthy-bg)' : 'var(--color-bg-card-subtle)',
                      borderColor: uploadedPhoto ? 'var(--color-healthy)' : 'var(--color-border)',
                      color: uploadedPhoto ? 'var(--color-healthy)' : 'var(--color-text-main)'
                    }}
                  >
                    <Camera size={14} color={uploadedPhoto ? 'var(--color-healthy)' : 'var(--color-primary)'} />
                    <span>{uploadedPhoto ? 'Retake / View Photo' : 'Upload Food Photo'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem 1.25rem',
                  borderTop: `1px solid ${isLogged ? 'rgba(5, 150, 105, 0.2)' : 'var(--color-border)'}`
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedMeal(enrichedMeal)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.45rem', fontSize: 'var(--text-xs)', minHeight: '38px' }}
                  aria-label={`View recipe details for ${meal.title}`}
                >
                  <Eye size={13} />
                  <span>Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleMealLogged(meal.type)}
                  className={isLogged ? 'btn-secondary' : 'btn-primary'}
                  style={{
                    flex: 1.3,
                    padding: '0.45rem',
                    fontSize: 'var(--text-xs)',
                    minHeight: '38px',
                    borderColor: isLogged ? 'var(--color-healthy)' : 'transparent',
                    color: isLogged ? 'var(--color-healthy)' : '#ffffff'
                  }}
                  aria-label={isLogged ? `Mark ${meal.title} as not logged` : `Log ${meal.title} as eaten`}
                >
                  <CheckCircle2 size={14} color={isLogged ? 'var(--color-healthy)' : '#ffffff'} />
                  <span>{isLogged ? 'Enjoyed ✓' : 'Log Meal'}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Meal Detail Modal */}
      <MealDetailModal
        meal={selectedMeal}
        onClose={() => setSelectedMeal(null)}
        isLogged={selectedMeal ? loggedMeals.includes(selectedMeal.type) : false}
        onToggleLog={() => {
          if (selectedMeal) toggleMealLogged(selectedMeal.type);
        }}
        onOpenUpload={(m) => setUploadMeal(m)}
      />

      {/* Food Photo Upload Modal */}
      <FoodPhotoUploadModal
        meal={uploadMeal}
        onClose={() => setUploadMeal(null)}
        onPhotoSaved={handlePhotoSaved}
      />
    </section>
  );
};
