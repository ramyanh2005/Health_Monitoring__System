import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Clock, 
  Users, 
  ChefHat, 
  Sparkles, 
  Check, 
  Heart,
  Flame,
  ShieldCheck
} from 'lucide-react';

export const RecipeModal = () => {
  const { selectedRecipe, closeModal } = useApp();

  if (!selectedRecipe || !selectedRecipe.recipe) return null;
  const recipe = selectedRecipe.recipe;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title">
      <div className="modal-content recipe-modal-box fade-in">
        {/* Modal Image Header */}
        <div className="recipe-hero-wrap">
          <img 
            src={selectedRecipe.image} 
            alt={selectedRecipe.title} 
            className="recipe-hero-img" 
          />
          <button 
            onClick={closeModal} 
            className="recipe-close-btn"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
          <div className="recipe-badge-overlay">
            <span className="badge badge-amber">{selectedRecipe.type}</span>
            <span className="badge badge-green font-bold">{selectedRecipe.calories} kcal</span>
          </div>
        </div>

        <div className="recipe-body-content">
          <h3 id="recipe-modal-title" className="recipe-title">
            {selectedRecipe.title}
          </h3>
          <p className="recipe-desc">{selectedRecipe.description}</p>

          {/* Quick Recipe Meta */}
          <div className="recipe-meta-row my-3">
            <div className="recipe-meta-item">
              <Clock size={16} className="text-primary-600" />
              <span>Prep: <strong>{recipe.prepTime}</strong></span>
            </div>
            <div className="recipe-meta-item">
              <Flame size={16} className="text-accent-coral" />
              <span>Cook: <strong>{recipe.cookTime}</strong></span>
            </div>
            <div className="recipe-meta-item">
              <Users size={16} className="text-accent-teal" />
              <span>Servings: <strong>{recipe.servings}</strong></span>
            </div>
          </div>

          {/* Senior Health Benefits Callout */}
          <div className="senior-benefit-card my-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-primary-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary-800">
                Senior Nutritional Benefit
              </span>
            </div>
            <p className="text-xs text-primary-900 leading-relaxed font-medium">
              {recipe.seniorBenefits}
            </p>
          </div>

          {/* Ingredients List */}
          <div className="recipe-section my-3">
            <h4 className="font-bold text-sm text-primary-900 mb-2">Ingredients:</h4>
            <ul className="ingredients-list">
              {recipe.ingredients.map((item, idx) => (
                <li key={idx} className="ingredient-item">
                  <span className="bullet-dot" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions List */}
          <div className="recipe-section my-3">
            <h4 className="font-bold text-sm text-primary-900 mb-2">Preparation Instructions:</h4>
            <ol className="instructions-list">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="instruction-step">
                  <span className="step-num-badge">{idx + 1}</span>
                  <p className="step-text">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <button onClick={closeModal} className="btn btn-primary w-full mt-4">
            <Check size={18} />
            <span>Got it, thank you!</span>
          </button>
        </div>
      </div>

      <style>{`
        .recipe-modal-box {
          max-width: 580px;
          padding: 0;
          overflow: hidden;
          max-height: 90vh;
        }

        .recipe-hero-wrap {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .recipe-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .recipe-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }

        .recipe-close-btn:hover {
          background: rgba(0, 0, 0, 0.75);
        }

        .recipe-badge-overlay {
          position: absolute;
          bottom: 12px;
          left: 16px;
          display: flex;
          gap: 0.5rem;
        }

        .recipe-body-content {
          padding: 1.5rem;
          overflow-y: auto;
          max-height: calc(90vh - 220px);
        }

        .recipe-title {
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.25;
        }

        .recipe-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .recipe-meta-row {
          display: flex;
          gap: 1.5rem;
          padding: 0.75rem;
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-md);
        }

        .recipe-meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: var(--text-xs);
          color: var(--text-primary);
        }

        .senior-benefit-card {
          background-color: var(--primary-50);
          border: 1.5px solid var(--primary-200);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .ingredients-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .ingredient-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }

        .bullet-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--primary-500);
        }

        .instructions-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .instruction-step {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .step-num-badge {
          width: 24px;
          height: 24px;
          min-width: 24px;
          border-radius: 50%;
          background-color: var(--primary-600);
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-text {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};
