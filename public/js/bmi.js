// BMI Calculator & Health Analytics Module

const BMIModule = {
  currentUnit: 'metric', // 'metric' or 'imperial'
  currentData: null,
  cachedLogs: [],

  init() {
    this.bindEvents();
    this.initGauge();
  },

  bindEvents() {
    // Unit switchers
    const metricBtn = document.getElementById('unit-metric-btn');
    const imperialBtn = document.getElementById('unit-imperial-btn');

    if (metricBtn && imperialBtn) {
      metricBtn.addEventListener('click', () => this.setUnit('metric'));
      imperialBtn.addEventListener('click', () => this.setUnit('imperial'));
    }

    // Sliders & inputs
    const heightRange = document.getElementById('bmi-height-range');
    const heightInput = document.getElementById('bmi-height-input');
    const weightRange = document.getElementById('bmi-weight-range');
    const weightInput = document.getElementById('bmi-weight-input');

    if (heightRange && heightInput) {
      heightRange.addEventListener('input', (e) => {
        heightInput.value = e.target.value;
        this.recalculate();
      });
      heightInput.addEventListener('input', (e) => {
        heightRange.value = e.target.value;
        this.recalculate();
      });
    }

    if (weightRange && weightInput) {
      weightRange.addEventListener('input', (e) => {
        weightInput.value = e.target.value;
        this.recalculate();
      });
      weightInput.addEventListener('input', (e) => {
        weightRange.value = e.target.value;
        this.recalculate();
      });
    }

    // Save Log button
    const saveBtn = document.getElementById('bmi-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveCurrentBmi());
    }

    // Quick filter / refresh for history
    const refreshHistoryBtn = document.getElementById('refresh-history-btn');
    if (refreshHistoryBtn) {
      refreshHistoryBtn.addEventListener('click', () => this.loadHistory());
    }
  },

  setUnit(unit) {
    if (this.currentUnit === unit) return;
    this.currentUnit = unit;

    const metricBtn = document.getElementById('unit-metric-btn');
    const imperialBtn = document.getElementById('unit-imperial-btn');
    const heightUnitLabel = document.getElementById('bmi-height-unit-label');
    const weightUnitLabel = document.getElementById('bmi-weight-unit-label');
    const heightRange = document.getElementById('bmi-height-range');
    const heightInput = document.getElementById('bmi-height-input');
    const weightRange = document.getElementById('bmi-weight-range');
    const weightInput = document.getElementById('bmi-weight-input');

    if (unit === 'metric') {
      metricBtn.classList.add('active');
      imperialBtn.classList.remove('active');
      heightUnitLabel.textContent = 'cm';
      weightUnitLabel.textContent = 'kg';

      // Convert from imperial to metric
      const curH = parseFloat(heightInput.value) || 68;
      const curW = parseFloat(weightInput.value) || 155;

      const newH = Math.round(curH * 2.54);
      const newW = Math.round(curW * 0.45359237);

      heightRange.min = 100;
      heightRange.max = 230;
      heightRange.value = newH;
      heightInput.value = newH;

      weightRange.min = 30;
      weightRange.max = 180;
      weightRange.value = newW;
      weightInput.value = newW;
    } else {
      imperialBtn.classList.add('active');
      metricBtn.classList.remove('active');
      heightUnitLabel.textContent = 'in';
      weightUnitLabel.textContent = 'lbs';

      // Convert from metric to imperial
      const curH = parseFloat(heightInput.value) || 175;
      const curW = parseFloat(weightInput.value) || 70;

      const newH = Math.round(curH / 2.54);
      const newW = Math.round(curW / 0.45359237);

      heightRange.min = 40;
      heightRange.max = 90;
      heightRange.value = newH;
      heightInput.value = newH;

      weightRange.min = 60;
      weightRange.max = 400;
      weightRange.value = newW;
      weightInput.value = newW;
    }

    this.recalculate();
  },

  prefillFromUser(user) {
    if (!user) return;
    const heightInput = document.getElementById('bmi-height-input');
    const heightRange = document.getElementById('bmi-height-range');
    const weightInput = document.getElementById('bmi-weight-input');
    const weightRange = document.getElementById('bmi-weight-range');

    if (user.height && heightInput && heightRange) {
      const h = this.currentUnit === 'metric' ? user.height : Math.round(user.height / 2.54);
      heightInput.value = h;
      heightRange.value = h;
    }

    if (user.weight && weightInput && weightRange) {
      const w = this.currentUnit === 'metric' ? user.weight : Math.round(user.weight / 0.45359237);
      weightInput.value = w;
      weightRange.value = w;
    }

    this.recalculate();
  },

  async recalculate() {
    const height = parseFloat(document.getElementById('bmi-height-input').value);
    const weight = parseFloat(document.getElementById('bmi-weight-input').value);

    if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) return;

    try {
      const res = await API.calculateBmi(height, weight, this.currentUnit);
      if (res.success && res.data) {
        this.currentData = res.data;
        this.renderResult(res.data);
      }
    } catch (err) {
      // Local fallback calculation if offline
      let heightCm = this.currentUnit === 'imperial' ? height * 2.54 : height;
      let weightKg = this.currentUnit === 'imperial' ? weight * 0.45359237 : weight;
      const hM = heightCm / 100;
      const bmi = Number((weightKg / (hM * hM)).toFixed(1));
      let category = 'Normal';
      let badgeClass = 'badge-normal';
      if (bmi < 18.5) { category = 'Underweight'; badgeClass = 'badge-underweight'; }
      else if (bmi < 25) { category = 'Normal'; badgeClass = 'badge-normal'; }
      else if (bmi < 30) { category = 'Overweight'; badgeClass = 'badge-overweight'; }
      else { category = 'Obese'; badgeClass = 'badge-obese'; }

      this.renderResult({
        bmi,
        category,
        categoryDetail: category,
        badgeClass,
        summary: `Your calculated BMI is ${bmi}.`,
        targetAction: 'Maintain balanced lifestyle',
        idealWeightRange: { min: (18.5 * hM * hM).toFixed(1), max: (24.9 * hM * hM).toFixed(1), unit: 'kg' },
        recommendations: [
          'Stay hydrated with 2-3L of water daily.',
          'Engage in 30 mins of moderate physical activity.',
          'Prioritize balanced nutrition with fresh whole foods.'
        ]
      });
    }
  },

  renderResult(data) {
    const bmiNumberEl = document.getElementById('gauge-bmi-value');
    const categoryBadgeEl = document.getElementById('bmi-category-badge');
    const summaryTextEl = document.getElementById('bmi-summary-text');
    const targetActionEl = document.getElementById('bmi-target-action');
    const idealSpanEl = document.getElementById('bmi-ideal-span');
    const recsListEl = document.getElementById('bmi-recommendations-list');

    if (bmiNumberEl) bmiNumberEl.textContent = data.bmi;

    if (categoryBadgeEl) {
      categoryBadgeEl.className = `badge ${data.badgeClass || 'badge-normal'}`;
      categoryBadgeEl.textContent = data.category;
    }

    if (summaryTextEl) summaryTextEl.textContent = data.summary;
    if (targetActionEl) targetActionEl.textContent = data.targetAction || 'Healthy Range';

    if (idealSpanEl && data.idealWeightRange) {
      idealSpanEl.textContent = `${data.idealWeightRange.min} - ${data.idealWeightRange.max} ${data.idealWeightRange.unit}`;
    }

    if (recsListEl && data.recommendations) {
      recsListEl.innerHTML = data.recommendations.map(r => `<li>${r}</li>`).join('');
    }

    this.drawGauge(data.bmi);
  },

  initGauge() {
    this.drawGauge(22.5);
  },

  drawGauge(bmiValue) {
    const canvas = document.getElementById('bmi-gauge-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 280;
    const height = canvas.height = 160;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height - 20;
    const radius = 100;
    const lineWidth = 18;

    // Slices for BMI: Underweight (15-18.5), Normal (18.5-25), Overweight (25-30), Obese (30-40)
    // Angles from Math.PI to 2*Math.PI (half circle)
    const minBmi = 14;
    const maxBmi = 38;

    function getAngle(val) {
      const clamped = Math.max(minBmi, Math.min(maxBmi, val));
      const pct = (clamped - minBmi) / (maxBmi - minBmi);
      return Math.PI + pct * Math.PI;
    }

    const segments = [
      { start: 14, end: 18.5, color: '#3b82f6' },  // Blue
      { start: 18.5, end: 25.0, color: '#10b981' }, // Emerald
      { start: 25.0, end: 30.0, color: '#f59e0b' }, // Amber
      { start: 30.0, end: 38.0, color: '#ef4444' }  // Red
    ];

    // Background track arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Colored segments
    segments.forEach(seg => {
      const a1 = getAngle(seg.start);
      const a2 = getAngle(seg.end);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, a1, a2, false);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = seg.color;
      ctx.stroke();
    });

    // Draw pointer needle / marker
    const needleAngle = getAngle(bmiValue);
    const needleRadius = radius - 6;
    const targetX = centerX + Math.cos(needleAngle) * needleRadius;
    const targetY = centerY + Math.sin(needleAngle) * needleRadius;

    // Pointer line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(targetX, targetY);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center pivot point
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#0ea5e9';
    ctx.fill();
  },

  async saveCurrentBmi() {
    if (!API.getToken()) {
      showToast('Please log in to save your BMI to health history.', 'info');
      window.dispatchEvent(new CustomEvent('open-modal', { detail: { modalId: 'login-modal' } }));
      return;
    }

    const height = parseFloat(document.getElementById('bmi-height-input').value);
    const weight = parseFloat(document.getElementById('bmi-weight-input').value);
    const notes = document.getElementById('bmi-notes-input') ? document.getElementById('bmi-notes-input').value : '';

    let heightCm = this.currentUnit === 'imperial' ? height * 2.54 : height;
    let weightKg = this.currentUnit === 'imperial' ? weight * 0.45359237 : weight;

    try {
      const res = await API.saveBmi(heightCm, weightKg, notes, true);
      if (res.success) {
        showToast('Fitness record saved to your health history!', 'success');
        if (document.getElementById('bmi-notes-input')) {
          document.getElementById('bmi-notes-input').value = '';
        }
        this.loadHistory();
      }
    } catch (err) {
      showToast(err.message || 'Failed to save BMI record.', 'error');
    }
  },

  async loadHistory() {
    if (!API.getToken()) return;

    try {
      const res = await API.getBmiHistory();
      if (res.success) {
        this.cachedLogs = res.logs || [];
        this.renderHistoryTable(res.logs || []);
        this.renderTrendChart(res.logs || []);
        this.renderStats(res.stats || {});
      }
    } catch (err) {
      console.error('History load error:', err);
    }
  },

  renderStats(stats) {
    const statLatestBmi = document.getElementById('stat-latest-bmi');
    const statTotalLogs = document.getElementById('stat-total-logs');
    const statWeightChange = document.getElementById('stat-weight-change');
    const statCategory = document.getElementById('stat-current-category');

    if (statLatestBmi && stats.latest_bmi !== null) {
      statLatestBmi.textContent = stats.latest_bmi;
    }
    if (statTotalLogs) {
      statTotalLogs.textContent = stats.total_records || 0;
    }
    if (statCategory && stats.latest_category) {
      statCategory.textContent = stats.latest_category;
    }
    if (statWeightChange && stats.weight_change !== null) {
      const prefix = stats.weight_change > 0 ? '+' : '';
      statWeightChange.textContent = `${prefix}${stats.weight_change} kg`;
      statWeightChange.style.color = stats.weight_change <= 0 ? 'var(--accent-emerald)' : 'var(--accent-amber)';
    }
  },

  renderHistoryTable(logs) {
    const tbody = document.getElementById('bmi-history-tbody');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">
            No health check records logged yet. Calculate your BMI above and click "Save Record"!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = logs.map(log => {
      const dateStr = new Date(log.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      let badgeClass = 'badge-normal';
      if (log.category === 'Underweight') badgeClass = 'badge-underweight';
      else if (log.category === 'Overweight') badgeClass = 'badge-overweight';
      else if (log.category === 'Obese') badgeClass = 'badge-obese';

      return `
        <tr>
          <td><strong>${dateStr}</strong></td>
          <td>${log.height} cm</td>
          <td>${log.weight} kg</td>
          <td><strong>${log.bmi_value}</strong></td>
          <td><span class="badge ${badgeClass}">${log.category}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-sm btn-danger" onclick="BMIModule.deleteLog('${log.id}')" title="Delete entry">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async deleteLog(id) {
    if (!confirm('Are you sure you want to delete this fitness record?')) return;
    try {
      const res = await API.deleteBmiLog(id);
      if (res.success) {
        showToast('Record deleted.', 'info');
        this.loadHistory();
      }
    } catch (err) {
      showToast(err.message || 'Error deleting log.', 'error');
    }
  },

  renderTrendChart(logs) {
    const canvas = document.getElementById('bmi-trend-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 600;
    const height = canvas.height = 280;

    ctx.clearRect(0, 0, width, height);

    if (!logs || logs.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Log at least 2 BMI checkups to view your dynamic fitness progression curve.', width / 2, height / 2);
      return;
    }

    // Chronological order (oldest to newest)
    const chronological = [...logs].reverse();

    const padding = { top: 30, right: 30, bottom: 40, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const bmiValues = chronological.map(l => l.bmi_value);
    const minVal = Math.max(14, Math.floor(Math.min(...bmiValues) - 2));
    const maxVal = Math.min(40, Math.ceil(Math.max(...bmiValues) + 2));

    // Draw Normal Healthy Zone Band (18.5 - 24.9)
    const healthyY1 = padding.top + chartH - ((24.9 - minVal) / (maxVal - minVal)) * chartH;
    const healthyY2 = padding.top + chartH - ((18.5 - minVal) / (maxVal - minVal)) * chartH;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fillRect(padding.left, healthyY1, chartW, healthyY2 - healthyY1);

    // Normal zone dashed line
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, healthyY1);
    ctx.lineTo(padding.left + chartW, healthyY1);
    ctx.moveTo(padding.left, healthyY2);
    ctx.lineTo(padding.left + chartW, healthyY2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Grid lines & labels
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';

    for (let v = minVal; v <= maxVal; v += 2) {
      const y = padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(v.toFixed(0), padding.left - 10, y + 4);
    }

    // Points
    const points = chronological.map((log, idx) => {
      const x = padding.left + (idx / (chronological.length - 1)) * chartW;
      const y = padding.top + chartH - ((log.bmi_value - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, log };
    });

    // Gradient fill under trend curve
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
    grad.addColorStop(1, 'rgba(14, 165, 233, 0.0)');

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

    // Trend Stroke line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Data points dots
    points.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#0ea5e9';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Date label on bottom
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      const d = new Date(p.log.created_at);
      ctx.fillText(`${d.getMonth() + 1}/${d.getDate()}`, p.x, height - padding.bottom + 20);

      // BMI value above point
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillText(p.log.bmi_value, p.x, p.y - 10);
    });
  }
};

window.BMIModule = BMIModule;
