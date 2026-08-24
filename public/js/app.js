// Application Main Controller & SPA Routing

const App = {
  currentView: 'dashboard',
  currentUser: null,

  init() {
    this.initTheme();
    this.bindGlobalEvents();
    this.checkSession();
    this.handleRoute();

    // Initialize sub-modules
    if (window.BMIModule) BMIModule.init();
    if (window.NotificationModule) NotificationModule.init();
    if (window.AdminModule) AdminModule.init();
  },

  initTheme() {
    const savedTheme = localStorage.getItem('health_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('health_theme', nextTheme);
    this.updateThemeIcon(nextTheme);
    // Redraw charts for theme
    if (window.BMIModule && BMIModule.cachedLogs) {
      BMIModule.renderTrendChart(BMIModule.cachedLogs);
    }
  },

  updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';
    }
  },

  bindGlobalEvents() {
    // Navigation routing
    window.addEventListener('hashchange', () => this.handleRoute());

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());

    // Modal listeners
    window.addEventListener('open-modal', (e) => this.openModal(e.detail.modalId));
    window.addEventListener('close-modal', (e) => this.closeModal(e.detail.modalId));

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.currentTarget.closest('.modal-backdrop');
        if (modal) this.closeModal(modal.id);
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal(backdrop.id);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(m => this.closeModal(m.id));
        if (window.NotificationModule) NotificationModule.closeDrawer();
      }
    });

    // Auth events
    window.addEventListener('auth-changed', (e) => {
      this.currentUser = e.detail.user || null;
      this.updateAuthUI();
      if (e.detail.loggedIn) {
        if (window.BMIModule) {
          BMIModule.prefillFromUser(this.currentUser);
          BMIModule.loadHistory();
        }
        if (window.NotificationModule) {
          NotificationModule.fetchNotifications();
          NotificationModule.loadPreferences();
        }
      }
    });

    // Form handlers
    this.bindAuthForms();
    this.bindProfileForms();
  },

  bindAuthForms() {
    // Registration Form (All 7 PRD required fields: Full Name, Email, Phone, Age, Height, Weight, Gender + Password)
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const full_name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const age = document.getElementById('reg-age').value;
        const height = document.getElementById('reg-height').value;
        const weight = document.getElementById('reg-weight').value;
        const gender = document.getElementById('reg-gender').value;
        const username = document.getElementById('reg-username')?.value.trim() || '';
        const password = document.getElementById('reg-password').value;

        try {
          const res = await API.register({
            full_name,
            email,
            phone,
            age,
            height,
            weight,
            gender,
            username,
            password
          });

          showToast(`Welcome aboard, ${res.user.full_name}!`, 'success');
          this.closeModal('register-modal');
          registerForm.reset();
          window.location.hash = '#dashboard';
        } catch (err) {
          showToast(err.message || 'Registration failed.', 'error');
        }
      });
    }

    // Login Form (Email / Username / Phone + Password)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value.trim();
        const password = document.getElementById('login-password').value;

        try {
          const res = await API.login(identifier, password);
          showToast(`Welcome back, ${res.user.full_name}!`, 'success');
          this.closeModal('login-modal');
          loginForm.reset();
          if (res.user.role === 'admin') {
            window.location.hash = '#admin';
          } else {
            window.location.hash = '#dashboard';
          }
        } catch (err) {
          showToast(err.message || 'Login failed.', 'error');
        }
      });
    }

    // Quick Fill Demo Credentials Buttons
    const fillUserBtn = document.getElementById('fill-demo-user-btn');
    if (fillUserBtn) {
      fillUserBtn.addEventListener('click', () => {
        document.getElementById('login-identifier').value = 'user@healthapp.com';
        document.getElementById('login-password').value = 'User@12345';
      });
    }

    const fillAdminBtn = document.getElementById('fill-demo-admin-btn');
    if (fillAdminBtn) {
      fillAdminBtn.addEventListener('click', () => {
        document.getElementById('login-identifier').value = 'admin@healthapp.com';
        document.getElementById('login-password').value = 'Admin@12345';
      });
    }

    // Forgot Password Flow (Step 1: Request OTP)
    const forgotRequestForm = document.getElementById('forgot-request-form');
    if (forgotRequestForm) {
      forgotRequestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('forgot-identifier').value.trim();

        try {
          const res = await API.requestPasswordReset(identifier);
          showToast(res.message, 'success');

          // Switch to Step 2 in modal
          document.getElementById('forgot-step-1').style.display = 'none';
          document.getElementById('forgot-step-2').style.display = 'block';
          document.getElementById('forgot-reset-identifier').value = identifier;

          if (res.recovery_preview && res.recovery_preview.demo_otp) {
            const previewBox = document.getElementById('forgot-otp-preview');
            if (previewBox) {
              previewBox.innerHTML = `🔐 Demo Verification Code: <strong>${res.recovery_preview.demo_otp}</strong>`;
              previewBox.style.display = 'block';
            }
          }
        } catch (err) {
          showToast(err.message || 'Error initiating password reset.', 'error');
        }
      });
    }

    // Forgot Password Flow (Step 2: Verify & Reset)
    const forgotResetForm = document.getElementById('forgot-reset-form');
    if (forgotResetForm) {
      forgotResetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('forgot-reset-identifier').value.trim();
        const otp_code = document.getElementById('forgot-otp').value.trim();
        const new_password = document.getElementById('forgot-new-password').value;

        try {
          const res = await API.verifyAndResetPassword(identifier, otp_code, new_password);
          showToast(res.message, 'success');
          this.closeModal('forgot-modal');
          // Reset forgot forms
          document.getElementById('forgot-step-1').style.display = 'block';
          document.getElementById('forgot-step-2').style.display = 'none';
          forgotRequestForm.reset();
          forgotResetForm.reset();

          // Open login modal
          this.openModal('login-modal');
        } catch (err) {
          showToast(err.message || 'Password reset verification failed.', 'error');
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        API.clearSession();
        this.currentUser = null;
        showToast('You have been logged out.', 'info');
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { loggedIn: false } }));
        window.location.hash = '#dashboard';
      });
    }
  },

  bindProfileForms() {
    // Profile Update Form
    const profileForm = document.getElementById('profile-edit-form');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const full_name = document.getElementById('prof-name').value.trim();
        const phone = document.getElementById('prof-phone').value.trim();
        const age = document.getElementById('prof-age').value;
        const height = document.getElementById('prof-height').value;
        const weight = document.getElementById('prof-weight').value;
        const gender = document.getElementById('prof-gender').value;

        try {
          const res = await API.updateProfile({ full_name, phone, age, height, weight, gender });
          showToast('Health profile updated successfully!', 'success');
          this.currentUser = res.user;
          this.updateAuthUI();
          if (window.BMIModule) BMIModule.prefillFromUser(res.user);
        } catch (err) {
          showToast(err.message || 'Profile update failed.', 'error');
        }
      });
    }

    // Change Password Form
    const changePassForm = document.getElementById('change-password-form');
    if (changePassForm) {
      changePassForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const current_password = document.getElementById('pass-current').value;
        const new_password = document.getElementById('pass-new').value;

        try {
          const res = await API.changePassword(current_password, new_password);
          showToast(res.message, 'success');
          changePassForm.reset();
        } catch (err) {
          showToast(err.message || 'Failed to change password.', 'error');
        }
      });
    }

    // Export My Data (GDPR)
    const exportBtn = document.getElementById('btn-export-my-data');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        try {
          const token = API.getToken();
          const response = await fetch('/api/privacy/export-my-data', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `my_health_records_${new Date().toISOString().slice(0, 10)}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast('Your health archive has been downloaded.', 'success');
        } catch (err) {
          showToast('Data export failed.', 'error');
        }
      });
    }

    // Delete Account
    const deleteAccBtn = document.getElementById('btn-delete-account');
    if (deleteAccBtn) {
      deleteAccBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to permanently erase your health profile and all BMI logs? This action cannot be reversed.')) {
          return;
        }

        try {
          const res = await API.requestAccountDeletion();
          showToast(res.message, 'info');
          API.clearSession();
          this.currentUser = null;
          this.updateAuthUI();
          window.location.hash = '#dashboard';
        } catch (err) {
          showToast(err.message || 'Account deletion failed.', 'error');
        }
      });
    }
  },

  async checkSession() {
    const user = API.getUser();
    if (user && API.getToken()) {
      this.currentUser = user;
      this.updateAuthUI();
      try {
        const freshUser = await API.getMe();
        if (freshUser) {
          this.currentUser = freshUser;
          this.updateAuthUI();
          if (window.BMIModule) {
            BMIModule.prefillFromUser(freshUser);
            BMIModule.loadHistory();
          }
        }
      } catch (e) {
        console.warn('Session refresh issue:', e);
      }
    } else {
      this.updateAuthUI();
    }
  },

  updateAuthUI() {
    const guestNav = document.getElementById('nav-guest-actions');
    const authNav = document.getElementById('nav-auth-actions');
    const adminNavLink = document.getElementById('nav-admin-link');
    const userNameEl = document.getElementById('user-menu-name');
    const userAvatarEl = document.getElementById('user-menu-avatar');
    const userRoleEl = document.getElementById('user-menu-role');

    if (this.currentUser) {
      if (guestNav) guestNav.style.display = 'none';
      if (authNav) authNav.style.display = 'flex';

      if (userNameEl) userNameEl.textContent = this.currentUser.full_name;
      if (userAvatarEl) {
        const initials = this.currentUser.full_name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        userAvatarEl.textContent = initials || 'U';
      }

      if (userRoleEl) {
        userRoleEl.textContent = this.currentUser.role;
        userRoleEl.style.display = this.currentUser.role === 'admin' ? 'inline-block' : 'none';
      }

      if (adminNavLink) {
        adminNavLink.style.display = this.currentUser.role === 'admin' ? 'flex' : 'none';
      }

      // Populate profile page fields
      this.populateProfileForm(this.currentUser);
    } else {
      if (guestNav) guestNav.style.display = 'flex';
      if (authNav) authNav.style.display = 'none';
      if (adminNavLink) adminNavLink.style.display = 'none';
    }
  },

  populateProfileForm(user) {
    if (!user) return;
    const nameInput = document.getElementById('prof-name');
    const emailInput = document.getElementById('prof-email');
    const phoneInput = document.getElementById('prof-phone');
    const ageInput = document.getElementById('prof-age');
    const heightInput = document.getElementById('prof-height');
    const weightInput = document.getElementById('prof-weight');
    const genderInput = document.getElementById('prof-gender');
    const usernameInput = document.getElementById('prof-username');

    if (nameInput) nameInput.value = user.full_name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (ageInput) ageInput.value = user.age || '';
    if (heightInput) heightInput.value = user.height || '';
    if (weightInput) weightInput.value = user.weight || '';
    if (genderInput) genderInput.value = user.gender || 'Male';
    if (usernameInput) usernameInput.value = user.username || '';
  },

  handleRoute() {
    const rawHash = window.location.hash.slice(1) || 'dashboard';
    const cleanHash = rawHash.split('?')[0];

    const validViews = ['dashboard', 'calculator', 'history', 'admin', 'profile', 'privacy'];
    const targetView = validViews.includes(cleanHash) ? cleanHash : 'dashboard';

    // Admin authorization guard
    if (targetView === 'admin' && (!this.currentUser || this.currentUser.role !== 'admin')) {
      showToast('Admin access required. Please log in with administrator credentials.', 'error');
      window.location.hash = '#dashboard';
      this.openModal('login-modal');
      return;
    }

    this.currentView = targetView;

    // Show/hide view sections
    document.querySelectorAll('.view-section').forEach(section => {
      section.style.display = section.id === `view-${targetView}` ? 'block' : 'none';
    });

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkHash = link.getAttribute('href')?.slice(1);
      if (linkHash === targetView) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Trigger view-specific loads
    if (targetView === 'history' && window.BMIModule) {
      BMIModule.loadHistory();
    } else if (targetView === 'admin' && window.AdminModule) {
      AdminModule.loadAll();
    } else if (targetView === 'calculator' && window.BMIModule) {
      BMIModule.recalculate();
    }
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      const firstInput = modal.querySelector('input:not([type="hidden"]), select');
      if (firstInput) setTimeout(() => firstInput.focus(), 50);
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }
};

window.App = App;

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
