/**
 * Female Wellness & Fitness Dashboard Engine
 * Built for lifestyle, fitness, beauty, nutrition & cycle balance
 */

// Initial State / Storage
const defaultState = {
  profile: {
    name: "Sophia Martinez",
    age: 26,
    height: 168, // cm
    weight: 58.5, // kg
    targetWeight: 56.0, // kg
    activityLevel: "Moderately Active",
    dailyCaloriesGoal: 2000,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  metrics: {
    caloriesBurned: 450,
    caloriesGoal: 600,
    steps: 8420,
    stepsGoal: 10000,
    distanceKm: 6.1,
    waterIntakeMl: 1750,
    waterGoalMl: 2500,
    sleepHours: 8.2,
    sleepScore: 92,
    bedtime: "10:45 PM",
    wakeTime: "07:00 AM",
    deepSleep: "2h 15m"
  },
  macros: {
    calories: 1620,
    protein: 82,
    proteinGoal: 95,
    carbs: 175,
    carbsGoal: 210,
    fats: 48,
    fatsGoal: 58,
    fiber: 28,
    fiberGoal: 32
  },
  meals: [
    { type: "Breakfast", icon: "🍳", name: "Avocado Sourdough Toast & Poached Egg + Matcha Latte", calories: 420 },
    { type: "Lunch", icon: "🥗", name: "Mediterranean Salmon Quinoa Bowl with Tahini Drizzle", calories: 580 },
    { type: "Snacks", icon: "🍓", name: "Greek Yogurt with Mixed Berries, Chia Seeds & Honey", calories: 240 },
    { type: "Dinner", icon: "🍲", name: "Lemon Herb Grilled Chicken Breast with Roasted Asparagus", calories: 380 }
  ],
  foodPhotos: [
    { url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80", tag: "Berry Quinoa Bowl • 410 kcal" },
    { url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80", tag: "Green Glow Salad • 320 kcal" },
    { url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&auto=format&fit=crop&q=80", tag: "Pitaya Smoothie • 210 kcal" }
  ],
  menstrual: {
    cycleDay: 14,
    cycleLength: 28,
    phase: "Ovulation Window 🌸",
    nextPeriodDays: 14,
    symptoms: "Radiant Skin, High Vitality",
    energy: "Peak Energy ⚡",
    mood: "Radiant & Confident 💖",
    phaseTip: "Your estrogen is peaking! Ideal time for high-energy dance, HIIT, or creative projects!"
  },
  habits: [
    { id: 1, name: "Drink 2.5L Pure Water", icon: "💧", streak: 12, done: true },
    { id: 2, name: "Morning Vinyasa Yoga (20m)", icon: "🧘‍♀️", streak: 8, done: true },
    { id: 3, name: "Eat Fresh Green Smoothie", icon: "🥑", streak: 14, done: true },
    { id: 4, name: "10,000 Mindful Steps", icon: "🚶‍♀️", streak: 6, done: false },
    { id: 5, name: "Evening Deep Sleep Meditation", icon: "🌙", streak: 9, done: false },
    { id: 6, name: "Nourish Skin with Hydration Serum", icon: "✨", streak: 18, done: true }
  ],
  activeActivity: "Yoga",
  currentMood: "Radiant"
};

// Data Store Load / Save
class WellnessStore {
  constructor() {
    const saved = localStorage.getItem("female_wellness_state_v1");
    this.state = saved ? JSON.parse(saved) : defaultState;
  }

  save() {
    localStorage.setItem("female_wellness_state_v1", JSON.stringify(this.state));
    renderAll();
  }

  addWater(ml) {
    this.state.metrics.waterIntakeMl = Math.max(0, this.state.metrics.waterIntakeMl + ml);
    this.save();
  }

  addSteps(steps) {
    this.state.metrics.steps += steps;
    this.state.metrics.distanceKm = ((this.state.metrics.steps * 0.75) / 1000).toFixed(1);
    this.save();
  }

  burnCalories(cal) {
    this.state.metrics.caloriesBurned += cal;
    this.save();
  }

  toggleHabit(id) {
    const habit = this.state.habits.find(h => h.id === id);
    if (habit) {
      habit.done = !habit.done;
      if (habit.done) habit.streak += 1;
      else habit.streak = Math.max(0, habit.streak - 1);
      this.save();
    }
  }

  addMeal(type, name, calories) {
    const icons = { Breakfast: "🍳", Lunch: "🥗", Snacks: "🍓", Dinner: "🍲" };
    this.state.meals.push({ type, icon: icons[type] || "🍽️", name, calories: parseInt(calories) || 350 });
    this.state.macros.calories += parseInt(calories) || 350;
    this.save();
  }

  addFoodPhoto(url, tag) {
    this.state.foodPhotos.unshift({ url, tag: tag || "Healthy Meal" });
    this.save();
  }

  setMood(mood) {
    this.state.currentMood = mood;
    this.save();
  }

  updateProfile(profileData) {
    this.state.profile = { ...this.state.profile, ...profileData };
    this.save();
  }
}

const store = new WellnessStore();

// Calculate Wellness Score
function calculateWellnessScore() {
  const { metrics, habits } = store.state;
  const stepRatio = Math.min(1, metrics.steps / metrics.stepsGoal);
  const waterRatio = Math.min(1, metrics.waterIntakeMl / metrics.waterGoalMl);
  const calRatio = Math.min(1, metrics.caloriesBurned / metrics.caloriesGoal);
  const habitRatio = habits.filter(h => h.done).length / habits.length;

  const score = Math.round((stepRatio * 30) + (waterRatio * 25) + (calRatio * 25) + (habitRatio * 20));
  return Math.min(100, Math.max(10, score));
}

// Calculate BMI
function calculateBMI() {
  const { height, weight } = store.state.profile;
  const heightM = height / 100;
  const bmi = (weight / (heightM * heightM)).toFixed(1);
  return bmi;
}

// Global Render
function renderAll() {
  const state = store.state;
  const { profile, metrics, macros, menstrual } = state;

  // Header & Greeting
  const nameSpan = document.getElementById("header-user-name");
  if (nameSpan) nameSpan.textContent = profile.name.split(" ")[0];
  const avatarImg = document.getElementById("nav-avatar-img");
  if (avatarImg) avatarImg.src = profile.avatar;

  // Wellness Score
  const score = calculateWellnessScore();
  const scoreEl = document.getElementById("val-wellness-score");
  if (scoreEl) scoreEl.textContent = score;
  const scoreProgress = document.getElementById("score-ring-circle");
  if (scoreProgress) {
    const offset = 377 - (377 * (score / 100));
    scoreProgress.style.strokeDashoffset = offset;
  }

  // Calories Section
  const calBurnedEl = document.getElementById("val-cal-burned");
  if (calBurnedEl) calBurnedEl.textContent = metrics.caloriesBurned;
  const calRem = Math.max(0, metrics.caloriesGoal - metrics.caloriesBurned);
  const calRemEl = document.getElementById("val-cal-remaining");
  if (calRemEl) calRemEl.textContent = `${calRem} kcal`;
  const calProgress = document.getElementById("bar-cal-progress");
  if (calProgress) {
    calProgress.style.width = `${Math.min(100, (metrics.caloriesBurned / metrics.caloriesGoal) * 100)}%`;
  }

  // Steps Section
  const stepsEl = document.getElementById("val-steps");
  if (stepsEl) stepsEl.textContent = metrics.steps.toLocaleString();
  const stepsRem = Math.max(0, metrics.stepsGoal - metrics.steps);
  const stepsRemEl = document.getElementById("val-steps-remaining");
  if (stepsRemEl) stepsRemEl.textContent = `${stepsRem.toLocaleString()} steps`;
  const stepsDistEl = document.getElementById("val-distance");
  if (stepsDistEl) stepsDistEl.textContent = `${metrics.distanceKm} km`;
  const stepsProgress = document.getElementById("bar-steps-progress");
  if (stepsProgress) {
    stepsProgress.style.width = `${Math.min(100, (metrics.steps / metrics.stepsGoal) * 100)}%`;
  }

  // Water Section
  const waterEl = document.getElementById("val-water");
  if (waterEl) waterEl.textContent = `${(metrics.waterIntakeMl / 1000).toFixed(2)} L`;
  const waterRem = Math.max(0, metrics.waterGoalMl - metrics.waterIntakeMl);
  const waterRemEl = document.getElementById("val-water-remaining");
  if (waterRemEl) waterRemEl.textContent = `${(waterRem / 1000).toFixed(2)} L required`;
  const waterProgress = document.getElementById("bar-water-progress");
  if (waterProgress) {
    waterProgress.style.width = `${Math.min(100, (metrics.waterIntakeMl / metrics.waterGoalMl) * 100)}%`;
  }

  // Sleep Section
  const sleepEl = document.getElementById("val-sleep-hours");
  if (sleepEl) sleepEl.textContent = `${metrics.sleepHours} hrs`;
  const sleepScoreEl = document.getElementById("val-sleep-score");
  if (sleepScoreEl) sleepScoreEl.textContent = `${metrics.sleepScore}% Sleep Quality`;
  const sleepTimesEl = document.getElementById("val-sleep-times");
  if (sleepTimesEl) sleepTimesEl.textContent = `🌙 ${metrics.bedtime} - ☀️ ${metrics.wakeTime}`;

  // BMI Section
  const bmiVal = calculateBMI();
  const bmiEl = document.getElementById("val-bmi");
  if (bmiEl) bmiEl.textContent = bmiVal;
  const bmiMarker = document.getElementById("bmi-marker-pin");
  if (bmiMarker) {
    // Map BMI 15-35 to percentage 0-100%
    const pct = Math.min(95, Math.max(5, ((bmiVal - 15) / 20) * 100));
    bmiMarker.style.left = `${pct}%`;
  }
  const weightProgress = document.getElementById("val-weight-status");
  if (weightProgress) {
    const diff = (profile.weight - profile.targetWeight).toFixed(1);
    weightProgress.textContent = diff > 0 ? `${diff} kg to healthy goal` : "Goal Achieved! ✨";
  }

  // Menstrual Section
  const cycleDayEl = document.getElementById("val-cycle-day");
  if (cycleDayEl) cycleDayEl.textContent = `Day ${menstrual.cycleDay}`;
  const cyclePhaseEl = document.getElementById("val-cycle-phase");
  if (cyclePhaseEl) cyclePhaseEl.textContent = menstrual.phase;
  const nextPeriodEl = document.getElementById("val-next-period");
  if (nextPeriodEl) nextPeriodEl.textContent = `Next Period in ${menstrual.nextPeriodDays} Days`;
  const cycleTipEl = document.getElementById("val-cycle-tip");
  if (cycleTipEl) cycleTipEl.textContent = menstrual.phaseTip;

  // Macros & Nutrition
  const macroCalEl = document.getElementById("macro-calories");
  if (macroCalEl) macroCalEl.textContent = `${macros.calories} / ${profile.dailyCaloriesGoal}`;
  const macroProteinEl = document.getElementById("macro-protein");
  if (macroProteinEl) macroProteinEl.textContent = `${macros.protein}g / ${macros.proteinGoal}g`;
  const macroCarbsEl = document.getElementById("macro-carbs");
  if (macroCarbsEl) macroCarbsEl.textContent = `${macros.carbs}g / ${macros.carbsGoal}g`;
  const macroFatsEl = document.getElementById("macro-fats");
  if (macroFatsEl) macroFatsEl.textContent = `${macros.fats}g / ${macros.fatsGoal}g`;

  // Render Meals
  const mealsList = document.getElementById("meals-container");
  if (mealsList) {
    mealsList.innerHTML = state.meals.map((m, idx) => `
      <div class="meal-item">
        <div>
          <div class="meal-header">
            <span class="meal-type">${m.icon} ${m.type}</span>
            <span class="meal-calories">${m.calories} kcal</span>
          </div>
          <div class="meal-name">${m.name}</div>
        </div>
        <button class="btn-add-meal" onclick="openAddMealModal('${m.type}')">
          <i class="fa-solid fa-plus"></i> Add ${m.type}
        </button>
      </div>
    `).join("");
  }

  // Render Food Photos
  const gallery = document.getElementById("food-plate-gallery");
  if (gallery) {
    gallery.innerHTML = state.foodPhotos.map(p => `
      <div class="food-img-card">
        <img src="${p.url}" alt="Food Plate" onerror="this.src='https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&auto=format&fit=crop&q=80'" />
        <div class="food-img-tag">${p.tag}</div>
      </div>
    `).join("");
  }

  // Render Habits
  const habitsList = document.getElementById("habits-container");
  if (habitsList) {
    habitsList.innerHTML = state.habits.map(h => `
      <div class="habit-row ${h.done ? 'completed' : ''}" onclick="store.toggleHabit(${h.id})">
        <div class="habit-info">
          <div class="habit-checkbox">
            ${h.done ? '<i class="fa-solid fa-check"></i>' : ''}
          </div>
          <span>${h.icon}</span>
          <span class="habit-title">${h.name}</span>
        </div>
        <div class="habit-streak">🔥 ${h.streak}d streak</div>
      </div>
    `).join("");
  }

  // Update Profile View in Modal
  const pName = document.getElementById("prof-name");
  if (pName) pName.value = profile.name;
  const pAge = document.getElementById("prof-age");
  if (pAge) pAge.value = profile.age;
  const pHeight = document.getElementById("prof-height");
  if (pHeight) pHeight.value = profile.height;
  const pWeight = document.getElementById("prof-weight");
  if (pWeight) pWeight.value = profile.weight;
  const pTargetWeight = document.getElementById("prof-target");
  if (pTargetWeight) pTargetWeight.value = profile.targetWeight;
  const pActivity = document.getElementById("prof-activity");
  if (pActivity) pActivity.value = profile.activityLevel;
}

// Workout Live Timer
let workoutInterval = null;
let workoutSeconds = 0;
let isWorkingOut = false;

function toggleWorkoutTimer() {
  const btn = document.getElementById("btn-timer-toggle");
  const timeDisplay = document.getElementById("workout-timer-val");
  const calDisplay = document.getElementById("workout-live-cal");

  if (isWorkingOut) {
    // Stop
    clearInterval(workoutInterval);
    isWorkingOut = false;
    if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
    // Add burned calories
    const burned = Math.round(workoutSeconds * 0.15);
    store.burnCalories(burned);
    alert(`🌟 Fantastic workout! You completed ${(workoutSeconds / 60).toFixed(1)} mins and burned ${burned} kcal!`);
    workoutSeconds = 0;
    if (timeDisplay) timeDisplay.textContent = "00:00";
    if (calDisplay) calDisplay.textContent = "0 kcal burned";
  } else {
    // Start
    isWorkingOut = true;
    if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    workoutInterval = setInterval(() => {
      workoutSeconds++;
      const mins = Math.floor(workoutSeconds / 60).toString().padStart(2, "0");
      const secs = (workoutSeconds % 60).toString().padStart(2, "0");
      if (timeDisplay) timeDisplay.textContent = `${mins}:${secs}`;
      const liveCal = Math.round(workoutSeconds * 0.15);
      if (calDisplay) calDisplay.textContent = `${liveCal} kcal burned`;
    }, 1000);
  }
}

function selectActivity(name, elem) {
  document.querySelectorAll(".activity-chip").forEach(c => c.classList.remove("active"));
  if (elem) elem.classList.add("active");
  const label = document.getElementById("selected-activity-label");
  if (label) label.textContent = name;
}

// Breathing Exercise
let breathingInterval = null;
let breathePhase = "Inhale";
function toggleBreathing() {
  const circle = document.getElementById("breathe-circle");
  const text = document.getElementById("breathe-text");
  if (!circle) return;

  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
    circle.classList.remove("expanding");
    if (text) text.textContent = "Start Breath 🌸";
    return;
  }

  circle.classList.add("expanding");
  if (text) text.textContent = "Inhale Deeply (4s)...";

  let step = 0;
  breathingInterval = setInterval(() => {
    step = (step + 1) % 3;
    if (step === 0) {
      circle.classList.add("expanding");
      if (text) text.textContent = "Inhale (4s)... 🌿";
    } else if (step === 1) {
      if (text) text.textContent = "Hold (7s)... ✨";
    } else {
      circle.classList.remove("expanding");
      if (text) text.textContent = "Exhale (8s)... 💨";
    }
  }, 4000);
}

// Mood Selector
function setMoodSelection(mood, elem) {
  store.setMood(mood);
  document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));
  if (elem) elem.classList.add("selected");
}

// Modal Handlers
function openAddMealModal(mealType = "Breakfast") {
  const modal = document.getElementById("modal-add-meal");
  const select = document.getElementById("meal-type-select");
  if (select) select.value = mealType;
  if (modal) modal.classList.add("active");
}

function closeAddMealModal() {
  const modal = document.getElementById("modal-add-meal");
  if (modal) modal.classList.remove("active");
}

function handleAddMealSubmit(e) {
  e.preventDefault();
  const type = document.getElementById("meal-type-select").value;
  const name = document.getElementById("meal-input-name").value;
  const cal = document.getElementById("meal-input-cal").value;
  if (name) {
    store.addMeal(type, name, cal);
    closeAddMealModal();
    document.getElementById("form-add-meal").reset();
  }
}

function openPhotoUploadModal() {
  const modal = document.getElementById("modal-photo-upload");
  if (modal) modal.classList.add("active");
}

function closePhotoUploadModal() {
  const modal = document.getElementById("modal-photo-upload");
  if (modal) modal.classList.remove("active");
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      store.addFoodPhoto(e.target.result, "Fresh Plate • 350 kcal");
      closePhotoUploadModal();
    };
    reader.readAsDataURL(file);
  }
}

