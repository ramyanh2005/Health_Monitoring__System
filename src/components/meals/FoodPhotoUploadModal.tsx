import React, { useState, useRef } from 'react';
import type { MealSuggestion } from '../../types/meal';
import { Modal } from '../common/Modal';
import { useWellness } from '../../context/WellnessContext';
import { Camera, CheckCircle2, Sparkles, RefreshCw, X } from 'lucide-react';

interface FoodPhotoUploadModalProps {
  meal: MealSuggestion | null;
  onClose: () => void;
  onPhotoSaved: (mealType: string, photoDataUrl: string) => void;
}

export const FoodPhotoUploadModal: React.FC<FoodPhotoUploadModalProps> = ({
  meal,
  onClose,
  onPhotoSaved
}) => {
  const { toggleMealLogged, loggedMeals } = useWellness();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(meal?.userPhotoUrl || null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    calories: number;
    protein: number;
    fiberRating: string;
    aiComment: string;
  } | null>(null);

  if (!meal) return null;

  const isAlreadyLogged = loggedMeals.includes(meal.type);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewUrl(result);
        simulateAiAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAiAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        calories: meal.caloriesApprox || 420,
        protein: meal.type === 'breakfast' ? 14 : meal.type === 'lunch' ? 20 : meal.type === 'snack' ? 8 : 16,
        fiberRating: 'Excellent (High Prebiotic Fiber)',
        aiComment: `AI Vision matched: "${meal.title}". Wholesome balance of complex carbohydrates, clean protein, and gut-friendly micronutrients.`
      });
    }, 1200);
  };

  const handleSaveMealWithPhoto = () => {
    if (previewUrl) {
      onPhotoSaved(meal.type, previewUrl);
      if (!isAlreadyLogged) {
        toggleMealLogged(meal.type);
      }
      onClose();
    }
  };

  return (
    <Modal
      isOpen={!!meal}
      onClose={onClose}
      title={`Upload Food Photo &bull; ${meal.title}`}
      maxWidth="580px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Subtitle */}
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Snap or upload a photo of your meal. NutriTrack AI will visually log your dish and verify your daily nutrition milestone.
        </p>

        {/* Upload Drop Zone / Camera Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--color-primary-border)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: previewUrl ? 'var(--color-bg-card)' : 'var(--color-primary-light)',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {previewUrl ? (
            <div style={{ width: '100%', position: 'relative' }}>
              <img
                src={previewUrl}
                alt="Uploaded meal"
                style={{
                  width: '100%',
                  maxHeight: '260px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewUrl(null);
                  setAnalysisResult(null);
                }}
                className="btn-secondary"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '0.35rem',
                  borderRadius: '50%',
                  minHeight: 'auto',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none'
                }}
                aria-label="Remove uploaded food photo"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                }}
              >
                <Camera size={28} />
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-main)', display: 'block' }}>
                  Tap to Take Photo or Browse Files
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
                  Supports JPG, PNG, WEBP &bull; Camera capture supported
                </span>
              </div>
            </div>
          )}
        </div>

        {/* AI Vision Analysis Feedback */}
        {isAnalyzing && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-card-subtle)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-primary-text)'
            }}
          >
            <RefreshCw size={18} className="animate-spin" color="var(--color-primary)" />
            <span>NutriTrack AI Vision is analyzing your dish portions & nutritional content...</span>
          </div>
        )}

        {analysisResult && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-healthy-bg)',
              border: '1px solid var(--color-healthy)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-healthy)', fontWeight: 800, fontSize: 'var(--text-sm)' }}>
              <Sparkles size={16} />
              <span>AI Vision Analysis Complete!</span>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-main)', lineHeight: 1.45 }}>
              {analysisResult.aiComment}
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', flexWrap: 'wrap', fontSize: '11px' }}>
              <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <strong>Est. Energy:</strong> ~{analysisResult.calories} kcal
              </div>
              <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <strong>Est. Protein:</strong> ~{analysisResult.protein}g
              </div>
              <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <strong>Fiber Rating:</strong> {analysisResult.fiberRating}
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ fontSize: 'var(--text-xs)' }}>
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveMealWithPhoto}
            disabled={!previewUrl}
            className="btn-primary"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            <CheckCircle2 size={16} />
            <span>Confirm & Log Meal with Photo</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
