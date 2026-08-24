// Centralized API Client & Session Manager

const API_BASE = '/api';

const API = {
  getToken() {
    return localStorage.getItem('health_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('health_token', token);
    } else {
      localStorage.removeItem('health_token');
    }
  },

  getUser() {
    try {
      const user = localStorage.getItem('health_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('health_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('health_user');
    }
  },

  clearSession() {
    localStorage.removeItem('health_token');
    localStorage.removeItem('health_user');
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          if (endpoint !== '/auth/login' && endpoint !== '/auth/register') {
            // Expired or unauthorized session
            this.clearSession();
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: { loggedIn: false } }));
          }
        }
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // Auth Endpoints
  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.token && res.user) {
      this.setToken(res.token);
      this.setUser(res.user);
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { loggedIn: true, user: res.user } }));
    }
    return res;
  },

  async login(identifier, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    if (res.token && res.user) {
      this.setToken(res.token);
      this.setUser(res.user);
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { loggedIn: true, user: res.user } }));
    }
    return res;
  },

  async getMe() {
    const res = await this.request('/auth/me');
    if (res.user) {
      this.setUser(res.user);
    }
    return res.user;
  },

  async updateProfile(profileData) {
    const res = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    if (res.user) {
      this.setUser(res.user);
      window.dispatchEvent(new CustomEvent('user-updated', { detail: { user: res.user } }));
    }
    return res;
  },

  async requestPasswordReset(identifier) {
    return this.request('/auth/forgot-password/request', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  },

  async verifyAndResetPassword(identifier, otp_code, new_password) {
    return this.request('/auth/forgot-password/verify-and-reset', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp_code, new_password })
    });
  },

  async changePassword(current_password, new_password) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, new_password })
    });
  },

  // BMI Endpoints
  async calculateBmi(height, weight, unit = 'metric') {
    return this.request('/bmi/calculate', {
      method: 'POST',
      body: JSON.stringify({ height, weight, unit })
    });
  },

  async saveBmi(height, weight, notes = '', sync_profile = true) {
    return this.request('/bmi/save', {
      method: 'POST',
      body: JSON.stringify({ height, weight, notes, sync_profile })
    });
  },

  async getBmiHistory() {
    return this.request('/bmi/history');
  },

  async deleteBmiLog(id) {
    return this.request(`/bmi/history/${id}`, {
      method: 'DELETE'
    });
  },

  // Notifications Endpoints
  async getNotifications() {
    return this.request('/notifications');
  },

  async markNotificationRead(id) {
    return this.request(`/notifications/read/${id}`, {
      method: 'POST'
    });
  },

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'POST'
    });
  },

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE'
    });
  },

  async getNotificationPreferences() {
    return this.request('/notifications/preferences');
  },

  async updateNotificationPreferences(prefs) {
    return this.request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs)
    });
  },

  async triggerReminder(type) {
    return this.request('/notifications/trigger-reminder', {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  },

  // Admin Endpoints
  async getAdminOverview() {
    return this.request('/admin/overview');
  },

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users${query ? '?' + query : ''}`);
  },

  async getAdminUserDetail(id) {
    return this.request(`/admin/users/${id}`);
  },

  async updateAdminUserStatus(id, status) {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async deleteAdminUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  async sendAdminBroadcast(broadcastData) {
    return this.request('/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify(broadcastData)
    });
  },

  async getAdminAuditLogs() {
    return this.request('/admin/audit-logs');
  },

  async updateAdminSettings(settings) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // Privacy Endpoints
  async getPrivacyPolicy() {
    return this.request('/privacy');
  },

  async exportMyData() {
    return this.request('/privacy/export-my-data', {
      method: 'POST'
    });
  },

  async requestAccountDeletion() {
    return this.request('/privacy/request-deletion', {
      method: 'POST'
    });
  }
};

// Toast notification helper
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

window.API = API;
window.showToast = showToast;
