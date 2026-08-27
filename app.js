/**
* Create Account (Registration) Application Logic
* Implements PRD specifications for validation, OTP flow, accessibility & navigation
*/

document.addEventListener('DOMContentLoaded', () => {
  // --- Country Data ---
  const COUNTRY_CODES = [
    { name: 'United States', code: '+1', flag: '🇺🇸', short: 'US' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧', short: 'GB' },
    { name: 'India', code: '+91', flag: '🇮🇳', short: 'IN' },
    { name: 'Canada', code: '+1', flag: '🇨🇦', short: 'CA' },
    { name: 'Australia', code: '+61', flag: '🇦🇺', short: 'AU' },
    { name: 'Germany', code: '+49', flag: '🇩🇪', short: 'DE' },
    { name: 'France', code: '+33', flag: '🇫🇷', short: 'FR' },
    { name: 'Japan', code: '+81', flag: '🇯🇵', short: 'JP' },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', short: 'AE' },
    { name: 'Singapore', code: '+65', flag: '🇸🇬', short: 'SG' },
    { name: 'Brazil', code: '+55', flag: '🇧🇷', short: 'BR' },
    { name: 'Netherlands', code: '+31', flag: '🇳🇱', short: 'NL' },
    { name: 'Spain', code: '+34', flag: '🇪🇸', short: 'ES' }
  ];

  // --- State Management ---
  const state = {
    selectedCountry: COUNTRY_CODES[0],
    generatedOTP: null,
    isOtpSent: false,
    isOtpVerified: false,
    otpTimerInterval: null,
    otpTimerSeconds: 60,
    unsavedChangesPendingAction: null
  };

  // --- DOM Elements ---
  const form = document.getElementById('create-account-form');
  const firstNameInput = document.getElementById('first-name');
  const middleNameInput = document.getElementById('middle-name');
  const lastNameInput = document.getElementById('last-name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');

  // Country selector
  const countryBtn = document.getElementById('country-select-btn');
  const countryMenu = document.getElementById('country-menu-list');
  const countrySearch = document.getElementById('country-search-input');
  const countryOptionsList = document.getElementById('country-options-list');
  const selectedFlag = document.getElementById('selected-flag');
  const selectedDialCode = document.getElementById('selected-dial-code');

  // OTP elements
  const otpSection = document.getElementById('otp-section');
  const sendOtpBtn = document.getElementById('send-otp-btn');
  const sendOtpBtnText = document.getElementById('send-otp-btn-text');
  const otpStatusBadge = document.getElementById('otp-status-badge');
  const otpInputs = Array.from(document.querySelectorAll('.otp-digit'));
  const otpTimerText = document.getElementById('otp-timer-text');
  const timerCountdown = document.getElementById('timer-countdown');
  const resendOtpBtn = document.getElementById('resend-otp-btn');
  const otpError = document.getElementById('otp-error');

  // SMS Toast HUD
  const smsToast = document.getElementById('sms-toast');
  const smsOtpCode = document.getElementById('sms-otp-code');
  const autofillOtpBtn = document.getElementById('autofill-otp-btn');
  const closeSmsBtn = document.getElementById('close-sms-btn');

  // Screens
  const registrationView = document.getElementById('registration-view');
  const loginView = document.getElementById('login-view');
  const successView = document.getElementById('success-view');
  const deviceContainer = document.getElementById('device-container');

  // Navigation Links / Buttons
  const backNavBtn = document.getElementById('back-nav-btn');
  const loginLink = document.getElementById('login-link');
  const backToRegisterBtn = document.getElementById('back-to-register-btn');
  const goToRegisterLink = document.getElementById('go-to-register-link');
  const continueDashboardBtn = document.getElementById('continue-dashboard-btn');
  const registerAnotherBtn = document.getElementById('register-another-btn');

  // Controls
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const viewModeToggle = document.getElementById('view-mode-toggle');

  // Modal
  const unsavedModal = document.getElementById('unsaved-modal');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalDiscardBtn = document.getElementById('modal-discard-btn');

  // Submit
  const registerBtn = document.getElementById('register-btn');
  const submitSpinner = document.getElementById('submit-spinner');
  const submitLabel = document.getElementById('submit-label');

  // --- Real-Time Time Clock for Mobile Notch ---
  const updateNotchClock = () => {
    const notchClock = document.getElementById('notch-time-display');
    if (!notchClock) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    notchClock.textContent = `${hours}:${mins}`;
  };
  updateNotchClock();
  setInterval(updateNotchClock, 30000);

  // --- Theme Management ---
  const savedTheme = localStorage.getItem('app-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('app-theme', nextTheme);
  });

  // --- Viewport Mode Toggle (Device Frame vs Desktop Fluid) ---
  let isFluidView = false;
  viewModeToggle.addEventListener('click', () => {
    isFluidView = !isFluidView;
    deviceContainer.classList.toggle('fluid-mode', isFluidView);
    const btnText = viewModeToggle.querySelector('.btn-text');
    if (btnText) {
      btnText.textContent = isFluidView ? 'Mobile View' : 'Device View';
    }
  });

  // --- Country Code Dropdown Initialization ---
  const renderCountryOptions = (filter = '') => {
    const query = filter.toLowerCase().trim();
    countryOptionsList.innerHTML = '';
    const filtered = COUNTRY_CODES.filter(c =>
      c.name.toLowerCase().includes(query) || c.code.includes(query) || c.short.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      countryOptionsList.innerHTML = '<li style="padding: 0.75rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No country found</li>';
      return;
    }

    filtered.forEach(country => {
      const li = document.createElement('li');
      li.className = `country-option-item ${country.code === state.selectedCountry.code && country.name === state.selectedCountry.name ? 'selected' : ''}`;
      li.setAttribute('role', 'option');
      li.innerHTML = `
        <div class="country-option-left">
          <span class="flag-icon">${country.flag}</span>
          <span>${country.name}</span>
        </div>
        <span class="country-option-code">${country.code}</span>
      `;
      li.addEventListener('click', () => {
        state.selectedCountry = country;
        selectedFlag.textContent = country.flag;
        selectedDialCode.textContent = country.code;
        countryMenu.classList.add('hidden');
        countryBtn.setAttribute('aria-expanded', 'false');
      });
      countryOptionsList.appendChild(li);
    });
  };

  renderCountryOptions();

  countryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = countryMenu.classList.toggle('hidden');
    countryBtn.setAttribute('aria-expanded', !isHidden);
    if (!isHidden) {
      countrySearch.value = '';
      renderCountryOptions();
      setTimeout(() => countrySearch.focus(), 50);
    }
  });

  countrySearch.addEventListener('input', (e) => {
    renderCountryOptions(e.target.value);
  });

  document.addEventListener('click', (e) => {
    if (!countryMenu.contains(e.target) && !countryBtn.contains(e.target)) {
      countryMenu.classList.add('hidden');
      countryBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // --- Validation Helpers ---
  const NAME_REGEX = /^[a-zA-Z\s\-]+$/;
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const PHONE_REGEX = /^[0-9\s\-()]{7,15}$/;

  const setFieldError = (groupId, errorId, message) => {
    const group = document.getElementById(groupId);
    const errorElem = document.getElementById(errorId);
    if (group && errorElem) {
      if (message) {
        group.classList.add('has-error');
        group.classList.remove('is-valid');
        errorElem.textContent = message;
      } else {
        group.classList.remove('has-error');
        group.classList.add('is-valid');
        errorElem.textContent = '';
      }
    }
  };

  const clearFieldError = (groupId, errorId) => {
    const group = document.getElementById(groupId);
    const errorElem = document.getElementById(errorId);
    if (group && errorElem) {
      group.classList.remove('has-error', 'is-valid');
      errorElem.textContent = '';
    }
  };

  const validateFirstName = () => {
    const val = firstNameInput.value.trim();
    if (!val) {
      setFieldError('group-first-name', 'first-name-error', 'First name is required.');
      return false;
    }
    if (val.length > 50) {
      setFieldError('group-first-name', 'first-name-error', 'First name cannot exceed 50 characters.');
      return false;
    }
    if (!NAME_REGEX.test(val)) {
      setFieldError('group-first-name', 'first-name-error', 'First name can only contain letters, spaces, or hyphens.');
      return false;
    }
    setFieldError('group-first-name', 'first-name-error', null);
    return true;
  };

  const validateMiddleName = () => {
    const val = middleNameInput.value.trim();
    if (!val) {
      clearFieldError('group-middle-name', 'middle-name-error');
      return true;
    }
    if (val.length > 50) {
      setFieldError('group-middle-name', 'middle-name-error', 'Middle name cannot exceed 50 characters.');
      return false;
    }
    if (!NAME_REGEX.test(val)) {
      setFieldError('group-middle-name', 'middle-name-error', 'Middle name can only contain letters, spaces, or hyphens.');
      return false;
    }
    setFieldError('group-middle-name', 'middle-name-error', null);
    return true;
  };

  const validateLastName = () => {
    const val = lastNameInput.value.trim();
    if (!val) {
      setFieldError('group-last-name', 'last-name-error', 'Last name is required.');
      return false;
    }
    if (val.length > 50) {
      setFieldError('group-last-name', 'last-name-error', 'Last name cannot exceed 50 characters.');
      return false;
    }
    if (!NAME_REGEX.test(val)) {
      setFieldError('group-last-name', 'last-name-error', 'Last name can only contain letters, spaces, or hyphens.');
      return false;
    }
    setFieldError('group-last-name', 'last-name-error', null);
    return true;
  };

  const validateEmail = () => {
    const val = emailInput.value.trim();
    if (!val) {
      clearFieldError('group-email', 'email-error');
      return true;
    }
    if (!EMAIL_REGEX.test(val)) {
      setFieldError('group-email', 'email-error', 'Please enter a valid email address (e.g. name@example.com).');
      return false;
    }
    if (val.toLowerCase() === 'existing@example.com') {
      setFieldError('group-email', 'email-error', 'This email is already registered. Please log in.');
      return false;
    }
    setFieldError('group-email', 'email-error', null);
    return true;
  };

  const validatePhone = () => {
    const val = phoneInput.value.trim();
    if (!val) {
      clearFieldError('group-phone', 'phone-error');
      return true;
    }
    const cleanDigits = val.replace(/\D/g, '');
    if (cleanDigits.length < 7 || cleanDigits.length > 15 || !PHONE_REGEX.test(val)) {
      setFieldError('group-phone', 'phone-error', 'Please enter a valid phone number (7 to 15 digits).');
      return false;
    }
    setFieldError('group-phone', 'phone-error', null);
    return true;
  };

  // Blur validation bindings
  firstNameInput.addEventListener('blur', validateFirstName);
  middleNameInput.addEventListener('blur', validateMiddleName);
  lastNameInput.addEventListener('blur', validateLastName);
  emailInput.addEventListener('blur', validateEmail);
  phoneInput.addEventListener('blur', validatePhone);

  // Live input cleanup
  firstNameInput.addEventListener('input', () => {
    if (document.getElementById('group-first-name').classList.contains('has-error')) validateFirstName();
  });
  lastNameInput.addEventListener('input', () => {
    if (document.getElementById('group-last-name').classList.contains('has-error')) validateLastName();
  });
  phoneInput.addEventListener('input', () => {
    if (document.getElementById('group-phone').classList.contains('has-error')) validatePhone();
  });

  // --- OTP Verification Logic ---
  const generateRandomOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const startOtpTimer = () => {
    clearInterval(state.otpTimerInterval);
    state.otpTimerSeconds = 60;
    otpTimerText.classList.remove('hidden');
    resendOtpBtn.classList.add('hidden');
    timerCountdown.textContent = `00:${String(state.otpTimerSeconds).padStart(2, '0')}`;

    state.otpTimerInterval = setInterval(() => {
      state.otpTimerSeconds--;
      if (state.otpTimerSeconds <= 0) {
        clearInterval(state.otpTimerInterval);
        otpTimerText.classList.add('hidden');
        resendOtpBtn.classList.remove('hidden');
      } else {
        timerCountdown.textContent = `00:${String(state.otpTimerSeconds).padStart(2, '0')}`;
      }
    }, 1000);
  };

  const triggerSendOTP = () => {
    const isPhoneValid = validatePhone();
    const phoneVal = phoneInput.value.trim();

    if (!phoneVal) {
      setFieldError('group-phone', 'phone-error', 'Please enter your phone number to receive an OTP.');
      phoneInput.focus();
      return;
    }

    if (!isPhoneValid) {
      phoneInput.focus();
      return;
    }

    // Generate 6 digit code
    state.generatedOTP = generateRandomOTP();
    state.isOtpSent = true;
    state.isOtpVerified = false;

    // Reset OTP boxes
    otpInputs.forEach(i => {
      i.value = '';
      i.classList.remove('filled');
      i.disabled = false;
    });

    // Update UI states
    otpStatusBadge.textContent = 'Code Sent';
    otpStatusBadge.className = 'otp-status-badge sent';
    sendOtpBtnText.textContent = 'Sent';
    sendOtpBtn.disabled = true;
    otpSection.classList.remove('has-error', 'verified');
    otpError.textContent = '';

    // Start 60s countdown
    startOtpTimer();

    // Show simulated SMS HUD notification
    smsOtpCode.textContent = state.generatedOTP;
    smsToast.classList.remove('hidden');

    // Auto focus first OTP input box
    setTimeout(() => {
      otpInputs[0].focus();
    }, 200);
  };

  sendOtpBtn.addEventListener('click', triggerSendOTP);
  resendOtpBtn.addEventListener('click', () => {
    triggerSendOTP();
  });

  closeSmsBtn.addEventListener('click', () => {
    smsToast.classList.add('hidden');
  });

  autofillOtpBtn.addEventListener('click', () => {
    if (!state.generatedOTP) return;
    const digits = state.generatedOTP.split('');
    otpInputs.forEach((input, idx) => {
      input.value = digits[idx] || '';
      input.classList.add('filled');
    });
    smsToast.classList.add('hidden');
    verifyEnteredOTP();
  });

  // OTP Digits Input Box Handlers
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      input.value = val ? val.slice(-1) : '';

      if (input.value) {
        input.classList.add('filled');
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      } else {
        input.classList.remove('filled');
      }

      checkAllOtpFilled();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text').trim();
      const cleanDigits = pastedData.replace(/\D/g, '').slice(0, 6);

      if (cleanDigits) {
        const digitsArr = cleanDigits.split('');
        otpInputs.forEach((inp, i) => {
          inp.value = digitsArr[i] || '';
          if (inp.value) inp.classList.add('filled');
        });

        const nextFocusIndex = Math.min(digitsArr.length, otpInputs.length - 1);
        otpInputs[nextFocusIndex].focus();
        checkAllOtpFilled();
      }
    });
  });

  const checkAllOtpFilled = () => {
    const fullCode = otpInputs.map(i => i.value).join('');
    if (fullCode.length === 6) {
      verifyEnteredOTP();
    }
  };

  const verifyEnteredOTP = () => {
    const enteredCode = otpInputs.map(i => i.value).join('');

    if (!state.generatedOTP) {
      otpError.textContent = 'Please request an OTP code first by clicking "Send OTP".';
      otpSection.classList.add('has-error');
      return;
    }

    if (enteredCode === state.generatedOTP) {
      state.isOtpVerified = true;
      clearInterval(state.otpTimerInterval);
      otpTimerText.classList.add('hidden');
      resendOtpBtn.classList.add('hidden');

      otpStatusBadge.textContent = '✓ Verified';
      otpStatusBadge.className = 'otp-status-badge verified';
      otpSection.classList.remove('has-error');
      otpSection.classList.add('verified');
      otpError.textContent = '';

      // Lock OTP inputs
      otpInputs.forEach(i => i.disabled = true);
    } else {
      state.isOtpVerified = false;
      otpError.textContent = 'Invalid OTP code. Please verify the 6 digits and try again.';
      otpSection.classList.add('has-error');
      otpSection.classList.remove('verified');
    }
  };

  // --- Form Submission / Register Handler ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isFirstValid = validateFirstName();
    const isMiddleValid = validateMiddleName();
    const isLastValid = validateLastName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();

    const phoneVal = phoneInput.value.trim();

    // Check OTP condition: if phone number is provided, OTP must be verified
    let isOtpValid = true;
    if (phoneVal) {
      if (!state.isOtpSent) {
        otpError.textContent = 'Please send and verify the OTP code for your phone number.';
        otpSection.classList.add('has-error');
        isOtpValid = false;
      } else if (!state.isOtpVerified) {
        otpError.textContent = 'Please enter and verify the valid 6-digit OTP code.';
        otpSection.classList.add('has-error');
        isOtpValid = false;
      }
    }

    if (!isFirstValid || !isMiddleValid || !isLastValid || !isEmailValid || !isPhoneValid || !isOtpValid) {
      // Focus first error element
      const firstError = document.querySelector('.has-error input');
      if (firstError) firstError.focus();
      return;
    }

    // Process Submission (Mock API Call)
    registerBtn.disabled = true;
    submitSpinner.classList.remove('hidden');
    submitLabel.textContent = 'Creating Account...';

    setTimeout(() => {
      registerBtn.disabled = false;
      submitSpinner.classList.add('hidden');
      submitLabel.textContent = 'Register';

      // Populate Success Screen
      const fullName = [firstNameInput.value.trim(), middleNameInput.value.trim(), lastNameInput.value.trim()].filter(Boolean).join(' ');
      document.getElementById('summary-name').textContent = fullName;
      document.getElementById('summary-phone').textContent = phoneVal ? `${state.selectedCountry.code} ${phoneVal}` : 'Not provided';

      const emailVal = emailInput.value.trim();
      const emailRow = document.getElementById('summary-email-row');
      if (emailVal) {
        emailRow.style.display = 'flex';
        document.getElementById('summary-email').textContent = emailVal;
      } else {
        emailRow.style.display = 'none';
      }

      // Switch to Success Screen
      switchScreen(successView);
    }, 700);
  });

  // --- Screen Switching & Navigation ---
  const switchScreen = (targetScreen) => {
    [registrationView, loginView, successView].forEach(s => {
      s.classList.remove('active-screen');
      s.classList.add('hidden-screen');
    });
    targetScreen.classList.remove('hidden-screen');
    targetScreen.classList.add('active-screen');
  };

  const hasUnsavedChanges = () => {
    return (
      firstNameInput.value.trim() !== '' ||
      middleNameInput.value.trim() !== '' ||
      lastNameInput.value.trim() !== '' ||
      emailInput.value.trim() !== '' ||
      phoneInput.value.trim() !== ''
    );
  };

  const promptUnsavedChanges = (onDiscard) => {
    if (hasUnsavedChanges()) {
      state.unsavedChangesPendingAction = onDiscard;
      unsavedModal.classList.remove('hidden');
    } else {
      onDiscard();
    }
  };

  modalCancelBtn.addEventListener('click', () => {
    unsavedModal.classList.add('hidden');
    state.unsavedChangesPendingAction = null;
  });

  modalDiscardBtn.addEventListener('click', () => {
    unsavedModal.classList.add('hidden');
    if (state.unsavedChangesPendingAction) {
      // Reset form
      form.reset();
      clearFieldError('group-first-name', 'first-name-error');
      clearFieldError('group-middle-name', 'middle-name-error');
      clearFieldError('group-last-name', 'last-name-error');
      clearFieldError('group-email', 'email-error');
      clearFieldError('group-phone', 'phone-error');
      otpSection.classList.remove('has-error', 'verified');
      otpError.textContent = '';
      state.isOtpSent = false;
      state.isOtpVerified = false;
      state.generatedOTP = null;
      otpInputs.forEach(i => { i.value = ''; i.disabled = false; i.classList.remove('filled'); });
      otpStatusBadge.textContent = 'Required';
      otpStatusBadge.className = 'otp-status-badge';
      sendOtpBtnText.textContent = 'Send OTP';
      sendOtpBtn.disabled = false;
      clearInterval(state.otpTimerInterval);
      otpTimerText.classList.add('hidden');
      resendOtpBtn.classList.add('hidden');

      state.unsavedChangesPendingAction();
      state.unsavedChangesPendingAction = null;
    }
  });

  backNavBtn.addEventListener('click', () => {
    promptUnsavedChanges(() => {
      switchScreen(loginView);
    });
  });

  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    promptUnsavedChanges(() => {
      switchScreen(loginView);
    });
  });

  backToRegisterBtn.addEventListener('click', () => {
    switchScreen(registrationView);
  });

  goToRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    switchScreen(registrationView);
  });

  registerAnotherBtn.addEventListener('click', () => {
    form.reset();
    otpInputs.forEach(i => { i.value = ''; i.disabled = false; i.classList.remove('filled'); });
    otpStatusBadge.textContent = 'Required';
    otpStatusBadge.className = 'otp-status-badge';
    sendOtpBtnText.textContent = 'Send OTP';
    sendOtpBtn.disabled = false;
    otpSection.classList.remove('has-error', 'verified');
    state.isOtpSent = false;
    state.isOtpVerified = false;
    state.generatedOTP = null;
    clearInterval(state.otpTimerInterval);
    otpTimerText.classList.add('hidden');
    resendOtpBtn.classList.add('hidden');

    switchScreen(registrationView);
  });

  continueDashboardBtn.addEventListener('click', () => {
    alert('🎉 Redirecting to User Dashboard!');
  });
});
