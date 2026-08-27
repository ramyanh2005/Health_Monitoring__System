// State management
let state = {
    currentDate: '', // YYYY-MM-DD
    waterIntake: 0, // in ml
    waterTarget: 3000, // 3.0 Liters
    loggedWorkouts: [], // array of { type, duration, timestamp }
    workoutTarget: 30, // 30 minutes
    dietPreference: 'balanced',
    timerInterval: null,
    timerSeconds: 0,
    isTimerRunning: false,
    cameraStream: null,
    allLogs: {} // stores all date keys and logs
};

let progressChartInstance = null;

// Meal database matching user requirements
const mealDatabase = {
    balanced: {
        breakfast: {
            title: "Oatmeal with Almonds & Berries",
            kcal: "380 kcal",
            desc: "Complex carbohydrates and high fiber for sustained energy levels.",
            protein: "12g", carbs: "55g", fats: "8g"
        },
        lunch: {
            title: "Grilled Chicken Salad",
            kcal: "450 kcal",
            desc: "Lean protein with fresh greens to aid muscle repair and post-op tissue recovery.",
            protein: "35g", carbs: "15g", fats: "14g"
        },
        dinner: {
            title: "Baked Salmon & Quinoa",
            kcal: "520 kcal",
            desc: "Omega-3 rich diet combating inflammation and promoting overall systemic healing.",
            protein: "42g", carbs: "38g", fats: "20g"
        }
    },
    keto: {
        breakfast: {
            title: "Avocado & Bacon Scrambled Eggs",
            kcal: "490 kcal",
            desc: "Healthy fats and zero refined sugars to maintain steady blood glucose.",
            protein: "24g", carbs: "4g", fats: "41g"
        },
        lunch: {
            title: "Keto Cobb Salad with Creamy Dressing",
            kcal: "580 kcal",
            desc: "Rich protein blend combined with leafy greens and a healthy fat profile.",
            protein: "38g", carbs: "6g", fats: "45g"
        },
        dinner: {
            title: "Garlic Butter Steak with Asparagus",
            kcal: "610 kcal",
            desc: "High protein steak coupled with fiber-rich roasted green asparagus.",
            protein: "48g", carbs: "5g", fats: "44g"
        }
    },
    vegan: {
        breakfast: {
            title: "Tofu Scramble with Spinach & Toast",
            kcal: "350 kcal",
            desc: "Plant-based protein rich in iron, zinc, and energy-providing carbohydrates.",
            protein: "18g", carbs: "36g", fats: "12g"
        },
        lunch: {
            title: "Chickpea & Quinoa Buddha Bowl",
            kcal: "480 kcal",
            desc: "Fibers and clean carbohydrates loaded with essential amino acids.",
            protein: "16g", carbs: "68g", fats: "14g"
        },
        dinner: {
            title: "Lentil Dahl with Brown Rice",
            kcal: "510 kcal",
            desc: "Warm comforting spices that promote gut health and supply dense fiber.",
            protein: "22g", carbs: "78g", fats: "10g"
        }
    }
};

// Backend API Base URL
const API_BASE = '/api';

// Load data from Backend on initiation
async function initializeApp() {
    // Set default date to today in YYYY-MM-DD local format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    state.currentDate = `${year}-${month}-${day}`;

    // Populate default picker value
    const datePicker = document.getElementById('dashboardDatePicker');
    datePicker.value = state.currentDate;
    
    // Bind Picker listener
    datePicker.addEventListener('change', async function() {
        state.currentDate = this.value;
        await fetchBackendState();
    });

    // Presentation text Date
    updateTodayText();

    // Initialize Navigation clicks
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Fetch state from server
    await fetchBackendState();

    // Populate UI components
    loadSuggestedMeals();
}

function updateTodayText() {
    const dateParts = state.currentDate.split('-');
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = dateObj.toLocaleDateString('en-US', dateOptions);
}

// Fetch all states from node backend server
async function fetchBackendState() {
    updateTodayText();
    try {
        const response = await fetch(`${API_BASE}/state?date=${state.currentDate}`);
        if (response.ok) {
            const data = await response.json();
            state.waterIntake = data.selectedDateData.waterIntake;
            state.loggedWorkouts = data.selectedDateData.loggedWorkouts;
            state.allLogs = data.allLogs;
        }
    } catch (err) {
        console.error("Failed to connect to backend. Falling back to local storage.", err);
        const storedWater = localStorage.getItem(`aura_water_${state.currentDate}`) || '0';
        state.waterIntake = parseInt(storedWater);
        const storedWorkouts = localStorage.getItem(`aura_workouts_${state.currentDate}`) || '[]';
        state.loggedWorkouts = JSON.parse(storedWorkouts);
        state.allLogs = {};
    }
    
    updateWaterUI();
    updateExerciseUI();
    renderProgressChart();
}

