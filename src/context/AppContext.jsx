import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  initialUserData,
  initialDailyGoals,
  initialMealsData,
  exercisesData,
  initialMedications,
  initialMilestones,
  historicalTrendsData
} from '../data/mockData';
import { isSupabaseConfigured, initSupabase } from '../lib/supabaseClient';
import { supabaseService } from '../services/supabaseService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Supabase connection state
  const [isSupabaseActive, setIsSupabaseActive] = useState(() => isSupabaseConfigured());

  // Load from localStorage or defaults
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem('vitality_user');
    return saved ? JSON.parse(saved) : initialUserData;
  });

  const [dailyGoals, setDailyGoalsState] = useState(() => {
    const saved = localStorage.getItem('vitality_goals');
    return saved ? JSON.parse(saved) : initialDailyGoals;
  });

  const [meals, setMealsState] = useState(() => {
    const saved = localStorage.getItem('vitality_meals');
    return saved ? JSON.parse(saved) : initialMealsData;
  });

  const [exercises, setExercises] = useState(exercisesData);

  const [medications, setMedicationsState] = useState(() => {
    const saved = localStorage.getItem('vitality_meds');
    return saved ? JSON.parse(saved) : initialMedications;
  });

  const [milestones, setMilestonesState] = useState(() => {
    const saved = localStorage.getItem('vitality_milestones');
    return saved ? JSON.parse(saved) : initialMilestones;
  });

  const [vitals, setVitalsState] = useState(() => {
    const saved = localStorage.getItem('vitality_vitals');
    return saved ? JSON.parse(saved) : {
      heartRate: 72,
      bloodPressure: "122/78",
      spo2: 98,
      lastChecked: "Today, 10:15 AM",
      status: "Optimal"
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('vitality_font_size') || 'normal');
  const [contrast, setContrast] = useState(() => localStorage.getItem('vitality_contrast') || 'normal');

  // Modals state
  const [activeModal, setActiveModal] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState(null);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync with Supabase Cloud
  const syncWithSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsSupabaseActive(false);
      return;
    }

    try {
      setIsSupabaseActive(true);
      // Fetch user profile
      const remoteProfile = await supabaseService.fetchProfile();
      if (remoteProfile) setUserState(remoteProfile);

      // Fetch daily goals
      const remoteGoals = await supabaseService.fetchDailyGoals();
      if (remoteGoals) setDailyGoalsState(remoteGoals);

      // Fetch meals
      const remoteMeals = await supabaseService.fetchMeals();
      if (remoteMeals && remoteMeals.length > 0) setMealsState(remoteMeals);

      // Fetch medications
      const remoteMeds = await supabaseService.fetchMedications();
      if (remoteMeds && remoteMeds.length > 0) setMedicationsState(remoteMeds);

      // Fetch vitals
      const remoteVitals = await supabaseService.fetchLatestVitals();
      if (remoteVitals) setVitalsState(remoteVitals);

      // Fetch milestones
      const remoteMilestones = await supabaseService.fetchMilestones();
      if (remoteMilestones && remoteMilestones.length > 0) setMilestonesState(remoteMilestones);

      console.log('Synced with Supabase Cloud successfully.');
    } catch (err) {
      console.warn('Sync with Supabase encountered an error:', err);
    }
  }, []);

  // Initial mount sync
  useEffect(() => {
    initSupabase();
    if (isSupabaseConfigured()) {
      syncWithSupabase();
    }
  }, [syncWithSupabase]);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('vitality_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('vitality_goals', JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  useEffect(() => {
    localStorage.setItem('vitality_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('vitality_meds', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('vitality_milestones', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem('vitality_vitals', JSON.stringify(vitals));
  }, [vitals]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('vitality_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', contrast);
    localStorage.setItem('vitality_contrast', contrast);
  }, [contrast]);

  // Hydration Actions
  const addWater = () => {
    setDailyGoalsState(prev => {
      const next = Math.min(prev.waterGlassesCurrent + 1, 16);
      const updated = { ...prev, waterGlassesCurrent: next };
      // Sync with Supabase
      supabaseService.updateDailyGoals('member-1', updated);

      if (next === prev.waterGlassesGoal) {
        showToast("💧 Wonderful! You hit your daily hydration goal of 8 glasses!", 'celebration');
        triggerConfetti();
      } else {
        showToast(`💧 Added 1 glass of water (${next}/${prev.waterGlassesGoal})`);
      }
      return updated;
    });
  };

  const removeWater = () => {
    setDailyGoalsState(prev => {
      const updated = { ...prev, waterGlassesCurrent: Math.max(prev.waterGlassesCurrent - 1, 0) };
      supabaseService.updateDailyGoals('member-1', updated);
      return updated;
    });
  };

  // Meal Actions
  const addMeal = (newMeal) => {
    setMealsState(prev => [newMeal, ...prev]);
    supabaseService.insertMeal(newMeal);
    showToast(`🥗 Logged "${newMeal.title}" (${newMeal.calories} kcal)`);
    triggerConfetti();
  };

  const deleteMeal = (id) => {
    setMealsState(prev => prev.filter(m => m.id !== id));
    supabaseService.deleteMeal(id);
    showToast("Meal removed from today's log", "info");
  };

  // Medication Actions
  const toggleMedication = (id) => {
    setMedicationsState(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.taken;
        supabaseService.updateMedicationStatus(id, nextState);
        showToast(nextState ? `✅ Marked ${m.name} as taken!` : `Marked ${m.name} as pending.`);
        return { ...m, taken: nextState };
      }
      return m;
    }));
  };

  // Exercise Complete Action
  const completeExerciseSession = (exercise, completedMinutes) => {
    const burned = Math.round((exercise.caloriesBurn / exercise.duration) * completedMinutes);
    setDailyGoalsState(prev => {
      const updated = {
        ...prev,
        activeMinutesCurrent: prev.activeMinutesCurrent + completedMinutes,
        caloriesBurnCurrent: prev.caloriesBurnCurrent + burned,
        stepsCurrent: prev.stepsCurrent + Math.round(completedMinutes * 75)
      };
      supabaseService.updateDailyGoals('member-1', updated);
      return updated;
    });
    showToast(`🎉 Great job! Completed ${completedMinutes} mins of ${exercise.title} (+${burned} kcal)!`, 'celebration');
    triggerConfetti();
  };

  // Custom Activity Log
  const logCustomActivity = (type, minutes, steps, calories) => {
    setDailyGoalsState(prev => {
      const updated = {
        ...prev,
        activeMinutesCurrent: prev.activeMinutesCurrent + Number(minutes || 0),
        stepsCurrent: prev.stepsCurrent + Number(steps || 0),
        caloriesBurnCurrent: prev.caloriesBurnCurrent + Number(calories || 0)
      };
      supabaseService.updateDailyGoals('member-1', updated);
      return updated;
    });
    showToast(`🏃 Activity logged: ${type} (+${steps} steps, +${calories} kcal)!`);
    triggerConfetti();
  };

  // Vitals Update
  const updateVitalsData = (newReading) => {
    const updated = {
      ...newReading,
      lastChecked: "Just now"
    };
    setVitalsState(updated);
    supabaseService.insertVitals(updated);
    showToast("❤️ Vitals updated successfully in cloud & local database!");
  };

  const setUser = (newProfile) => {
    setUserState(newProfile);
    supabaseService.updateProfile('member-1', newProfile);
  };

  const setDailyGoals = (newGoals) => {
    setDailyGoalsState(newGoals);
    supabaseService.updateDailyGoals('member-1', newGoals);
  };

  // Confetti helper
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#2D6A4F', '#52B788', '#E76F51', '#F4A261']
      });
    } catch (e) {
      console.log('Confetti triggered');
    }
  };

  const openRecipeModal = (meal) => {
    setSelectedRecipe(meal);
    setActiveModal('recipe');
  };

  const openExerciseCoach = (exercise) => {
    setSelectedExercise(exercise);
    setActiveModal('exerciseCoach');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        dailyGoals,
        setDailyGoals,
        meals,
        addMeal,
        deleteMeal,
        exercises,
        medications,
        toggleMedication,
        milestones,
        vitals,
        updateVitalsData,
        trends: historicalTrendsData,
        activeTab,
        setActiveTab,
        fontSize,
        setFontSize,
        contrast,
        setContrast,
        activeModal,
        setActiveModal,
        selectedRecipe,
        openRecipeModal,
        selectedExercise,
        openExerciseCoach,
        closeModal,
        addWater,
        removeWater,
        completeExerciseSession,
        logCustomActivity,
        toastMessage,
        showToast,
        triggerConfetti,
        isSupabaseActive,
        syncWithSupabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
