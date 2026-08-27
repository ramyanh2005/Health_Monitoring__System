/**
 * VitalHealth Onboarding & Profile Application Controller
 * Handles multi-step branching, real-time validation, live BMI calculations,
 * auto-saving drafts, telemetry events, and database exploration.
 */

class VitalHealthApp {
  constructor() {
    this.session_id = this.getOrCreateSessionId();
    this.currentStep = 1;
    this.stepStartTime = Date.now();

    this.state = {
      full_name: '',
      gender: null,
      maternal_status: null,
      age: 45,
      height_cm: 175,
      weight_kg: 70,
      step_length_cm: 75,
      wellbeing: null,
      condition_details: '',
      has_disability: false,
      disability_details: '',
      has_allergies: false,
      allergy_details: '',
      primary_goal: 'Manage Blood Pressure'
    };

    this.selectedAllergyTags = new Set();
    this.selectedConditionTags = new Set();
    this.draftDebounceTimer = null;

    this.init();
  }

  getOrCreateSessionId() {
    let sid = sessionStorage.getItem('vitalhealth_session_id');
    if (!sid) {
      sid = 'vh_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem('vitalhealth_session_id', sid);
    }
    return sid;
  }

  async init() {
    this.bindEvents();
    this.updateBMI();
    
    // Check if an existing draft exists to resume
    await this.restoreDraftIfExists();
    
    this.updateUIForCurrentStep();
    this.logTelemetry('step1_basic_info', 'step_view');
  }