// Tab router
function switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id === `tab-${tabName}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });

    if (tabName === 'scanner') {
        startCamera();
    } else {
        stopCamera();
    }
}

// Water intake logic
async function addWater(amount) {
    try {
        const response = await fetch(`${API_BASE}/water`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: state.currentDate, amount })
        });
        if (response.ok) {
            const data = await response.json();
            state.waterIntake = data.selectedDateData.waterIntake;
            state.allLogs = data.allLogs;
        } else {
            state.waterIntake += amount;
        }
    } catch (err) {
        state.waterIntake += amount;
    }
    localStorage.setItem(`aura_water_${state.currentDate}`, state.waterIntake);
    updateWaterUI();
    renderProgressChart();
}

async function resetWater() {
    try {
        const response = await fetch(`${API_BASE}/water/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: state.currentDate })
        });
        if (response.ok) {
            const data = await response.json();
            state.waterIntake = data.selectedDateData.waterIntake;
            state.allLogs = data.allLogs;
        } else {
            state.waterIntake = 0;
        }
    } catch (err) {
        state.waterIntake = 0;
    }
    localStorage.setItem(`aura_water_${state.currentDate}`, state.waterIntake);
    updateWaterUI();
    renderProgressChart();
}

function updateWaterUI() {
    const liters = (state.waterIntake / 1000).toFixed(2);
    const percentage = Math.min(Math.round((state.waterIntake / state.waterTarget) * 100), 100);
    
    document.getElementById('water-current-liter').innerText = liters;
    document.getElementById('water-percent-label').innerText = `${percentage}%`;
    document.getElementById('overview-water-val').innerText = liters;
    
    document.getElementById('liquid-level').style.height = `${percentage}%`;
    document.getElementById('overview-water-progress').style.width = `${percentage}%`;
}

// Exercise Logging Logic
function handleExerciseSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('workoutType').value;
    const duration = parseInt(document.getElementById('workoutDuration').value);
    
    logWorkout(type, duration);
}

function quickLogWorkout(type, duration) {
    logWorkout(type, duration);
}

