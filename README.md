# NutriTrack AI &bull; Disabled Citizen Health & Wellness Dashboard

A modern, accessible, and responsive health-and-wellness dashboard built specifically for **Disabled Citizens** as part of the **NutriTrack AI** health platform.

This module is designed to be **completely modular and self-contained**, making it seamless for any teammate to merge into the team's central repository via GitHub without conflicts or overwriting other dashboards.

---

## 🌟 Key Features & Highlights

- **Dynamic Biometric & BMI Screening**:
  - Calculates BMI dynamically: $\text{BMI} = \text{weight (kg)} / (\text{height (m)})^2$.
  - Real-time gauge indicator (Underweight, Healthy range, Overweight, High).
  - Explicit non-diagnostic medical disclaimers on every metric.

- **Universal Accessibility Suite (WCAG AA/AAA Compliant)**:
  - **Dynamic Text Scaling**: Standard (16px), Large (18px / 115%), Extra Large (20px / 130%).
  - **High Contrast Dark Mode**: Pure high-contrast palette with bold borders and enhanced luminescence.
  - **Reduced Motion Support**: Eliminates layout shifts and animations for motion-sensitive users.
  - **Voice & Audio Guidance**: Text-to-Speech audio reader using the Web Speech API for step-by-step exercise instructions.
  - **Screen Reader Announcements**: Live region (`aria-live="polite"`) updates for all dynamic milestones.
  - **Accessible Controls**: Large touch targets ($\ge 48\text{px}$), visible keyboard focus rings, and semantic HTML5 landmarks (`<main>`, `<header>`, `<section>`, `<article>`).

- **Safety-First Adaptive Exercise System**:
  - Library of seated stretches, joint mobility, and mindful breathing routines.
  - Interactive step-by-step workout player with countdown timers, pause/resume, and voice guidance.
  - Mandatory safety disclaimers: *"Stop if you experience pain, dizziness, or unusual discomfort. Consult a healthcare professional before beginning new physical activity."*

- **Adaptive Daily Goals & Dedicated Water Tracker**:
  - **Hydration Ring**: Circular SVG progress meter, remaining amount indicator, and quick logging (+250ml, +500ml, +750ml, custom amount).
  - **Movement & Mobility Goal**: Tailored for mobility levels (e.g. Wheelchair user, Limited mobility, Assisted walking). Avoids conventional step-count pressure.
  - **Wholesome Nutrition Goal**: Diet-aware meal recommendations (Vegetarian, Vegan, Non-Vegetarian, Low-Sodium, Gluten-Free, Diabetic-Friendly, Balanced).

- **Streaks & Milestone Badges**:
  - 7-day streak tracker with Mon-Sun calendar visualization.
  - Milestone badges (*Hydration Hero*, *Active Starter*, *Healthy Choice*, *7-Day Streak*, *Mindful Mover*, *Consistency Champion*) with unlock fanfare and confetti animations.

- **Future AI Integration Bridge**:
  - Clean modular service layer (`aiRecommendationService.ts`) providing simulated AI health insights, ready to connect directly to the NutriTrack backend / Gemini API.

---

## 🚀 How to Run the Module

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Open in Browser
- **Direct Module Route**: [http://localhost:5175/dashboard/disabled](http://localhost:5175/dashboard/disabled)
- **Team Platform Portal**: [http://localhost:5175/](http://localhost:5175/)

### 4. Build for Production
```bash
npm run build
```

---

## 📂 Project Architecture

```
disabled_people_dashboard/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── src/
│   ├── main.tsx
│   ├── App.tsx                          # App router with /dashboard/disabled and /
│   ├── index.css                        # Design tokens, themes, high contrast & font scaling
│   ├── types/
│   │   ├── user.ts                      # UserProfile, MobilityLevel, DietaryPreference
│   │   ├── wellness.ts                  # DailyGoalStatus, WaterLog, Badge, StreakData
│   │   ├── exercise.ts                  # Exercise, ExerciseStep, safety metadata
│   │   ├── meal.ts                      # MealSuggestion, MealItem
│   │   └── accessibility.ts             # AccessibilitySettings
│   ├── data/
│   │   ├── demoUser.ts                  # Demo profile (Alex, 32yo, 170cm, 65kg, Wheelchair user)
│   │   ├── exercisesData.ts             # Accessible exercise library with safety notes
│   │   ├── mealsData.ts                 # Diet-aware meal recommendations
│   │   ├── badgesData.ts                # Milestone badges
│   │   └── notificationsData.ts         # Gentle wellness notifications
│   ├── services/
│   │   ├── bmiService.ts                # BMI computation & gauge calculation
│   │   ├── storageService.ts            # LocalStorage persistence layer
│   │   ├── wellnessService.ts           # Hydration calculation, celebration triggers
│   │   └── aiRecommendationService.ts   # AI recommendation bridge
│   ├── context/
│   │   ├── AccessibilityContext.tsx     # Font sizing, contrast, audio speech synthesis
│   │   └── WellnessContext.tsx          # Live reactive state for profile, goals, water & badges
│   ├── components/
│   │   ├── common/                      # DisclaimerBanner, ProgressBar, CircularProgress, Modal
│   │   ├── header/                      # DashboardHeader, NotificationDrawer
│   │   ├── summary/                     # HealthSummary (BMI, Weight, Height, Activity)
│   │   ├── profile/                     # WellnessProfileCard, EditProfileModal
│   │   ├── goals/                       # DailyGoals (Water, Movement, Nutrition)
│   │   ├── water/                       # WaterTracker (Ring, quick buttons, logs)
│   │   ├── exercises/                   # ExerciseSection, ExerciseCard, ExercisePlayerModal
│   │   ├── meals/                       # MealSuggestions, MealDetailModal
│   │   ├── progress/                    # WeeklyProgressChart, StreakCard, BadgeSection
│   │   ├── quickActions/                # QuickActions (Large accessible shortcuts)
│   │   ├── ai/                          # AIWellnessInsights
│   │   └── accessibility/               # AccessibilitySettingsModal
│   └── pages/
│       └── DisabledDashboard/
│           ├── DisabledDashboard.tsx    # Master self-contained page
│           └── DisabledDashboard.css    # Responsive grid styles
```

---

## 🤝 GitHub Team Integration Guide

To merge this module into your team's main project:

### 1. Copy Files
Copy the `src/pages/DisabledDashboard/` folder along with the associated `src/components/`, `src/services/`, `src/types/`, `src/data/`, and `src/context/` folders into your main project.

### 2. Register the Route
In your team's central router file (e.g. `App.tsx` or `routes.tsx`):
```tsx
import { DisabledDashboard } from './pages/DisabledDashboard/DisabledDashboard';

// Inside your <Routes>:
<Route path="/dashboard/disabled" element={<DisabledDashboard />} />
```

### 3. Connect User Authentication / Context
When a user logs in and is assigned the `Disabled Citizen` category, navigate to `/dashboard/disabled`. 
The `DisabledDashboard` component automatically initializes with realistic fallback demo data (Alex) or can read from the parent application state/API.

---

## 🛡️ Medical Disclaimer
*All health metrics, suggestions, and exercises provided by this application are general wellness guidance and are not a substitute for professional medical advice, clinical diagnosis, or individualized therapy. Always consult a qualified physician or physical therapist before beginning any new physical regimen.*
