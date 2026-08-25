// Calorie Burn & Energy Tracking Module

const CalorieModule = {
  currentSummary: null,
  cachedLogs: [],
  activityMets: {
    'Running 🏃': 9.8,
    'Brisk Walking 🚶': 3.8,
    'Cycling 🚴': 7.5,
    'Gym Strength 🏋️': 5.5,
    'Swimming 🏊': 8.0,
    'HIIT Cardio ⚡': 9.5,
    'Yoga & Stretch 🧘': 3.0,
    'Rowing 🚣': 7.0,
    'Sports & Dance ⚽': 7.0,
    'Custom Workout ✨': 6.0
  },

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Activity Logger Modal Trigger Buttons
    document.querySelectorAll('[data-open-log-activity]').forEach(btn => {
      btn.addEventListener('click', () => this.openLogModal());
    });

    // Preset activity quick buttons
    document.querySelectorAll('[data-quick-activity]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const act = e.currentTarget.getAttribute('data-quick-activity');
        this.openLogModal(act);
      });
    });

    // Activity Logger Form
    const logForm = document.getElementById('log-activity-form');
    if (logForm) {
      logForm.addEventListener('submit', (e) => this.handleLogSubmit(e));
    }

    // Modal activity & duration auto-calculation inputs
    const actSelect = document.getElementById('log-act-type');
    const durationInput = document.getElementById('log-act-duration');
    const caloriesInput = document.getElementById('log-act-calories');

    if (actSelect && durationInput && caloriesInput) {
      const updateEstimate = () => {
        const selectedAct = actSelect.value;
        const mins = parseFloat(durationInput.value) || 0;
        const weight = (window.App && window.App.currentUser && window.App.currentUser.weight) ? window.App.currentUser.weight : 70;
        const met = this.activityMets[selectedAct] || 6.0;
        // Standard Calories Burned = (MET * 3.5 * weightKg / 200) * mins
        const estBurn = Math.round((met * 3.5 * weight / 200) * mins);
        if (estBurn > 0) {
          caloriesInput.value = estBurn;
        }
      };

      actSelect.addEventListener('change', updateEstimate);
      durationInput.addEventListener('input', updateEstimate);
    }

    // Chart toggle in History view (BMI vs Calorie Burn)
    const toggleBmiBtn = document.getElementById('btn-trend-tab-bmi');
    const toggleCalBtn = document.getElementById('btn-trend-tab-calories');

    if (toggleBmiBtn && toggleCalBtn) {
      toggleBmiBtn.addEventListener('click', () => {
        toggleBmiBtn.classList.add('active');
        toggleCalBtn.classList.remove('active');
        document.getElementById('trend-bmi-wrapper').style.display = 'block';
        document.getElementById('trend-cal-wrapper').style.display = 'none';
        if (window.BMIModule && window.BMIModule.cachedLogs) {
          window.BMIModule.renderTrendChart(window.BMIModule.cachedLogs);
        }
      });

      toggleCalBtn.addEventListener('click', () => {
        toggleCalBtn.classList.add('active');
        toggleBmiBtn.classList.remove('active');
        document.getElementById('trend-bmi-wrapper').style.display = 'none';
        document.getElementById('trend-cal-wrapper').style.display = 'block';
        this.renderCalorieChart(this.cachedLogs);
      });
    }
  },

  openLogModal(presetActivity = null) {
    if (!API.getToken()) {
      showToast('Please log in to track your burned calories.', 'info');
      window.dispatchEvent(new CustomEvent('open-modal', { detail: { modalId: 'login-modal' } }));
      return;
    }

    const modal = document.getElementById('log-activity-modal');
    if (!modal) return;

    const actSelect = document.getElementById('log-act-type');
    const durationInput = document.getElementById('log-act-duration');
    const caloriesInput = document.getElementById('log-act-calories');
    const notesInput = document.getElementById('log-act-notes');

    if (actSelect && presetActivity) {
      // Find matching option
      for (let opt of actSelect.options) {
        if (opt.value.includes(presetActivity) || opt.text.includes(presetActivity)) {
          actSelect.value = opt.value;
          break;
        }
      }
    }

    if (durationInput && !durationInput.value) durationInput.value = '30';
    if (notesInput) notesInput.value = '';

    // Trigger calculation
    if (actSelect && durationInput && caloriesInput) {
      const selectedAct = actSelect.value;
      const mins = parseFloat(durationInput.value) || 30;
      const weight = (window.App && window.App.currentUser && window.App.currentUser.weight) ? window.App.currentUser.weight : 70;
      const met = this.activityMets[selectedAct] || 6.0;
      caloriesInput.value = Math.round((met * 3.5 * weight / 200) * mins);
    }

    window.dispatchEvent(new CustomEvent('open-modal', { detail: { modalId: 'log-activity-modal' } }));
  },

  async handleLogSubmit(e) {
    e.preventDefault();
    const actSelect = document.getElementById('log-act-type');
    const durationInput = document.getElementById('log-act-duration');
    const caloriesInput = document.getElementById('log-act-calories');
    const notesInput = document.getElementById('log-act-notes');

    const activity = actSelect.value;
    const duration_mins = parseInt(durationInput.value, 10);
    const calories_burned = parseInt(caloriesInput.value, 10);
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!activity || isNaN(duration_mins) || isNaN(calories_burned)) {
      showToast('Please fill all required activity details.', 'error');
      return;
    }

    try {
      const res = await API.logCalories({
        activity,
        duration_mins,
        calories_burned,
        notes
      });

      if (res.success) {
        showToast(res.message, 'success');
        window.dispatchEvent(new CustomEvent('close-modal', { detail: { modalId: 'log-activity-modal' } }));
        if (notesInput) notesInput.value = '';
        this.loadSummaryAndLogs();
        if (window.NotificationModule) {
          NotificationModule.fetchNotifications();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to log workout calories.', 'error');
    }
  },

  async loadSummaryAndLogs() {
    if (!API.getToken()) return;

    try {
      const [summaryRes, logsRes] = await Promise.all([
        API.getCalorieSummary(),
        API.getCalorieLogs()
      ]);

      if (summaryRes.success && summaryRes.data) {
        this.currentSummary = summaryRes.data;
        this.renderDashboardStats(summaryRes.data);
      }

      if (logsRes.success && logsRes.logs) {
        this.cachedLogs = logsRes.logs;
        this.renderRecentActivities(logsRes.logs);
        this.renderActivityTable(logsRes.logs);
        const calChartWrapper = document.getElementById('trend-cal-wrapper');
        if (calChartWrapper && calChartWrapper.style.display !== 'none') {
          this.renderCalorieChart(logsRes.logs);
        }
      }
    } catch (err) {
      console.error('Error loading calorie data:', err);
    }
  },

  renderDashboardStats(data) {
    // 1. Today's Burnt Calories KPI
    const statTodayBurnt = document.getElementById('stat-today-burnt');
    const statTodayTarget = document.getElementById('stat-today-target');
    const statBurnProgress = document.getElementById('stat-burn-progress-bar');
    const statBurnPercent = document.getElementById('stat-burn-progress-percent');
    const statRemainingToday = document.getElementById('stat-remaining-today-burn');

    if (statTodayBurnt) statTodayBurnt.textContent = `${data.today_burnt} kcal`;
    if (statTodayTarget) statTodayTarget.textContent = `${data.daily_target_burn} kcal`;
    if (statBurnProgress) statBurnProgress.style.width = `${Math.min(100, data.progress_percent)}%`;
    if (statBurnPercent) statBurnPercent.textContent = `${data.progress_percent}%`;
    if (statRemainingToday) {
      if (data.remaining_today_to_burn > 0) {
        statRemainingToday.innerHTML = `<span style="color:var(--accent-amber);">${data.remaining_today_to_burn} kcal</span> remaining to hit daily goal`;
      } else {
        statRemainingToday.innerHTML = `<span style="color:var(--accent-emerald); font-weight:700;">🎉 Daily Goal Achieved!</span> (+${data.today_burnt - data.daily_target_burn} kcal bonus)`;
      }
    }

    // 2. Total Burnt Calories Till Now KPI
    const statTotalBurnt = document.getElementById('stat-total-burnt-till-now');
    const statWeeklyBurnt = document.getElementById('stat-weekly-burnt');
    if (statTotalBurnt) statTotalBurnt.textContent = `${data.total_burnt_till_now.toLocaleString()} kcal`;
    if (statWeeklyBurnt) statWeeklyBurnt.textContent = `${data.week_burnt.toLocaleString()} kcal this week (${data.logs_count} sessions)`;

    // 3. Calories to Burn (Goal / Targets)
    const statDailyGoal = document.getElementById('stat-daily-burn-goal');
    const statTotalGoalBurn = document.getElementById('stat-total-calories-to-burn');
    const statGoalTypeBadge = document.getElementById('stat-goal-type-badge');

    if (statDailyGoal) statDailyGoal.textContent = `${data.daily_target_burn} kcal/day`;
    if (statTotalGoalBurn) {
      if (data.total_calories_to_burn_for_goal > 0) {
        statTotalGoalBurn.textContent = `${data.total_calories_to_burn_for_goal.toLocaleString()} kcal`;
      } else {
        statTotalGoalBurn.textContent = 'Ideal Range Reached ✨';
      }
    }
    if (statGoalTypeBadge) {
      if (data.goal_type === 'weight_loss') {
        statGoalTypeBadge.className = 'badge badge-overweight';
        statGoalTypeBadge.textContent = `Target Deficit (-${data.weight_delta_kg} kg)`;
      } else if (data.goal_type === 'weight_gain') {
        statGoalTypeBadge.className = 'badge badge-underweight';
        statGoalTypeBadge.textContent = `Target Gain (+${data.weight_delta_kg} kg)`;
      } else {
        statGoalTypeBadge.className = 'badge badge-normal';
        statGoalTypeBadge.textContent = 'Active Maintenance';
      }
    }

    // 4. Energy Expenditure Breakdown Card
    const dashBmr = document.getElementById('dash-bmr-value');
    const dashTdee = document.getElementById('dash-tdee-value');
    const dashTargetBurn = document.getElementById('dash-target-burn-value');

    if (dashBmr) dashBmr.textContent = `${data.bmr} kcal`;
    if (dashTdee) dashTdee.textContent = `${data.tdee} kcal`;
    if (dashTargetBurn) dashTargetBurn.textContent = `${data.daily_target_burn} kcal`;

    // 5. Draw Dynamic Dashboard Burn Progress Ring
    this.drawDashboardBurnRing(data.today_burnt, data.daily_target_burn);
  },

  drawDashboardBurnRing(todayBurnt, dailyTarget) {
    const canvas = document.getElementById('dash-burn-ring-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = canvas.width = canvas.height = 160;
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 62;
    const lineWidth = 12;

    // Background track ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Progress arc
    const pct = Math.min(1.0, Math.max(0, todayBurnt / (dailyTarget || 1)));
    const startAngle = -0.5 * Math.PI;
    const endAngle = startAngle + pct * 2 * Math.PI;

    if (pct > 0) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#f97316'); // Orange
      grad.addColorStop(1, '#ef4444'); // Crimson Red

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = grad;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(249, 115, 22, 0.4)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  },

  renderRecentActivities(logs) {
    const container = document.getElementById('dash-recent-activities-list');
    if (!container) return;

    if (!logs || logs.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.85rem;">
          No workout sessions logged yet today. Click "🔥 Log Burnt Calories" to record your fitness activities!
        </div>
      `;
      return;
    }

    const recent = logs.slice(0, 5);
    container.innerHTML = recent.map(log => {
      const d = new Date(log.created_at);
      const timeStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' +
                      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="activity-feed-item">
          <div class="activity-icon-bubble">🔥</div>
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.2rem;">
              <strong style="font-size:0.92rem; color:var(--text-primary);">${log.activity}</strong>
              <span class="calorie-burn-pill">+${log.calories_burned} kcal</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--text-muted);">
              <span>⏱️ ${log.duration_mins} mins ${log.notes ? `• ${log.notes}` : ''}</span>
              <span>${timeStr}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderActivityTable(logs) {
    const tbody = document.getElementById('calorie-history-tbody');
    if (!tbody) return;

    if (!logs || logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">
            No burned calorie activities recorded yet. Click "Log Burnt Calories" to add your workouts!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = logs.map(log => {
      const d = new Date(log.created_at);
      const dateStr = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <tr>
          <td><strong>${dateStr}</strong></td>
          <td><span style="font-weight:600; color:var(--text-primary);">${log.activity}</span></td>
          <td>${log.duration_mins} mins</td>
          <td><span class="calorie-burn-pill" style="font-size:0.85rem;">🔥 ${log.calories_burned} kcal</span></td>
          <td style="color:var(--text-secondary); font-size:0.85rem;">${log.notes || '—'}</td>
          <td style="text-align:right;">
            <button class="btn btn-sm btn-danger" onclick="CalorieModule.deleteLog('${log.id}')" title="Delete log">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async deleteLog(id) {
    if (!confirm('Are you sure you want to delete this activity record?')) return;
    try {
      const res = await API.deleteCalorieLog(id);
      if (res.success) {
        showToast(res.message, 'info');
        this.loadSummaryAndLogs();
      }
    } catch (err) {
      showToast(err.message || 'Error deleting log.', 'error');
    }
  },

  renderCalorieChart(logs) {
    const canvas = document.getElementById('calorie-trend-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 600;
    const height = canvas.height = 280;
    ctx.clearRect(0, 0, width, height);

    if (!logs || logs.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Log at least 2 activity sessions to plot your daily calorie burn curve.', width / 2, height / 2);
      return;
    }

    // Group logs by day (chronological)
    const dayMap = {};
    [...logs].reverse().forEach(log => {
      const d = new Date(log.created_at);
      const dayKey = `${d.getMonth() + 1}/${d.getDate()}`;
      dayMap[dayKey] = (dayMap[dayKey] || 0) + log.calories_burned;
    });

    const dayKeys = Object.keys(dayMap);
    const calValues = Object.values(dayMap);

    const padding = { top: 30, right: 30, bottom: 40, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const targetBurn = (this.currentSummary && this.currentSummary.daily_target_burn) ? this.currentSummary.daily_target_burn : 500;
    const maxBurn = Math.max(targetBurn * 1.3, Math.max(...calValues) + 100);

    // Target burn dashed line
    const targetY = padding.top + chartH - (targetBurn / maxBurn) * chartH;
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.45)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, targetY);
    ctx.lineTo(padding.left + chartW, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f97316';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Target: ${targetBurn} kcal`, padding.left + chartW, targetY - 6);

    // Grid lines
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    for (let v = 0; v <= maxBurn; v += Math.round(maxBurn / 4)) {
      const y = padding.top + chartH - (v / maxBurn) * chartH;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(`${v}`, padding.left - 8, y + 4);
    }

    // Points
    const points = dayKeys.map((day, idx) => {
      const x = padding.left + (idx / Math.max(1, dayKeys.length - 1)) * chartW;
      const y = padding.top + chartH - (dayMap[day] / maxBurn) * chartH;
      return { x, y, day, val: dayMap[day] };
    });

    // Gradient fill under curve
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, 'rgba(249, 115, 22, 0.35)');
    grad.addColorStop(1, 'rgba(249, 115, 22, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.lineTo(points[0].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Curve line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Point dots
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Date label
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(p.day, p.x, height - padding.bottom + 20);

      // Value label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillText(`${p.val} kcal`, p.x, p.y - 10);
    });
  }
};

window.CalorieModule = CalorieModule;