async function logWorkout(type, duration) {
    try {
        const response = await fetch(`${API_BASE}/exercise`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: state.currentDate, type, duration })
        });
        if (response.ok) {
            const data = await response.json();
            state.loggedWorkouts = data.selectedDateData.loggedWorkouts;
            state.allLogs = data.allLogs;
        } else {
            state.loggedWorkouts.push({
                type, duration,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }
    } catch (err) {
        state.loggedWorkouts.push({
            type, duration,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    }

    localStorage.setItem(`aura_workouts_${state.currentDate}`, JSON.stringify(state.loggedWorkouts));
    updateExerciseUI();
    renderProgressChart();
    
    const toast = document.createElement('div');
    toast.className = 'toast-alert';
    toast.innerText = `Logged ${duration}m of ${type}!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function updateExerciseUI() {
    const historyList = document.getElementById('exerciseHistory');
    historyList.innerHTML = '';
    
    let totalMinutes = 0;
    
    if (state.loggedWorkouts.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No activities logged for selected date yet.</div>';
    } else {
        state.loggedWorkouts.forEach(workout => {
            totalMinutes += workout.duration;
            
            const item = document.createElement('div');
            item.className = 'logged-exercise-item';
            item.innerHTML = `
                <div>
                    <h4>${workout.type}</h4>
                    <span>Logged at ${workout.timestamp}</span>
                </div>
                <strong>${workout.duration} mins</strong>
            `;
            historyList.appendChild(item);
        });
    }

    document.getElementById('overview-exercise-val').innerText = totalMinutes;
    const percentage = Math.min(Math.round((totalMinutes / state.workoutTarget) * 100), 100);
    document.getElementById('overview-exercise-progress').style.width = `${percentage}%`;
}

// Stopwatch Workout Timer Logic
function toggleWorkoutTimer() {
    const btn = document.getElementById('timerStartBtn');
    const saveBtn = document.getElementById('timerSaveBtn');
    
    if (state.isTimerRunning) {
        clearInterval(state.timerInterval);
        state.isTimerRunning = false;
        btn.innerText = 'Resume Timer';
        saveBtn.style.display = 'inline-flex';
    } else {
        state.isTimerRunning = true;
        btn.innerText = 'Pause Timer';
        saveBtn.style.display = 'none';
        
        state.timerInterval = setInterval(() => {
            state.timerSeconds++;
            const mins = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
            const secs = (state.timerSeconds % 60).toString().padStart(2, '0');
            document.getElementById('timerDisplay').innerText = `${mins}:${secs}`;
        }, 1000);
    }
}

function saveTimerWorkout() {
    clearInterval(state.timerInterval);
    const duration = Math.max(Math.round(state.timerSeconds / 60), 1);
    const type = document.getElementById('workoutType').value;
    
    logWorkout(type, duration);
    
    state.timerSeconds = 0;
    state.isTimerRunning = false;
    document.getElementById('timerDisplay').innerText = '00:00';
    document.getElementById('timerStartBtn').innerText = 'Start Timer';
    document.getElementById('timerSaveBtn').style.display = 'none';
}

// Meal Advisor Suggestions Loading
function loadSuggestedMeals() {
    const preference = document.getElementById('dietPreference').value;
    state.dietPreference = preference;
    const data = mealDatabase[preference];
    
    document.getElementById('meal-breakfast-title').innerText = data.breakfast.title;
    document.getElementById('meal-breakfast-kcal').innerText = data.breakfast.kcal;
    document.getElementById('meal-breakfast-desc').innerText = data.breakfast.desc;
    document.getElementById('meal-breakfast-prot').innerText = data.breakfast.protein;
    document.getElementById('meal-breakfast-carb').innerText = data.breakfast.carbs;
    document.getElementById('meal-breakfast-fat').innerText = data.breakfast.fats;

    document.getElementById('meal-lunch-title').innerText = data.lunch.title;
    document.getElementById('meal-lunch-kcal').innerText = data.lunch.kcal;
    document.getElementById('meal-lunch-desc').innerText = data.lunch.desc;
    document.getElementById('meal-lunch-prot').innerText = data.lunch.protein;
    document.getElementById('meal-lunch-carb').innerText = data.lunch.carbs;
    document.getElementById('meal-lunch-fat').innerText = data.lunch.fats;

    document.getElementById('meal-dinner-title').innerText = data.dinner.title;
    document.getElementById('meal-dinner-kcal').innerText = data.dinner.kcal;
    document.getElementById('meal-dinner-desc').innerText = data.dinner.desc;
    document.getElementById('meal-dinner-prot').innerText = data.dinner.protein;
    document.getElementById('meal-dinner-carb').innerText = data.dinner.carbs;
    document.getElementById('meal-dinner-fat').innerText = data.dinner.fats;

    document.getElementById('overview-breakfast-title').innerText = data.breakfast.title;
    document.getElementById('overview-breakfast-nut').innerText = `${data.breakfast.kcal} | Protein: ${data.breakfast.protein}`;
    
    document.getElementById('overview-lunch-title').innerText = data.lunch.title;
    document.getElementById('overview-lunch-nut').innerText = `${data.lunch.kcal} | Protein: ${data.lunch.protein}`;
    
    document.getElementById('overview-dinner-title').innerText = data.dinner.title;
    document.getElementById('overview-dinner-nut').innerText = `${data.dinner.kcal} | Protein: ${data.dinner.protein}`;
}

// Camera Scanner Logic
async function startCamera() {
    const video = document.getElementById('videoFeed');
    const placeholder = document.getElementById('viewportPlaceholder');
    const captureBtn = document.getElementById('captureBtn');
    
    // Explicit options: Try back camera first on phones, fallback to front/default on laptop
    const constraints = {
        video: { facingMode: { ideal: 'environment' } }
    };
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        state.cameraStream = stream;
        video.srcObject = stream;
        video.classList.remove('hidden');
        placeholder.classList.add('hidden');
        captureBtn.removeAttribute('disabled');
        document.getElementById('cameraStatusMsg').innerText = "Live camera stream connected.";
    } catch (err) {
        console.warn("Back camera facing mode unavailable. Trying default video sources...", err);
        try {
            // Secondary fallback if strict environment constraints fail
            const genericStream = await navigator.mediaDevices.getUserMedia({ video: true });
            state.cameraStream = genericStream;
            video.srcObject = genericStream;
            video.classList.remove('hidden');
            placeholder.classList.add('hidden');
            captureBtn.removeAttribute('disabled');
            document.getElementById('cameraStatusMsg').innerText = "Live camera stream connected.";
        } catch (fallbackErr) {
            console.warn("Camera hardware access denied/unavailable.", fallbackErr);
            document.getElementById('cameraStatusMsg').innerText = "Camera blocked or not found. Please click 'Upload Image File' or select a Demo Meal below.";
            video.classList.add('hidden');
            placeholder.classList.remove('hidden');
            captureBtn.setAttribute('disabled', 'true');
        }
    }
}

function stopCamera() {
    if (state.cameraStream) {
        state.cameraStream.getTracks().forEach(track => track.stop());
        state.cameraStream = null;
    }
    const video = document.getElementById('videoFeed');
    if (video) video.classList.add('hidden');
    
    const placeholder = document.getElementById('viewportPlaceholder');
    if (placeholder) placeholder.classList.remove('hidden');
}

// Capture photo and upload base64 to server
function captureAndAnalyze() {
    const video = document.getElementById('videoFeed');
    const canvas = document.getElementById('photoCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    video.classList.add('hidden');
    canvas.classList.remove('hidden');
    
    const imageData = canvas.toDataURL('image/jpeg');
    triggerScanningSequence(imageData, null);
}

// Trigger hidden file input click
function triggerFileSelect() {
    document.getElementById('imageFileInput').click();
}

// Read the uploaded image file as Base64 Data URL and display in canvas viewport
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Draw image onto viewport canvas to render preview
        const canvas = document.getElementById('photoCanvas');
        const video = document.getElementById('videoFeed');
        const placeholder = document.getElementById('viewportPlaceholder');
        const ctx = canvas.getContext('2d');
        
        video.classList.add('hidden');
        placeholder.classList.add('hidden');
        canvas.classList.remove('hidden');
        
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Run scanning engine simulation and upload payload
            triggerScanningSequence(imageData, null);
        };
        img.src = imageData;
    };
    reader.readAsDataURL(file);
}

// Trigger simulation of a demo item
function simulateDemoFood(foodId) {
    const canvas = document.getElementById('photoCanvas');
    const video = document.getElementById('videoFeed');
    const placeholder = document.getElementById('viewportPlaceholder');
    
    video.classList.add('hidden');
    canvas.classList.add('hidden');
    placeholder.classList.remove('hidden');
    
    triggerScanningSequence(null, foodId);
}

function triggerScanningSequence(imageData, foodId) {
    const readyBox = document.getElementById('analysisReadyState');
    const scanBox = document.getElementById('analysisScanningState');
    const resultBox = document.getElementById('analysisResultState');
    const laser = document.getElementById('scanLaser');
    
    readyBox.classList.add('hidden');
    resultBox.classList.add('hidden');
    scanBox.classList.remove('hidden');
    laser.classList.remove('hidden');
    
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    
    step1.className = "scan-step font-weight-bold";
    step1.innerText = "Initializing backend scanner connection...";
    step2.className = "scan-step text-muted";
    step2.innerText = "Uploading frame payload...";
    step3.className = "scan-step text-muted";
    step3.innerText = "Running AI computer vision assessment...";

    setTimeout(() => {
        step1.className = "scan-step text-success";
        step1.innerText = "✓ Server connected successfully";
        step2.className = "scan-step font-weight-bold";
        
        setTimeout(() => {
            step2.className = "scan-step text-success";
            step2.innerText = "✓ Visual frame loaded on backend";
            step3.className = "scan-step font-weight-bold";
            
            postScanPayload(imageData, foodId);
        }, 1000);
    }, 800);
}

async function postScanPayload(imageData, foodId) {
    const step3 = document.getElementById('step3');
    try {
        const response = await fetch(`${API_BASE}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData, foodId: foodId })
        });
        
        if (response.ok) {
            const parsedResult = await response.json();
            step3.className = "scan-step text-success";
            step3.innerText = "✓ AI classification complete";
            
            setTimeout(() => {
                displayAIAnalysisResult(parsedResult);
            }, 500);
        } else {
            throw new Error("Server analysis failed");
        }
    } catch (err) {
        console.error(err);
        step3.className = "scan-step text-danger";
        step3.innerText = "✗ Backend AI query failed";
        
        setTimeout(() => {
            displayAIAnalysisResult({
                title: "[Offline Fallback] Fresh Salad",
                verdict: "Approved",
                isHealthy: true,
                cal: "250 kcal",
                prot: "5g",
                carbs: "10g",
                explanation: "The connection to the backend was lost, but this looks like a healthy alternative for recovery.",
                compliance: "Correct choice! General green light."
            });
        }, 1000);
    }
}

