# VitalPulse - Fitness & Health Monitoring System

A modern, full-stack Fitness & Health Tracking Web Application built according to [PRD_Fitness_App (1).docx](file:///c:/Users/harch/Health_Monitoring__System/PRD_Fitness_App%20%281%29.docx).

---

## 🌟 Key Features

### 1. User Registration & Multi-Identifier Login (FR-1)
- **Comprehensive Registration**: Form requiring all 7 specified fields: **Full Name**, **Email ID**, **Phone Number**, **Age**, **Height** (cm), **Weight** (kg), and **Gender**, plus secure password hashing (PBKDF2 / SHA-512).
- **Flexible Authentication**: Log in using **Email ID**, **Username**, or **Phone Number** with password.
- **Session Management**: Authenticated HMAC-SHA256 tokens with role-based access control.

### 2. 3-Way "Forgot Password" Account Recovery Flow (FR-2)
- Recover account using **Username**, **Email ID**, or **Phone Number**.
- Generates a secure 6-digit OTP / verification token valid for 15 minutes.
- Verified password update with instant login re-authentication.

### 3. Fitness Check & Interactive BMI Calculator (FR-3)
- **Unit Conversions**: Seamlessly switch between **Metric** (cm, kg) and **Imperial** (inches, lbs).
- **Dynamic Calculation**: Real-time slider and numeric inputs.
- **Visual Feedback**:
  - Radial arc gauge meter with animated dial needle.
  - Health category categorization: **Underweight** (<18.5), **Normal** (18.5–24.9), **Overweight** (25–29.9), and **Obese** (≥30).
  - Target ideal weight span calculation and personalized diet/exercise recommendations.
- **Health Progression & History**: Interactive Canvas progression trend curve plotting historical checkups against normal healthy zones.

### 4. Proactive Notification Center (FR-4)
- Slide-in Notification Center drawer with live unread counter badge.
- Categorized filters: **All**, **Reminders**, **Health Alerts**, and **Admin Broadcasts**.
- Instant reminder triggers: Hydration 💧, Workout 🏋️, Posture 🧘, and Weekly BMI check ⚖️.
- Granular user reminder preferences management.

### 5. Administrative Portal (FR-5)
- Dedicated Admin dashboard with real-time KPI cards: Total Users, Active Users, Total BMI Records, Suspended Accounts.
- **BMI Distribution Analytics**: Canvas doughnut chart breakdown of population health categories.
- **User Management**: Search, filter by role/status, toggle user status (Active / Suspended / Banned), or remove accounts.
- **System Announcements**: Broadcast alerts to all users or specific accounts.
- **Platform Oversight**: Live security and activity audit log feed.
- **Data Export**: Export complete user registry formatted in JSON.

### 6. Transparent Privacy Policy & GDPR Compliance (FR-6)
- Comprehensive in-app Privacy Policy explaining data collection, encryption, and rights.
- **GDPR Article 20**: "Download My Health Archive (JSON)" one-click data portability.
- **GDPR Article 17**: "Permanently Delete My Account" self-service data erasure.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Start the Application Server
```bash
npm start
```
The server will run at: **`http://localhost:5000`**

### 3. Run Automated Tests
```bash
npm test
```
Or run the complete end-to-end suite:
```bash
node tests/e2e_verification.js
```

---

## 🔑 Pre-Seeded Accounts for Testing

| Role | Identifier (Email / Username) | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@healthapp.com` (Username: `admin`) | `Admin@12345` |
| **Demo User** | `user@healthapp.com` (Username: `alex_fit`) | `User@12345` |

---

## 📁 Project Structure

```
Health_Monitoring__System/
├── PRD_Fitness_App (1).docx      # Product Requirements Document
├── data/                         # Persistent transactional database store
│   └── database.json
├── public/                       # Frontend SPA (HTML5, Vanilla CSS, JS)
│   ├── css/
│   │   └── style.css             # Design tokens, themes, glassmorphism
│   ├── js/
│   │   ├── api.js                # REST client & session manager
│   │   ├── bmi.js                # Gauge renderer & BMI calculator
│   │   ├── notifications.js      # Drawer & reminders manager
│   │   ├── admin.js              # Admin portal & moderation
│   │   └── app.js                # SPA routing & form coordinator
│   └── index.html                # Main application interface
├── server/                       # Node.js & Express backend
│   ├── auth.js                   # JWT signing & role middleware
│   ├── db.js                     # Data persistence & seeding
│   ├── routes/
│   │   ├── authRoutes.js         # Auth, registration, forgot-pwd
│   │   ├── bmiRoutes.js          # BMI calculation & history
│   │   ├── notificationRoutes.js # Notifications & preferences
│   │   ├── adminRoutes.js        # Admin oversight & broadcast
│   │   └── privacyRoutes.js      # Policy & GDPR data export
│   └── server.js                 # Express app entry
├── tests/
│   ├── api_tests.js              # Backend API test suite
│   └── e2e_verification.js       # End-to-end integration tests
└── package.json
```