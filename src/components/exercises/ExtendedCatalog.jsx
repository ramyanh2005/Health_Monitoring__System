import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Play, 
  Flame, 
  ShieldCheck, 
  Dumbbell, 
  Sparkles,
  Check
} from 'lucide-react';

export const ExtendedCatalog = () => {
  const { exercises, setActiveTab, openExerciseCoach } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Categories list
  const categories = ['All', 'Flexibility & Posture', 'Mobility', 'Balance & Stability', 'Low-Impact Cardio', 'Strength & Resistance', 'Mindfulness & Vitals'];

  // Filter exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.benefits.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || ex.difficulty.toLowerCase().includes(selectedDifficulty.toLowerCase());
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="catalog-container fade-in">
      {/* ======================================================================
          1. Header & Back Navigation (CAT-1)
          ====================================================================== */}
      <div className="catalog-top-nav">
        <button
          onClick={() => setActiveTab('exercises')}
          className="btn btn-secondary back-to-exercises-btn"
          id="cat-btn-back-exercises"
          aria-label="Back to Suggested Exercises"
        >
          <ArrowLeft size={20} />
          <span>Back to Suggested Exercises</span>
        </button>

        <div className="catalog-title-box">
          <h2 className="page-title">Exercise Library & Catalog</h2>
          <p className="page-subtitle">
            Browse our complete collection of low-impact, joint-friendly workouts designed for senior health
          </p>
        </div>
      </div>

      {/* ======================================================================
          2. Search & Category Filters (CAT-4)
          ====================================================================== */}
      <section className="card filter-bar-card" aria-label="Search and Filter Exercises">
        <div className="filter-controls-row">
          {/* Search Input */}
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by activity name, joint focus (e.g. knee, spine, balance)..."
              className="search-input-field"
              aria-label="Search exercises"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="clear-search-btn"
              >
                ×
              </button>
            )}
          </div>

          {/* Difficulty Quick Filter */}
          <div className="difficulty-pill-group">
            <span className="text-xs font-bold text-muted mr-1">Intensity:</span>
            {['All', 'Gentle', 'Moderate'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`diff-filter-btn ${selectedDifficulty === diff ? 'active' : ''}`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Category Scroll / Pill Tabs */}
        <div className="category-pills-scroll" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`cat-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              role="tab"
              aria-selected={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ======================================================================
          3. Photo-Card Grid (CAT-2, CAT-3, CAT-5)
          ====================================================================== */}
      <section className="catalog-grid-section" aria-label="Exercise Catalog Grid">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-bold text-secondary">
            Showing {filteredExercises.length} {filteredExercises.length === 1 ? 'workout' : 'workouts'}
          </p>
        </div>

        {filteredExercises.length === 0 ? (
          <div className="card empty-catalog-state">
            <Dumbbell size={48} className="text-primary-300 mb-2" />
            <h4 className="font-bold text-lg text-primary-900">No exercises matched your filters</h4>
            <p className="text-xs text-muted mt-1">Try searching for "Yoga", "Balance", or clear your filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedDifficulty('All'); }}
              className="btn btn-secondary btn-sm mt-4"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid-catalog-cards">
            {filteredExercises.map((exercise) => {
              const isGentle = exercise.difficulty.toLowerCase().includes('gentle') || exercise.difficultyLevel === 'easy';
              return (
                <div key={exercise.id} className="card catalog-item-card">
                  <div className="catalog-img-wrap">
                    <img 
                      src={exercise.image} 
                      alt={exercise.title} 
                      className="catalog-card-img" 
                    />
                    <div className="catalog-overlay-pills">
                      <span className="badge badge-amber">{exercise.duration} mins</span>
                      <span className={`badge ${isGentle ? 'badge-teal' : 'badge-coral'}`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="catalog-card-body">
                    <span className="catalog-card-category">{exercise.category}</span>
                    <h4 className="catalog-card-title">{exercise.title}</h4>
                    <p className="catalog-card-desc line-clamp-2">{exercise.benefits}</p>

                    <div className="catalog-safety-badge">
                      <ShieldCheck size={15} className="text-primary-600 shrink-0" />
                      <span className="text-xs text-secondary font-medium line-clamp-1">{exercise.safetyTip}</span>
                    </div>

                    <div className="catalog-card-footer">
                      <span className="text-xs font-bold text-muted">
                        <Flame size={14} className="text-accent-coral inline mr-1" />
                        ~{exercise.caloriesBurn} kcal
                      </span>

                      {/* CAT-5: Startable in 1 tap directly from catalog card */}
                      <button
                        onClick={() => openExerciseCoach(exercise)}
                        className="btn btn-primary btn-sm"
                        aria-label={`Start ${exercise.title}`}
                      >
                        <Play size={16} />
                        <span>Start</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <style>{`
        .catalog-container {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .catalog-top-nav {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .back-to-exercises-btn {
          align-self: flex-start;
          min-height: 44px;
        }

        /* Filter Bar */
        .filter-bar-card {
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .filter-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
        }

        .search-input-field {
          width: 100%;
          min-height: 48px;
          padding: 0.75rem 2.5rem 0.75rem 2.75rem;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--border-medium);
          font-family: inherit;
          font-size: var(--text-base);
          background-color: var(--bg-surface);
          color: var(--text-primary);
          transition: border-color var(--trans-fast);
        }

        .search-input-field:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.15);
        }

        .clear-search-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.4rem;
          color: var(--text-muted);
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .difficulty-pill-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .diff-filter-btn {
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 700;
          background-color: var(--bg-surface-subtle);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
        }

        .diff-filter-btn.active {
          background-color: var(--primary-500);
          color: white;
          border-color: var(--primary-500);
        }

        .category-pills-scroll {
          display: flex;
          gap: 0.6rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
          -webkit-overflow-scrolling: touch;
        }

        .cat-pill-btn {
          white-space: nowrap;
          padding: 0.45rem 1.1rem;
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 700;
          background-color: var(--bg-surface-subtle);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
          min-height: 40px;
        }

        .cat-pill-btn:hover {
          background-color: var(--primary-50);
          color: var(--primary-600);
        }

        .cat-pill-btn.active {
          background-color: var(--primary-600);
          color: white;
          border-color: var(--primary-600);
        }

        /* Grid */
        .grid-catalog-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 640px) {
          .grid-catalog-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .grid-catalog-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .catalog-item-card {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .catalog-img-wrap {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .catalog-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--trans-normal);
        }

        .catalog-item-card:hover .catalog-card-img {
          transform: scale(1.05);
        }

        .catalog-overlay-pills {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
        }

        .catalog-card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .catalog-card-category {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--primary-600);
          text-transform: uppercase;
        }

        .catalog-card-title {
          font-size: var(--text-base);
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.3;
          margin-top: 0.2rem;
        }

        .catalog-card-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-top: 0.4rem;
          flex: 1;
        }

        .catalog-safety-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.6rem;
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-sm);
          margin: 0.85rem 0;
        }

        .catalog-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-light);
        }

        .empty-catalog-state {
          text-align: center;
          padding: 3rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};
