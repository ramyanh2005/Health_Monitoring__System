// Admin Portal Management Module

const AdminModule = {
  users: [],
  overviewStats: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // User search & filters
    const searchInput = document.getElementById('admin-user-search');
    const statusFilter = document.getElementById('admin-status-filter');
    const roleFilter = document.getElementById('admin-role-filter');

    if (searchInput) {
      searchInput.addEventListener('input', () => this.debounceSearch());
    }
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.loadUsers());
    }
    if (roleFilter) {
      roleFilter.addEventListener('change', () => this.loadUsers());
    }

    // Refresh button
    const refreshBtn = document.getElementById('admin-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadOverview();
        this.loadUsers();
        this.loadAuditLogs();
        showToast('Admin data refreshed.', 'info');
      });
    }

    // Broadcast form
    const broadcastForm = document.getElementById('admin-broadcast-form');
    if (broadcastForm) {
      broadcastForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendBroadcast();
      });
    }

    // Export Users Data button
    const exportBtn = document.getElementById('admin-export-users-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportUsersData());
    }
  },

  searchTimer: null,
  debounceSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadUsers(), 300);
  },

  async loadAll() {
    await Promise.all([
      this.loadOverview(),
      this.loadUsers(),
      this.loadAuditLogs()
    ]);
  },

  async loadOverview() {
    try {
      const res = await API.getAdminOverview();
      if (res.success && res.stats) {
        this.overviewStats = res.stats;
        this.renderOverviewStats(res.stats);
        this.drawBmiDistributionChart(res.stats.categoryCounts);
      }
    } catch (err) {
      console.error('Admin overview load error:', err);
    }
  },

  renderOverviewStats(stats) {
    const totalUsersEl = document.getElementById('admin-stat-total-users');
    const activeUsersEl = document.getElementById('admin-stat-active-users');
    const totalRecordsEl = document.getElementById('admin-stat-total-records');
    const suspendedUsersEl = document.getElementById('admin-stat-suspended-users');

    if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers || 0;
    if (activeUsersEl) activeUsersEl.textContent = stats.activeUsers || 0;
    if (totalRecordsEl) totalRecordsEl.textContent = stats.totalBmiRecords || 0;
    if (suspendedUsersEl) suspendedUsersEl.textContent = stats.suspendedUsers || 0;
  },

  drawBmiDistributionChart(counts) {
    const canvas = document.getElementById('admin-bmi-pie-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 300;
    const height = canvas.height = 200;

    ctx.clearRect(0, 0, width, height);

    if (!counts) return;

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    const categories = [
      { label: 'Normal', count: counts.Normal || 0, color: '#10b981' },
      { label: 'Overweight', count: counts.Overweight || 0, color: '#f59e0b' },
      { label: 'Underweight', count: counts.Underweight || 0, color: '#3b82f6' },
      { label: 'Obese', count: counts.Obese || 0, color: '#ef4444' }
    ];

    if (total === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No health records to categorize yet', width / 2, height / 2);
      return;
    }

    const centerX = 90;
    const centerY = height / 2;
    const outerRadius = 75;
    const innerRadius = 45;

    let startAngle = -Math.PI / 2;

    categories.forEach(cat => {
      if (cat.count === 0) return;
      const sliceAngle = (cat.count / total) * 2 * Math.PI;

      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = cat.color;
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Center total text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(total, centerX, centerY + 2);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Users', centerX, centerY + 16);

    // Legend on the right side
    let legendY = 40;
    const legendX = 180;

    categories.forEach(cat => {
      const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;

      // Color Dot
      ctx.beginPath();
      ctx.arc(legendX, legendY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = cat.color;
      ctx.fill();

      // Text
      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${cat.label} (${cat.count})`, legendX + 12, legendY + 4);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${pct}%`, width - 10, legendY + 4);

      legendY += 32;
    });
  },

  async loadUsers() {
    const search = document.getElementById('admin-user-search')?.value || '';
    const status = document.getElementById('admin-status-filter')?.value || 'all';
    const role = document.getElementById('admin-role-filter')?.value || 'all';

    try {
      const res = await API.getAdminUsers({ search, status, role });
      if (res.success) {
        this.users = res.users || [];
        this.renderUsersTable(res.users || []);
      }
    } catch (err) {
      console.error('Error loading admin users:', err);
    }
  },

  renderUsersTable(users) {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">
            No user accounts found matching the current search / filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = users.map(user => {
      const registeredDate = new Date(user.created_at).toLocaleDateString();
      const isSelf = API.getUser() && API.getUser().id === user.id;

      let bmiBadge = '<span style="color:var(--text-muted);">No records</span>';
      if (user.latest_bmi) {
        let catClass = 'badge-normal';
        if (user.latest_category === 'Underweight') catClass = 'badge-underweight';
        else if (user.latest_category === 'Overweight') catClass = 'badge-overweight';
        else if (user.latest_category === 'Obese') catClass = 'badge-obese';
        bmiBadge = `<span class="badge ${catClass}">${user.latest_bmi} (${user.latest_category})</span>`;
      }

      const statusBadge = user.status === 'active'
        ? '<span style="color:var(--accent-emerald); font-weight:600;">● Active</span>'
        : user.status === 'suspended'
        ? '<span style="color:var(--accent-amber); font-weight:600;">● Suspended</span>'
        : '<span style="color:var(--accent-rose); font-weight:600;">● Banned</span>';

      return `
        <tr>
          <td>
            <div style="font-weight:600; color:var(--text-primary);">${user.full_name}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">@${user.username}</div>
          </td>
          <td>
            <div>${user.email}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">${user.phone}</div>
          </td>
          <td>
            <span class="user-role-badge" style="background:${user.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'var(--primary-glow)'}; color:${user.role === 'admin' ? 'var(--accent-violet)' : 'var(--primary)'};">
              ${user.role}
            </span>
          </td>
          <td>${bmiBadge}</td>
          <td>${statusBadge}</td>
          <td style="font-size:0.82rem; color:var(--text-muted);">${registeredDate}</td>
          <td style="text-align:right;">
            <div style="display:inline-flex; gap:0.4rem;">
              ${!isSelf ? `
                <select class="form-select" style="padding:0.25rem 0.5rem; font-size:0.78rem; width:auto;" onchange="AdminModule.changeUserStatus('${user.id}', this.value)">
                  <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                  <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspend</option>
                  <option value="banned" ${user.status === 'banned' ? 'selected' : ''}>Ban</option>
                </select>
                <button class="btn btn-sm btn-danger" onclick="AdminModule.deleteUserAccount('${user.id}', '${user.full_name}')" title="Delete User">
                  🗑️
                </button>
              ` : '<span style="font-size:0.78rem; color:var(--primary); font-weight:600;">(Current Admin)</span>'}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async changeUserStatus(userId, status) {
    try {
      const res = await API.updateAdminUserStatus(userId, status);
      if (res.success) {
        showToast(res.message, 'success');
        this.loadOverview();
        this.loadUsers();
      }
    } catch (err) {
      showToast(err.message || 'Error updating status.', 'error');
      this.loadUsers();
    }
  },

  async deleteUserAccount(userId, name) {
    if (!confirm(`Are you sure you want to permanently delete user "${name}" and all their fitness logs? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await API.deleteAdminUser(userId);
      if (res.success) {
        showToast(res.message, 'info');
        this.loadOverview();
        this.loadUsers();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete user.', 'error');
    }
  },

  async sendBroadcast() {
    const titleInput = document.getElementById('broadcast-title-input');
    const msgInput = document.getElementById('broadcast-msg-input');
    const targetSelect = document.getElementById('broadcast-target-select');

    if (!titleInput || !msgInput) return;

    const title = titleInput.value.trim();
    const message = msgInput.value.trim();
    const target = targetSelect ? targetSelect.value : 'all';

    if (!title || !message) {
      showToast('Please provide both title and message.', 'error');
      return;
    }

    try {
      const res = await API.sendAdminBroadcast({ title, message, target });
      if (res.success) {
        showToast(res.message, 'success');
        titleInput.value = '';
        msgInput.value = '';
        this.loadAuditLogs();
      }
    } catch (err) {
      showToast(err.message || 'Failed to dispatch broadcast.', 'error');
    }
  },

  async loadAuditLogs() {
    const container = document.getElementById('admin-audit-logs-container');
    if (!container) return;

    try {
      const res = await API.getAdminAuditLogs();
      if (res.success && res.logs) {
        if (res.logs.length === 0) {
          container.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; padding:1rem;">No recent audit events.</div>`;
          return;
        }

        container.innerHTML = res.logs.slice(0, 15).map(log => {
          const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px solid var(--border-color); font-size:0.82rem;">
              <div>
                <span style="font-weight:700; color:var(--primary);">${log.action}</span>
                <span style="color:var(--text-secondary); margin-left:0.5rem;">${log.details}</span>
              </div>
              <div style="color:var(--text-muted); font-family:monospace; font-size:0.75rem; white-space:nowrap; margin-left:1rem;">
                ${time}
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (err) {
      console.error('Audit logs error:', err);
    }
  },

  async exportUsersData() {
    try {
      const token = API.getToken();
      const response = await fetch('/api/admin/export-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health_users_registry_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('User registry exported successfully!', 'success');
    } catch (err) {
      showToast('Export failed.', 'error');
    }
  }
};

window.AdminModule = AdminModule;
