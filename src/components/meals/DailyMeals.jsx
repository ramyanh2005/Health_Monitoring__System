import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Camera, 
  Upload, 
  Droplets, 
  Plus, 
  Minus, 
  Sparkles, 
  ChefHat, 
  BookOpen, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle,
  ScanLine,
  Image as ImageIcon
} from 'lucide-react';

export const DailyMeals = () => {
  const { 
    meals, 
    addMeal, 
    deleteMeal, 
    dailyGoals, 
    addWater, 
    removeWater, 
    openRecipeModal,
    showToast,
    triggerConfetti
  } = useApp();

  // "Track Your Plate" Scanner States
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('Lunch');
  const fileInputRef = useRef(null);

  // Quick preset sample plates for simulation
  const samplePlates = [
    {
      title: "Steamed Atlantic Salmon & Asparagus",
      calories: 420,
      protein: 36,
      carbs: 12,
      fat: 16,
      fiber: 6,
      description: "Tender herb-crusted salmon with roasted green asparagus spears and lemon drizzle.",
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=600",
      recipe: {
        prepTime: "8 mins",
        cookTime: "12 mins",
        servings: 1,
        seniorBenefits: "Omega-3 rich for joint lubrication, eye health, and gentle cardiac support.",
        ingredients: ["4 oz salmon fillet", "8 asparagus spears", "1 tbsp olive oil", "1/2 lemon"],
        instructions: ["Toss asparagus with olive oil and place in pan.", "Sear salmon 4 mins each side.", "Plate and squeeze fresh lemon."]
      }
    },
    {
      title: "Avocado & Poached Egg Toast",
      calories: 310,
      protein: 15,
      carbs: 28,
      fat: 14,
      fiber: 7,
      description: "Whole grain sourdough toasted golden, crushed avocado, and a farm-fresh poached egg.",
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600",
      recipe: {
        prepTime: "5 mins",
        cookTime: "5 mins",
        servings: 1,
        seniorBenefits: "Choline in eggs protects memory and nerve signaling in seniors.",
        ingredients: ["1 slice sprouted whole grain bread", "1/2 ripe avocado", "1 organic egg", "Pinch of paprika"],
        instructions: ["Toast bread.", "Mash avocado with a fork and spread.", "Gently poach egg for 3 mins and place on top."]
      }
    },
    {
      title: "Fresh Berry Greek Yogurt Parfait",
      calories: 220,
      protein: 18,
      carbs: 24,
      fat: 4,
      fiber: 5,
      description: "Layered probiotic Greek yogurt, fresh raspberries, blueberries, and toasted flaxseed.",
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600",
      recipe: {
        prepTime: "4 mins",
        cookTime: "0 mins",
        servings: 1,
        seniorBenefits: "Probiotics balance gut microbiome and strengthen immune defenses.",
        ingredients: ["3/4 cup Greek yogurt", "1/2 cup fresh mixed berries", "1 tsp ground flaxseed"],
        instructions: ["Layer yogurt and berries in a glass bowl.", "Top with flaxseed."]
      }
    }
  ];

  // Handle Photo Upload / Capture Simulation
  const handlePhotoSelected = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPhotoPreview(uploadEvent.target.result);
        analyzePlate(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulatePreset = (preset) => {
    setPhotoPreview(preset.image);
    analyzePlate(preset.image, preset);
  };

  const analyzePlate = (imgSrc, customPreset = null) => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate AI visual recognition
    setTimeout(() => {
      setIsScanning(false);
      const chosen = customPreset || samplePlates[Math.floor(Math.random() * samplePlates.length)];
      setScanResult({
        ...chosen,
        id: `meal-${Date.now()}`,
        time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date()),
        image: imgSrc
      });
      showToast("✨ AI Nutritional Scan Complete! Plate recognized.");
    }, 1600);
  };

  const handleConfirmLoggedMeal = () => {
    if (!scanResult) return;
    const newMeal = {
      ...scanResult,
      type: selectedMealType
    };
    addMeal(newMeal);
    setPhotoPreview(null);
    setScanResult(null);
  };

  // Group meals by type
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const totalCaloriesToday = meals.reduce((sum, m) => sum + m.calories, 0);

  return (
    <div className="meals-container fade-in">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Daily Meals & Nutrition</h2>
          <p className="page-subtitle">Effortless photo-based logging and hydration tracking tailored for seniors</p>
        </div>
        <div className="daily-calorie-tag">
          <ChefHat size={20} className="text-primary-600" />
          <span>Today's Total: <strong>{totalCaloriesToday} kcal</strong></span>
        </div>
      </div>

      {/* ======================================================================
          1. Hydration Tracker Module (MEAL-3)
          ====================================================================== */}
      <section className="card card-accent-blue hydration-card" aria-label="Hydration Tracker">
        <div className="hydration-header">
          <div className="flex items-center gap-3">
            <div className="hydration-icon-circle">
              <Droplets size={26} className="text-accent-blue" />
            </div>
            <div>
              <h3 className="hydration-title">Hydration Tracker</h3>
              <p className="hydration-subtitle">
                Target: {dailyGoals.waterGlassesGoal} glasses (approx. 2.0 Liters) for joint & kidney vitality
              </p>
            </div>
          </div>

          <div className="hydration-counter-badge">
            <span className="counter-current">{dailyGoals.waterGlassesCurrent}</span>
            <span className="counter-total">/ {dailyGoals.waterGlassesGoal} Glasses</span>
          </div>
        </div>

        {/* Visual Water Glasses Row */}
        <div className="water-glasses-row" role="meter" aria-label="Water glasses consumed">
          {Array.from({ length: dailyGoals.waterGlassesGoal }).map((_, idx) => {
            const isFilled = idx < dailyGoals.waterGlassesCurrent;
            return (
              <div 
                key={idx} 
                className={`water-glass-item ${isFilled ? 'filled' : 'empty'}`}
                title={`Glass ${idx + 1}: ${isFilled ? 'Drank' : 'Pending'}`}
              >
                <div className="water-level" />
                <span className="glass-number">{idx + 1}</span>
              </div>
            );
          })}
        </div>

        {/* 1-Tap Add/Remove Water Controls */}
        <div className="hydration-controls-row">
          <button
            onClick={addWater}
            className="btn btn-primary hydration-btn-add"
            id="meal-btn-add-water"
            aria-label="Add 1 glass of water"
          >
            <Plus size={20} />
            <span>Add 1 Glass (250ml)</span>
          </button>

          {dailyGoals.waterGlassesCurrent > 0 && (
            <button
              onClick={removeWater}
              className="btn btn-secondary hydration-btn-remove"
              aria-label="Remove 1 glass of water"
            >
              <Minus size={18} />
              <span>Remove 1</span>
            </button>
          )}

          <span className="hydration-status-text">
            {dailyGoals.waterGlassesCurrent >= dailyGoals.waterGlassesGoal ? (
              <span className="text-primary-700 font-bold flex items-center gap-1">
                <Check size={16} /> Daily Hydration Goal Reached!
              </span>
            ) : (
              <span>{dailyGoals.waterGlassesGoal - dailyGoals.waterGlassesCurrent} glasses remaining today</span>
            )}
          </span>
        </div>
      </section>

      {/* ======================================================================
          2. "Track Your Plate" Photo Logging Module (MEAL-1, MEAL-2, MEAL-7)
          ====================================================================== */}
      <section className="card card-accent-green track-plate-section" aria-label="Track Your Plate">
        <div className="track-plate-header">
          <div className="flex items-center gap-3">
            <div className="plate-icon-circle">
              <Camera size={26} className="text-primary-600" />
            </div>
            <div>
              <h3 className="section-title">Track Your Plate</h3>
              <p className="section-subtitle">Take a photo or upload your meal. Our senior-friendly AI automatically recognizes ingredients and counts calories.</p>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          capture="environment"
          onChange={handlePhotoSelected} 
          style={{ display: 'none' }} 
        />

        <div className="track-plate-content-grid">
          {/* Left Action Box: Camera & Upload Buttons */}
          <div className="plate-input-panel">
            <p className="font-bold text-primary-900 mb-3">Choose Logging Method:</p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary plate-action-btn"
                id="meal-btn-take-photo"
              >
                <Camera size={22} />
                <span>Take a Photo with Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary plate-action-btn"
                id="meal-btn-upload-gallery"
              >
                <Upload size={22} />
                <span>Upload from Gallery</span>
              </button>
            </div>

            {/* Quick Demo Previews */}
            <div className="sample-presets-block mt-4">
              <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">
                Or test with sample senior meals:
              </span>
              <div className="sample-buttons-row">
                {samplePlates.map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => handleSimulatePreset(sample)}
                    className="btn btn-secondary sample-plate-btn"
                  >
                    <span>{sample.title.split(' ')[0]} {sample.title.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Preview & Recognition Result Box */}
          <div className="plate-preview-panel">
            {!photoPreview && (
              <div className="preview-empty-state">
                <ImageIcon size={48} className="text-primary-300 mb-2" />
                <p className="font-semibold text-primary-800">No Photo Selected</p>
                <p className="text-xs text-muted">Your scanned plate and nutrition breakdown will appear here.</p>
              </div>
            )}

            {isScanning && (
              <div className="preview-scanning-state">
                <div className="scanning-radar">
                  <ScanLine size={48} className="text-primary-500 animate-pulse" />
                </div>
                <p className="font-bold text-primary-800 mt-3">Analyzing Plate Nutrition...</p>
                <p className="text-xs text-muted">Identifying ingredients, portion size & vitamins</p>
              </div>
            )}

            {photoPreview && !isScanning && scanResult && (
              <div className="preview-result-card fade-in">
                <div className="result-img-wrapper">
                  <img src={photoPreview} alt="Scanned Plate" className="result-plate-img" />
                  <span className="ai-verified-pill">
                    <Sparkles size={14} /> AI Verified
                  </span>
                </div>

                <div className="result-details">
                  <h4 className="font-bold text-lg text-primary-900 leading-tight">
                    {scanResult.title}
                  </h4>
                  <p className="text-xs text-secondary line-clamp-2 mt-1">
                    {scanResult.description}
                  </p>

                  <div className="nutrition-pills-row mt-3">
                    <span className="badge badge-coral font-bold">{scanResult.calories} kcal</span>
                    <span className="badge badge-green">Protein: {scanResult.protein}g</span>
                    <span className="badge badge-amber">Carbs: {scanResult.carbs}g</span>
                    <span className="badge badge-teal">Fat: {scanResult.fat}g</span>
                  </div>

                  {/* Meal Slot Selector */}
                  <div className="meal-slot-picker mt-3">
                    <span className="text-xs font-bold text-muted mr-2">Meal Type:</span>
                    <select 
                      value={selectedMealType} 
                      onChange={(e) => setSelectedMealType(e.target.value)}
                      className="meal-select-control"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>

                  {/* Confirm Log Action */}
                  <button
                    onClick={handleConfirmLoggedMeal}
                    className="btn btn-primary w-full mt-4"
                  >
                    <Check size={18} />
                    <span>Save to Today's Meals</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================================
          3. "Today's Meals" Grouped List (MEAL-4, MEAL-5, MEAL-6)
          ====================================================================== */}
      <section className="todays-meals-section" aria-label="Today's Logged Meals">
        <div className="section-header">
          <div>
            <h3 className="section-title">Today's Logged Meals</h3>
            <p className="section-subtitle">Grouped by meal type with nutritional breakdown and recipes</p>
          </div>
        </div>

        <div className="meal-groups-container">
          {mealTypes.map((type) => {
            const groupMeals = meals.filter(m => m.type.toLowerCase() === type.toLowerCase());
            return (
              <div key={type} className="meal-group-block">
                <div className="group-header-row">
                  <h4 className="group-title">
                    <span className="group-type-badge">{type}</span>
                  </h4>
                  <span className="text-xs font-bold text-muted">
                    {groupMeals.length} {groupMeals.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                {groupMeals.length === 0 ? (
                  <div className="empty-meal-slot">
                    <p className="text-sm text-muted">No {type.toLowerCase()} logged yet.</p>
                  </div>
                ) : (
                  <div className="grid-meals-list">
                    {groupMeals.map((meal) => (
                      <div key={meal.id} className="card meal-item-card">
                        <img 
                          src={meal.image} 
                          alt={meal.title} 
                          className="meal-thumbnail-img" 
                        />
                        <div className="meal-content-box">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-semibold text-muted flex items-center gap-1">
                                <Clock size={12} /> {meal.time || 'Today'}
                              </span>
                              <h5 className="meal-name-heading">{meal.title}</h5>
                            </div>
                            <button
                              onClick={() => deleteMeal(meal.id)}
                              className="delete-meal-btn"
                              title="Delete meal"
                              aria-label={`Delete ${meal.title}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <p className="meal-desc-text line-clamp-2">{meal.description}</p>

                          <div className="meal-macros-row">
                            <span className="badge badge-coral font-bold">{meal.calories} kcal</span>
                            <span className="text-xs font-semibold text-muted">P: {meal.protein}g</span>
                            <span className="text-xs font-semibold text-muted">C: {meal.carbs}g</span>
                            <span className="text-xs font-semibold text-muted">F: {meal.fat}g</span>
                          </div>

                          {/* MEAL-5: Link to View Recipe Details */}
                          {meal.recipe && (
                            <button
                              onClick={() => openRecipeModal(meal)}
                              className="btn btn-secondary btn-sm w-full mt-3"
                            >
                              <BookOpen size={16} className="text-primary-600" />
                              <span>View Recipe & Health Benefits</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <style>{`
        .meals-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .page-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-size: var(--text-2xl);
          color: var(--text-primary);
        }

        .page-subtitle {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }

        .daily-calorie-tag {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 1.25rem;
          background-color: var(--primary-50);
          border: 1px solid var(--primary-200);
          border-radius: var(--radius-full);
          font-size: var(--text-base);
          color: var(--primary-800);
        }

        /* Hydration Card */
        .hydration-card {
          background: linear-gradient(145deg, #eef6ff, var(--bg-surface));
          border-color: #c9e2ff;
          padding: 2rem;
        }

        .hydration-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .hydration-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background-color: var(--accent-blue-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hydration-title {
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--text-primary);
        }

        .hydration-subtitle {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }

        .hydration-counter-badge {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          padding: 0.4rem 1rem;
          background-color: var(--bg-surface);
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-sm);
          border: 1px solid #c9e2ff;
        }

        .counter-current {
          font-size: var(--text-2xl);
          font-weight: 800;
          color: var(--accent-blue);
        }

        .counter-total {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--text-muted);
        }

        /* Water Glasses Visualization */
        .water-glasses-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 640px) {
          .water-glasses-row {
            grid-template-columns: repeat(8, 1fr);
          }
        }

        .water-glass-item {
          height: 70px;
          border: 2px solid #b8d9ff;
          border-radius: 4px 4px 14px 14px;
          background-color: var(--bg-surface);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.04);
          transition: all var(--trans-normal);
        }

        .water-glass-item.filled {
          border-color: #3a86ff;
          box-shadow: 0 4px 12px rgba(58, 134, 255, 0.25);
        }

        .water-glass-item.filled .water-level {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #70a9ff, #3a86ff);
          animation: fillGlass 0.4s ease-out;
        }

        @keyframes fillGlass {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .glass-number {
          position: relative;
          z-index: 2;
          font-weight: 800;
          font-size: var(--text-sm);
          color: var(--text-primary);
        }

        .water-glass-item.filled .glass-number {
          color: #ffffff;
        }

        .hydration-controls-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .hydration-status-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-left: auto;
        }

        /* Track Your Plate Section */
        .track-plate-section {
          padding: 2rem;
        }

        .plate-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background-color: var(--primary-100);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .track-plate-content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-top: 1.5rem;
        }

        @media (min-width: 860px) {
          .track-plate-content-grid {
            grid-template-columns: 1.1fr 1fr;
          }
        }

        .plate-action-btn {
          min-height: 54px;
          font-size: var(--text-base);
          justify-content: flex-start;
          padding-left: 1.5rem;
        }

        .sample-buttons-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .sample-plate-btn {
          font-size: var(--text-xs);
          padding: 0.4rem 0.75rem;
          min-height: 36px;
        }

        .plate-preview-panel {
          background-color: var(--bg-surface-subtle);
          border: 1.5px dashed var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 280px;
        }

        .preview-empty-state, .preview-scanning-state {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .preview-result-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          overflow: hidden;
          width: 100%;
          box-shadow: var(--shadow-md);
        }

        .result-img-wrapper {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .result-plate-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ai-verified-pill {
          position: absolute;
          top: 12px;
          right: 12px;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.75rem;
          background-color: rgba(45, 106, 79, 0.9);
          backdrop-filter: blur(4px);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: var(--radius-full);
        }

        .result-details {
          padding: 1.25rem;
        }

        .nutrition-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .meal-slot-picker {
          display: flex;
          align-items: center;
        }

        .meal-select-control {
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border-medium);
          font-family: inherit;
          font-size: var(--text-sm);
          font-weight: 600;
          background-color: var(--bg-surface);
          color: var(--text-primary);
        }

        /* Grouped Meals List */
        .meal-groups-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .group-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .group-type-badge {
          font-size: var(--text-base);
          font-weight: 800;
          color: var(--primary-700);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .empty-meal-slot {
          padding: 1rem 1.25rem;
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-md);
          border: 1px dashed var(--border-light);
        }

        .grid-meals-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 768px) {
          .grid-meals-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .meal-item-card {
          display: flex;
          gap: 1.25rem;
          padding: 1.25rem;
        }

        .meal-thumbnail-img {
          width: 90px;
          height: 90px;
          min-width: 90px;
          border-radius: var(--radius-md);
          object-fit: cover;
        }

        .meal-content-box {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .meal-name-heading {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
          margin-top: 0.15rem;
        }

        .meal-desc-text {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-top: 0.35rem;
        }

        .meal-macros-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.6rem;
          margin-top: 0.5rem;
        }

        .delete-meal-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-meal-btn:hover {
          color: var(--danger-main);
          background-color: var(--danger-light);
        }
      `}</style>
    </div>
  );
};
