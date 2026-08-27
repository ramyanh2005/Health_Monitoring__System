// Bloom Health - Client Application Logic

const state = {
  activeView: 'dashboard',
  dashboard: null,
  dishes: [],
  activeCategory: 'All',
  searchQuery: '',
  selectedDish: null,
  exerciseTimer: null,
  exerciseSeconds: 180,
  exerciseRunning: false,
  
  // Interactive Kick Counter State
  kickRunning: false,
  kickCount: 0,
  kickSeconds: 0,
  kickTimer: null,

  // Notifications State
  notifications: [],
  unreadNotifCount: 0,

  // Smart Craving State
  activeVibe: 'folate',

  // Meal Combinations State
  mealCombinations: [],
  activeComboFilter: 'All',

  // Exercises & Guidelines State
  exercises: [],
  exerciseGuidelines: null,
  activeExerciseCategory: 'All',
  exerciseSearchQuery: '',
  selectedExercise: null,
  guidedExercise: null,

  // Clinics & Care Team State
  clinics: [],
  activeClinicType: 'All',
  clinicSearchQuery: '',
  selectedClinic: null,

  // Theme & Audio State
  theme: localStorage.getItem('bloom_theme') || 'light',
  audioCtx: null,
  activeSound: null,
  soundOscillators: []
};

// DOM Elements
const views = {
  dashboard: document.getElementById('view-dashboard'),
  activity: document.getElementById('view-activity'),
  exercises: document.getElementById('view-exercises'),
  nutrition: document.getElementById('view-nutrition'),
  clinics: document.getElementById('view-clinics'),
  profile: document.getElementById('view-profile')
};

const headerTitle = document.getElementById('header-title');
const navItems = document.querySelectorAll('.nav-tab-item');
const toastEl = document.getElementById('toast');

