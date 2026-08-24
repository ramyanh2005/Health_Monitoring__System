// Notification Center & Reminders Manager

const NotificationModule = {
  notifications: [],
  unreadCount: 0,
  currentFilter: 'all',
  drawerOpen: false,

  init() {
    this.bindEvents();
    if (API.getToken()) {
      this.fetchNotifications();
      this.loadPreferences();
    }
  },

  bindEvents() {
    // Drawer triggers
    const bellBtn = document.getElementById('nav-notifications-btn');
    const closeBtn = document.getElementById('drawer-close-btn');
    const overlay = document.getElementById('drawer-overlay');

    if (bellBtn) bellBtn.addEventListener('click', () => this.toggleDrawer());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());
    if (overlay) overlay.addEventListener('click', () => this.closeDrawer());

    // Mark all read button
    const markAllBtn = document.getElementById('notif-mark-all-btn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => this.markAllRead());
    }

    // Filter pills
    const filterTabs = document.querySelectorAll('.notif-filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        filterTabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFilter = e.currentTarget.dataset.filter || 'all';
        this.renderNotifications();
      });
    });

    // Quick reminder trigger buttons
    document.querySelectorAll('[data-trigger-reminder]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.triggerReminder;
        this.triggerQuickReminder(type);
      });
    });

    // Preferences form
    const prefForm = document.getElementById('notif-preferences-form');
    if (prefForm) {
      prefForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.savePreferences();
      });
    }
  },

  toggleDrawer() {
    if (this.drawerOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  },

  openDrawer() {
    if (!API.getToken()) {
      showToast('Please log in to view your notifications.', 'info');
      window.dispatchEvent(new CustomEvent('open-modal', { detail: { modalId: 'login-modal' } }));
      return;
    }

    this.drawerOpen = true;
    const drawer = document.getElementById('notifications-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    this.fetchNotifications();
  },

  closeDrawer() {
    this.drawerOpen = false;
    const drawer = document.getElementById('notifications-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  },

  async fetchNotifications() {
    if (!API.getToken()) return;

    try {
      const res = await API.getNotifications();
      if (res.success) {
        this.notifications = res.notifications || [];
        this.unreadCount = res.unreadCount || 0;
        this.updateBadge();
        this.renderNotifications();
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  },

  updateBadge() {
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  },

  renderNotifications() {
    const container = document.getElementById('notif-list-container');
    if (!container) return;

    let filtered = this.notifications;
    if (this.currentFilter === 'reminders') {
      filtered = this.notifications.filter(n => n.type === 'reminder');
    } else if (this.currentFilter === 'alerts') {
      filtered = this.notifications.filter(n => n.type === 'health_alert');
    } else if (this.currentFilter === 'broadcasts') {
      filtered = this.notifications.filter(n => n.type === 'admin_broadcast');
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔔</div>
          <p style="font-weight:600; color:var(--text-primary);">All Caught Up!</p>
          <p style="font-size:0.85rem; margin-top:0.25rem;">No notifications in this category right now.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const timeAgo = this.formatTimeAgo(new Date(item.created_at));
      const icon = item.type === 'health_alert' ? '✨' : item.type === 'admin_broadcast' ? '📢' : '⏰';

      return `
        <div class="notif-item ${!item.is_read ? 'unread' : ''}" id="notif-item-${item.id}">
          <div class="notif-top">
            <div class="notif-title">
              <span>${icon}</span> ${item.title}
            </div>
            <span class="notif-time">${timeAgo}</span>
          </div>
          <div class="notif-msg">${item.message}</div>
          <div style="display:flex; justify-content: flex-end; gap:0.5rem; margin-top: 0.5rem;">
            ${!item.is_read ? `
              <button class="btn btn-sm btn-outline" onclick="NotificationModule.markRead('${item.id}')" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;">
                Mark Read
              </button>
            ` : ''}
            <button class="btn btn-sm btn-secondary" onclick="NotificationModule.deleteNotification('${item.id}')" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;">
              Dismiss
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async markRead(id) {
    try {
      const res = await API.markNotificationRead(id);
      if (res.success) {
        const item = this.notifications.find(n => n.id === id);
        if (item) item.is_read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.updateBadge();
        this.renderNotifications();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update notification.', 'error');
    }
  },

  async markAllRead() {
    try {
      const res = await API.markAllNotificationsRead();
      if (res.success) {
        this.notifications.forEach(n => (n.is_read = true));
        this.unreadCount = 0;
        this.updateBadge();
        this.renderNotifications();
        showToast('All notifications marked as read.', 'success');
      }
    } catch (err) {
      showToast('Error marking notifications as read.', 'error');
    }
  },

  async deleteNotification(id) {
    try {
      const res = await API.deleteNotification(id);
      if (res.success) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.unreadCount = this.notifications.filter(n => !n.is_read).length;
        this.updateBadge();
        this.renderNotifications();
      }
    } catch (err) {
      showToast('Error dismissing notification.', 'error');
    }
  },

  async triggerQuickReminder(type) {
    if (!API.getToken()) {
      showToast('Please log in to trigger fitness reminders.', 'info');
      return;
    }

    try {
      const res = await API.triggerReminder(type);
      if (res.success) {
        showToast(`🔔 ${res.notification.title}`, 'info');
        this.fetchNotifications();
      }
    } catch (err) {
      showToast('Could not trigger reminder.', 'error');
    }
  },

  async loadPreferences() {
    try {
      const res = await API.getNotificationPreferences();
      if (res.success && res.preferences) {
        const p = res.preferences;
        const dailyCb = document.getElementById('pref-daily');
        const hydrationCb = document.getElementById('pref-hydration');
        const alertsCb = document.getElementById('pref-alerts');
        const broadcastsCb = document.getElementById('pref-broadcasts');

        if (dailyCb) dailyCb.checked = !!p.daily_reminders;
        if (hydrationCb) hydrationCb.checked = !!p.hydration_reminders;
        if (alertsCb) alertsCb.checked = !!p.health_alerts;
        if (broadcastsCb) broadcastsCb.checked = !!p.admin_broadcasts;
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  },

  async savePreferences() {
    const prefs = {
      daily_reminders: document.getElementById('pref-daily')?.checked ?? true,
      hydration_reminders: document.getElementById('pref-hydration')?.checked ?? true,
      health_alerts: document.getElementById('pref-alerts')?.checked ?? true,
      admin_broadcasts: document.getElementById('pref-broadcasts')?.checked ?? true
    };

    try {
      const res = await API.updateNotificationPreferences(prefs);
      if (res.success) {
        showToast('Reminder preferences saved!', 'success');
      }
    } catch (err) {
      showToast('Failed to save preferences.', 'error');
    }
  },

  formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
};

window.NotificationModule = NotificationModule;