function displayAIAnalysisResult(info) {
    const scanBox = document.getElementById('analysisScanningState');
    const resultBox = document.getElementById('analysisResultState');
    const laser = document.getElementById('scanLaser');
    
    laser.classList.add('hidden');
    scanBox.classList.add('hidden');
    resultBox.classList.remove('hidden');
    
    document.getElementById('reportFoodTitle').innerText = info.title;
    document.getElementById('reportVerdictBadge').innerText = info.verdict;
    document.getElementById('reportCal').innerText = info.cal;
    document.getElementById('reportProt').innerText = info.prot;
    document.getElementById('reportCarbs').innerText = info.carbs;
    document.getElementById('reportExplanation').innerText = info.explanation;
    
    const complianceBox = document.getElementById('complianceBox');
    complianceBox.innerHTML = `<strong>Dietary Recommendation:</strong> ${info.compliance}`;
    
    const header = document.getElementById('reportHeader');
    if (info.isHealthy || info.verdict === 'Approved') {
        resultBox.className = "analysis-report approved-state";
        header.querySelector('.verdict-icon').innerText = "✓";
    } else {
        resultBox.className = "analysis-report danger-state";
        header.querySelector('.verdict-icon').innerText = "✗";
    }
}

// --- Chart.js Progress Visualization Rendering ---
function renderProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    const dateLabels = [];
    const waterData = [];
    const exerciseData = [];
    
    const activeDateParts = state.currentDate.split('-');
    const activeDate = new Date(activeDateParts[0], activeDateParts[1] - 1, activeDateParts[2]);

    for (let i = 6; i >= 0; i--) {
        const d = new Date(activeDate);
        d.setDate(activeDate.getDate() - i);
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dateLabels.push(label);
        
        if (state.allLogs && state.allLogs[dateStr]) {
            waterData.push(state.allLogs[dateStr].waterIntake / 1000);
            
            let dailyExerciseMin = 0;
            state.allLogs[dateStr].loggedWorkouts.forEach(w => dailyExerciseMin += w.duration);
            exerciseData.push(dailyExerciseMin);
        } else {
            waterData.push(0);
            exerciseData.push(0);
        }
    }

    if (progressChartInstance) {
        progressChartInstance.destroy();
    }

    progressChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dateLabels,
            datasets: [
                {
                    label: 'Water (Liters)',
                    data: waterData,
                    backgroundColor: 'rgba(0, 242, 254, 0.45)',
                    borderColor: '#00F2FE',
                    borderWidth: 2,
                    borderRadius: 6,
                    yAxisID: 'y-water',
                    type: 'bar'
                },
                {
                    label: 'Exercise (Minutes)',
                    data: exerciseData,
                    borderColor: '#FF9F43',
                    backgroundColor: 'rgba(255, 159, 67, 0.1)',
                    borderWidth: 3,
                    tension: 0.35,
                    pointBackgroundColor: '#FF9F43',
                    pointHoverRadius: 6,
                    yAxisID: 'y-exercise',
                    type: 'line'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#8E9AA8',
                        font: { family: 'Outfit', size: 12, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: '#121629',
                    titleColor: '#F1F3F9',
                    bodyColor: '#F1F3F9',
                    borderColor: 'rgba(0, 242, 254, 0.2)',
                    borderWidth: 1,
                    titleFont: { family: 'Outfit', weight: '700' },
                    bodyFont: { family: 'Outfit' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.03)' },
                    ticks: { color: '#8E9AA8', font: { family: 'Outfit', weight: '500' } }
                },
                'y-water': {
                    type: 'linear',
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.03)' },
                    ticks: {
                        color: '#00F2FE',
                        font: { family: 'Outfit', weight: '600' },
                        callback: function(value) { return value + ' L'; }
                    },
                    min: 0,
                    suggestedMax: 3.5
                },
                'y-exercise': {
                    type: 'linear',
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: {
                        color: '#FF9F43',
                        font: { family: 'Outfit', weight: '600' },
                        callback: function(value) { return value + ' min'; }
                    },
                    min: 0,
                    suggestedMax: 45
                }
            }
        }
    });
}

// Run setup on load
window.addEventListener('DOMContentLoaded', initializeApp);
window.addEventListener('beforeunload', stopCamera);