function handlePhotoUrlSubmit(e) {
  e.preventDefault();
  const url = document.getElementById("photo-url-input").value;
  const tag = document.getElementById("photo-tag-input").value;
  if (url) {
    store.addFoodPhoto(url, tag || "Healthy Meal");
    closePhotoUploadModal();
    document.getElementById("form-photo-url").reset();
  }
}

function openProfileModal() {
  const modal = document.getElementById("modal-profile");
  if (modal) modal.classList.add("active");
}

function closeProfileModal() {
  const modal = document.getElementById("modal-profile");
  if (modal) modal.classList.remove("active");
}

function handleProfileSubmit(e) {
  e.preventDefault();
  const updated = {
    name: document.getElementById("prof-name").value,
    age: parseInt(document.getElementById("prof-age").value),
    height: parseFloat(document.getElementById("prof-height").value),
    weight: parseFloat(document.getElementById("prof-weight").value),
    targetWeight: parseFloat(document.getElementById("prof-target").value),
    activityLevel: document.getElementById("prof-activity").value
  };
  store.updateProfile(updated);
  closeProfileModal();
}

// Chart.js Reports
let analyticsChart = null;
function initReportsChart() {
  const ctx = document.getElementById("reportsChart");
  if (!ctx) return;

  const dataWeekly = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Steps (x100)",
        data: [78, 85, 92, 80, 105, 112, 84],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        fill: true,
        tension: 0.4
      },
      {
        label: "Active Calories Burned",
        data: [420, 480, 520, 410, 590, 640, 450],
        borderColor: "#f43f5e",
        backgroundColor: "rgba(244, 63, 94, 0.12)",
        fill: true,
        tension: 0.4
      }
    ]
  };

  analyticsChart = new Chart(ctx, {
    type: "line",
    data: dataWeekly,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { font: { family: "'Outfit', sans-serif", weight: '600' } }
        }
      },
      scales: {
        y: {
          grid: { color: "rgba(200, 200, 200, 0.15)" }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

function switchReportTab(period, elem) {
  document.querySelectorAll(".report-tab-btn").forEach(b => b.classList.remove("active"));
  if (elem) elem.classList.add("active");

  if (!analyticsChart) return;
  if (period === "weekly") {
    analyticsChart.data.labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    analyticsChart.data.datasets[0].data = [78, 85, 92, 80, 105, 112, 84];
    analyticsChart.data.datasets[1].data = [420, 480, 520, 410, 590, 640, 450];
  } else if (period === "monthly") {
    analyticsChart.data.labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    analyticsChart.data.datasets[0].data = [82, 94, 101, 88];
    analyticsChart.data.datasets[1].data = [460, 510, 580, 490];
  } else {
    analyticsChart.data.labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    analyticsChart.data.datasets[0].data = [75, 80, 85, 90, 92, 98, 104, 108, 95, 99, 102, 105];
    analyticsChart.data.datasets[1].data = [410, 430, 460, 490, 520, 540, 580, 610, 530, 560, 590, 620];
  }
  analyticsChart.update();
}

// Initial Boot
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  initReportsChart();
});
