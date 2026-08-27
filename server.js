const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, 'db.json');

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static frontend assets
app.use(express.static(__dirname));

// DB Helper functions
function readDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            const initialData = { dailyLogs: {} };
            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(data);
        if (!parsed.dailyLogs) {
            return { dailyLogs: {} };
        }
        return parsed;
    } catch (err) {
        console.error("Error reading database:", err);
        return { dailyLogs: {} };
    }
}

function writeDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing database:", err);
    }
}

// Local mock database for food items when Gemini is offline/disabled
const localFoodDatabase = {
    avocado_salad: {
        title: "Fresh Avocado Salad",
        verdict: "Approved",
        isHealthy: true,
        cal: "280 kcal",
        prot: "6g",
        carbs: "12g",
        explanation: "Excellent choice! This salad contains dense healthy fats from avocado and vital vitamins from green veggies, aiding tissue rebuild and calming post-recovery inflammation.",
        compliance: "Correct choice! Extremely compliant with recovery diet."
    },
    grilled_salmon: {
        title: "Grilled Salmon with Veggies",
        verdict: "Approved",
        isHealthy: true,
        cal: "410 kcal",
        prot: "36g",
        carbs: "8g",
        explanation: "Highly recommended! Packed with premium lean proteins and omega-3 fatty acids, which enhance cellular repair and heart-rate recovery.",
        compliance: "Correct choice! Perfect protein source for recovery."
    },
    pepperoni_pizza: {
        title: "Pepperoni Pizza Slice",
        verdict: "Limit / Avoid",
        isHealthy: false,
        cal: "320 kcal",
        prot: "12g",
        carbs: "38g",
        explanation: "Contains high amounts of saturated fats and excessive sodium, which can cause fluid retention and increase systemic cardiovascular workload during recovery.",
        compliance: "Avoid/Limit: Not suitable for active health recovery."
    },
    glazed_donut: {
        title: "Sugar Glazed Donut",
        verdict: "Limit / Avoid",
        isHealthy: false,
        cal: "290 kcal",
        prot: "3g",
        carbs: "42g",
        explanation: "Loaded with refined sugars and zero quality fiber. Triggers instant glucose spikes and crashes, creating energy instability and high inflammation profiles.",
        compliance: "Avoid: High sugar content delays recovery phases."
    }
};

// Ensure active date structures exist
function ensureDateStructure(db, date) {
    if (!db.dailyLogs) db.dailyLogs = {};
    if (!db.dailyLogs[date]) {
        db.dailyLogs[date] = {
            waterIntake: 0,
            loggedWorkouts: []
        };
    }
}

// --- API Endpoints ---

// Get state for a specific date
app.get('/api/state', (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ error: "Missing date parameter" });
    }
    
    const db = readDB();
    ensureDateStructure(db, date);
    writeDB(db);
    
    res.json({
        selectedDateData: db.dailyLogs[date],
        allLogs: db.dailyLogs
    });
});

// Increment water intake
app.post('/api/water', (req, res) => {
    const { date, amount } = req.body;
    if (!date || typeof amount !== 'number') {
        return res.status(400).json({ error: "Missing date or amount parameter" });
    }
    
    const db = readDB();
    ensureDateStructure(db, date);
    db.dailyLogs[date].waterIntake += amount;
    writeDB(db);
    
    res.json({
        selectedDateData: db.dailyLogs[date],
        allLogs: db.dailyLogs
    });
});

// Reset water intake
app.post('/api/water/reset', (req, res) => {
    const { date } = req.body;
    if (!date) {
        return res.status(400).json({ error: "Missing date parameter" });
    }
    
    const db = readDB();
    ensureDateStructure(db, date);
    db.dailyLogs[date].waterIntake = 0;
    writeDB(db);
    
    res.json({
        selectedDateData: db.dailyLogs[date],
        allLogs: db.dailyLogs
    });
});

// Log a workout
app.post('/api/exercise', (req, res) => {
    const { date, type, duration } = req.body;
    if (!date || !type || typeof duration !== 'number') {
        return res.status(400).json({ error: "Missing date, type or duration" });
    }
    
    const db = readDB();
    ensureDateStructure(db, date);
    
    const workout = {
        type,
        duration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    db.dailyLogs[date].loggedWorkouts.push(workout);
    writeDB(db);
    
    res.json({
        selectedDateData: db.dailyLogs[date],
        allLogs: db.dailyLogs
    });
});

// AI Food Scanner endpoint
app.post('/api/scan', async (req, res) => {
    const { image, foodId } = req.body;

    // 1. If a specific demo chip foodId is supplied, return it from the local DB immediately
    if (foodId && localFoodDatabase[foodId]) {
        return res.json(localFoodDatabase[foodId]);
    }

    // Check if an image is provided
    if (!image) {
        return res.status(400).json({ error: "No image payload found" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Fall back to simulation if no API key is specified
    if (!apiKey) {
        console.log("No GEMINI_API_KEY found. Simulating image scanning...");
        const keys = Object.keys(localFoodDatabase);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const simulatedResult = { ...localFoodDatabase[randomKey] };
        simulatedResult.title = `[Simulated] ${simulatedResult.title}`;
        return res.json(simulatedResult);
    }

    // 3. Make live Gemini API request
    try {
        console.log("GEMINI_API_KEY detected. Making live image analysis request to Gemini...");
        const base64Data = image.split(',')[1] || image;
        const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{
                parts: [
                    {
                        text: `You are Aura, an AI recovery dietitian. Analyze this meal image. Determine if it is 'Approved' (healthy recovery meal) or 'Limit / Avoid' (unhealthy/high sugar/high sodium). Return a JSON response matching exactly this format:
                        {
                          "title": "Name of the detected food",
                          "verdict": "Approved" or "Limit / Avoid",
                          "isHealthy": true or false,
                          "cal": "Estimated calories (e.g., 350 kcal)",
                          "prot": "Estimated protein (e.g., 20g)",
                          "carbs": "Estimated carbohydrates (e.g., 40g)",
                          "explanation": "Detailed paragraph explanation of how this food affects post-recovery or recovery in general.",
                          "compliance": "Short recommendation sentence."
                        }
                        Do not wrap the JSON output in markdown formatting, return only raw JSON.`
                    },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API HTTP Error ${response.status}: ${errorText}`);
        }

        const responseData = await response.json();
        const outputText = responseData.contents[0].parts[0].text;
        const parsedResult = JSON.parse(outputText.trim());
        
        res.json(parsedResult);
    } catch (err) {
        console.error("Gemini API request failed:", err);
        const keys = Object.keys(localFoodDatabase);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const errorResult = { ...localFoodDatabase[randomKey] };
        errorResult.title = `[API Error Fallback] ${errorResult.title}`;
        res.json(errorResult);
    }
});

// Run server listening on 0.0.0.0 for cross-device availability
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aura Health Server successfully listening on http://0.0.0.0:${PORT} (Accessible across local network)`);
});
