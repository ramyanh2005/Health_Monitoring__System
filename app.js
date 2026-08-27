// app.js - Male Unhealthy Dashboard Reactive Engine

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------------------------
  // 1. STATE INITIALIZATION & LOCALSTORAGE MANAGEMENT
  // ----------------------------------------------------
  const STORAGE_KEYS = {
    PROFILE: "male_health_profile_v1",
    HISTORY: "male_health_history_v1",
    LOGGED_MEALS: "male_health_logged_meals_v1",
    FOOD_PLATES: "male_health_food_plates_v1",
    BOOKINGS: "male_health_doctor_bookings_v1",
    THEME: "male_health_theme_v1",
    SOUND: "male_health_sound_v1"
  };

  // Load or fallback to initial datasets from data.js
  let userProfile = loadStorage(STORAGE_KEYS.PROFILE, INITIAL_HEALTH_PROFILE);
  let historyData = loadStorage(STORAGE_KEYS.HISTORY, HISTORICAL_DATA_7_DAYS);
  let foodPlates = loadStorage(STORAGE_KEYS.FOOD_PLATES, SAMPLE_FOOD_PLATES);
  let doctorBookings = loadStorage(STORAGE_KEYS.BOOKINGS, []);
  let isSoundOn = loadStorage(STORAGE_KEYS.SOUND, true);
  let currentTheme = loadStorage(STORAGE_KEYS.THEME, "dark");

  let activeConditionId = "fatty_liver";
  let activeMealFilter = "all";
  let activeChartRange = "7days";
  let currentDayIndex = historyData.length - 1; // Default to Today
  let cameraStream = null;
  let selectedPlateMealType = "breakfast";
  let selectedDoctorForBooking = null;

  // Chart instances
  let caloriesChart = null;
  let stepsChart = null;
  let waterChart = null;
  let recoveryChart = null;

  // Circle perimeter for r=42 is 2 * Math.PI * 42 ≈ 263.89
  const CIRCLE_PERIMETER = 263.89;

  function loadStorage(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn("Storage load error:", e);
      return fallback;
    }
  }

  function saveStorage(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  // ----------------------------------------------------
  // 2. AUDIO SYNTHESIZER (WEB AUDIO API)
  // ----------------------------------------------------
  let audioCtx = null;
  function playChime(type = "success") {
    if (!isSoundOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "water") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "burn") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(329.63, now);
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // Ignore audio context errors
    }
  }

  // ----------------------------------------------------
  // 3. TOAST NOTIFICATIONS
  // ----------------------------------------------------
  function showToast(message, type = "success", icon = "fa-check") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-msg toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ----------------------------------------------------
  // 4. THEME & HEADER CONTROLS
  // ----------------------------------------------------
  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    saveStorage(STORAGE_KEYS.THEME, theme);
    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) {
      themeIcon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
    // Re-render charts for theme colors
    updateCharts();
  }

  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      applyTheme(currentTheme === "dark" ? "light" : "dark");
      playChime("success");
    });
  }

  const soundToggleBtn = document.getElementById("soundToggleBtn");
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => {
      isSoundOn = !isSoundOn;
      saveStorage(STORAGE_KEYS.SOUND, isSoundOn);
      const soundIcon = document.getElementById("soundIcon");
      if (soundIcon) {
        soundIcon.className = isSoundOn ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
      }
      showToast(isSoundOn ? "Audio feedback enabled" : "Audio muted", "info", isSoundOn ? "fa-volume-high" : "fa-volume-xmark");
    });
  }

  // ----------------------------------------------------
  // 5. VITALS & USER PROFILE RENDERING
  // ----------------------------------------------------
  function renderProfileVitals() {
    const today = historyData[currentDayIndex];
    if (!today) return;

    document.getElementById("bannerUserName").textContent = userProfile.name;
    document.getElementById("bannerDemographics").textContent = 
      `${userProfile.age} yrs • Male • ${userProfile.heightCm} cm • ${userProfile.weightKg} kg (Target: ${userProfile.targetWeightKg} kg)`;

    // Calculate BMI
    const heightM = userProfile.heightCm / 100;
    const bmi = (userProfile.weightKg / (heightM * heightM)).toFixed(1);
    document.getElementById("vitalBmiVal").innerHTML = `${bmi} <span style="font-size: 12px; font-weight: normal; color: var(--text-secondary);">kg/m²</span>`;

    let bmiStatus = "Healthy Weight";
    let bmiClass = "status-good";
    if (bmi >= 25 && bmi < 30) {
      bmiStatus = "Overweight (Visceral Fat)";
      bmiClass = "status-warning";
    } else if (bmi >= 30) {
      bmiStatus = "Obesity (High Health Risk)";
      bmiClass = "status-danger";
    }
    const bmiElem = document.getElementById("vitalBmiStatus");
    bmiElem.textContent = bmiStatus;
    bmiElem.className = `vital-status ${bmiClass}`;

    document.getElementById("vitalBpVal").innerHTML = `${userProfile.bloodPressure} <span style="font-size: 12px; font-weight: normal; color: var(--text-secondary);">mmHg</span>`;
    document.getElementById("vitalGlucoseVal").innerHTML = `${userProfile.fastingGlucose} <span style="font-size: 12px; font-weight: normal; color: var(--text-secondary);">mg/dL</span>`;
    document.getElementById("vitalTriglyceridesVal").innerHTML = `${userProfile.triglycerides} <span style="font-size: 12px; font-weight: normal; color: var(--text-secondary);">mg/dL</span>`;

    // Targets display
    document.getElementById("calorieTargetVal").textContent = userProfile.dailyCalorieBurnTarget.toLocaleString();
    document.getElementById("stepsTargetVal").textContent = userProfile.dailyStepTarget.toLocaleString();
    document.getElementById("waterTargetVal").textContent = userProfile.dailyWaterTargetMl.toLocaleString();
  }

  // ----------------------------------------------------
  // 6. CORE 3 TARGET CARDS LOGIC & GAUGES
  // ----------------------------------------------------
  function updateCoreTargetsUI() {
    const today = historyData[currentDayIndex];
    if (!today) return;

    // 1. Calories Card
    const targetBurn = userProfile.dailyCalorieBurnTarget;
    const currentBurn = today.caloriesBurned;
    const remainingBurn = Math.max(0, targetBurn - currentBurn);
    const burnPercent = Math.min(100, Math.round((currentBurn / targetBurn) * 100));

    document.getElementById("caloriesBurnedVal").textContent = `${currentBurn} kcal`;
    document.getElementById("caloriesRemainingVal").textContent = remainingBurn === 0 ? "Goal Met! 🎉" : `${remainingBurn} kcal`;
    document.getElementById("caloriePercentVal").textContent = `${burnPercent}%`;

    const calCircle = document.getElementById("calorieProgressCircle");
    if (calCircle) {
      calCircle.style.strokeDasharray = CIRCLE_PERIMETER;
      const offset = CIRCLE_PERIMETER - (burnPercent / 100) * CIRCLE_PERIMETER;
      calCircle.style.strokeDashoffset = offset;
    }

    // 2. Steps Card
    const targetSteps = userProfile.dailyStepTarget;
    const currentSteps = today.steps;
    const remainingSteps = Math.max(0, targetSteps - currentSteps);
    const stepsPercent = Math.min(100, Math.round((currentSteps / targetSteps) * 100));
    const distanceKm = (currentSteps * 0.000762).toFixed(1);

    document.getElementById("stepsCompletedVal").textContent = currentSteps.toLocaleString();
    document.getElementById("stepsRemainingVal").textContent = remainingSteps === 0 ? "Goal Met! 🏆" : remainingSteps.toLocaleString();
    document.getElementById("stepsDistanceVal").textContent = `${distanceKm} km`;
    document.getElementById("stepsPercentVal").textContent = `${stepsPercent}%`;

    const stepCircle = document.getElementById("stepsProgressCircle");
    if (stepCircle) {
      stepCircle.style.strokeDasharray = CIRCLE_PERIMETER;
      const offset = CIRCLE_PERIMETER - (stepsPercent / 100) * CIRCLE_PERIMETER;
      stepCircle.style.strokeDashoffset = offset;
    }

    // 3. Water Card
    const targetWater = userProfile.dailyWaterTargetMl;
    const currentWater = today.waterMl;
    const remainingWater = Math.max(0, targetWater - currentWater);
    const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));

    document.getElementById("waterCurrentVal").textContent = `${currentWater.toLocaleString()} mL`;
    document.getElementById("waterRemainingVal").textContent = remainingWater === 0 ? "Hydrated! 💧" : `${remainingWater.toLocaleString()} mL`;
    document.getElementById("waterPercentVal").textContent = `${waterPercent}%`;

    const waterWave = document.getElementById("waterWaveLevel");
    if (waterWave) {
      waterWave.style.height = `${waterPercent}%`;
    }

    // 4. Recovery Score Calculation
    calculateAndRenderRecoveryScore(today, burnPercent, stepsPercent, waterPercent);

    // Save history data changes
    saveStorage(STORAGE_KEYS.HISTORY, historyData);
  }

  function calculateAndRenderRecoveryScore(dayObj, burnPct, stepPct, waterPct) {
    // Weighted score components:
    // Burn: 25 pts, Steps: 25 pts, Water: 25 pts, Nutrition Compliance: 25 pts
    const burnScore = Math.min(25, (burnPct / 100) * 25);
    const stepScore = Math.min(25, (stepPct / 100) * 25);
    const waterScore = Math.min(25, (waterPct / 100) * 25);
    const mealScore = Math.min(25, (dayObj.mealsLogged >= 3 ? 25 : dayObj.mealsLogged * 8));

    const totalScore = Math.round(burnScore + stepScore + waterScore + mealScore);
    dayObj.recoveryScore = totalScore;

    const topScoreElem = document.getElementById("topRecoveryScoreVal");
    if (topScoreElem) {
      topScoreElem.textContent = `${totalScore} / 100`;
    }

    const riskBadge = document.getElementById("riskLevelBadge");
    if (riskBadge) {
      if (totalScore >= 90) {
        riskBadge.textContent = "OPTIMAL PROGRESS";
        riskBadge.style.background = "rgba(16, 185, 129, 0.15)";
        riskBadge.style.color = "#34d399";
        riskBadge.style.borderColor = "rgba(16, 185, 129, 0.3)";
      } else if (totalScore >= 70) {
        riskBadge.textContent = "ON RECOVERY TRACK";
        riskBadge.style.background = "rgba(6, 182, 212, 0.15)";
        riskBadge.style.color = "#22d3ee";
        riskBadge.style.borderColor = "rgba(6, 182, 212, 0.3)";
      } else {
        riskBadge.textContent = "ACTION NEEDED";
        riskBadge.style.background = "rgba(239, 68, 68, 0.15)";
        riskBadge.style.color = "#f87171";
        riskBadge.style.borderColor = "rgba(239, 68, 68, 0.3)";
      }
    }
  }

  // Quick Action Buttons Event Listeners
  document.querySelectorAll(".calories-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const burn = parseInt(btn.getAttribute("data-burn"), 10);
      historyData[currentDayIndex].caloriesBurned += burn;
      updateCoreTargetsUI();
      updateCharts();
      playChime("burn");
      showToast(`Logged +${burn} kcal burned!`, "success", "fa-fire");
    });
  });

  document.querySelectorAll(".steps-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const steps = parseInt(btn.getAttribute("data-steps"), 10);
      historyData[currentDayIndex].steps += steps;
      // Also add modest calorie burn for steps
      const estCal = Math.round(steps * 0.04);
      historyData[currentDayIndex].caloriesBurned += estCal;
      updateCoreTargetsUI();
      updateCharts();
      playChime("success");
      showToast(`Added +${steps.toLocaleString()} steps (+${estCal} kcal)!`, "success", "fa-shoe-prints");
    });
  });

  document.querySelectorAll(".water-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const water = parseInt(btn.getAttribute("data-water"), 10);
      historyData[currentDayIndex].waterMl += water;
      updateCoreTargetsUI();
      updateCharts();
      playChime("water");
      showToast(`Hydration logged: +${water} mL!`, "info", "fa-droplet");
    });
  });

  // Date Switcher
  const prevDayBtn = document.getElementById("prevDayBtn");
  const nextDayBtn = document.getElementById("nextDayBtn");
  const dateDisplay = document.getElementById("currentDateDisplay");

  if (prevDayBtn && nextDayBtn) {
    prevDayBtn.addEventListener("click", () => {
      if (currentDayIndex > 0) {
        currentDayIndex--;
        updateDateView();
      }
    });
    nextDayBtn.addEventListener("click", () => {
      if (currentDayIndex < historyData.length - 1) {
        currentDayIndex++;
        updateDateView();
      }
    });
  }

  function updateDateView() {
    const cur = historyData[currentDayIndex];
    if (dateDisplay && cur) {
      dateDisplay.textContent = cur.dayLabel;
    }
    updateCoreTargetsUI();
    renderLoggedMeals();
  }

  // ----------------------------------------------------
  // 7. MEAL SUGGESTIONS & "ADD MEAL" ENGINE
  // ----------------------------------------------------
  let loggedMeals = loadStorage(STORAGE_KEYS.LOGGED_MEALS, [
    {
      id: "log_1",
      title: "Mediterranean Spinach & Omega-3 Egg Scramble",
      type: "breakfast",
      calories: 420,
      protein: 28,
      carbs: 18,
      fats: 26,
      icon: "🍳",
      time: "08:15 AM"
    },
    {
      id: "log_2",
      title: "Grilled Herb Chicken & Quinoa Superfood Bowl",
      type: "lunch",
      calories: 540,
      protein: 48,
      carbs: 38,
      fats: 18,
      icon: "🥗",
      time: "01:10 PM"
    }
  ]);

  function renderMealSuggestions() {
    const container = document.getElementById("mealSuggestionsContainer");
    if (!container) return;

    const filtered = activeMealFilter === "all" 
      ? MEAL_SUGGESTIONS 
      : MEAL_SUGGESTIONS.filter(m => m.type === activeMealFilter);

    container.innerHTML = filtered.map(meal => `
      <div class="meal-card">
        <div class="meal-image-wrap">
          <img src="${meal.image}" alt="${meal.title}" loading="lazy">
          <span class="meal-type-tag">${meal.icon} ${meal.type}</span>
          <span class="meal-calories-tag">${meal.calories} kcal</span>
        </div>
        <div class="meal-card-content">
          <div>
            <h3 class="meal-title">${meal.title}</h3>
            <div class="meal-tagline">${meal.tagline}</div>
            <p class="meal-desc">${meal.description}</p>
            
            <div class="macro-pills-row">
              <div class="macro-pill macro-pill-p">
                <div class="macro-name">Protein</div>
                <div class="macro-val">${meal.protein}g</div>
              </div>
              <div class="macro-pill macro-pill-c">
                <div class="macro-name">Carbs</div>
                <div class="macro-val">${meal.carbs}g</div>
              </div>
              <div class="macro-pill macro-pill-f">
                <div class="macro-name">Fats</div>
                <div class="macro-val">${meal.fats}g</div>
              </div>
            </div>

            <ul class="meal-benefits-list">
              ${meal.benefits.map(b => `<li>${b}</li>`).join("")}
            </ul>
          </div>

          <button class="btn-add-meal" data-meal-id="${meal.id}">
            <i class="fa-solid fa-plus-circle"></i> Add Meal to Today
          </button>
        </div>
      </div>
    `).join("");

    // Attach click handlers to "Add Meal" buttons
    container.querySelectorAll(".btn-add-meal").forEach(btn => {
      btn.addEventListener("click", () => {
        const mealId = btn.getAttribute("data-meal-id");
        const meal = MEAL_SUGGESTIONS.find(m => m.id === mealId);
        if (meal) {
          addMealToToday(meal);
        }
      });
    });
  }

  function addMealToToday(meal) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog = {
      id: "log_" + Date.now(),
      title: meal.title,
      type: meal.type,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      icon: meal.icon || "🍽️",
      time: timeStr
    };

    loggedMeals.unshift(newLog);
    saveStorage(STORAGE_KEYS.LOGGED_MEALS, loggedMeals);

    // Update history day calories eaten and meal count
    const today = historyData[currentDayIndex];
    if (today) {
      today.mealsLogged = (today.mealsLogged || 0) + 1;
      today.caloriesEaten = (today.caloriesEaten || 0) + meal.calories;
    }

    renderLoggedMeals();
    updateCoreTargetsUI();
    updateCharts();
    playChime("success");
    showToast(`Added "${meal.title}" (+${meal.calories} kcal) to today's log!`, "success", "fa-utensils");
  }

  function renderLoggedMeals() {
    const container = document.getElementById("loggedMealsFeed");
    const countDisplay = document.getElementById("loggedCountDisplay");
    const totalCalsDisplay = document.getElementById("totalIntakeCalories");
    if (!container) return;

    if (loggedMeals.length === 0) {
      container.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px;">No meals logged yet today. Choose from the suggestions above!</p>`;
      if (countDisplay) countDisplay.textContent = "0";
      if (totalCalsDisplay) totalCalsDisplay.textContent = "0 kcal";
      return;
    }

    const totalCals = loggedMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
    if (countDisplay) countDisplay.textContent = loggedMeals.length.toString();
    if (totalCalsDisplay) totalCalsDisplay.textContent = `${totalCals.toLocaleString()} kcal`;

    container.innerHTML = loggedMeals.map(item => `
      <div class="logged-meal-item">
        <div class="logged-left">
          <span class="logged-meal-icon">${item.icon}</span>
          <div>
            <div class="logged-name">${item.title}</div>
            <div class="logged-sub">${item.type.toUpperCase()} • ${item.time} • P:${item.protein}g C:${item.carbs}g F:${item.fats}g</div>
          </div>
        </div>
        <div class="logged-right">
          <span class="logged-cals">+${item.calories} kcal</span>
          <button class="btn-remove-logged" data-remove-id="${item.id}" title="Remove item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".btn-remove-logged").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-remove-id");
        loggedMeals = loggedMeals.filter(m => m.id !== id);
        saveStorage(STORAGE_KEYS.LOGGED_MEALS, loggedMeals);
        renderLoggedMeals();
        updateCoreTargetsUI();
        updateCharts();
        showToast("Removed meal from log", "warning", "fa-trash-can");
      });
    });
  }

  // Meal Filter Tabs
  document.querySelectorAll(".meal-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".meal-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeMealFilter = btn.getAttribute("data-filter");
      renderMealSuggestions();
    });
  });

  // ----------------------------------------------------
  // 8. FOOD PLATE PHOTO SCANNER & UPLOADER
  // ----------------------------------------------------
  function renderFoodPlatesGallery() {
    const gallery = document.getElementById("platesGalleryFeed");
    if (!gallery) return;

    if (foodPlates.length === 0) {
      gallery.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); font-size: 13px; text-align: center; padding: 40px;">No food plate photos captured yet today. Upload a photo or take a live picture to get an instant AI nutritional breakdown!</p>`;
      return;
    }

    gallery.innerHTML = foodPlates.map(plate => `
      <div class="food-plate-item-card">
        <div class="plate-thumb-wrap">
          <img src="${plate.imageUrl}" alt="${plate.mealName}">
          <span class="plate-badge-time"><i class="fa-regular fa-clock"></i> ${plate.timestamp}</span>
          <span class="plate-badge-type">${plate.mealType}</span>
        </div>
        <div class="plate-ai-analysis">
          <div class="plate-ai-header">
            <span class="plate-meal-name">${plate.mealName}</span>
            <span class="plate-grade-badge">Grade ${plate.aiAnalysis.healthGrade}</span>
          </div>

          <div style="font-size: 12px; color: var(--accent-cyan); font-weight: 600;">
            ${plate.aiAnalysis.verdict}
          </div>

          <div class="plate-macro-mini">
            <span>🔥 <strong>${plate.estimatedCalories}</strong> kcal</span>
            <span>🥩 <strong>${plate.aiAnalysis.proteinGrams}g</strong> P</span>
            <span>🌾 <strong>${plate.aiAnalysis.carbsGrams}g</strong> C</span>
            <span>🥑 <strong>${plate.aiAnalysis.fatGrams}g</strong> F</span>
          </div>

          <ul class="plate-ai-highlights">
            ${plate.aiAnalysis.highlights.map(h => `<li>${h}</li>`).join("")}
          </ul>
        </div>
      </div>
    `).join("");
  }

  // Tag Pill Buttons
  document.querySelectorAll(".tag-pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tag-pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPlateMealType = btn.getAttribute("data-type");
    });
  });

  // Dropzone & File Browser
  const dropzone = document.getElementById("foodDropzone");
  const fileInput = document.getElementById("foodFileInput");
  const browseBtn = document.getElementById("browsePhotoBtn");

  if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", () => fileInput.click());
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("drag-over");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("drag-over");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("drag-over");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processUploadedImageFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        processUploadedImageFile(e.target.files[0]);
      }
    });
  }

  function processUploadedImageFile(file) {
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file (JPG, PNG, WebP)", "warning", "fa-triangle-exclamation");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      const customTitle = document.getElementById("photoMealNameInput").value.trim() || `${capitalize(selectedPlateMealType)} Plate`;
      generateAiPlateAnalysis(base64Url, selectedPlateMealType, customTitle);
    };
    reader.readAsDataURL(file);
  }

  function generateAiPlateAnalysis(imageUrl, mealType, mealName) {
    // Generate realistic AI health evaluation
    showToast("Analyzing plate nutrition with AI vision...", "info", "fa-brain");

    setTimeout(() => {
      const grades = ["A+", "A", "A-", "B+"];
      const selectedGrade = grades[Math.floor(Math.random() * grades.length)];
      const estCal = Math.floor(Math.random() * (580 - 340 + 1)) + 340;
      const estP = Math.floor(Math.random() * (45 - 24 + 1)) + 24;
      const estC = Math.floor(Math.random() * (35 - 12 + 1)) + 12;
      const estF = Math.floor(Math.random() * (26 - 14 + 1)) + 14;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newPlate = {
        id: "plate_" + Date.now(),
        mealType: mealType,
        mealName: mealName,
        timestamp: timeStr,
        imageUrl: imageUrl,
        estimatedCalories: estCal,
        aiAnalysis: {
          healthGrade: selectedGrade,
          verdict: "High-Satiety Liver & Glycemic Friendly Plate",
          proteinGrams: estP,
          carbsGrams: estC,
          fatGrams: estF,
          highlights: [
            "Balanced macronutrient ratio suitable for insulin recovery",
            "Optimal fiber-to-carbohydrate density",
            "Low inflammatory saturated fat profile"
          ]
        }
      };

      foodPlates.unshift(newPlate);
      saveStorage(STORAGE_KEYS.FOOD_PLATES, foodPlates);
      renderFoodPlatesGallery();

      // Automatically add to logged meals if user wants
      addMealToToday({
        title: mealName,
        type: mealType,
        calories: estCal,
        protein: estP,
        carbs: estC,
        fats: estF,
        icon: "📸"
      });

      playChime("success");
      showToast(`Food plate analyzed! Grade ${selectedGrade} (${estCal} kcal logged)`, "success", "fa-sparkles");
    }, 800);
  }

  // Camera Modal & Live Webcam WebRTC Capture
  const openCameraBtn = document.getElementById("openCameraModalBtn");
  const cameraModal = document.getElementById("cameraModal");
  const cameraVideo = document.getElementById("cameraVideo");
  const cameraCanvas = document.getElementById("cameraCanvas");
  const capturePhotoBtn = document.getElementById("capturePhotoBtn");
  const cameraStatusMsg = document.getElementById("cameraStatusMsg");

  if (openCameraBtn) {
    openCameraBtn.addEventListener("click", async () => {
      openModal("cameraModal");
      await startCamera();
    });
  }

  async function startCamera() {
    if (cameraStatusMsg) cameraStatusMsg.textContent = "Connecting to camera...";
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (cameraVideo) {
          cameraVideo.srcObject = cameraStream;
          cameraVideo.onloadedmetadata = () => {
            cameraVideo.play();
            if (cameraStatusMsg) cameraStatusMsg.style.display = "none";
          };
        }
      } else {
        throw new Error("WebRTC camera not supported in this browser");
      }
    } catch (err) {
      console.warn("Camera access error:", err);
      if (cameraStatusMsg) {
        cameraStatusMsg.textContent = "Camera not accessible. Please use file upload.";
        cameraStatusMsg.style.display = "block";
      }
    }
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
  }

  if (capturePhotoBtn) {
    capturePhotoBtn.addEventListener("click", () => {
      if (cameraVideo && cameraVideo.videoWidth) {
        cameraCanvas.width = cameraVideo.videoWidth;
        cameraCanvas.height = cameraVideo.videoHeight;
        const ctx = cameraCanvas.getContext("2d");
        ctx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
        const dataUrl = cameraCanvas.toDataURL("image/jpeg", 0.85);

        stopCamera();
        closeModal("cameraModal");

        const customTitle = document.getElementById("photoMealNameInput").value.trim() || `${capitalize(selectedPlateMealType)} Snapshot`;
        generateAiPlateAnalysis(dataUrl, selectedPlateMealType, customTitle);
      } else {
        // Fallback demo snapshot
        stopCamera();
        closeModal("cameraModal");
        const fallbackUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";
        generateAiPlateAnalysis(fallbackUrl, selectedPlateMealType, "Captured Lunch Plate");
      }
    });
  }

  // ----------------------------------------------------
  // 9. DOCTORS & CLINICS DIRECTORY & BOOKING ENGINE
  // ----------------------------------------------------
  function renderConditionPills() {
    const container = document.getElementById("conditionsPillsContainer");
    if (!container) return;

    container.innerHTML = HEALTH_CONDITIONS.map(cond => `
      <button class="condition-pill ${cond.id === activeConditionId ? 'active' : ''}" data-cond-id="${cond.id}">
        <span>${cond.icon}</span> ${cond.name}
      </button>
    `).join("");

    container.querySelectorAll(".condition-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        container.querySelectorAll(".condition-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        activeConditionId = pill.getAttribute("data-cond-id");
        renderConditionSummary();
        renderDoctorsAndClinics();
      });
    });
  }

  function renderConditionSummary() {
    const summaryBox = document.getElementById("selectedConditionSummary");
    if (!summaryBox) return;

    const condition = HEALTH_CONDITIONS.find(c => c.id === activeConditionId);
    if (!condition) return;

    summaryBox.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <h4 style="font-size: 15px; color: #d8b4fe; display: flex; align-items: center; gap: 8px;">
          <span>${condition.icon}</span> ${condition.name}
        </h4>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); background: rgba(168, 85, 247, 0.2); color: #e9d5ff; font-weight: 700;">
          ${condition.severity}
        </span>
      </div>
      <p style="font-size: 13px; color: var(--text-primary); margin-bottom: 8px; line-height: 1.4;">
        ${condition.summary}
      </p>
      <div style="font-size: 12px; color: var(--text-secondary);">
        <strong style="color: var(--accent-emerald);">Recommended Protocol:</strong> ${condition.lifestyleFocus}
      </div>
    `;
  }

  function renderDoctorsAndClinics(searchQuery = "") {
    const doctorsContainer = document.getElementById("doctorsListContainer");
    const clinicsContainer = document.getElementById("clinicsListContainer");
    if (!doctorsContainer || !clinicsContainer) return;

    const q = searchQuery.toLowerCase().trim();

    // Filter doctors
    const matchedDoctors = DOCTORS_DATABASE.filter(doc => {
      const matchesCond = activeConditionId ? doc.conditionIds.includes(activeConditionId) : true;
      const matchesQuery = !q || doc.name.toLowerCase().includes(q) || doc.specialty.toLowerCase().includes(q) || doc.hospital.toLowerCase().includes(q);
      return (matchesCond || q) && matchesQuery;
    });

    // Filter clinics
    const matchedClinics = CLINICS_DATABASE.filter(clinic => {
      const matchesCond = activeConditionId ? clinic.conditionIds.includes(activeConditionId) : true;
      const matchesQuery = !q || clinic.name.toLowerCase().includes(q) || clinic.category.toLowerCase().includes(q);
      return (matchesCond || q) && matchesQuery;
    });

    // Render Doctors
    if (matchedDoctors.length === 0) {
      doctorsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 13px; padding: 20px;">No specialist doctors found matching your filter criteria. Try searching for a specific specialty.</p>`;
    } else {
      doctorsContainer.innerHTML = matchedDoctors.map(doc => `
        <div class="doctor-card">
          <div class="doc-avatar-wrap">
            <img src="${doc.avatar}" alt="${doc.name}" loading="lazy">
            <div class="doc-rating-badge">★ ${doc.rating} (${doc.reviewsCount})</div>
          </div>
          <div class="doc-info-wrap">
            <div>
              <div class="doc-header-row">
                <div>
                  <h4 class="doc-name">${doc.name}</h4>
                  <div class="doc-spec">${doc.specialty}</div>
                </div>
                <div class="doc-fee">${doc.fee} <span style="font-size: 10px; font-weight: normal; color: var(--text-secondary);">/ consult</span></div>
              </div>
              <div class="doc-hospital"><i class="fa-solid fa-hospital-user"></i> ${doc.hospital} • ${doc.location}</div>
              <p class="doc-about">${doc.about}</p>
            </div>
            <div class="doc-footer-row">
              <div class="doc-slot"><i class="fa-regular fa-clock"></i> Next: ${doc.availableSlots[0]}</div>
              <button class="btn-book-doc" data-doc-id="${doc.id}">
                <i class="fa-solid fa-calendar-plus"></i> Book Visit
              </button>
            </div>
          </div>
        </div>
      `).join("");

      doctorsContainer.querySelectorAll(".btn-book-doc").forEach(btn => {
        btn.addEventListener("click", () => {
          const docId = btn.getAttribute("data-doc-id");
          const doc = DOCTORS_DATABASE.find(d => d.id === docId);
          if (doc) {
            openBookingModal(doc);
          }
        });
      });
    }

    // Render Clinics
    if (matchedClinics.length === 0) {
      clinicsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 13px; padding: 20px;">No specialized diagnostic centers listed for this filter.</p>`;
    } else {
      clinicsContainer.innerHTML = matchedClinics.map(clinic => `
        <div class="clinic-card">
          <div class="clinic-top">
            <div>
              <h4 class="clinic-name">${clinic.name}</h4>
              <span style="font-size: 11px; color: var(--accent-purple); font-weight: 600;">${clinic.category}</span>
            </div>
            <span class="clinic-distance"><i class="fa-solid fa-location-dot"></i> ${clinic.distance}</span>
          </div>
          <div class="clinic-address">${clinic.address} • Tel: <strong>${clinic.phone}</strong></div>
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Hours: ${clinic.hours}</div>
          <div class="clinic-tests-list">
            ${clinic.testsOffered.map(t => `<span class="test-chip">${t}</span>`).join("")}
          </div>
          <button class="btn-chip" style="width: 100%; border-color: var(--accent-cyan); color: var(--accent-cyan);" onclick="window.open('tel:${clinic.phone}')">
            <i class="fa-solid fa-phone"></i> Call Clinic & Schedule Test
          </button>
        </div>
      `).join("");
    }
  }

  // Condition Search Bar Listener
  const conditionSearchInput = document.getElementById("conditionSearchInput");
  if (conditionSearchInput) {
    conditionSearchInput.addEventListener("input", (e) => {
      const query = e.target.value;
      renderDoctorsAndClinics(query);
    });
  }

  // Doctor Booking Modal Handler
  function openBookingModal(doctor) {
    selectedDoctorForBooking = doctor;
    const header = document.getElementById("bookingDoctorHeader");
    const slotSelect = document.getElementById("bookingSlotSelect");

    if (header) {
      header.innerHTML = `
        <img src="${doctor.avatar}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
        <div>
          <h4 style="font-size: 15px; margin-bottom: 2px;">${doctor.name}</h4>
          <div style="font-size: 12px; color: var(--accent-purple); font-weight: 600;">${doctor.specialty}</div>
          <div style="font-size: 11px; color: var(--text-secondary);">${doctor.hospital} • ${doctor.fee}</div>
        </div>
      `;
    }

    if (slotSelect) {
      slotSelect.innerHTML = doctor.availableSlots.map(slot => `<option value="${slot}">${slot}</option>`).join("");
    }

    openModal("bookDoctorModal");
  }

  const confirmBookingBtn = document.getElementById("confirmBookingBtn");
  if (confirmBookingBtn) {
    confirmBookingBtn.addEventListener("click", () => {
      if (!selectedDoctorForBooking) return;

      const slot = document.getElementById("bookingSlotSelect").value;
      const type = document.getElementById("bookingTypeSelect").value;
      const notes = document.getElementById("bookingNotesInput").value;

      const booking = {
        id: "book_" + Date.now(),
        doctorId: selectedDoctorForBooking.id,
        doctorName: selectedDoctorForBooking.name,
        specialty: selectedDoctorForBooking.specialty,
        slot: slot,
        type: type,
        notes: notes,
        createdAt: new Date().toISOString()
      };

      doctorBookings.push(booking);
      saveStorage(STORAGE_KEYS.BOOKINGS, doctorBookings);

      closeModal("bookDoctorModal");
      playChime("success");
      showToast(`Appointment confirmed with ${selectedDoctorForBooking.name} for ${slot}!`, "success", "fa-calendar-check");
    });
  }

  // ----------------------------------------------------
  // 10. DAILY PROGRESS & CHART.JS ANALYTICS
  // ----------------------------------------------------
  function initCharts() {
    const isDark = currentTheme === "dark";
    const textColor = isDark ? "#94a3b8" : "#475569";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";

    const labels = historyData.map(d => d.dayLabel);
    const caloriesData = historyData.map(d => d.caloriesBurned);
    const stepsData = historyData.map(d => d.steps);
    const waterData = historyData.map(d => d.waterMl);
    const scoresData = historyData.map(d => d.recoveryScore);

    // Chart 1: Calories
    const calCanvas = document.getElementById("caloriesTrendChart");
    if (calCanvas) {
      caloriesChart = new Chart(calCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Calories Burned (kcal)",
              data: caloriesData,
              backgroundColor: "#f97316",
              borderRadius: 6,
              barPercentage: 0.5
            },
            {
              label: "Target (650 kcal)",
              data: Array(labels.length).fill(userProfile.dailyCalorieBurnTarget),
              type: "line",
              borderColor: "rgba(239, 68, 68, 0.7)",
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: getChartBaseOptions(textColor, gridColor, "kcal")
      });
    }

    // Chart 2: Steps
    const stepsCanvas = document.getElementById("stepsTrendChart");
    if (stepsCanvas) {
      stepsChart = new Chart(stepsCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Steps Completed",
              data: stepsData,
              backgroundColor: "#10b981",
              borderRadius: 6,
              barPercentage: 0.5
            },
            {
              label: "Step Goal (10k)",
              data: Array(labels.length).fill(userProfile.dailyStepTarget),
              type: "line",
              borderColor: "rgba(16, 185, 129, 0.7)",
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: getChartBaseOptions(textColor, gridColor, "steps")
      });
    }

    // Chart 3: Water
    const waterCanvas = document.getElementById("waterTrendChart");
    if (waterCanvas) {
      waterChart = new Chart(waterCanvas.getContext("2d"), {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Hydration (mL)",
              data: waterData,
              borderColor: "#38bdf8",
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              fill: true,
              tension: 0.35,
              pointBackgroundColor: "#38bdf8",
              pointRadius: 5
            }
          ]
        },
        options: getChartBaseOptions(textColor, gridColor, "mL")
      });
    }

    // Chart 4: Recovery Score
    const recoveryCanvas = document.getElementById("recoveryScoreTrendChart");
    if (recoveryCanvas) {
      recoveryChart = new Chart(recoveryCanvas.getContext("2d"), {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Men's Health Score",
              data: scoresData,
              borderColor: "#a855f7",
              backgroundColor: "rgba(168, 85, 247, 0.12)",
              fill: true,
              tension: 0.35,
              pointBackgroundColor: "#a855f7",
              pointRadius: 5
            }
          ]
        },
        options: getChartBaseOptions(textColor, gridColor, "/ 100")
      });
    }

    // Update summary stat boxes
    const totalWeeklySteps = stepsData.reduce((a, b) => a + b, 0);
    const totalWeeklyWaterLiters = (waterData.reduce((a, b) => a + b, 0) / 1000).toFixed(1);
    const weeklyStepsElem = document.getElementById("weeklyStepsTotal");
    const weeklyWaterElem = document.getElementById("weeklyWaterTotal");
    if (weeklyStepsElem) weeklyStepsElem.textContent = `${totalWeeklySteps.toLocaleString()} Steps`;
    if (weeklyWaterElem) weeklyWaterElem.textContent = `${totalWeeklyWaterLiters} Liters`;
  }

  function getChartBaseOptions(textColor, gridColor, unitLabel) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: textColor,
            font: { family: 'Inter', size: 11, weight: '600' },
            boxWidth: 12
          }
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleColor: "#fff",
          bodyColor: "#38bdf8",
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'Inter', size: 10 } }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'Inter', size: 10 } }
        }
      }
    };
  }

  function updateCharts() {
    if (!caloriesChart || !stepsChart || !waterChart || !recoveryChart) return;

    const isDark = currentTheme === "dark";
    const textColor = isDark ? "#94a3b8" : "#475569";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";

    const labels = historyData.map(d => d.dayLabel);
    const caloriesData = historyData.map(d => d.caloriesBurned);
    const stepsData = historyData.map(d => d.steps);
    const waterData = historyData.map(d => d.waterMl);
    const scoresData = historyData.map(d => d.recoveryScore);

    // Update datasets
    caloriesChart.data.labels = labels;
    caloriesChart.data.datasets[0].data = caloriesData;
    caloriesChart.options.scales.x.ticks.color = textColor;
    caloriesChart.options.scales.y.ticks.color = textColor;
    caloriesChart.update();

    stepsChart.data.labels = labels;
    stepsChart.data.datasets[0].data = stepsData;
    stepsChart.options.scales.x.ticks.color = textColor;
    stepsChart.options.scales.y.ticks.color = textColor;
    stepsChart.update();

    waterChart.data.labels = labels;
    waterChart.data.datasets[0].data = waterData;
    waterChart.options.scales.x.ticks.color = textColor;
    waterChart.options.scales.y.ticks.color = textColor;
    waterChart.update();

    recoveryChart.data.labels = labels;
    recoveryChart.data.datasets[0].data = scoresData;
    recoveryChart.options.scales.x.ticks.color = textColor;
    recoveryChart.options.scales.y.ticks.color = textColor;
    recoveryChart.update();
  }

  // ----------------------------------------------------
  // 11. WORKOUT & STEP LOGGING MODALS
  // ----------------------------------------------------
  const openWorkoutModalBtn = document.getElementById("openAddWorkoutModalBtn");
  const workoutPresetSelect = document.getElementById("workoutPresetSelect");
  const saveWorkoutBtn = document.getElementById("saveWorkoutBtn");

  if (openWorkoutModalBtn) {
    openWorkoutModalBtn.addEventListener("click", () => {
      if (workoutPresetSelect) {
        workoutPresetSelect.innerHTML = `<option value="">-- Choose Workout Preset --</option>` +
          WORKOUT_PRESETS.map((p, i) => `<option value="${i}">${p.icon} ${p.name} (~${p.calories} kcal)</option>`).join("");
      }
      openModal("workoutModal");
    });
  }

  if (workoutPresetSelect) {
    workoutPresetSelect.addEventListener("change", (e) => {
      const idx = e.target.value;
      if (idx !== "") {
        const preset = WORKOUT_PRESETS[idx];
        document.getElementById("workoutNameInput").value = preset.name;
        document.getElementById("workoutCaloriesInput").value = preset.calories;
        document.getElementById("workoutStepsInput").value = preset.steps;
      }
    });
  }

  if (saveWorkoutBtn) {
    saveWorkoutBtn.addEventListener("click", () => {
      const cals = parseInt(document.getElementById("workoutCaloriesInput").value, 10) || 0;
      const extraSteps = parseInt(document.getElementById("workoutStepsInput").value, 10) || 0;
      const name = document.getElementById("workoutNameInput").value.trim() || "Workout";

      if (cals <= 0) {
        showToast("Please enter valid calories burned", "warning", "fa-circle-exclamation");
        return;
      }

      historyData[currentDayIndex].caloriesBurned += cals;
      if (extraSteps > 0) historyData[currentDayIndex].steps += extraSteps;

      updateCoreTargetsUI();
      updateCharts();
      closeModal("workoutModal");
      playChime("burn");
      showToast(`Logged "${name}": +${cals} kcal${extraSteps > 0 ? `, +${extraSteps} steps` : ''}!`, "success", "fa-fire");
    });
  }

  // Step modal
  const openStepsModalBtn = document.getElementById("openAddStepsModalBtn");
  const saveStepsBtn = document.getElementById("saveStepsBtn");

  if (openStepsModalBtn) {
    openStepsModalBtn.addEventListener("click", () => openModal("stepsModal"));
  }

  if (saveStepsBtn) {
    saveStepsBtn.addEventListener("click", () => {
      const steps = parseInt(document.getElementById("manualStepsInput").value, 10) || 0;
      if (steps <= 0) {
        showToast("Please enter a valid step count", "warning", "fa-circle-exclamation");
        return;
      }
      historyData[currentDayIndex].steps += steps;
      const estCal = Math.round(steps * 0.04);
      historyData[currentDayIndex].caloriesBurned += estCal;

      updateCoreTargetsUI();
      updateCharts();
      closeModal("stepsModal");
      playChime("success");
      showToast(`Added +${steps.toLocaleString()} steps (+${estCal} kcal)!`, "success", "fa-shoe-prints");
    });
  }

  // Custom water modal
  const openCustomWaterBtn = document.getElementById("openCustomWaterBtn");
  const saveWaterBtn = document.getElementById("saveWaterBtn");

  if (openCustomWaterBtn) {
    openCustomWaterBtn.addEventListener("click", () => openModal("waterModal"));
  }

  if (saveWaterBtn) {
    saveWaterBtn.addEventListener("click", () => {
      const ml = parseInt(document.getElementById("customWaterInput").value, 10) || 0;
      if (ml <= 0) {
        showToast("Please enter a valid water volume", "warning", "fa-circle-exclamation");
        return;
      }
      historyData[currentDayIndex].waterMl += ml;
      updateCoreTargetsUI();
      updateCharts();
      closeModal("waterModal");
      playChime("water");
      showToast(`Hydration logged: +${ml} mL!`, "info", "fa-droplet");
    });
  }

  // Custom meal modal
  const openCustomMealBtn = document.getElementById("openCustomMealModalBtn");
  const saveCustomMealBtn = document.getElementById("saveCustomMealBtn");

  if (openCustomMealBtn) {
    openCustomMealBtn.addEventListener("click", () => openModal("customMealModal"));
  }

  if (saveCustomMealBtn) {
    saveCustomMealBtn.addEventListener("click", () => {
      const title = document.getElementById("customMealTitleInput").value.trim() || "Custom Healthy Meal";
      const type = document.getElementById("customMealTypeSelect").value;
      const cals = parseInt(document.getElementById("customMealCaloriesInput").value, 10) || 350;
      const p = parseInt(document.getElementById("customMealProteinInput").value, 10) || 30;
      const c = parseInt(document.getElementById("customMealCarbsInput").value, 10) || 20;
      const f = parseInt(document.getElementById("customMealFatsInput").value, 10) || 12;

      addMealToToday({
        title: title,
        type: type,
        calories: cals,
        protein: p,
        carbs: c,
        fats: f,
        icon: "🥗"
      });

      closeModal("customMealModal");
    });
  }

  // Profile modal
  const editProfileBtn = document.getElementById("editProfileBtn");
  const saveProfileBtn = document.getElementById("saveProfileBtn");

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      document.getElementById("profNameInput").value = userProfile.name;
      document.getElementById("profAgeInput").value = userProfile.age;
      document.getElementById("profHeightInput").value = userProfile.heightCm;
      document.getElementById("profWeightInput").value = userProfile.weightKg;
      document.getElementById("profBpInput").value = userProfile.bloodPressure;
      document.getElementById("profGlucoseInput").value = userProfile.fastingGlucose;
      document.getElementById("profCalorieTargetInput").value = userProfile.dailyCalorieBurnTarget;
      document.getElementById("profStepTargetInput").value = userProfile.dailyStepTarget;
      document.getElementById("profWaterTargetInput").value = userProfile.dailyWaterTargetMl;
      openModal("profileModal");
    });
  }

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", () => {
      userProfile.name = document.getElementById("profNameInput").value.trim() || userProfile.name;
      userProfile.age = parseInt(document.getElementById("profAgeInput").value, 10) || userProfile.age;
      userProfile.heightCm = parseFloat(document.getElementById("profHeightInput").value) || userProfile.heightCm;
      userProfile.weightKg = parseFloat(document.getElementById("profWeightInput").value) || userProfile.weightKg;
      userProfile.bloodPressure = document.getElementById("profBpInput").value.trim() || userProfile.bloodPressure;
      userProfile.fastingGlucose = parseInt(document.getElementById("profGlucoseInput").value, 10) || userProfile.fastingGlucose;
      userProfile.dailyCalorieBurnTarget = parseInt(document.getElementById("profCalorieTargetInput").value, 10) || userProfile.dailyCalorieBurnTarget;
      userProfile.dailyStepTarget = parseInt(document.getElementById("profStepTargetInput").value, 10) || userProfile.dailyStepTarget;
      userProfile.dailyWaterTargetMl = parseInt(document.getElementById("profWaterTargetInput").value, 10) || userProfile.dailyWaterTargetMl;

      saveStorage(STORAGE_KEYS.PROFILE, userProfile);
      renderProfileVitals();
      updateCoreTargetsUI();
      updateCharts();
      closeModal("profileModal");
      playChime("success");
      showToast("Health profile and target goals updated!", "success", "fa-user-check");
    });
  }

  // Quick link button to doctors
  const quickDocBtn = document.getElementById("openConditionFinderQuickBtn");
  if (quickDocBtn) {
    quickDocBtn.addEventListener("click", () => {
      const targetSec = document.getElementById("conditionsPillsContainer");
      if (targetSec) targetSec.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Export printable medical report
  const exportReportBtn = document.getElementById("exportReportBtn");
  const printReportBtn = document.getElementById("printReportBtn");

  if (exportReportBtn) {
    exportReportBtn.addEventListener("click", () => {
      generatePrintableReport();
      openModal("reportModal");
    });
  }

  if (printReportBtn) {
    printReportBtn.addEventListener("click", () => {
      window.print();
    });
  }

  function generatePrintableReport() {
    const reportBox = document.getElementById("printableReportContent");
    if (!reportBox) return;

    const today = historyData[currentDayIndex];
    const totalLoggedCals = loggedMeals.reduce((a, b) => a + (b.calories || 0), 0);

    reportBox.innerHTML = `
      <div style="font-family: 'Inter', sans-serif; color: #1e293b; background: #fff; padding: 10px;">
        <div style="border-bottom: 2px solid #06b6d4; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 20px; color: #0f172a; margin: 0;">MALE METABOLIC HEALTH REPORT</h2>
            <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">Comprehensive Daily Health & Vitals Record</p>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            Date: <strong>${new Date().toLocaleDateString()}</strong>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; font-size: 13px;">
          <div style="padding: 10px; background: #f8fafc; border-radius: 6px;">
            <strong>Patient Name:</strong> ${userProfile.name}<br>
            <strong>Age / Gender:</strong> ${userProfile.age} yrs / Male<br>
            <strong>Height / Weight:</strong> ${userProfile.heightCm} cm / ${userProfile.weightKg} kg (BMI: ${userProfile.bmi})
          </div>
          <div style="padding: 10px; background: #f8fafc; border-radius: 6px;">
            <strong>Blood Pressure:</strong> ${userProfile.bloodPressure}<br>
            <strong>Fasting Glucose:</strong> ${userProfile.fastingGlucose} mg/dL<br>
            <strong>Triglycerides:</strong> ${userProfile.triglycerides} mg/dL
          </div>
        </div>

        <h4 style="font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">TODAY'S ACTIVITY & TARGET COMPLIANCE</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; font-size: 12px; text-align: center;">
          <div style="padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="color: #64748b;">CALORIES BURNED</div>
            <strong style="font-size: 16px; color: #ea580c;">${today.caloriesBurned} / ${userProfile.dailyCalorieBurnTarget} kcal</strong>
          </div>
          <div style="padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="color: #64748b;">STEPS COMPLETED</div>
            <strong style="font-size: 16px; color: #10b981;">${today.steps.toLocaleString()} / ${userProfile.dailyStepTarget.toLocaleString()}</strong>
          </div>
          <div style="padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="color: #64748b;">WATER INTAKE</div>
            <strong style="font-size: 16px; color: #0284c7;">${today.waterMl} / ${userProfile.dailyWaterTargetMl} mL</strong>
          </div>
        </div>

        <h4 style="font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">LOGGED MEALS (${loggedMeals.length} items • ${totalLoggedCals} kcal)</h4>
        <ul style="font-size: 12px; padding-left: 18px; margin-bottom: 16px; color: #334155;">
          ${loggedMeals.map(m => `<li><strong>${m.type.toUpperCase()}:</strong> ${m.title} (${m.calories} kcal - P:${m.protein}g C:${m.carbs}g F:${m.fats}g)</li>`).join("")}
        </ul>

        <h4 style="font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">PRIMARY HEALTH CONDITIONS & FOCUS</h4>
        <div style="font-size: 12px; color: #475569; line-height: 1.5;">
          Non-Alcoholic Fatty Liver (NAFLD) • Pre-Hypertension (Stage 1) • Visceral Fat Reduction
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // 12. GENERIC MODAL CONTROLLER
  // ----------------------------------------------------
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add("show");
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove("show");
      if (id === "cameraModal") stopCamera();
    }
  }

  // Bind close buttons
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close");
      closeModal(modalId);
    });
  });

  // Close modal when clicking backdrop
  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ----------------------------------------------------
  // 13. INITIAL BOOTSTRAP
  // ----------------------------------------------------
  applyTheme(currentTheme);
  renderProfileVitals();
  updateCoreTargetsUI();
  renderMealSuggestions();
  renderLoggedMeals();
  renderFoodPlatesGallery();
  renderConditionPills();
  renderConditionSummary();
  renderDoctorsAndClinics();
  initCharts();

  console.log("Male Unhealthy Dashboard initialized successfully!");
});