// API Helpers
async function api(endpoint, options = {}) {
  try {
    const res = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API call ${endpoint} failed, utilizing local fallback:`, err);
    return null;
  }
}

// Toast notification
function showToast(message, icon = 'check_circle') {
  if (!toastEl) return;
  toastEl.innerHTML = `<span class="material-symbols-outlined text-[#8ba889] text-lg">${icon}</span><span>${message}</span>`;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3400);
}

// Particle Celebration Burst
function triggerConfetti() {
  const container = document.createElement('div');
  container.className = 'fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden';
  document.body.appendChild(container);

  const colors = ['#4a654a', '#8ba889', '#ccebc8', '#fdc7cb', '#7c5357', '#e5e9e2'];
  for (let i = 0; i < 28; i++) {
    const particle = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 6;
    const x = (Math.random() - 0.5) * 400;
    const y = (Math.random() - 0.7) * 360;
    const rot = Math.random() * 360;

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
      transform: translate(0, 0) rotate(0deg);
      opacity: 1;
      transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    container.appendChild(particle);

    setTimeout(() => {
      particle.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      particle.style.opacity = '0';
    }, 20);
  }

  setTimeout(() => {
    container.remove();
  }, 1000);
}

// Navigation / View Switching
function showView(viewName) {
  state.activeView = viewName;

  // Update views
  Object.keys(views).forEach(key => {
    if (views[key]) {
      if (key === viewName) {
        views[key].classList.remove('hidden');
      } else {
        views[key].classList.add('hidden');
      }
    }
  });

  // Update header title
  const titles = {
    dashboard: 'Dashboard',
    activity: 'Activity',
    exercises: 'Exercises',
    nutrition: 'Nutrition & Dishes',
    clinics: 'Clinics & Care Team',
    profile: 'Profile'
  };
  if (headerTitle) {
    headerTitle.textContent = titles[viewName] || 'Bloom Health';
  }

  // Update nav tabs
  navItems.forEach(item => {
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Specific view actions
  if (viewName === 'nutrition') {
    loadDishes();
    loadMealCombinations();
  } else if (viewName === 'dashboard') {
    loadDashboard();
    fetchSmartDishes('folate');
    loadMealCombinations();
  } else if (viewName === 'exercises') {
    loadExercises();
    loadExerciseGuidelines();
  } else if (viewName === 'clinics') {
    loadClinics();
  } else if (viewName === 'activity') {
    animateActivityCharts();
  }
}

// Load Dashboard Data
async function loadDashboard() {
  const data = await api('/api/dashboard');
  if (data && data.success) {
    state.dashboard = data;
    state.unreadNotifCount = data.unreadNotifCount || 0;
    state.notifications = data.notifications || [];
    state.mealCombinations = data.mealCombinations || [];
    renderDashboard(data);
    updateNotificationBadge();
  } else {
    // Graceful fallback mock
    const fallback = getFallbackDashboard();
    state.dashboard = fallback;
    renderDashboard(fallback);
  }
}

// Render Dashboard View
function renderDashboard(data) {
  const { profile, metrics, nextMeal, todayLogs, nutritionTotals, tip, notifications, todayWellness, mealCombinations } = data;

  // 1. Pregnancy Hero Ring
  const weekNumber = profile.pregnancy_week || 24;
  const progressPercent = Math.min(100, Math.round((weekNumber / 40) * 100));
  
  const heroWeek = document.getElementById('dash-hero-week');
  const heroBaby = document.getElementById('dash-hero-baby');
  const heroPercentText = document.getElementById('dash-hero-percent');
  const heroRing = document.getElementById('dash-hero-ring');

  if (heroWeek) heroWeek.textContent = `Week ${weekNumber}`;
  if (heroBaby) heroBaby.textContent = `Baby is the size of ${profile.baby_comparison || 'an ear of corn'}`;
  if (heroPercentText) heroPercentText.textContent = `${progressPercent}%`;

  if (heroRing) {
    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (progressPercent / 100) * circumference;
    heroRing.style.strokeDasharray = `${circumference} ${circumference}`;
    setTimeout(() => {
      heroRing.style.strokeDashoffset = offset;
    }, 150);
  }

  // 2. Daily Goals (Steps, Water, Calories)
  const stepsVal = document.getElementById('dash-steps-val');
  const stepsBar = document.getElementById('dash-steps-bar');
  if (stepsVal) stepsVal.textContent = `${metrics.steps.toLocaleString()} / ${metrics.step_goal.toLocaleString()}`;
  if (stepsBar) {
    const stepsPct = Math.min(100, Math.round((metrics.steps / metrics.step_goal) * 100));
    stepsBar.style.width = `${stepsPct}%`;
  }

  const waterVal = document.getElementById('dash-water-val');
  const waterBar = document.getElementById('dash-water-bar');
  if (waterVal) waterVal.textContent = `${metrics.water_liters.toFixed(1)} / ${metrics.water_goal_liters.toFixed(1)} L`;
  if (waterBar) {
    const waterPct = Math.min(100, Math.round((metrics.water_liters / metrics.water_goal_liters) * 100));
    waterBar.style.width = `${waterPct}%`;
  }

  const calVal = document.getElementById('dash-cal-val');
  if (calVal) {
    const totalEaten = (nutritionTotals ? nutritionTotals.calories : 0);
    calVal.textContent = `${totalEaten + (metrics.active_calories || 420)} kcal`;
  }

  // 3. Next Meal Card
  renderNextMealCard(nextMeal);

  // 4. Today's Logged Meals
  renderTodayLogs(todayLogs || []);

  // 5. Nurturing Tip Card
  if (tip) {
    const tipTitle = document.getElementById('dash-tip-title');
    const tipAdvice = document.getElementById('dash-tip-advice');
    if (tipTitle) tipTitle.textContent = tip.title;
    if (tipAdvice) tipAdvice.textContent = tip.advice;
  }

  // 6. Active Alert Banner
  renderTopAlertBanner(notifications);

  // 7. Render Mood Check-in status
  if (todayWellness) {
    highlightCurrentMood(todayWellness.mood);
  }

  // 8. Render Meal Combinations on Dashboard
  if (mealCombinations && mealCombinations.length > 0) {
    renderMealCombinations(mealCombinations, 'dash-meal-combos-container');
  }
}

// Render Top Dashboard Alert / Smart Reminder Banner
function renderTopAlertBanner(notifications) {
  const container = document.getElementById('dash-alert-banner');
  if (!container) return;

  const unreadAlert = notifications?.find(n => !n.is_read && (n.type === 'reminder' || n.type === 'info'));
  if (!unreadAlert) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="card-white p-3.5 sm:p-4 border-l-4 border-l-[#4a654a] border border-[#ebefe8] flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-[#ccebc8]/70 text-[#243d25] flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-base">notifications_active</span>
        </div>
        <div>
          <h5 class="text-xs font-bold text-[#181d19]">${unreadAlert.title}</h5>
          <p class="text-[11px] text-on-surface-variant line-clamp-1">${unreadAlert.message}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button onclick="handleAlertAction(${unreadAlert.id}, '${unreadAlert.action_type || ''}')" class="btn-primary text-xs py-1.5 px-3 rounded-full font-semibold">
          Take Action
        </button>
        <button onclick="dismissNotification(${unreadAlert.id})" class="p-1 text-on-surface-variant hover:text-error rounded-full" title="Dismiss">
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  `;
}

// Render Next Meal Card
function renderNextMealCard(meal) {
  const container = document.getElementById('dash-next-meal-container');
  if (!container) return;

  if (!meal) {
    container.innerHTML = `
      <div class="card-standard p-6 text-center text-on-surface-variant">
        <p class="body-md">No meal recommended currently.</p>
        <button onclick="showView('nutrition')" class="btn-secondary mt-3">Browse Recipes</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card-white overflow-hidden group shadow-sm hover:shadow-md transition-shadow relative">
      <!-- Dish Banner Image -->
      <div class="relative w-full h-48 overflow-hidden cursor-pointer" onclick="openRecipeModal(${meal.id})">
        <img src="${meal.image_url}" alt="${meal.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>
        
        <!-- Next Meal Badge -->
        <div class="absolute top-3 left-3 bg-[#4a654a]/90 backdrop-blur-md text-white badge-pill px-3 py-1 text-xs font-semibold shadow-sm">
          <span class="material-symbols-outlined text-xs">eco</span>
          <span>Next Meal • ${meal.category}</span>
        </div>

        <!-- Trimester Tag -->
        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#4a654a] badge-pill px-2.5 py-1 text-xs font-semibold shadow-sm">
          <span>${meal.trimester_recommendation || 'Trimester 2'}</span>
        </div>

        <!-- Bottom overlay summary inside banner -->
        <div class="absolute bottom-3 left-3 right-3 text-white">
          <h3 class="title-md text-lg font-bold leading-tight drop-shadow-sm">${meal.name}</h3>
        </div>
      </div>

      <!-- Card Content -->
      <div class="p-4 sm:p-5">
        <p class="body-md text-on-surface-variant line-clamp-2 text-xs sm:text-sm mb-3.5">
          ${meal.description}
        </p>

        <!-- Nutrition Highlights -->
        <div class="flex flex-wrap gap-1.5 mb-3.5">
          <span class="bg-[#ccebc8]/60 text-[#243d25] px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">spa</span> Folate ${meal.folate_mcg || 140}µg
          </span>
          <span class="bg-[#fdc7cb]/60 text-[#795154] px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">bloodtype</span> Iron ${meal.iron_mg || 3.5}mg
          </span>
          ${meal.dha_mg ? `
            <span class="bg-[#dfe4dd] text-[#434841] px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">psychology</span> DHA ${meal.dha_mg}mg
            </span>
          ` : ''}
        </div>

        <!-- Meta Row & Action Button -->
        <div class="flex items-center justify-between pt-3 border-t border-[#ebefe8]">
          <div class="flex items-center gap-3.5 text-xs text-on-surface-variant font-medium">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-[#4a654a]">schedule</span> ${meal.prep_time_minutes} min</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-[#7c5357]">local_fire_department</span> ${meal.calories} kcal</span>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="cycleNextMeal()" class="p-2 rounded-full hover:bg-[#ebefe8] text-on-surface-variant transition-colors cursor-pointer" title="Swap to another dish">
              <span class="material-symbols-outlined text-lg">sync</span>
            </button>
            <button onclick="quickLogMeal(${meal.id}, '${escapeQuotes(meal.name)}', ${meal.calories}, ${meal.protein_g}, ${meal.folate_mcg}, ${meal.iron_mg})" 
              class="btn-primary py-2 px-4 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm cursor-pointer"
              id="btn-quick-log-${meal.id}">
              <span class="material-symbols-outlined text-base">add</span>
              <span>Log Meal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render Today's Logged Meals
function renderTodayLogs(logs) {
  const container = document.getElementById('dash-today-logs-container');
  if (!container) return;

  if (!logs || logs.length === 0) {
    container.innerHTML = `
      <div class="p-4 text-center text-on-surface-variant text-xs sm:text-sm bg-[#f1f5ee] rounded-2xl">
        <span class="material-symbols-outlined text-2xl text-[#8ba889] mb-1">restaurant</span>
        <p>No meals logged yet today. Tap + to record your first prenatal dish or power combo!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = logs.map(log => `
    <div class="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#ebefe8] shadow-xs mb-2 transition-all hover:border-[#c3c8bf]">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl overflow-hidden bg-[#ebefe8] flex-shrink-0 flex items-center justify-center">
          ${log.image_url ? `<img src="${log.image_url}" class="w-full h-full object-cover" />` : `<span class="material-symbols-outlined text-[#4a654a]">lunch_dining</span>`}
        </div>
        <div>
          <h4 class="text-xs sm:text-sm font-semibold text-[#181d19] leading-tight">${log.dish_name}</h4>
          <div class="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
            <span class="text-[#4a654a] font-medium">${log.category || 'Meal'}</span>
            <span>•</span>
            <span>${log.calories} kcal</span>
            <span>•</span>
            <span class="text-[#7c5357]">Fe ${log.iron_mg || 0}mg</span>
            <span>•</span>
            <span class="text-[#243d25]">Folate ${log.folate_mcg || 0}µg</span>
          </div>
        </div>
      </div>
      <button onclick="deleteMealLog(${log.id})" class="p-1.5 text-on-surface-variant hover:text-error rounded-full hover:bg-[#ffdad6]/40 transition-colors cursor-pointer" title="Delete entry">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// PRENATAL MEAL COMBINATIONS & POWER PAIRINGS
// -------------------------------------------------------------

async function loadMealCombinations() {
  const res = await api('/api/meal-combinations');
  if (res && res.combinations) {
    state.mealCombinations = res.combinations;
    renderMealCombinations(res.combinations, 'dash-meal-combos-container');
    renderMealCombinations(res.combinations, 'nutrition-meal-combos-grid');
  }
}

function renderMealCombinations(combos, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!combos || combos.length === 0) {
    container.innerHTML = `<p class="text-xs text-on-surface-variant p-4">No meal combinations found.</p>`;
    return;
  }

  container.innerHTML = combos.map(combo => `
    <div class="card-white overflow-hidden border border-[#ebefe8] hover:border-[#b0ceae] transition-all flex flex-col justify-between shadow-xs hover:shadow-md group">
      <!-- Image Header with Duo Visual Indicator -->
      <div class="relative h-44 w-full overflow-hidden bg-[#ebefe8]">
        <img src="${combo.image_url}" alt="${combo.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
        
        <!-- Category & Synergy Badge -->
        <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span class="bg-[#4a654a]/95 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">auto_awesome</span>
            <span>Power Pair</span>
          </span>
          <span class="bg-white/90 backdrop-blur-md text-[#4a654a] text-[11px] font-semibold px-2 py-0.5 rounded-full">
            ${combo.category}
          </span>
        </div>

        <!-- Duo Mini Floating Side Item Avatar -->
        ${combo.side_item_image ? `
          <div class="absolute top-2.5 right-2.5 w-10 h-10 rounded-full ring-2 ring-white overflow-hidden shadow-md" title="Includes side: ${combo.side_item_name}">
            <img src="${combo.side_item_image}" class="w-full h-full object-cover" />
          </div>
        ` : ''}

        <!-- Bottom Header Text -->
        <div class="absolute bottom-2.5 left-3 right-3 text-white">
          <span class="text-[11px] text-[#ccebc8] font-medium block uppercase tracking-wider">${combo.subtitle}</span>
          <h4 class="font-heading text-base font-bold drop-shadow-sm leading-tight">${combo.name}</h4>
        </div>
      </div>

      <!-- Combo Body -->
      <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
        <!-- Breakdown of Combo Items -->
        <div class="space-y-1.5 bg-[#f6fbf4] p-3 rounded-2xl border border-[#ebefe8] text-xs">
          <div class="flex items-center gap-2 text-[#181d19] font-medium">
            <span class="material-symbols-outlined text-sm text-[#4a654a]">restaurant</span>
            <span class="line-clamp-1"><strong class="font-bold">Main:</strong> ${combo.main_dish_name}</span>
          </div>
          <div class="flex items-center gap-2 text-[#434841]">
            <span class="material-symbols-outlined text-sm text-[#7c5357]">add_circle</span>
            <span class="line-clamp-1"><strong class="font-bold">Side:</strong> ${combo.side_item_name}</span>
          </div>
        </div>

        <!-- Synergy Reason Alert Box -->
        <div class="bg-[#fdc7cb]/35 border border-[#fdc7cb] p-2.5 rounded-xl flex items-start gap-2">
          <span class="material-symbols-outlined text-sm text-[#7c5357] mt-0.5">science</span>
          <p class="text-[11px] text-[#795154] leading-relaxed">
            ${combo.synergy_benefit}
          </p>
        </div>

        <!-- Nutrient Values -->
        <div class="flex flex-wrap gap-1.5 text-[11px]">
          <span class="bg-[#ccebc8]/60 text-[#243d25] px-2 py-0.5 rounded-full font-medium">
            🍃 Folate ${combo.folate_mcg}µg
          </span>
          <span class="bg-[#fdc7cb]/60 text-[#795154] px-2 py-0.5 rounded-full font-medium">
            🩸 Iron ${combo.iron_mg}mg
          </span>
          ${combo.dha_mg ? `
            <span class="bg-[#dfe4dd] text-[#434841] px-2 py-0.5 rounded-full font-medium">
              🥑 DHA ${combo.dha_mg}mg
            </span>
          ` : ''}
          ${combo.calcium_mg ? `
            <span class="bg-[#ebefe8] text-[#181d19] px-2 py-0.5 rounded-full font-medium">
              🥛 Ca ${combo.calcium_mg}mg
            </span>
          ` : ''}
        </div>

        <!-- Footer Action -->
        <div class="flex items-center justify-between pt-2 border-t border-[#ebefe8]">
          <div class="text-xs text-on-surface-variant font-medium">
            <span>🔥 ${combo.calories} kcal</span>
            <span class="mx-1">•</span>
            <span>💪 ${combo.protein_g}g Protein</span>
          </div>

          <button onclick="logMealCombination(${combo.id}, '${escapeQuotes(combo.name)}', ${combo.calories})" class="btn-primary text-xs py-2 px-3.5 rounded-full flex items-center gap-1.5 font-semibold cursor-pointer shadow-xs" id="btn-log-combo-${combo.id}">
            <span class="material-symbols-outlined text-sm">playlist_add</span>
            <span>Log Full Combo</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

async function logMealCombination(comboId, name, calories) {
  const btn = document.getElementById(`btn-log-combo-${comboId}`);
  if (btn) btn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">refresh</span>`;

  const res = await api(`/api/meal-combinations/${comboId}/log`, { method: 'POST' });
  triggerConfetti();

  if (res && res.success) {
    showToast(`Logged power pair "${name}" (+${calories} kcal)! 🥗✨`, 'auto_awesome');
  } else {
    showToast(`Logged "${name}" (+${calories} kcal)! 🥗✨`, 'auto_awesome');
  }

  await loadDashboard();
}

// Quick Log Meal with Sparkle Celebration
async function quickLogMeal(dishId, dishName, calories, protein, folate, iron) {
  const btn = document.getElementById(`btn-quick-log-${dishId}`);
  if (btn) {
    btn.innerHTML = `<span class="material-symbols-outlined text-base animate-spin">refresh</span>`;
  }

  const res = await api('/api/meal-logs', {
    method: 'POST',
    body: JSON.stringify({
      dish_id: dishId,
      dish_name: dishName,
      calories: calories,
      protein_g: protein,
      folate_mcg: folate,
      iron_mg: iron
    })
  });

  triggerConfetti();

  if (res && res.success) {
    showToast(`Logged "${dishName}" (+${calories} kcal)! ✨`, 'check_circle');
  } else {
    showToast(`Logged "${dishName}" locally (+${calories} kcal)! ✨`, 'check_circle');
  }

  await loadDashboard();
}

// Delete Logged Meal
async function deleteMealLog(id) {
  await api(`/api/meal-logs/${id}`, { method: 'DELETE' });
  showToast('Meal log entry removed', 'delete');
  await loadDashboard();
}

// Cycle / Swap Next Meal
async function cycleNextMeal() {
  const data = await api('/api/dishes');
  if (data && data.dishes && data.dishes.length > 0) {
    const randomIndex = Math.floor(Math.random() * data.dishes.length);
    renderNextMealCard(data.dishes[randomIndex]);
    showToast('Swapped to recommended recipe', 'shuffle');
  }
}

// -------------------------------------------------------------
// HYDRATION LOGGING WITH MULTI-VOLUMES
// -------------------------------------------------------------

async function addWaterAmount(amount) {
  await api('/api/metrics/water/add', {
    method: 'POST',
    body: JSON.stringify({ amount: amount })
  });
  triggerConfetti();
  showToast(`Hydration recorded (+${amount} L) 💧`, 'water_drop');
  await loadDashboard();
}

// -------------------------------------------------------------
// NOTIFICATION CENTER DRAWER
// -------------------------------------------------------------

function updateNotificationBadge() {
  const badge = document.getElementById('notif-badge');
  const count = state.unreadNotifCount;
  if (!badge) return;

  if (count > 0) {
    badge.textContent = count > 9 ? '9+' : count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

async function openNotificationDrawer() {
  const data = await api('/api/notifications');
  const notifs = data?.notifications || state.notifications;
  const listEl = document.getElementById('notification-list');

  if (listEl) {
    if (!notifs || notifs.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-10 text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl text-[#8ba889] mb-2">notifications_none</span>
          <p class="text-xs">No notifications right now. You're all caught up!</p>
        </div>
      `;
    } else {
      listEl.innerHTML = notifs.map(n => `
        <div class="p-3.5 rounded-2xl border ${n.is_read ? 'bg-[#f6fbf4] border-[#ebefe8]' : 'bg-white border-[#b0ceae] shadow-xs'} transition-all">
          <div class="flex items-start justify-between gap-2.5">
            <div class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-base mt-0.5 ${n.type === 'success' ? 'text-[#4a654a]' : (n.type === 'reminder' ? 'text-[#7c5357]' : 'text-[#8ba889]')}">
                ${n.type === 'reminder' ? 'alarm' : (n.type === 'success' ? 'check_circle' : 'info')}
              </span>
              <div>
                <h5 class="text-xs font-bold text-[#181d19] ${n.is_read ? '' : 'text-[#4a654a]'}">${n.title}</h5>
                <p class="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">${n.message}</p>
                <span class="text-[10px] text-[#737971] block mt-1">${formatTimeAgo(n.created_at)}</span>
              </div>
            </div>
            ${!n.is_read ? `
              <button onclick="dismissNotification(${n.id})" class="text-[10px] font-bold text-[#4a654a] hover:underline cursor-pointer flex-shrink-0">
                Mark read
              </button>
            ` : ''}
          </div>
        </div>
      `).join('');
    }
  }

  openModal('notifications-modal');
}

async function dismissNotification(id) {
  await api(`/api/notifications/${id}/read`, { method: 'POST' });
  state.unreadNotifCount = Math.max(0, state.unreadNotifCount - 1);
  updateNotificationBadge();
  const banner = document.getElementById('dash-alert-banner');
  if (banner) banner.classList.add('hidden');
  showToast('Notification updated', 'done');
  openNotificationDrawer();
}

async function markAllNotificationsRead() {
  await api('/api/notifications/read-all', { method: 'POST' });
  state.unreadNotifCount = 0;
  updateNotificationBadge();
  showToast('All notifications marked as read', 'done_all');
  openNotificationDrawer();
}

function handleAlertAction(notifId, actionType) {
  dismissNotification(notifId);
  if (actionType === 'add_water') {
    addWaterAmount(0.25);
  } else if (actionType === 'view_nutrition') {
    showView('nutrition');
  } else if (actionType === 'start_kick_count') {
    document.getElementById('kick-counter-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}

// -------------------------------------------------------------
// INTERACTIVE FETAL KICK COUNTER
// -------------------------------------------------------------

function toggleKickSession() {
  const btn = document.getElementById('kick-toggle-btn');
  const countBtn = document.getElementById('kick-tap-btn');
  const timerDisplay = document.getElementById('kick-timer-display');

  if (state.kickRunning) {
    // End session
    clearInterval(state.kickTimer);
    state.kickRunning = false;
    if (btn) btn.innerHTML = `<span class="material-symbols-outlined text-sm">play_arrow</span><span>Start Session</span>`;
    if (countBtn) countBtn.disabled = true;
    
    if (state.kickCount > 0) {
      saveKickSession(state.kickCount, state.kickSeconds);
    }
  } else {
    // Start session
    state.kickRunning = true;
    state.kickCount = 0;
    state.kickSeconds = 0;
    updateKickCountDisplay();

    if (btn) btn.innerHTML = `<span class="material-symbols-outlined text-sm">stop</span><span>Save & Finish</span>`;
    if (countBtn) countBtn.disabled = false;

    state.kickTimer = setInterval(() => {
      state.kickSeconds++;
      const mins = Math.floor(state.kickSeconds / 60);
      const secs = state.kickSeconds % 60;
      if (timerDisplay) timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);

    showToast('Kick counter started. Tap baby foot whenever you feel movement!', 'favorite');
  }
}

function recordKickMovement() {
  if (!state.kickRunning) return;
  state.kickCount++;
  updateKickCountDisplay();
  triggerConfetti();

  // Subtle tap feedback
  const tapBtn = document.getElementById('kick-tap-btn');
  if (tapBtn) {
    tapBtn.classList.add('scale-110');
    setTimeout(() => tapBtn.classList.remove('scale-110'), 150);
  }

  showToast(`Recorded kick #${state.kickCount} 👶`, 'child_care');
}

function updateKickCountDisplay() {
  const el = document.getElementById('kick-count-display');
  if (el) el.textContent = state.kickCount;
}

async function saveKickSession(kicks, seconds) {
  const res = await api('/api/kicks', {
    method: 'POST',
    body: JSON.stringify({
      kick_count: kicks,
      duration_seconds: seconds,
      notes: `Fetal kick session recorded (${kicks} movements)`
    })
  });

  if (res && res.success) {
    showToast(`Saved session: ${kicks} kicks in ${Math.round(seconds / 60)} mins! ✨`, 'celebration');
  }
  loadDashboard();
}

// -------------------------------------------------------------
// DAILY MOOD & WELLNESS CHECK-IN
// -------------------------------------------------------------

async function checkInMood(mood) {
  highlightCurrentMood(mood);
  const res = await api('/api/wellness', {
    method: 'POST',
    body: JSON.stringify({ mood: mood })
  });
  triggerConfetti();
  showToast(`Checked in: Feeling ${mood} today 🌸`, 'spa');
}

function highlightCurrentMood(mood) {
  document.querySelectorAll('.mood-btn').forEach(btn => {
    if (btn.dataset.mood === mood) {
      btn.classList.add('ring-2', 'ring-[#4a654a]', 'bg-[#ccebc8]');
    } else {
      btn.classList.remove('ring-2', 'ring-[#4a654a]', 'bg-[#ccebc8]');
    }
  });
}

// -------------------------------------------------------------
// SMART PRENATAL DISH & CRAVING ASSISTANT
// -------------------------------------------------------------

async function fetchSmartDishes(vibe) {
  state.activeVibe = vibe;
  
  // Highlight vibe pill
  document.querySelectorAll('.vibe-chip').forEach(chip => {
    if (chip.dataset.vibe === vibe) {
      chip.classList.add('bg-[#4a654a]', 'text-white');
      chip.classList.remove('bg-[#ebefe8]', 'text-on-surface-variant');
    } else {
      chip.classList.remove('bg-[#4a654a]', 'text-white');
      chip.classList.add('bg-[#ebefe8]', 'text-on-surface-variant');
    }
  });

  const res = await api(`/api/dishes/smart-suggest?vibe=${vibe}`);
  const dishes = res?.dishes || [];
  const container = document.getElementById('smart-dishes-carousel');
  if (!container) return;

  if (dishes.length === 0) {
    container.innerHTML = `<p class="text-xs text-on-surface-variant p-4">No curated dishes found for this craving.</p>`;
    return;
  }

  container.innerHTML = dishes.map(d => `
    <div class="card-white p-3 border border-[#ebefe8] flex items-center justify-between gap-3 min-w-[260px] flex-1 shadow-xs hover:border-[#b0ceae] transition-all">
      <div class="flex items-center gap-2.5">
        <img src="${d.image_url}" class="w-12 h-12 rounded-xl object-cover" />
        <div>
          <h5 class="text-xs font-bold text-[#181d19] leading-tight line-clamp-1">${d.name}</h5>
          <span class="text-[11px] text-[#4a654a] font-medium block mt-0.5">${d.calories} kcal • Fe ${d.iron_mg}mg</span>
        </div>
      </div>
      <button onclick="quickLogMeal(${d.id}, '${escapeQuotes(d.name)}', ${d.calories}, ${d.protein_g}, ${d.folate_mcg}, ${d.iron_mg})" class="btn-primary p-2 text-xs rounded-full flex-shrink-0 cursor-pointer" title="Log Meal">
        <span class="material-symbols-outlined text-sm">add</span>
      </button>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// NUTRITION & DISH HUB
// -------------------------------------------------------------

async function loadDishes() {
  let url = `/api/dishes?`;
  if (state.activeCategory && state.activeCategory !== 'All') {
    url += `category=${encodeURIComponent(state.activeCategory)}&`;
  }
  if (state.searchQuery) {
    url += `search=${encodeURIComponent(state.searchQuery)}&`;
  }

  const data = await api(url);
  const dishes = (data && data.dishes) ? data.dishes : getFallbackDishes();
  state.dishes = dishes;
  renderDishesGrid(dishes);
  renderNutritionMeters();
}

function filterCategory(category) {
  state.activeCategory = category;
  document.querySelectorAll('.filter-chip').forEach(chip => {
    if (chip.dataset.category === category) {
      chip.classList.add('bg-[#4a654a]', 'text-white');
      chip.classList.remove('bg-[#ebefe8]', 'text-on-surface-variant');
    } else {
      chip.classList.remove('bg-[#4a654a]', 'text-white');
      chip.classList.add('bg-[#ebefe8]', 'text-on-surface-variant');
    }
  });
  loadDishes();
}

function handleDishSearch(query) {
  state.searchQuery = query.trim();
  loadDishes();
}

function renderNutritionMeters() {
  const totals = state.dashboard?.nutritionTotals || { calories: 420, protein_g: 14, folate_mcg: 195, iron_mg: 3.4 };
  
  const rda = {
    calories: 2200,
    protein: 75,
    folate: 600,
    iron: 27
  };

  const calPct = Math.min(100, Math.round((totals.calories / rda.calories) * 100));
  const protPct = Math.min(100, Math.round((totals.protein_g / rda.protein) * 100));
  const folPct = Math.min(100, Math.round((totals.folate_mcg / rda.folate) * 100));
  const ironPct = Math.min(100, Math.round((totals.iron_mg / rda.iron) * 100));

  const nutrCalBar = document.getElementById('nutr-cal-bar');
  const nutrCalText = document.getElementById('nutr-cal-text');
  if (nutrCalBar) nutrCalBar.style.width = `${calPct}%`;
  if (nutrCalText) nutrCalText.textContent = `${totals.calories} / ${rda.calories} kcal`;

  const nutrProtBar = document.getElementById('nutr-prot-bar');
  const nutrProtText = document.getElementById('nutr-prot-text');
  if (nutrProtBar) nutrProtBar.style.width = `${protPct}%`;
  if (nutrProtText) nutrProtText.textContent = `${Math.round(totals.protein_g)}g / ${rda.protein}g`;

  const nutrFolBar = document.getElementById('nutr-fol-bar');
  const nutrFolText = document.getElementById('nutr-fol-text');
  if (nutrFolBar) nutrFolBar.style.width = `${folPct}%`;
  if (nutrFolText) nutrFolText.textContent = `${Math.round(totals.folate_mcg)}µg / ${rda.folate}µg`;

  const nutrIronBar = document.getElementById('nutr-iron-bar');
  const nutrIronText = document.getElementById('nutr-iron-text');
  if (nutrIronBar) nutrIronBar.style.width = `${ironPct}%`;
  if (nutrIronText) nutrIronText.textContent = `${totals.iron_mg.toFixed(1)}mg / ${rda.iron}mg`;
}

function renderDishesGrid(dishes) {
  const grid = document.getElementById('dishes-grid');
  if (!grid) return;

  if (!dishes || dishes.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl text-[#8ba889] mb-2">menu_book</span>
        <p class="body-md font-medium">No recipes found matching your criteria.</p>
        <button onclick="filterCategory('All')" class="btn-secondary mt-3">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = dishes.map(dish => `
    <div class="card-white overflow-hidden border border-[#ebefe8] hover:border-[#c3c8bf] transition-all flex flex-col group shadow-xs hover:shadow-md">
      <!-- Dish Image Banner -->
      <div class="relative h-44 w-full overflow-hidden cursor-pointer" onclick="openRecipeModal(${dish.id})">
        <img src="${dish.image_url}" alt="${dish.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div class="absolute top-2.5 left-2.5 bg-[#4a654a]/90 backdrop-blur-md text-white badge-pill text-[11px] px-2.5 py-0.5 font-semibold">
          ${dish.category}
        </div>

        <button onclick="event.stopPropagation(); toggleFavorite(${dish.id}, ${dish.is_favorite})" class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-on-surface transition-transform active:scale-90 cursor-pointer">
          <span class="material-symbols-outlined text-base ${dish.is_favorite ? 'text-[#7c5357] font-filled' : 'text-[#737971]'}">
            ${dish.is_favorite ? 'favorite' : 'favorite_border'}
          </span>
        </button>

        <div class="absolute bottom-2.5 left-2.5 right-2.5 text-white">
          <h4 class="title-md text-base font-bold drop-shadow-sm leading-tight">${dish.name}</h4>
        </div>
      </div>

      <!-- Card Body -->
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p class="body-md text-xs text-on-surface-variant line-clamp-2 mb-3">
            ${dish.description}
          </p>

          <div class="flex flex-wrap gap-1.5 mb-3.5">
            <span class="bg-[#ccebc8]/60 text-[#243d25] px-2 py-0.5 rounded-full text-[11px] font-medium">
              Folate ${dish.folate_mcg}µg
            </span>
            <span class="bg-[#fdc7cb]/60 text-[#795154] px-2 py-0.5 rounded-full text-[11px] font-medium">
              Iron ${dish.iron_mg}mg
            </span>
            ${dish.protein_g ? `
              <span class="bg-[#ebefe8] text-[#434841] px-2 py-0.5 rounded-full text-[11px] font-medium">
                ${dish.protein_g}g Protein
              </span>
            ` : ''}
          </div>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-[#ebefe8]">
          <div class="text-xs text-on-surface-variant font-medium flex items-center gap-2">
            <span>⏱️ ${dish.prep_time_minutes}m</span>
            <span>🔥 ${dish.calories} kcal</span>
          </div>

          <div class="flex items-center gap-1.5">
            <button onclick="openRecipeModal(${dish.id})" class="btn-ghost text-xs py-1.5 px-2.5 font-medium cursor-pointer">
              Recipe
            </button>
            <button onclick="quickLogMeal(${dish.id}, '${escapeQuotes(dish.name)}', ${dish.calories}, ${dish.protein_g}, ${dish.folate_mcg}, ${dish.iron_mg})" class="btn-primary text-xs py-1.5 px-3.5 rounded-full flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-sm">add</span>
              <span>Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Recipe Details Modal
async function openRecipeModal(dishId) {
  let dish = state.dishes.find(d => d.id === dishId);
  if (!dish) {
    const res = await api(`/api/dishes/${dishId}`);
    if (res && res.dish) dish = res.dish;
  }
  if (!dish && state.dashboard?.nextMeal?.id === dishId) {
    dish = state.dashboard.nextMeal;
  }
  if (!dish) return;

  state.selectedDish = dish;
  const modalContent = document.getElementById('recipe-modal-content');
  if (!modalContent) return;

  const ingredientsList = Array.isArray(dish.ingredients) ? dish.ingredients : [];
  const stepsList = Array.isArray(dish.recipe_steps) ? dish.recipe_steps : [];

  modalContent.innerHTML = `
    <!-- Header Image -->
    <div class="relative -mx-6 -mt-6 h-60 mb-5 overflow-hidden rounded-t-[32px]">
      <img src="${dish.image_url}" alt="${dish.name}" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      
      <button onclick="closeModal('recipe-modal')" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>

      <div class="absolute bottom-4 left-5 right-5 text-white">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="bg-[#4a654a] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">${dish.category}</span>
          <span class="bg-white/25 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">${dish.trimester_recommendation || 'Trimester 2'}</span>
        </div>
        <h2 class="headline-lg text-xl sm:text-2xl font-bold leading-tight drop-shadow-sm">${dish.name}</h2>
      </div>
    </div>

    <!-- Quick Nutrition Chips -->
    <div class="grid grid-cols-4 gap-2.5 mb-4">
      <div class="bg-[#f1f5ee] p-3 rounded-2xl text-center">
        <span class="text-[11px] text-on-surface-variant block">Calories</span>
        <span class="font-bold text-sm text-[#181d19]">${dish.calories}</span>
      </div>
      <div class="bg-[#f1f5ee] p-3 rounded-2xl text-center">
        <span class="text-[11px] text-on-surface-variant block">Protein</span>
        <span class="font-bold text-sm text-[#181d19]">${dish.protein_g}g</span>
      </div>
      <div class="bg-[#f1f5ee] p-3 rounded-2xl text-center">
        <span class="text-[11px] text-on-surface-variant block">Folate</span>
        <span class="font-bold text-sm text-[#4a654a]">${dish.folate_mcg}µg</span>
      </div>
      <div class="bg-[#f1f5ee] p-3 rounded-2xl text-center">
        <span class="text-[11px] text-on-surface-variant block">Iron</span>
        <span class="font-bold text-sm text-[#7c5357]">${dish.iron_mg}mg</span>
      </div>
    </div>

    <!-- Prenatal Benefit Box -->
    <div class="bg-[#ccebc8]/40 border border-[#b0ceae] p-4 rounded-2xl mb-4">
      <div class="flex items-center gap-2 mb-1.5 text-[#243d25] font-semibold text-xs">
        <span class="material-symbols-outlined text-base">favorite</span>
        <span>Why it's great for your pregnancy</span>
      </div>
      <p class="text-xs text-[#243d25]/90 leading-relaxed">${dish.description}</p>
    </div>

    <!-- Ingredients -->
    <div class="mb-5">
      <h4 class="title-md text-sm font-semibold text-[#181d19] mb-2.5 flex items-center gap-1.5">
        <span class="material-symbols-outlined text-base text-[#4a654a]">shopping_basket</span>
        <span>Ingredients (${ingredientsList.length})</span>
      </h4>
      <ul class="space-y-2 text-xs text-on-surface bg-[#f6fbf4] p-4 rounded-2xl border border-[#ebefe8]">
        ${ingredientsList.map(item => `
          <li class="flex items-start gap-2">
            <span class="material-symbols-outlined text-[#8ba889] text-base mt-0.5">check_circle</span>
            <span>${item}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <!-- Step by Step Instructions -->
    <div class="mb-6">
      <h4 class="title-md text-sm font-semibold text-[#181d19] mb-2.5 flex items-center gap-1.5">
        <span class="material-symbols-outlined text-base text-[#4a654a]">skillet</span>
        <span>Preparation Steps (${stepsList.length})</span>
      </h4>
      <ol class="space-y-2.5 text-xs text-on-surface">
        ${stepsList.map((step, idx) => `
          <li class="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#ebefe8]">
            <span class="w-6 h-6 rounded-full bg-[#4a654a] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">${idx + 1}</span>
            <span class="leading-relaxed">${step}</span>
          </li>
        `).join('')}
      </ol>
    </div>

    <!-- Log CTA Button -->
    <div class="sticky bottom-0 bg-white/95 backdrop-blur-md pt-2 pb-1">
      <button onclick="quickLogMeal(${dish.id}, '${escapeQuotes(dish.name)}', ${dish.calories}, ${dish.protein_g}, ${dish.folate_mcg}, ${dish.iron_mg}); closeModal('recipe-modal');" class="btn-primary w-full py-3.5 text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md">
        <span class="material-symbols-outlined">add_circle</span>
        <span>Log this Meal to Journal</span>
      </button>
    </div>
  `;

  openModal('recipe-modal');
}

// Toggle Favorite Dish
async function toggleFavorite(dishId, currentStatus) {
  const newStatus = currentStatus ? 0 : 1;
  await api(`/api/dishes/${dishId}`, {
    method: 'PUT',
    body: JSON.stringify({ is_favorite: newStatus })
  });
  showToast(newStatus ? 'Added to favorites ⭐' : 'Removed from favorites', 'favorite');
  loadDishes();
}

// Create New Dish Submit
async function submitNewDish(event) {
  event.preventDefault();
  const form = event.target;
  
  const ingredientsRaw = form.ingredients.value.split('\n').map(s => s.trim()).filter(Boolean);
  const stepsRaw = form.steps.value.split('\n').map(s => s.trim()).filter(Boolean);

  const payload = {
    name: form.name.value.trim(),
    category: form.category.value,
    description: form.description.value.trim(),
    prep_time_minutes: parseInt(form.prep_time.value, 10) || 15,
    calories: parseInt(form.calories.value, 10) || 350,
    protein_g: parseFloat(form.protein.value) || 15,
    carbs_g: parseFloat(form.carbs.value) || 35,
    fat_g: parseFloat(form.fat.value) || 12,
    folate_mcg: parseFloat(form.folate.value) || 120,
    iron_mg: parseFloat(form.iron.value) || 3.0,
    calcium_mg: parseFloat(form.calcium.value) || 100,
    dha_mg: parseFloat(form.dha.value) || 0,
    trimester_recommendation: form.trimester.value,
    dietary_tags: form.tags.value.trim(),
    image_url: form.image_url.value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    ingredients: ingredientsRaw.length > 0 ? ingredientsRaw : ['1 cup fresh ingredients'],
    recipe_steps: stepsRaw.length > 0 ? stepsRaw : ['Prepare and cook all ingredients with care.']
  };

  const res = await api('/api/dishes', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  triggerConfetti();

  if (res && res.success) {
    showToast(`Created custom dish "${payload.name}"! 🍳`, 'restaurant');
  } else {
    showToast(`Saved dish "${payload.name}"! 🍳`, 'restaurant');
  }

  closeModal('add-dish-modal');
  form.reset();
  loadDishes();
}

// -------------------------------------------------------------
// ACTIVITY & GOAL SETTINGS
// -------------------------------------------------------------

function toggleGoalSettings() {
  const panel = document.getElementById('goal-settings-panel');
  if (panel) {
    panel.classList.toggle('hidden');
  }
}

async function handleSliderChange(type, value) {
  const val = parseInt(value, 10);
  if (type === 'steps') {
    const readout = document.getElementById('slider-steps-readout');
    if (readout) readout.textContent = val.toLocaleString();
    await api('/api/metrics', {
      method: 'PUT',
      body: JSON.stringify({ step_goal: val })
    });
  } else if (type === 'calories') {
    const readout = document.getElementById('slider-cal-readout');
    if (readout) readout.textContent = `${val} kcal`;
    await api('/api/metrics', {
      method: 'PUT',
      body: JSON.stringify({ active_calories_goal: val })
    });
  }
}

function animateActivityCharts() {
  setTimeout(() => {
    document.querySelectorAll('.chart-bar').forEach(bar => {
      const height = bar.dataset.height || '50%';
      bar.style.height = height;
    });
  }, 200);
}

// -------------------------------------------------------------
// PRENATAL EXERCISES & CLINICAL GUIDELINES
// -------------------------------------------------------------

async function loadExercises() {
  let url = `/api/exercises?`;
  if (state.activeExerciseCategory && state.activeExerciseCategory !== 'All') {
    url += `category=${encodeURIComponent(state.activeExerciseCategory)}&`;
  }
  if (state.exerciseSearchQuery) {
    url += `search=${encodeURIComponent(state.exerciseSearchQuery)}&`;
  }

  const res = await api(url);
  const exercises = (res && res.exercises) ? res.exercises : [];
  state.exercises = exercises;
  renderExercisesGrid(exercises);

  // If no guided exercise selected yet, default to the first
  if (!state.guidedExercise && exercises.length > 0) {
    setGuidedExercise(exercises[0]);
  }
}

async function loadExerciseGuidelines() {
  const res = await api('/api/exercises/guidelines');
  if (res && res.guidelines) {
    state.exerciseGuidelines = res.guidelines;
    renderExerciseGuidelines(res.guidelines);
  }
}

function filterExerciseCategory(category) {
  state.activeExerciseCategory = category;
  document.querySelectorAll('.ex-filter-chip').forEach(chip => {
    if (chip.dataset.category === category) {
      chip.classList.add('bg-[#4a654a]', 'text-white');
      chip.classList.remove('bg-[#ebefe8]', 'text-on-surface-variant');
    } else {
      chip.classList.remove('bg-[#4a654a]', 'text-white');
      chip.classList.add('bg-[#ebefe8]', 'text-on-surface-variant');
    }
  });
  loadExercises();
}

function handleExerciseSearch(query) {
  state.exerciseSearchQuery = query.trim();
  loadExercises();
}

function renderExerciseGuidelines(guidelines) {
  // 1. Render Golden Rules
  const rulesContainer = document.getElementById('exercise-rules-container');
  if (rulesContainer && guidelines.golden_rules) {
    rulesContainer.innerHTML = guidelines.golden_rules.map(rule => `
      <div class="card-white p-3.5 rounded-2xl border border-[#ebefe8] flex items-start gap-3 shadow-xs hover:border-[#8ba889] transition-all">
        <div class="w-9 h-9 rounded-xl bg-[#ccebc8]/60 text-[#243d25] flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-lg">${rule.icon}</span>
        </div>
        <div>
          <h5 class="text-xs font-bold text-[#181d19]">${rule.title}</h5>
          <p class="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">${rule.description}</p>
        </div>
      </div>
    `).join('');
  }

  // 2. Render Warning Signs
  const warningList = document.getElementById('exercise-warnings-list');
  if (warningList && guidelines.warning_signs) {
    warningList.innerHTML = guidelines.warning_signs.map(sign => `
      <li class="flex items-center gap-2 text-xs text-[#ba1a1a] font-medium bg-[#ffdad6]/30 px-3 py-1.5 rounded-xl border border-[#ffdad6]">
        <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
        <span>${sign}</span>
      </li>
    `).join('');
  }
}

function renderExercisesGrid(exercises) {
  const container = document.getElementById('exercises-library-grid');
  if (!container) return;

  if (!exercises || exercises.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-10 text-center text-on-surface-variant">
        <span class="material-symbols-outlined text-3xl text-[#8ba889] mb-1">self_improvement</span>
        <p class="text-xs font-medium">No exercises found matching your search.</p>
        <button onclick="filterExerciseCategory('All')" class="btn-secondary text-xs mt-2">Reset Filter</button>
      </div>
    `;
    return;
  }

  container.innerHTML = exercises.map(ex => `
    <div class="card-white overflow-hidden border border-[#ebefe8] hover:border-[#b0ceae] transition-all flex flex-col group shadow-xs hover:shadow-md">
      <div class="relative h-36 w-full overflow-hidden cursor-pointer" onclick="openExerciseDetailsModal(${ex.id})">
        <img src="${ex.image_url}" alt="${ex.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        <div class="absolute top-2.5 left-2.5 bg-[#4a654a]/90 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
          ${ex.category}
        </div>

        <div class="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md text-[#181d19] text-[10px] px-2 py-0.5 rounded-full font-semibold">
          ⏱️ ${ex.duration_minutes}m • 🔥 ${ex.calories_burn} kcal
        </div>

        <div class="absolute bottom-2.5 left-2.5 right-2.5 text-white">
          <h4 class="font-heading text-sm font-bold leading-tight drop-shadow-sm">${ex.name}</h4>
        </div>
      </div>

      <div class="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <p class="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed mb-2">
            ${ex.benefits}
          </p>

          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="bg-[#ccebc8]/60 text-[#243d25] px-2 py-0.5 rounded-full text-[10px] font-semibold">
              ${ex.trimester_safe}
            </span>
            <span class="bg-[#ebefe8] text-[#434841] px-2 py-0.5 rounded-full text-[10px] font-medium">
              ${ex.intensity}
            </span>
            <span class="bg-[#ebefe8] text-[#434841] px-2 py-0.5 rounded-full text-[10px] font-medium">
              🏷️ ${ex.equipment}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2.5 border-t border-[#ebefe8]">
          <button onclick="openExerciseDetailsModal(${ex.id})" class="text-xs font-semibold text-[#4a654a] hover:underline flex items-center gap-0.5 cursor-pointer">
            <span>Guide & Steps</span>
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>

          <button onclick="startGuidedExercise(${ex.id})" class="btn-primary text-xs py-1.5 px-3 rounded-full flex items-center gap-1 cursor-pointer font-medium shadow-xs">
            <span class="material-symbols-outlined text-sm">play_circle</span>
            <span>Studio Session</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function setGuidedExercise(ex) {
  state.guidedExercise = ex;
  const titleEl = document.getElementById('studio-exercise-title');
  const catEl = document.getElementById('studio-exercise-category');
  const benefitEl = document.getElementById('studio-exercise-benefit');
  const timerLabel = document.getElementById('exercise-timer-text');

  if (titleEl) titleEl.textContent = ex.name;
  if (catEl) catEl.textContent = `${ex.category} • ${ex.intensity} (${ex.duration_minutes}m)`;
  if (benefitEl) benefitEl.textContent = ex.benefits;

  state.exerciseSeconds = (ex.duration_minutes || 5) * 60;
  if (timerLabel) {
    const mins = Math.floor(state.exerciseSeconds / 60);
    const secs = state.exerciseSeconds % 60;
    timerLabel.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

function startGuidedExercise(id) {
  const ex = state.exercises.find(e => e.id === id);
  if (!ex) return;
  setGuidedExercise(ex);
  document.getElementById('guided-studio-panel')?.scrollIntoView({ behavior: 'smooth' });
  showToast(`Loaded "${ex.name}" into Movement Studio! 🧘`, 'self_improvement');
}

function toggleExerciseTimer() {
  const btn = document.getElementById('exercise-timer-btn');
  const label = document.getElementById('exercise-timer-text');
  
  if (state.exerciseRunning) {
    clearInterval(state.exerciseTimer);
    state.exerciseRunning = false;
    if (btn) btn.innerHTML = `<span class="material-symbols-outlined">play_arrow</span><span>Resume Session</span>`;
  } else {
    state.exerciseRunning = true;
    if (btn) btn.innerHTML = `<span class="material-symbols-outlined">pause</span><span>Pause Session</span>`;
    
    state.exerciseTimer = setInterval(() => {
      if (state.exerciseSeconds > 0) {
        state.exerciseSeconds--;
        const mins = Math.floor(state.exerciseSeconds / 60);
        const secs = state.exerciseSeconds % 60;
        if (label) label.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      } else {
        clearInterval(state.exerciseTimer);
        state.exerciseRunning = false;
        triggerConfetti();
        if (btn) btn.innerHTML = `<span class="material-symbols-outlined">restart_alt</span><span>Restart Session</span>`;
        if (state.guidedExercise) {
          logCompletedExercise(state.guidedExercise.id, state.guidedExercise.duration_minutes);
        }
      }
    }, 1000);
  }
}

function resetExerciseTimer() {
  clearInterval(state.exerciseTimer);
  state.exerciseRunning = false;
  const btn = document.getElementById('exercise-timer-btn');
  if (btn) btn.innerHTML = `<span class="material-symbols-outlined">play_arrow</span><span>Start Guided Session</span>`;
  if (state.guidedExercise) {
    state.exerciseSeconds = (state.guidedExercise.duration_minutes || 5) * 60;
  } else {
    state.exerciseSeconds = 180;
  }
  const label = document.getElementById('exercise-timer-text');
  if (label) {
    const mins = Math.floor(state.exerciseSeconds / 60);
    const secs = state.exerciseSeconds % 60;
    label.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  showToast('Timer reset to full duration', 'replay');
}

async function logCompletedExercise(exerciseId, duration) {
  const res = await api(`/api/exercises/${exerciseId}/log`, {
    method: 'POST',
    body: JSON.stringify({ duration_minutes: duration })
  });

  triggerConfetti();
  if (res && res.success) {
    showToast(res.message, 'celebration');
  } else {
    showToast(`Logged workout session! Great maternal stamina ✨`, 'celebration');
  }
  loadDashboard();
}

// Full Exercise Details Modal
async function openExerciseDetailsModal(id) {
  let ex = state.exercises.find(e => e.id === id);
  if (!ex) {
    const res = await api(`/api/exercises/${id}`);
    if (res && res.exercise) ex = res.exercise;
  }
  if (!ex) return;

  state.selectedExercise = ex;
  const content = document.getElementById('exercise-modal-content');
  if (!content) return;

  const stepsList = Array.isArray(ex.steps) ? ex.steps : [];

  content.innerHTML = `
    <!-- Header Image -->
    <div class="relative -mx-6 -mt-6 h-56 mb-4 overflow-hidden rounded-t-[32px]">
      <img src="${ex.image_url}" alt="${ex.name}" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      
      <button onclick="closeModal('exercise-details-modal')" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>

      <div class="absolute bottom-4 left-5 right-5 text-white">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="bg-[#4a654a] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">${ex.category}</span>
          <span class="bg-white/25 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">${ex.trimester_safe}</span>
        </div>
        <h2 class="font-heading text-xl font-bold leading-tight drop-shadow-sm">${ex.name}</h2>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-3 gap-2.5 mb-4 text-center">
      <div class="bg-[#f1f5ee] p-2.5 rounded-2xl">
        <span class="text-[10px] text-on-surface-variant block">Duration</span>
        <span class="font-bold text-xs text-[#181d19]">⏱️ ${ex.duration_minutes} mins</span>
      </div>
      <div class="bg-[#f1f5ee] p-2.5 rounded-2xl">
        <span class="text-[10px] text-on-surface-variant block">Energy Burn</span>
        <span class="font-bold text-xs text-[#7c5357]">🔥 ${ex.calories_burn} kcal</span>
      </div>
      <div class="bg-[#f1f5ee] p-2.5 rounded-2xl">
        <span class="text-[10px] text-on-surface-variant block">Equipment</span>
        <span class="font-bold text-xs text-[#4a654a]">${ex.equipment}</span>
      </div>
    </div>

    <!-- Pregnancy Benefit Box -->
    <div class="bg-[#ccebc8]/40 border border-[#b0ceae] p-3.5 rounded-2xl mb-4">
      <div class="flex items-center gap-1.5 mb-1 text-[#243d25] font-bold text-xs">
        <span class="material-symbols-outlined text-base">spa</span>
        <span>Maternal & Fetal Benefits</span>
      </div>
      <p class="text-xs text-[#243d25]/90 leading-relaxed">${ex.benefits}</p>
    </div>

    <!-- Form Cues -->
    <div class="bg-[#fdc7cb]/30 border border-[#fdc7cb] p-3.5 rounded-2xl mb-4">
      <div class="flex items-center gap-1.5 mb-1 text-[#795154] font-bold text-xs">
        <span class="material-symbols-outlined text-base">psychology</span>
        <span>Breathing & Form Cues</span>
      </div>
      <p class="text-xs text-[#795154] leading-relaxed">${ex.cues}</p>
    </div>

    <!-- Numbered Steps -->
    <div class="mb-4">
      <h4 class="font-heading text-xs font-bold text-[#181d19] mb-2 flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[#4a654a] text-base">format_list_numbered</span>
        <span>Step-by-Step Movement Guide</span>
      </h4>
      <ol class="space-y-2 text-xs text-on-surface">
        ${stepsList.map((step, idx) => `
          <li class="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#ebefe8]">
            <span class="w-5 h-5 rounded-full bg-[#4a654a] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">${idx + 1}</span>
            <span class="leading-relaxed">${step}</span>
          </li>
        `).join('')}
      </ol>
    </div>

    <!-- Safety Warning Note -->
    ${ex.safety_tips ? `
      <div class="bg-[#fff3cd]/50 border border-[#ffeaa7] p-3 rounded-xl mb-4 text-xs text-[#856404] flex items-start gap-2">
        <span class="material-symbols-outlined text-base flex-shrink-0 mt-0.5">warning</span>
        <span><strong>Safety Modification:</strong> ${ex.safety_tips}</span>
      </div>
    ` : ''}

    <!-- Action Buttons -->
    <div class="grid grid-cols-2 gap-3 pt-2">
      <button onclick="startGuidedExercise(${ex.id}); closeModal('exercise-details-modal');" class="btn-primary py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
        <span class="material-symbols-outlined text-sm">play_arrow</span>
        <span>Open in Studio</span>
      </button>

      <button onclick="logCompletedExercise(${ex.id}, ${ex.duration_minutes}); closeModal('exercise-details-modal');" class="btn-secondary py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
        <span class="material-symbols-outlined text-sm">check_circle</span>
        <span>Quick Log (+${ex.calories_burn} kcal)</span>
      </button>
    </div>
  `;

  openModal('exercise-details-modal');
}

// -------------------------------------------------------------
// PROFILE & EXPORT
// -------------------------------------------------------------

function exportHealthData() {
  const data = {
    user: state.dashboard?.profile || { name: 'Sarah Miller', week: 24 },
    todayMetrics: state.dashboard?.metrics,
    loggedMeals: state.dashboard?.todayLogs,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bloom_Health_Report_Sarah_Miller_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported health report (JSON)', 'download');
}

// -------------------------------------------------------------
// MODALS
// -------------------------------------------------------------

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function escapeQuotes(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Just now';
  return 'Today';
}

// Fallbacks
function getFallbackDashboard() {
  return {
    profile: { name: 'Sarah Miller', pregnancy_week: 24, baby_comparison: 'an ear of corn' },
    metrics: { steps: 6420, step_goal: 8000, water_liters: 1.5, water_goal_liters: 2.5, active_calories: 420 },
    nextMeal: { id: 1, name: "Avocado & Spinach Sourdough Toast", category: "Breakfast", calories: 360, protein_g: 14, folate_mcg: 195, iron_mg: 3.4, prep_time_minutes: 10, description: "Rich in folate and choline.", image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80" },
    todayLogs: [],
    nutritionTotals: { calories: 360, protein_g: 14, folate_mcg: 195, iron_mg: 3.4 },
    tip: { title: "Folate Synergy", advice: "Pair greens with vitamin C to boost iron absorption." }
  };
}

function getFallbackDishes() {
  return [
    { id: 1, name: "Avocado Toast", category: "Breakfast", calories: 360, protein_g: 14, folate_mcg: 195, iron_mg: 3.4, prep_time_minutes: 10, description: "Folate-rich", image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80" }
  ];
}

// -------------------------------------------------------------
// CLINICS & PRENATAL CARE PROVIDERS MANAGEMENT
// -------------------------------------------------------------

async function loadClinics() {
  let url = `/api/clinics?`;
  if (state.activeClinicType && state.activeClinicType !== 'All') {
    url += `type=${encodeURIComponent(state.activeClinicType)}&`;
  }
  if (state.clinicSearchQuery) {
    url += `search=${encodeURIComponent(state.clinicSearchQuery)}&`;
  }

  const res = await api(url);
  const clinics = (res && res.clinics) ? res.clinics : [];
  state.clinics = clinics;
  renderClinicsGrid(clinics);
}

function filterClinicType(type) {
  state.activeClinicType = type;
  document.querySelectorAll('.clinic-filter-chip').forEach(chip => {
    if (chip.dataset.type === type) {
      chip.classList.add('bg-[#4a654a]', 'text-white');
      chip.classList.remove('bg-[#ebefe8]', 'text-on-surface-variant');
    } else {
      chip.classList.remove('bg-[#4a654a]', 'text-white');
      chip.classList.add('bg-[#ebefe8]', 'text-on-surface-variant');
    }
  });
  loadClinics();
}

function handleClinicSearch(query) {
  state.clinicSearchQuery = query.trim();
  loadClinics();
}

function renderClinicsGrid(clinics) {
  const container = document.getElementById('clinics-grid');
  if (!container) return;

  if (!clinics || clinics.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl text-[#8ba889] mb-2">local_hospital</span>
        <p class="text-xs font-semibold">No clinics or doctors found matching your search.</p>
        <button onclick="filterClinicType('All')" class="btn-secondary text-xs mt-3">Reset Filter</button>
      </div>
    `;
    return;
  }

  container.innerHTML = clinics.map(c => `
    <div class="card-white overflow-hidden border ${c.is_primary ? 'border-[#8ba889] ring-2 ring-[#ccebc8]/60 shadow-sm' : 'border-[#ebefe8]'} hover:border-[#8ba889] transition-all flex flex-col group shadow-xs">
      
      <!-- Clinic Photo / Top Banner -->
      <div class="relative h-40 w-full overflow-hidden">
        <img src="${c.image_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'}" alt="${c.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>

        <!-- Clinic Type & Primary Pill -->
        <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span class="bg-[#4a654a]/90 backdrop-blur-md text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">
            ${c.clinic_type || 'OB/GYN'}
          </span>
          ${c.is_primary ? `
            <span class="bg-[#fdc7cb] text-[#795154] text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 shadow-xs">
              <span class="material-symbols-outlined text-[12px]">star</span>
              <span>Primary Care</span>
            </span>
          ` : ''}
        </div>

        <!-- Action Menu -->
        <div class="absolute top-2.5 right-2.5 flex items-center gap-1">
          <button onclick="openEditClinicModal(${c.id})" class="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-on-surface flex items-center justify-center hover:bg-white transition-transform active:scale-90 cursor-pointer shadow-xs" title="Edit / Change Clinic Data">
            <span class="material-symbols-outlined text-sm">edit</span>
          </button>
          <button onclick="deleteClinic(${c.id})" class="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-[#ba1a1a] flex items-center justify-center hover:bg-[#ffdad6] transition-transform active:scale-90 cursor-pointer shadow-xs" title="Remove Clinic">
            <span class="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>

        <div class="absolute bottom-2.5 left-3 right-3 text-white">
          <h4 class="font-heading text-sm sm:text-base font-bold leading-tight drop-shadow-sm">${c.name}</h4>
          <span class="text-[11px] text-[#ccebc8] font-medium block mt-0.5">${c.doctor_name || c.specialty}</span>
        </div>
      </div>

      <!-- Card Body -->
      <div class="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div class="space-y-2.5">
          <div class="text-xs text-on-surface-variant flex items-start gap-2">
            <span class="material-symbols-outlined text-[#4a654a] text-base flex-shrink-0 mt-0.5">location_on</span>
            <span class="line-clamp-2 leading-relaxed">${c.address || 'Address on file'}</span>
          </div>

          <!-- Next Appointment Box -->
          <div class="bg-[#f6fbf4] p-3 rounded-2xl border border-[#ebefe8] space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#4a654a] flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">event</span>
                <span>Next Appointment</span>
              </span>
              <button onclick="openChangeAppointmentModal(${c.id})" class="text-[10px] font-bold text-[#4a654a] hover:underline cursor-pointer">
                Change Date
              </button>
            </div>
            <div class="text-xs font-bold text-[#181d19]">
              ${c.next_appointment ? c.next_appointment : 'No upcoming visit scheduled'}
            </div>
            ${c.appointment_purpose ? `
              <p class="text-[11px] text-on-surface-variant line-clamp-1">${c.appointment_purpose}</p>
            ` : ''}
          </div>

          ${c.notes ? `
            <p class="text-[11px] text-[#737971] italic line-clamp-2 bg-[#f1f5ee] px-3 py-1.5 rounded-xl">
              "${c.notes}"
            </p>
          ` : ''}
        </div>

        <!-- Card Footer Contact Buttons -->
        <div class="pt-2 border-t border-[#ebefe8] flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 flex-1">
            ${c.phone ? `
              <a href="tel:${c.phone}" class="btn-secondary flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer" title="Call Clinic">
                <span class="material-symbols-outlined text-sm">call</span>
                <span>Call</span>
              </a>
            ` : ''}
            ${c.emergency_phone ? `
              <a href="tel:${c.emergency_phone}" class="bg-[#ffdad6]/60 hover:bg-[#ffdad6] text-[#ba1a1a] flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors" title="24/7 Triage Line">
                <span class="material-symbols-outlined text-sm">emergency</span>
                <span>24/7 Hotline</span>
              </a>
            ` : ''}
          </div>

          <button onclick="openEditClinicModal(${c.id})" class="btn-primary py-2 px-3 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer shadow-xs" title="Change Clinic Info">
            <span class="material-symbols-outlined text-sm">tune</span>
            <span>Manage</span>
          </button>
        </div>
      </div>

    </div>
  `).join('');
}

// -------------------------------------------------------------
// ADD / EDIT CLINIC MODALS & ACTIONS
// -------------------------------------------------------------

function openAddClinicModal() {
  const form = document.getElementById('add-clinic-form');
  if (form) form.reset();
  openModal('add-clinic-modal');
}

async function submitNewClinic(event) {
  event.preventDefault();
  const form = event.target;

  const payload = {
    name: form.name.value.trim(),
    doctor_name: form.doctor_name.value.trim(),
    specialty: form.specialty.value.trim(),
    clinic_type: form.clinic_type.value,
    phone: form.phone.value.trim(),
    emergency_phone: form.emergency_phone.value.trim(),
    address: form.address.value.trim(),
    website: form.website.value.trim(),
    next_appointment: form.next_appointment.value.trim(),
    appointment_purpose: form.appointment_purpose.value.trim(),
    notes: form.notes.value.trim(),
    is_primary: form.is_primary.checked ? 1 : 0,
    image_url: form.image_url.value.trim() || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
  };

  const res = await api('/api/clinics', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  triggerConfetti();
  if (res && res.success) {
    showToast(`Added "${payload.name}" to clinics! 🏥`, 'local_hospital');
  } else {
    showToast(`Saved clinic "${payload.name}"!`, 'local_hospital');
  }

  closeModal('add-clinic-modal');
  loadClinics();
  loadDashboard();
}

async function openEditClinicModal(id) {
  let clinic = state.clinics.find(c => c.id === id);
  if (!clinic) {
    const res = await api(`/api/clinics/${id}`);
    if (res && res.clinic) clinic = res.clinic;
  }
  if (!clinic) return;

  state.selectedClinic = clinic;
  const form = document.getElementById('edit-clinic-form');
  if (!form) return;

  form.clinic_id.value = clinic.id;
  form.name.value = clinic.name || '';
  form.doctor_name.value = clinic.doctor_name || '';
  form.specialty.value = clinic.specialty || '';
  form.clinic_type.value = clinic.clinic_type || 'OB/GYN';
  form.phone.value = clinic.phone || '';
  form.emergency_phone.value = clinic.emergency_phone || '';
  form.address.value = clinic.address || '';
  form.website.value = clinic.website || '';
  form.next_appointment.value = clinic.next_appointment || '';
  form.appointment_purpose.value = clinic.appointment_purpose || '';
  form.notes.value = clinic.notes || '';
  form.is_primary.checked = clinic.is_primary === 1;
  form.image_url.value = clinic.image_url || '';

  openModal('edit-clinic-modal');
}

async function submitEditClinic(event) {
  event.preventDefault();
  const form = event.target;
  const id = form.clinic_id.value;

  const payload = {
    name: form.name.value.trim(),
    doctor_name: form.doctor_name.value.trim(),
    specialty: form.specialty.value.trim(),
    clinic_type: form.clinic_type.value,
    phone: form.phone.value.trim(),
    emergency_phone: form.emergency_phone.value.trim(),
    address: form.address.value.trim(),
    website: form.website.value.trim(),
    next_appointment: form.next_appointment.value.trim(),
    appointment_purpose: form.appointment_purpose.value.trim(),
    notes: form.notes.value.trim(),
    is_primary: form.is_primary.checked ? 1 : 0,
    image_url: form.image_url.value.trim()
  };

  const res = await api(`/api/clinics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

  triggerConfetti();
  showToast(`Updated "${payload.name}" successfully! ✨`, 'check_circle');
  closeModal('edit-clinic-modal');
  loadClinics();
  loadDashboard();
}

async function openChangeAppointmentModal(id) {
  let clinic = state.clinics.find(c => c.id === id);
  if (!clinic) {
    const res = await api(`/api/clinics/${id}`);
    if (res && res.clinic) clinic = res.clinic;
  }
  if (!clinic) return;

  state.selectedClinic = clinic;
  const form = document.getElementById('change-appointment-form');
  if (!form) return;

  form.clinic_id.value = clinic.id;
  document.getElementById('change-app-clinic-name').textContent = clinic.name;
  form.next_appointment.value = clinic.next_appointment || '';
  form.appointment_purpose.value = clinic.appointment_purpose || '';
  form.notes.value = clinic.notes || '';

  openModal('change-appointment-modal');
}

async function submitChangeAppointment(event) {
  event.preventDefault();
  const form = event.target;
  const id = form.clinic_id.value;

  const payload = {
    next_appointment: form.next_appointment.value.trim(),
    appointment_purpose: form.appointment_purpose.value.trim(),
    notes: form.notes.value.trim()
  };

  const res = await api(`/api/clinics/${id}/appointment`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  triggerConfetti();
  showToast(`Appointment rescheduled for ${payload.next_appointment}! 📅`, 'event');
  closeModal('change-appointment-modal');
  loadClinics();
  loadDashboard();
}

async function deleteClinic(id) {
  if (!confirm('Are you sure you want to remove this clinic from your directory?')) return;
  const res = await api(`/api/clinics/${id}`, { method: 'DELETE' });
  showToast(res?.message || 'Clinic removed', 'delete');
  loadClinics();
  loadDashboard();
}

// -------------------------------------------------------------
// MATERNAL SOUNDSCAPE SYNTHESIZER (WEB AUDIO API)
// -------------------------------------------------------------

function toggleSoundscape(type) {
  if (state.activeSound === type) {
    stopSoundscape();
    return;
  }

  stopSoundscape();
  state.activeSound = type;
  document.querySelectorAll('.sound-chip').forEach(chip => {
    if (chip.dataset.sound === type) {
      chip.classList.add('bg-[#4a654a]', 'text-white', 'scale-105');
      chip.classList.remove('bg-[#ebefe8]', 'text-on-surface-variant');
    } else {
      chip.classList.remove('bg-[#4a654a]', 'text-white', 'scale-105');
      chip.classList.add('bg-[#ebefe8]', 'text-on-surface-variant');
    }
  });

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!state.audioCtx) state.audioCtx = new AudioCtx();
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();

    const ctx = state.audioCtx;

    if (type === 'heartbeat') {
      // Synthesize rhythmic maternal 65 BPM heartbeat pulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(1.08, ctx.currentTime); // ~65 bpm
      lfoGain.gain.setValueAtTime(0.3, ctx.currentTime);

      lfo.connect(gain.gain);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      lfo.start();
      state.soundOscillators = [osc, lfo];
      showToast('Playing Gentle Womb Heartbeat (65 BPM) 💓', 'favorite');
    } else if (type === 'ocean') {
      // Synthesize gentle ocean swells
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      state.soundOscillators = [osc];
      showToast('Playing Calming Ocean Swell 🌊', 'waves');
    }
  } catch (err) {
    console.warn('Audio synthesis note:', err);
    showToast('Soundscape active ✨', 'spa');
  }
}

function stopSoundscape() {
  state.soundOscillators.forEach(osc => {
    try { osc.stop(); osc.disconnect(); } catch (e) {}
  });
  state.soundOscillators = [];
  state.activeSound = null;
  document.querySelectorAll('.sound-chip').forEach(chip => {
    chip.classList.remove('bg-[#4a654a]', 'text-white', 'scale-105');
    chip.classList.add('bg-[#ebefe8]', 'text-on-surface-variant');
  });
}

// -------------------------------------------------------------
// USER PROFILE EDITING & PREGNANCY MONTH/WEEK CUSTOMIZER
// -------------------------------------------------------------

const babySizeMilestones = {
  1: { month: 1, week: 4, size: 'a poppy seed', trimester: 1 },
  2: { month: 2, week: 8, size: 'a raspberry', trimester: 1 },
  3: { month: 3, week: 12, size: 'a sweet lime', trimester: 1 },
  4: { month: 4, week: 16, size: 'an avocado', trimester: 2 },
  5: { month: 5, week: 20, size: 'a bell pepper', trimester: 2 },
  6: { month: 6, week: 24, size: 'an ear of corn', trimester: 2 },
  7: { month: 7, week: 28, size: 'an eggplant', trimester: 3 },
  8: { month: 8, week: 34, size: 'a butternut squash', trimester: 3 },
  9: { month: 9, week: 38, size: 'a small watermelon', trimester: 3 }
};

function openEditProfileModal() {
  const profile = state.dashboard?.profile || {
    name: 'Sarah Miller',
    pregnancy_month: 6,
    pregnancy_week: 24,
    trimester: 2,
    due_date: 'Nov 15, 2026',
    baby_comparison: 'an ear of corn',
    weight_lbs: 142,
    height: "5' 6\"",
    age: 31
  };

  const form = document.getElementById('edit-profile-form');
  if (!form) return;

  form.name.value = profile.name || '';
  form.pregnancy_month.value = profile.pregnancy_month || 6;
  form.pregnancy_week.value = profile.pregnancy_week || 24;
  form.due_date.value = profile.due_date || 'Nov 15, 2026';
  form.weight_lbs.value = profile.weight_lbs || 142;
  form.height.value = profile.height || "5' 6\"";
  form.age.value = profile.age || 31;
  form.baby_comparison.value = profile.baby_comparison || 'an ear of corn';

  updateProfilePreview(profile.pregnancy_week || 24, profile.pregnancy_month || 6);
  openModal('edit-profile-modal');
}

function handleProfileMonthChange(monthVal) {
  const m = parseInt(monthVal, 10) || 6;
  const milestone = babySizeMilestones[m] || babySizeMilestones[6];
  const form = document.getElementById('edit-profile-form');
  if (form) {
    form.pregnancy_week.value = milestone.week;
    form.baby_comparison.value = milestone.size;
  }
  updateProfilePreview(milestone.week, m);
}

function handleProfileWeekChange(weekVal) {
  const w = parseInt(weekVal, 10) || 24;
  let m = Math.min(9, Math.max(1, Math.ceil(w / 4.44)));
  if (w <= 4) m = 1;
  else if (w <= 8) m = 2;
  else if (w <= 13) m = 3;
  else if (w <= 17) m = 4;
  else if (w <= 22) m = 5;
  else if (w <= 27) m = 6;
  else if (w <= 31) m = 7;
  else if (w <= 36) m = 8;
  else m = 9;

  const milestone = babySizeMilestones[m] || babySizeMilestones[6];
  const form = document.getElementById('edit-profile-form');
  if (form) {
    form.pregnancy_month.value = m;
    form.baby_comparison.value = milestone.size;
  }
  updateProfilePreview(w, m);
}

function updateProfilePreview(week, month) {
  const weekNum = parseInt(week, 10) || 24;
  const monthNum = parseInt(month, 10) || 6;
  const trimester = weekNum <= 13 ? 1 : (weekNum <= 27 ? 2 : 3);
  const milestone = babySizeMilestones[monthNum] || babySizeMilestones[6];

  const weekDisplay = document.getElementById('edit-profile-week-display');
  const monthDisplay = document.getElementById('edit-profile-month-display');
  const trimesterDisplay = document.getElementById('edit-profile-trimester-display');
  const babyPreview = document.getElementById('edit-profile-baby-preview');

  if (weekDisplay) weekDisplay.textContent = `Week ${weekNum}`;
  if (monthDisplay) monthDisplay.textContent = `Month ${monthNum}`;
  if (trimesterDisplay) trimesterDisplay.textContent = `Trimester ${trimester}`;
  if (babyPreview) babyPreview.textContent = milestone.size;
}

async function submitEditProfile(event) {
  event.preventDefault();
  const form = event.target;

  const week = parseInt(form.pregnancy_week.value, 10) || 24;
  const month = parseInt(form.pregnancy_month.value, 10) || 6;
  const trimester = week <= 13 ? 1 : (week <= 27 ? 2 : 3);

  const payload = {
    name: form.name.value.trim() || 'Sarah Miller',
    pregnancy_month: month,
    pregnancy_week: week,
    trimester: trimester,
    due_date: form.due_date.value.trim() || 'Nov 15, 2026',
    baby_comparison: form.baby_comparison.value.trim() || 'an ear of corn',
    weight_lbs: parseFloat(form.weight_lbs.value) || 142,
    height: form.height.value.trim() || "5' 6\"",
    age: parseInt(form.age.value, 10) || 31
  };

  const res = await api('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

  triggerConfetti();
  showToast(`Profile updated to Week ${week} (Month ${month})! 🌸`, 'check_circle');
  closeModal('edit-profile-modal');

  // Reload dashboard and UI
  await loadDashboard();
}

// -------------------------------------------------------------
// AI MATERNAL HEALTH CHATBOT ("BLOOM AI DOULA")
// -------------------------------------------------------------

const chatState = {
  isOpen: false,
  isTyping: false,
  messages: [
    {
      sender: 'ai',
      text: "🌸 **Hello Sarah! I'm your Bloom AI Doula & Midwife Assistant.**\n\nI'm here to answer any questions or doubts about your pregnancy, safe foods, relieving symptoms, exercises, or contraction rules.\n\nHow can I help you today?",
      timestamp: 'Just now',
      actions: ['Is feta cheese safe?', 'How to stop leg cramps?', 'Baby size in Month 6', 'What is the 5-1-1 rule?']
    }
  ]
};

function toggleChatDrawer() {
  chatState.isOpen = !chatState.isOpen;
  const drawer = document.getElementById('ai-chat-drawer');
  const fab = document.getElementById('ai-chat-fab');
  if (!drawer) return;

  if (chatState.isOpen) {
    drawer.classList.remove('hidden');
    drawer.classList.add('flex');
    if (fab) fab.classList.add('scale-0');
    renderChatMessages();
    setTimeout(() => {
      const input = document.getElementById('chat-input-text');
      if (input) input.focus();
    }, 150);
  } else {
    drawer.classList.add('hidden');
    drawer.classList.remove('flex');
    if (fab) fab.classList.remove('scale-0');
  }
}

function renderChatMessages() {
  const list = document.getElementById('chat-messages-list');
  if (!list) return;

  list.innerHTML = chatState.messages.map(m => {
    const isUser = m.sender === 'user';
    return `
      <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-fadeIn">
        <div class="flex items-center gap-1.5 text-[10px] text-on-surface-variant px-1">
          <span class="font-bold">${isUser ? 'You' : 'Bloom AI Doula 🌸'}</span>
          <span>•</span>
          <span>${m.timestamp || 'Just now'}</span>
        </div>

        <div class="max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
          isUser 
            ? 'bg-[#4a654a] text-white rounded-tr-none shadow-xs' 
            : (m.isEmergency 
                ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/30 rounded-tl-none shadow-xs font-medium' 
                : 'bg-white text-[#181d19] border border-[#ebefe8] rounded-tl-none shadow-xs')
        }">
          <div class="whitespace-pre-line">${formatChatMarkdown(m.text)}</div>
        </div>

        ${(!isUser && m.actions && m.actions.length > 0) ? `
          <div class="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
            ${m.actions.map(act => `
              <button onclick="askSuggestedQuestion('${act.replace(/'/g, "\\'")}')" class="px-2.5 py-1 bg-[#ebefe8] hover:bg-[#ccebc8] text-[#243d25] rounded-full text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs">
                ${act}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  if (chatState.isTyping) {
    list.innerHTML += `
      <div class="flex items-center gap-2 p-3 bg-white rounded-2xl border border-[#ebefe8] w-24 text-on-surface-variant shadow-xs">
        <span class="w-2 h-2 rounded-full bg-[#4a654a] animate-bounce"></span>
        <span class="w-2 h-2 rounded-full bg-[#4a654a] animate-bounce [animation-delay:0.2s]"></span>
        <span class="w-2 h-2 rounded-full bg-[#4a654a] animate-bounce [animation-delay:0.4s]"></span>
      </div>
    `;
  }

  // Scroll to bottom
  list.scrollTop = list.scrollHeight;
}

function formatChatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input-text');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  await sendChatMessage(text);
}

function askSuggestedQuestion(text) {
  sendChatMessage(text);
}

async function sendChatMessage(text) {
  chatState.messages.push({
    sender: 'user',
    text: text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  chatState.isTyping = true;
  renderChatMessages();

  try {
    const res = await api('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: text })
    });

    chatState.isTyping = false;

    if (res && res.success) {
      chatState.messages.push({
        sender: 'ai',
        text: res.reply,
        category: res.category,
        isEmergency: res.isEmergency,
        actions: res.suggestedActions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else {
      chatState.messages.push({
        sender: 'ai',
        text: "🌸 I am here with you. Please try asking your question again or explore the guided exercises and clinics tabs!",
        timestamp: 'Just now'
      });
    }
  } catch (err) {
    chatState.isTyping = false;
    chatState.messages.push({
      sender: 'ai',
      text: "🌸 I'm having a little trouble connecting, but feel free to review your clinic directory or ask another question!",
      timestamp: 'Just now'
    });
  }

  renderChatMessages();
}

// -------------------------------------------------------------
// THEME SWITCHER (DAYLIGHT SAGE VS STARLIGHT DARK GLOW)
// -------------------------------------------------------------

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('bloom_theme', state.theme);
  applyTheme();
}

function applyTheme() {
  const root = document.documentElement;
  const icon = document.getElementById('theme-toggle-icon');
  if (state.theme === 'dark') {
    root.classList.add('dark-theme');
    if (icon) icon.textContent = 'light_mode';
  } else {
    root.classList.remove('dark-theme');
    if (icon) icon.textContent = 'dark_mode';
  }
}

// -------------------------------------------------------------
// SUPABASE CLOUD STATUS CHECKER
// -------------------------------------------------------------

async function checkCloudStatus() {
  const badgeEl = document.getElementById('cloud-status-badge');
  const detailsEl = document.getElementById('cloud-status-details');
  if (!badgeEl) return;

  const res = await api('/api/supabase/status');
  if (res && res.connected) {
    badgeEl.className = 'badge-pill bg-[#ccebc8] text-[#243d25] text-xs font-bold flex items-center gap-1';
    badgeEl.innerHTML = `<span class="material-symbols-outlined text-sm">cloud_done</span><span>Supabase Cloud Active</span>`;
    if (detailsEl) detailsEl.textContent = `Connected to ${res.url}`;
  } else {
    badgeEl.className = 'badge-pill bg-[#ebefe8] text-[#434841] text-xs font-semibold flex items-center gap-1';
    badgeEl.innerHTML = `<span class="material-symbols-outlined text-sm">database</span><span>Local SQLite Database</span>`;
    if (detailsEl) detailsEl.textContent = `Cloud Ready (add SUPABASE_URL & SUPABASE_KEY to .env)`;
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  showView('dashboard');
  loadDashboard();
  checkCloudStatus();
});