  // --------------------------------------------------------------------------
  // Event Bindings
  // --------------------------------------------------------------------------
  bindEvents() {
    // Step 1: Basic Info
    const fullNameInput = document.getElementById('fullNameInput');
    fullNameInput.addEventListener('input', (e) => {
      this.state.full_name = e.target.value;
      this.validateStep1();
      this.triggerAutoSave();
    });

    const tileFemale = document.getElementById('tileGenderFemale');
    const tileMale = document.getElementById('tileGenderMale');

    tileFemale.addEventListener('click', () => {
      this.state.gender = 'Female';
      tileFemale.classList.add('selected');
      tileMale.classList.remove('selected');
      this.validateStep1();
      this.triggerAutoSave();
    });

    tileMale.addEventListener('click', () => {
      this.state.gender = 'Male';
      this.state.maternal_status = null;
      tileMale.classList.add('selected');
      tileFemale.classList.remove('selected');
      this.validateStep1();
      this.triggerAutoSave();
    });

    document.getElementById('btnStep1Next').addEventListener('click', () => {
      if (this.validateStep1()) {
        if (this.state.gender === 'Female') {
          this.navigateToStep(1.5);
        } else {
          this.navigateToStep(2);
        }
      }
    });

    // Step 1.5: Maternal Status
    document.querySelectorAll('.radio-card[data-maternal]').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.radio-card[data-maternal]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.state.maternal_status = card.getAttribute('data-maternal');
        this.validateStep1_5();
        this.triggerAutoSave();
      });
    });

    document.getElementById('btnStep1_5Back').addEventListener('click', () => {
      this.navigateToStep(1);
    });

    document.getElementById('btnStep1_5Next').addEventListener('click', () => {
      if (this.validateStep1_5()) {
        this.navigateToStep(2);
      }
    });

    // Step 2: Vitals & BMI
    this.bindVitalsInputs();

    document.getElementById('btnStep2Back').addEventListener('click', () => {
      if (this.state.gender === 'Female') {
        this.navigateToStep(1.5);
      } else {
        this.navigateToStep(1);
      }
    });

    document.getElementById('btnStep2Next').addEventListener('click', () => {
      if (this.validateStep2()) {
        this.navigateToStep(3);
      }
    });

    // Step 3: Health Status
    const wbHealthy = document.getElementById('wellbeingHealthy');
    const wbUnhealthy = document.getElementById('wellbeingUnhealthy');
    const condReveal = document.getElementById('conditionRevealBox');

    wbHealthy.addEventListener('click', () => {
      this.state.wellbeing = 'Healthy';
      this.state.condition_details = '';
      wbHealthy.classList.add('selected');
      wbUnhealthy.classList.remove('selected');
      condReveal.classList.remove('visible');
      this.validateStep3();
      this.triggerAutoSave();
    });

    wbUnhealthy.addEventListener('click', () => {
      this.state.wellbeing = 'Unhealthy';
      wbUnhealthy.classList.add('selected');
      wbHealthy.classList.remove('selected');
      condReveal.classList.add('visible');
      this.validateStep3();
      this.triggerAutoSave();
    });

    // Condition Quick Chips
    document.querySelectorAll('#conditionChips .chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        if (this.selectedConditionTags.has(tag)) {
          this.selectedConditionTags.delete(tag);
          btn.classList.remove('active');
        } else {
          this.selectedConditionTags.add(tag);
          btn.classList.add('active');
        }
        this.syncConditionText();
      });
    });

    const condInput = document.getElementById('conditionInput');
    condInput.addEventListener('input', (e) => {
      this.state.condition_details = e.target.value;
      this.validateStep3();
      this.triggerAutoSave();
    });

    // Disability Toggle
    const disToggle = document.getElementById('disabilityToggle');
    const disBox = document.getElementById('disabilityDetailsBox');
    disToggle.addEventListener('change', (e) => {
      this.state.has_disability = e.target.checked;
      if (this.state.has_disability) {
        disBox.classList.add('visible');
      } else {
        disBox.classList.remove('visible');
        this.state.disability_details = '';
      }
      this.triggerAutoSave();
    });

    document.getElementById('disabilityInput').addEventListener('input', (e) => {
      this.state.disability_details = e.target.value;
      this.triggerAutoSave();
    });

    document.getElementById('btnStep3Back').addEventListener('click', () => {
      this.navigateToStep(2);
    });

    document.getElementById('btnStep3Next').addEventListener('click', () => {
      if (this.validateStep3()) {
        this.navigateToStep(4);
      }
    });

    // Step 4: Allergies & Finalize
    const allergyNo = document.getElementById('allergyNoBtn');
    const allergyYes = document.getElementById('allergyYesBtn');
    const allergyRev = document.getElementById('allergyDetailsReveal');

    allergyNo.addEventListener('click', () => {
      this.state.has_allergies = false;
      this.state.allergy_details = '';
      this.selectedAllergyTags.clear();
      document.querySelectorAll('#allergyChips .chip-btn').forEach(b => b.classList.remove('active'));
      allergyNo.classList.add('active');
      allergyYes.classList.remove('active');
      allergyRev.classList.remove('visible');
      this.validateStep4();
      this.populateSummaryReview();
      this.triggerAutoSave();
    });

    allergyYes.addEventListener('click', () => {
      this.state.has_allergies = true;
      allergyYes.classList.add('active');
      allergyNo.classList.remove('active');
      allergyRev.classList.add('visible');
      this.validateStep4();
      this.populateSummaryReview();
      this.triggerAutoSave();
    });

    // Allergy Quick Chips
    document.querySelectorAll('#allergyChips .chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const alg = btn.getAttribute('data-allergy');
        if (this.selectedAllergyTags.has(alg)) {
          this.selectedAllergyTags.delete(alg);
          btn.classList.remove('active');
        } else {
          this.selectedAllergyTags.add(alg);
          btn.classList.add('active');
        }
        this.syncAllergyText();
      });
    });

    document.getElementById('allergyInput').addEventListener('input', (e) => {
      this.state.allergy_details = e.target.value;
      this.validateStep4();
      this.populateSummaryReview();
      this.triggerAutoSave();
    });

    // Primary Goal Picker
    document.querySelectorAll('.goal-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.goal-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.state.primary_goal = pill.getAttribute('data-goal');
        document.getElementById('goalSelectedDisplay').textContent = this.state.primary_goal;
        this.populateSummaryReview();
        this.triggerAutoSave();
      });
    });

    document.getElementById('btnStep4Back').addEventListener('click', () => {
      this.navigateToStep(3);
    });

    document.getElementById('btnCompleteSetup').addEventListener('click', () => {
      this.submitFinalOnboarding();
    });

    // Dashboard View Actions
    document.getElementById('dashNewOnboardBtn').addEventListener('click', () => {
      sessionStorage.removeItem('vitalhealth_session_id');
      window.location.reload();
    });

    document.getElementById('dashExportJsonBtn').addEventListener('click', () => {
      this.exportHealthRecordJson();
    });

    // Metrics Modal
    this.bindMetricsModal();
  }

  // --------------------------------------------------------------------------
  // Vitals Inputs Synchronization & Live BMI Calculation
  // --------------------------------------------------------------------------
  bindVitalsInputs() {
    const bindSync = (inputId, sliderId, stateKey, min, max) => {
      const numInput = document.getElementById(inputId);
      const slider = document.getElementById(sliderId);

      numInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          slider.value = Math.min(Math.max(val, min), max);
          this.state[stateKey] = val;
        } else {
          this.state[stateKey] = null;
        }
        this.updateBMI();
        this.validateStep2();
        this.triggerAutoSave();
      });

      slider.addEventListener('input', (e) => {
        numInput.value = e.target.value;
        this.state[stateKey] = parseFloat(e.target.value);
        this.updateBMI();
        this.validateStep2();
        this.triggerAutoSave();
      });
    };

    bindSync('vitalAge', 'sliderAge', 'age', 1, 120);
    bindSync('vitalHeight', 'sliderHeight', 'height_cm', 50, 250);
    bindSync('vitalWeight', 'sliderWeight', 'weight_kg', 2, 300);
    bindSync('vitalStepLength', 'sliderStepLength', 'step_length_cm', 20, 150);
  }

  updateBMI() {
    const h = parseFloat(this.state.height_cm);
    const w = parseFloat(this.state.weight_kg);

    if (h && w && h > 0 && w > 0) {
      const h_m = h / 100;
      const bmi = parseFloat((w / (h_m * h_m)).toFixed(1));
      this.state.calculated_bmi = bmi;

      const bmiNumEl = document.getElementById('bmiNumber');
      const badgeEl = document.getElementById('bmiCategoryBadge');
      const needleEl = document.getElementById('gaugeNeedle');

      if (bmiNumEl) bmiNumEl.textContent = bmi;

      let category = 'Normal Weight';
      let badgeClass = 'normal';
      let needlePct = 50;

      if (bmi < 18.5) {
        category = 'Underweight';
        badgeClass = 'under';
        needlePct = Math.max(10, (bmi / 18.5) * 25);
      } else if (bmi <= 24.9) {
        category = 'Normal Weight';
        badgeClass = 'normal';
        needlePct = 25 + ((bmi - 18.5) / (24.9 - 18.5)) * 25;
      } else if (bmi <= 29.9) {
        category = 'Overweight';
        badgeClass = 'over';
        needlePct = 50 + ((bmi - 25) / (29.9 - 25)) * 25;
      } else {
        category = 'Obese';
        badgeClass = 'obese';
        needlePct = Math.min(95, 75 + ((bmi - 30) / 15) * 25);
      }

      if (badgeEl) {
        badgeEl.textContent = category;
        badgeEl.className = `bmi-badge ${badgeClass}`;
      }
      if (needleEl) {
        needleEl.style.left = `${needlePct}%`;
      }
    }
  }

  syncConditionText() {
    const chipsArr = Array.from(this.selectedConditionTags);
    const currentInput = document.getElementById('conditionInput').value;
    
    // Combine chips with any extra free text
    const extraParts = currentInput.split(',').map(s => s.trim()).filter(s => s && !this.selectedConditionTags.has(s));
    const merged = [...chipsArr, ...extraParts].join(', ');
    
    document.getElementById('conditionInput').value = merged;
    this.state.condition_details = merged;
    this.validateStep3();
    this.triggerAutoSave();
  }

  syncAllergyText() {
    const chipsArr = Array.from(this.selectedAllergyTags);
    const currentInput = document.getElementById('allergyInput').value;
    
    const extraParts = currentInput.split(',').map(s => s.trim()).filter(s => s && !this.selectedAllergyTags.has(s));
    const merged = [...chipsArr, ...extraParts].join(', ');
    
    document.getElementById('allergyInput').value = merged;
    this.state.allergy_details = merged;
    this.validateStep4();
    this.populateSummaryReview();
    this.triggerAutoSave();
  }

  // --------------------------------------------------------------------------
  // Validations
  // --------------------------------------------------------------------------
  validateStep1() {
    const nameValid = this.state.full_name && this.state.full_name.trim().length >= 1;
    const genderValid = this.state.gender === 'Male' || this.state.gender === 'Female';

    const feedback = document.getElementById('fullNameFeedback');
    if (!nameValid && this.state.full_name !== '') {
      feedback.classList.add('visible');
    } else {
      feedback.classList.remove('visible');
    }

    const isValid = nameValid && genderValid;
    document.getElementById('btnStep1Next').disabled = !isValid;
    return isValid;
  }

  validateStep1_5() {
    const isValid = this.state.gender === 'Female' && 
      ['Pregnant', 'Postpartum', 'Neither'].includes(this.state.maternal_status);
    
    document.getElementById('btnStep1_5Next').disabled = !isValid;
    return isValid;
  }

  validateStep2() {
    const age = parseFloat(this.state.age);
    const height = parseFloat(this.state.height_cm);
    const weight = parseFloat(this.state.weight_kg);
    const stepLength = this.state.step_length_cm !== null ? parseFloat(this.state.step_length_cm) : null;

    const ageOk = !isNaN(age) && age >= 1 && age <= 120;
    const heightOk = !isNaN(height) && height >= 50 && height <= 250;
    const weightOk = !isNaN(weight) && weight >= 2 && weight <= 300;
    const stepOk = stepLength === null || (!isNaN(stepLength) && stepLength >= 20 && stepLength <= 150);

    document.getElementById('ageFeedback').classList.toggle('visible', !ageOk);
    document.getElementById('heightFeedback').classList.toggle('visible', !heightOk);
    document.getElementById('weightFeedback').classList.toggle('visible', !weightOk);
    document.getElementById('stepLengthFeedback').classList.toggle('visible', !stepOk);

    const isValid = ageOk && heightOk && weightOk && stepOk;
    document.getElementById('btnStep2Next').disabled = !isValid;
    return isValid;
  }

  validateStep3() {
    const wellbeingOk = this.state.wellbeing === 'Healthy' || this.state.wellbeing === 'Unhealthy';
    let conditionOk = true;

    if (this.state.wellbeing === 'Unhealthy') {
      conditionOk = Boolean(this.state.condition_details && this.state.condition_details.trim().length > 0);
      document.getElementById('conditionFeedback').classList.toggle('visible', !conditionOk);
    } else {
      document.getElementById('conditionFeedback').classList.remove('visible');
    }

    const isValid = wellbeingOk && conditionOk;
    document.getElementById('btnStep3Next').disabled = !isValid;
    return isValid;
  }

  validateStep4() {
    let allergyOk = true;
    if (this.state.has_allergies) {
      allergyOk = Boolean(this.state.allergy_details && this.state.allergy_details.trim().length > 0);
      document.getElementById('allergyFeedback').classList.toggle('visible', !allergyOk);
    } else {
      document.getElementById('allergyFeedback').classList.remove('visible');
    }

    const isValid = allergyOk;
    document.getElementById('btnCompleteSetup').disabled = !isValid;
    return isValid;
  }

  // --------------------------------------------------------------------------
  // Step Navigation Engine & Dynamic Progress
  // --------------------------------------------------------------------------
  navigateToStep(stepNumber) {
    const elapsed = Math.round((Date.now() - this.stepStartTime) / 1000);
    this.logTelemetry(`step_${this.currentStep}`, 'step_complete', elapsed);

    this.currentStep = stepNumber;
    this.stepStartTime = Date.now();

    this.updateUIForCurrentStep();
    this.logTelemetry(`step_${this.currentStep}`, 'step_view');
    this.triggerAutoSave();
  }

  jumpToStep(stepNumber) {
    this.navigateToStep(stepNumber);
  }

  updateUIForCurrentStep() {
    // Hide all step panels
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));

    const stepPanelMap = {
      1: 'stepPanel1',
      1.5: 'stepPanel1_5',
      2: 'stepPanel2',
      3: 'stepPanel3',
      4: 'stepPanel4'
    };

    const activePanelId = stepPanelMap[this.currentStep];
    const activePanel = document.getElementById(activePanelId);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    // Dynamic Step Metadata
    const isFemale = this.state.gender === 'Female';
    const totalSteps = isFemale ? 5 : 4;

    let stepIndexDisplay = 1;
    let subtag = 'STEP 1 • DEMOGRAPHICS';
    let heading = 'Basic Information';
    let desc = "Let's establish your baseline identity before tailoring your health profile.";
    let progressPercent = 25;

    if (this.currentStep === 1) {
      stepIndexDisplay = 1;
      progressPercent = isFemale ? 20 : 25;
      subtag = 'STEP 1 • DEMOGRAPHICS';
      heading = 'Basic Information';
      desc = "Let's establish your baseline identity before tailoring your health profile.";
      this.validateStep1();
    } else if (this.currentStep === 1.5) {
      stepIndexDisplay = 2;
      progressPercent = 40;
      subtag = 'STEP 2 (SPECIALIZED) • MATERNAL WELLNESS';
      heading = 'Maternal Health Status';
      desc = 'Tailoring safety margins and nutritional guidelines for maternal wellness.';
      this.validateStep1_5();
    } else if (this.currentStep === 2) {
      stepIndexDisplay = isFemale ? 3 : 2;
      progressPercent = isFemale ? 60 : 50;
      subtag = isFemale ? 'STEP 3 • BIOMETRICS' : 'STEP 2 • BIOMETRICS';
      heading = 'Vitals & Measurements';
      desc = 'Baseline biometric metrics for personalized risk assessments and caloric targets.';
      this.validateStep2();
    } else if (this.currentStep === 3) {
      stepIndexDisplay = isFemale ? 4 : 3;
      progressPercent = isFemale ? 80 : 75;
      subtag = isFemale ? 'STEP 4 • CLINICAL STATUS' : 'STEP 3 • CLINICAL STATUS';
      heading = 'Current Health Status';
      desc = 'Tell us how you feel today and any active conditions under management.';
      this.validateStep3();
    } else if (this.currentStep === 4) {
      stepIndexDisplay = isFemale ? 5 : 4;
      progressPercent = 100;
      subtag = isFemale ? 'STEP 5 • ALLERGIES & REVIEW' : 'STEP 4 • ALLERGIES & REVIEW';
      heading = 'Allergies & Final Confirmation';
      desc = 'Review your baseline clinical summary before finalizing your profile.';
      this.validateStep4();
      this.populateSummaryReview();
    }

    // Update Progress Header UI
    document.getElementById('circularStepText').textContent = stepIndexDisplay;
    document.getElementById('circularTotalText').textContent = `of ${totalSteps}`;
    document.getElementById('stepSubtag').textContent = subtag;
    document.getElementById('stepHeading').textContent = heading;
    document.getElementById('stepDesc').textContent = desc;

    // Update Circular Meter
    const circleFill = document.getElementById('circleFillPath');
    circleFill.setAttribute('stroke-dasharray', `${progressPercent}, 100`);

    // Update Linear Bar
    document.getElementById('linearProgressBar').style.width = `${progressPercent}%`;

    // Render Step Nodes
    this.renderStepNodes(isFemale);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderStepNodes(isFemale) {
    const container = document.getElementById('stepNodesContainer');
    const nodes = isFemale
      ? [
          { key: 1, label: '1. Basics' },
          { key: 1.5, label: '2. Maternal' },
          { key: 2, label: '3. Vitals' },
          { key: 3, label: '4. Health' },
          { key: 4, label: '5. Review' }
        ]
      : [
          { key: 1, label: '1. Basics' },
          { key: 2, label: '2. Vitals' },
          { key: 3, label: '3. Health' },
          { key: 4, label: '4. Review' }
        ];

    container.innerHTML = nodes.map(node => {
      let statusClass = '';
      if (node.key === this.currentStep) {
        statusClass = 'active';
      } else if (node.key < this.currentStep) {
        statusClass = 'completed';
      }
      return `
        <div class="step-node-item ${statusClass}">
          <span class="step-node-dot"></span>
          <span>${node.label}</span>
        </div>
      `;
    }).join('');
  }

  // --------------------------------------------------------------------------
  // Summary Panel Population
  // --------------------------------------------------------------------------
  populateSummaryReview() {
    document.getElementById('sumName').textContent = this.state.full_name || 'Not provided';
    document.getElementById('sumGender').textContent = this.state.gender || '-';

    const maternalRow = document.getElementById('sumMaternalRow');
    if (this.state.gender === 'Female' && this.state.maternal_status) {
      maternalRow.style.display = 'block';
      document.getElementById('sumMaternal').textContent = this.state.maternal_status;
    } else {
      maternalRow.style.display = 'none';
    }

    document.getElementById('sumAge').textContent = `${this.state.age || '-'} years`;
    document.getElementById('sumHeightWeight').textContent = `${this.state.height_cm || '-'} cm / ${this.state.weight_kg || '-'} kg`;
    
    const bmi = this.state.calculated_bmi || '-';
    document.getElementById('sumBmi').textContent = `${bmi} BMI`;
    
    document.getElementById('sumStepLength').textContent = this.state.step_length_cm 
      ? `${this.state.step_length_cm} cm` 
      : 'Default estimated';

    document.getElementById('sumWellbeing').textContent = this.state.wellbeing || 'Not specified';
    document.getElementById('sumCondition').textContent = this.state.wellbeing === 'Unhealthy'
      ? (this.state.condition_details || 'Managing condition')
      : 'No active conditions reported';

    document.getElementById('sumDisability').textContent = this.state.has_disability
      ? (this.state.disability_details || 'Reported')
      : 'None';

    document.getElementById('sumAllergies').textContent = this.state.has_allergies
      ? (this.state.allergy_details || 'Reported')
      : 'No known allergies';

    document.getElementById('sumGoal').textContent = this.state.primary_goal;
  }

  // --------------------------------------------------------------------------
  // Auto-Save Draft & Resume
  // --------------------------------------------------------------------------
  triggerAutoSave() {
    clearTimeout(this.draftDebounceTimer);
    const indicator = document.getElementById('draftIndicator');
    const statusText = document.getElementById('draftStatusText');

    if (indicator) indicator.classList.add('saving');
    if (statusText) statusText.textContent = 'Saving...';

    this.draftDebounceTimer = setTimeout(async () => {
      try {
        await fetch('/api/onboarding/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: this.session_id,
            current_step: this.currentStep,
            draft_data: this.state
          })
        });
        if (indicator) indicator.classList.remove('saving');
        if (statusText) statusText.textContent = 'Draft auto-saved';
      } catch (err) {
        console.warn('Draft auto-save warning:', err);
      }
    }, 600);
  }

  async restoreDraftIfExists() {
    try {
      const res = await fetch(`/api/onboarding/draft/${this.session_id}`);
      const data = await res.json();
      if (data.exists && data.draft && data.draft.draft_data) {
        const d = data.draft.draft_data;
        this.state = { ...this.state, ...d };
        this.currentStep = data.draft.current_step || 1;

        // Restore Form UI fields
        if (this.state.full_name) {
          document.getElementById('fullNameInput').value = this.state.full_name;
        }
        if (this.state.gender === 'Female') {
          document.getElementById('tileGenderFemale').classList.add('selected');
        } else if (this.state.gender === 'Male') {
          document.getElementById('tileGenderMale').classList.add('selected');
        }
        if (this.state.maternal_status) {
          const card = document.querySelector(`.radio-card[data-maternal="${this.state.maternal_status}"]`);
          if (card) card.classList.add('selected');
        }

        document.getElementById('vitalAge').value = this.state.age;
        document.getElementById('sliderAge').value = this.state.age;
        document.getElementById('vitalHeight').value = this.state.height_cm;
        document.getElementById('sliderHeight').value = this.state.height_cm;
        document.getElementById('vitalWeight').value = this.state.weight_kg;
        document.getElementById('sliderWeight').value = this.state.weight_kg;
        if (this.state.step_length_cm) {
          document.getElementById('vitalStepLength').value = this.state.step_length_cm;
          document.getElementById('sliderStepLength').value = this.state.step_length_cm;
        }

        if (this.state.wellbeing === 'Healthy') {
          document.getElementById('wellbeingHealthy').classList.add('selected');
        } else if (this.state.wellbeing === 'Unhealthy') {
          document.getElementById('wellbeingUnhealthy').classList.add('selected');
          document.getElementById('conditionRevealBox').classList.add('visible');
          document.getElementById('conditionInput').value = this.state.condition_details || '';
        }

        if (this.state.has_disability) {
          document.getElementById('disabilityToggle').checked = true;
          document.getElementById('disabilityDetailsBox').classList.add('visible');
          document.getElementById('disabilityInput').value = this.state.disability_details || '';
        }

        if (this.state.has_allergies) {
          document.getElementById('allergyYesBtn').classList.add('active');
          document.getElementById('allergyNoBtn').classList.remove('active');
          document.getElementById('allergyDetailsReveal').classList.add('visible');
          document.getElementById('allergyInput').value = this.state.allergy_details || '';
        }

        this.showToast('Resumed previously saved session draft.', 'success');
      }
    } catch (e) {
      console.log('No existing draft found.');
    }
  }

  // --------------------------------------------------------------------------
  // Final Submission & Post-Onboarding Transition
  // --------------------------------------------------------------------------
  async submitFinalOnboarding() {
    const btn = document.getElementById('btnCompleteSetup');
    const btnText = document.getElementById('completeBtnText');

    btn.disabled = true;
    btnText.textContent = 'Saving Profile...';

    const payload = {
      session_id: this.session_id,
      full_name: this.state.full_name.trim(),
      gender: this.state.gender,
      maternal_status: this.state.gender === 'Female' ? this.state.maternal_status : null,
      age: parseInt(this.state.age),
      height_cm: parseFloat(this.state.height_cm),
      weight_kg: parseFloat(this.state.weight_kg),
      step_length_cm: this.state.step_length_cm ? parseFloat(this.state.step_length_cm) : null,
      wellbeing: this.state.wellbeing,
      condition_details: this.state.wellbeing === 'Unhealthy' ? this.state.condition_details : null,
      has_disability: Boolean(this.state.has_disability),
      disability_details: this.state.has_disability ? this.state.disability_details : null,
      has_allergies: Boolean(this.state.has_allergies),
      allergy_details: this.state.has_allergies ? this.state.allergy_details : null,
      primary_goal: this.state.primary_goal
    };

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Failed to submit profile.');
      }

      this.showToast('Profile created successfully in SQLite database!', 'success');
      this.renderCompletedDashboard(data.profile);

    } catch (err) {
      this.showToast(`Error: ${err.message}`, 'error');
      btn.disabled = false;
      btnText.textContent = 'Complete Setup';
    }
  }

  renderCompletedDashboard(profile) {
    // Hide wizard flow, show dashboard
    document.getElementById('wizardContainer').style.display = 'none';
    const dashView = document.getElementById('dashboardView');
    dashView.style.display = 'block';

    document.getElementById('dashUserName').textContent = profile.full_name;
    document.getElementById('dashAge').textContent = `${profile.age} yr`;
    document.getElementById('dashHeight').textContent = `${profile.height_cm} cm`;
    document.getElementById('dashWeight').textContent = `${profile.weight_kg} kg`;
    document.getElementById('dashBmi').textContent = `${profile.bmi}`;
    document.getElementById('dashGoal').textContent = profile.primary_goal;

    // Compute vitality baseline score
    let score = 95;
    if (profile.bmi < 18.5 || profile.bmi > 25) score -= 8;
    if (profile.wellbeing === 'Unhealthy') score -= 12;
    if (profile.has_allergies) score -= 3;
    score = Math.max(score, 65);

    document.getElementById('dashVitalityScore').textContent = score;

    // Render personalized recommendations
    const recs = [];
    if (profile.maternal_status === 'Pregnant') {
      recs.push({
        title: 'Maternal Hydration & Heart Rate Monitoring Active',
        desc: 'Custom trimester baselines calibrated for blood volume expansion and gentle cardiovascular zones.'
      });
    } else if (profile.maternal_status === 'Postpartum') {
      recs.push({
        title: 'Postpartum Core & Recovery Tracking',
        desc: 'Personalized recovery pacing and pelvic health milestones configured.'
      });
    }

    if (profile.condition_details && profile.condition_details.toLowerCase().includes('hypertens')) {
      recs.push({
        title: 'Targeted Blood Pressure Check Schedule',
        desc: 'Daily morning resting vitals reminders recommended. Sodium intake tracker enabled.',
        warning: true
      });
    }

    if (profile.has_allergies) {
      recs.push({
        title: `Allergen Safeguard: ${profile.allergy_details}`,
        desc: 'Cross-checked emergency allergen cards available in your clinical record.'
      });
    }

    recs.push({
      title: `Personalized Goal Strategy: ${profile.primary_goal}`,
      desc: 'Targeted weekly cardiovascular minutes and adaptive step targets based on your stride length.'
    });

    const recContainer = document.getElementById('dashRecList');
    recContainer.innerHTML = recs.map(r => `
      <div class="rec-item ${r.warning ? 'warning' : ''}">
        <div>
          <div class="rec-title">${r.title}</div>
          <div class="rec-desc">${r.desc}</div>
        </div>
      </div>
    `).join('');

    this.createdProfile = profile;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  exportHealthRecordJson() {
    if (!this.createdProfile) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.createdProfile, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `vitalhealth_profile_${this.createdProfile.session_id}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  // --------------------------------------------------------------------------
  // Analytics Telemetry & Metrics Modal
  // --------------------------------------------------------------------------
  async logTelemetry(step_name, event_type, time_spent = 0) {
    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.session_id,
          step_name: step_name,
          event_type: event_type,
          time_spent_seconds: time_spent
        })
      });
    } catch (e) {
      // Non-blocking telemetry
    }
  }

  bindMetricsModal() {
    const modal = document.getElementById('metricsModalBackdrop');
    const openBtn = document.getElementById('metricsModalBtn');
    const closeBtn = document.getElementById('closeMetricsModal');
    const closeFooter = document.getElementById('closeMetricsModalFooter');
    const refreshBtn = document.getElementById('refreshMetricsBtn');
    const searchInput = document.getElementById('dbSearchInput');

    const openModal = () => {
      modal.classList.add('open');
      this.fetchMetricsAndDb();
    };

    const closeModal = () => {
      modal.classList.remove('open');
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    closeFooter.addEventListener('click', closeModal);
    refreshBtn.addEventListener('click', () => this.fetchMetricsAndDb());

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    searchInput.addEventListener('input', (e) => {
      this.fetchMetricsAndDb(e.target.value);
    });
  }

  async fetchMetricsAndDb(searchTerm = '') {
    try {
      // 1. Fetch Metrics
      const mRes = await fetch('/api/analytics/metrics');
      const mData = await mRes.json();

      document.getElementById('metricCompletionRate').textContent = `${mData.completion_rate_pct}%`;
      document.getElementById('metricAvgTime').textContent = `${mData.avg_completion_time_seconds}s`;
      document.getElementById('metricVitalsPct').textContent = `${mData.vitals_completeness_pct}%`;
      document.getElementById('metricProfilesCount').textContent = mData.profiles_count;

      // Render Funnel
      const funnelContainer = document.getElementById('funnelBarsContainer');
      const funnelSteps = [
        { key: 'step1_basic_info', label: '1. Basic Info' },
        { key: 'step1_5_maternal', label: '2. Maternal' },
        { key: 'step2_vitals', label: '3. Vitals' },
        { key: 'step3_health_status', label: '4. Health Status' },
        { key: 'step4_allergies', label: '5. Allergies' }
      ];

      const maxCount = Math.max(...Object.values(mData.step_dropoff_funnel), 1);
      funnelContainer.innerHTML = funnelSteps.map(st => {
        const count = mData.step_dropoff_funnel[st.key] || 0;
        const pct = Math.round((count / maxCount) * 100);
        return `
          <div class="funnel-row">
            <span class="funnel-step-name">${st.label}</span>
            <div class="funnel-bar-wrap">
              <div class="funnel-bar-fill" style="width: ${pct}%"></div>
            </div>
            <span class="funnel-count">${count} views</span>
          </div>
        `;
      }).join('');

      // 2. Fetch Profiles from SQLite
      const url = searchTerm ? `/api/profiles?search=${encodeURIComponent(searchTerm)}` : '/api/profiles';
      const pRes = await fetch(url);
      const pData = await pRes.json();

      const tbody = document.getElementById('dbTableBody');
      if (pData.profiles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:#64748b; padding:20px;">No profiles recorded yet.</td></tr>`;
      } else {
        tbody.innerHTML = pData.profiles.map(p => `
          <tr>
            <td><strong>#${p.id}</strong></td>
            <td><strong>${p.full_name}</strong></td>
            <td><span class="sum-badge">${p.gender}</span></td>
            <td>${p.maternal_status || '-'}</td>
            <td>${p.age}</td>
            <td><strong>${p.bmi}</strong></td>
            <td>${p.wellbeing}${p.condition_details ? ` (${p.condition_details})` : ''}</td>
            <td>${p.has_allergies ? (p.allergy_details || 'Yes') : 'None'}</td>
            <td><small>${p.primary_goal}</small></td>
            <td><small>${p.created_at ? p.created_at.split('T')[0] : '-'}</small></td>
          </tr>
        `).join('');
      }

    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Global instance
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new VitalHealthApp();
});
