const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing utility using built-in crypto PBKDF2
function hashPassword(password, salt = null) {
  const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, passwordSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: passwordSalt };
}

function verifyPassword(password, hash, salt) {
  const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return checkHash === hash;
}

// Initial Database Structure
const initialData = {
  users: [],
  bmi_logs: [],
  calorie_logs: [],
  notifications: [],
  password_resets: [],
  notification_preferences: {},
  audit_logs: [],
  system_settings: {
    app_name: 'Health Monitoring System',
    version: '1.0.0',
    maintenance_mode: false,
    registration_enabled: true,
    policy_version: '2026.1',
    last_updated: new Date().toISOString()
  }
};

class Database {
  constructor() {
    this.data = this.load();
    this.seedIfEmpty();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        parsed.calorie_logs = parsed.calorie_logs || [];
        return parsed;
      }
    } catch (err) {
      console.error('Error loading database file, initializing fresh store:', err);
    }
    const fresh = JSON.parse(JSON.stringify(initialData));
    fresh.calorie_logs = fresh.calorie_logs || [];
    return fresh;
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  seedIfEmpty() {
    let modified = false;

    // Seed Admin if not exists
    if (!this.data.users.some(u => u.role === 'admin')) {
      const adminCreds = hashPassword('Admin@12345');
      const adminUser = {
        id: 'usr_admin_001',
        full_name: 'System Administrator',
        email: 'admin@healthapp.com',
        username: 'admin',
        phone: '+1-800-555-0199',
        age: 35,
        height: 175, // cm
        weight: 70,  // kg
        gender: 'Other',
        password_hash: adminCreds.hash,
        password_salt: adminCreds.salt,
        role: 'admin',
        status: 'active',
        created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.users.push(adminUser);
      modified = true;
    }

    // Seed Demo User if not exists
    let demoUser = this.data.users.find(u => u.email === 'user@healthapp.com');
    if (!demoUser) {
      const userCreds = hashPassword('User@12345');
      demoUser = {
        id: 'usr_demo_002',
        full_name: 'Alex Mercer',
        email: 'user@healthapp.com',
        username: 'alex_fit',
        phone: '+1-555-014-8899',
        age: 28,
        height: 178, // cm
        weight: 74.5, // kg
        gender: 'Male',
        password_hash: userCreds.hash,
        password_salt: userCreds.salt,
        role: 'user',
        status: 'active',
        created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.users.push(demoUser);
      modified = true;
    }

    // Seed historical BMI Logs for demo user
    if (this.data.bmi_logs.length === 0) {
      const pastDates = [
        { daysAgo: 24, height: 178, weight: 79.0, notes: 'Initial baseline checkup' },
        { daysAgo: 18, height: 178, weight: 77.8, notes: 'Started morning jogging routine' },
        { daysAgo: 12, height: 178, weight: 76.5, notes: 'Consistent balanced diet' },
        { daysAgo: 6, height: 178, weight: 75.2, notes: 'Feeling energetic & light' },
        { daysAgo: 1, height: 178, weight: 74.5, notes: 'Reached target fitness zone!' }
      ];

      for (let item of pastDates) {
        const hMeter = item.height / 100;
        const bmiVal = Number((item.weight / (hMeter * hMeter)).toFixed(1));
        let category = 'Normal';
        if (bmiVal < 18.5) category = 'Underweight';
        else if (bmiVal < 25) category = 'Normal';
        else if (bmiVal < 30) category = 'Overweight';
        else category = 'Obese';

        this.data.bmi_logs.push({
          id: 'bmi_' + crypto.randomBytes(6).toString('hex'),
          user_id: demoUser.id,
          height: item.height,
          weight: item.weight,
          bmi_value: bmiVal,
          category: category,
          notes: item.notes,
          created_at: new Date(Date.now() - item.daysAgo * 24 * 3600 * 1000).toISOString()
        });
      }
      modified = true;
    }

    // Seed Sample Notifications
    if (this.data.notifications.length === 0) {
      this.data.notifications.push(
        {
          id: 'notif_001',
          user_id: demoUser.id,
          type: 'reminder',
          title: 'Daily Fitness Reminder 🏃‍♂️',
          message: 'Time for your daily workout or 20-minute brisk walk. Keep up the great consistency!',
          is_read: false,
          link: '#calculator',
          created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
        },
        {
          id: 'notif_002',
          user_id: demoUser.id,
          type: 'health_alert',
          title: 'Weekly BMI Milestone 🎯',
          message: 'Your latest BMI of 23.5 is right in the ideal healthy range (18.5 - 24.9). Great job!',
          is_read: false,
          link: '#history',
          created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'notif_003',
          user_id: demoUser.id,
          type: 'admin_broadcast',
          title: 'Platform Update: New Health Insights 💡',
          message: 'Welcome to Health Monitoring System! Personalized nutrition recommendations are now live.',
          is_read: true,
          link: '#privacy',
          created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
        },
        {
          id: 'notif_004',
          user_id: demoUser.id,
          type: 'reminder',
          title: 'Hydration Check 💧',
          message: 'Remember to stay hydrated! Drink a glass of water to support your metabolism.',
          is_read: false,
          link: '#dashboard',
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        }
      );
      modified = true;
    }

    // Seed Sample Calorie / Activity Logs for Demo User
    if (!this.data.calorie_logs || this.data.calorie_logs.length === 0) {
      this.data.calorie_logs = [];
      const sampleActivities = [
        { daysAgo: 0, hoursAgo: 2, activity: 'Morning Jogging 🏃', duration: 30, calories: 280, notes: 'Outdoor park run, steady 5:30/km pace' },
        { daysAgo: 0, hoursAgo: 5, activity: 'Brisk Walking 🚶', duration: 25, calories: 110, notes: 'Post-lunch walk in sunny weather' },
        { daysAgo: 1, hoursAgo: 18, activity: 'Evening Cycling 🚴', duration: 45, calories: 360, notes: 'River trail cardio ride' },
        { daysAgo: 2, hoursAgo: 10, activity: 'Swimming Laps 🏊', duration: 40, calories: 380, notes: 'Freestyle and breaststroke drills' },
        { daysAgo: 3, hoursAgo: 14, activity: 'HIIT Circuit Workout ⚡', duration: 35, calories: 340, notes: 'High intensity interval training session' },
        { daysAgo: 4, hoursAgo: 8, activity: 'Gym Strength Training 🏋️', duration: 50, calories: 310, notes: 'Upper body push & pull compound lifts' },
        { daysAgo: 5, hoursAgo: 12, activity: 'Trail Running 🌲', duration: 45, calories: 420, notes: 'Hill climbs and nature trail cardio' },
        { daysAgo: 6, hoursAgo: 16, activity: 'Yoga & Core Stretching 🧘', duration: 40, calories: 140, notes: 'Flexibility and core stability routines' },
        { daysAgo: 8, hoursAgo: 9, activity: 'Outdoor Cycling 🚴', duration: 50, calories: 410, notes: 'Long endurance distance ride' },
        { daysAgo: 11, hoursAgo: 11, activity: 'Bodyweight Circuit 🤸', duration: 35, calories: 290, notes: 'Calisthenics, burpees, and planks' },
        { daysAgo: 15, hoursAgo: 15, activity: 'Morning Run 🏃', duration: 40, calories: 390, notes: '5K morning cardio workout' },
        { daysAgo: 19, hoursAgo: 10, activity: 'Gym Leg Day 🏋️', duration: 55, calories: 380, notes: 'Squats, lunges, and calf raises' },
        { daysAgo: 23, hoursAgo: 14, activity: 'Rowing Machine & Cardio 🚣', duration: 45, calories: 420, notes: 'Interval rowing intervals' }
      ];

      for (let act of sampleActivities) {
        const timestamp = new Date(Date.now() - (act.daysAgo * 24 + act.hoursAgo) * 3600 * 1000).toISOString();
        this.data.calorie_logs.push({
          id: 'cal_' + crypto.randomBytes(6).toString('hex'),
          user_id: demoUser.id,
          activity: act.activity,
          duration_mins: act.duration,
          calories_burned: act.calories,
          notes: act.notes,
          created_at: timestamp
        });
      }
      modified = true;
    }

    // Seed initial audit log
    if (this.data.audit_logs.length === 0) {
      this.data.audit_logs.push({
        id: 'aud_' + crypto.randomBytes(6).toString('hex'),
        user_id: 'usr_admin_001',
        action: 'SYSTEM_INITIALIZED',
        details: 'Health Monitoring System database seeded and initialized.',
        ip_address: '127.0.0.1',
        timestamp: new Date().toISOString()
      });
      modified = true;
    }

    if (modified) {
      this.save();
    }
  }

  // User methods
  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  findUserByUsername(username) {
    if (!username) return null;
    return this.data.users.find(u => u.username && u.username.toLowerCase() === username.trim().toLowerCase());
  }

  findUserByPhone(phone) {
    if (!phone) return null;
    // Normalize phone digits
    const clean = phone.replace(/[^0-9+]/g, '');
    return this.data.users.find(u => u.phone && u.phone.replace(/[^0-9+]/g, '') === clean);
  }

  findUserByAnyIdentifier(identifier) {
    if (!identifier) return null;
    const cleanId = identifier.trim();
    return (
      this.findUserByEmail(cleanId) ||
      this.findUserByUsername(cleanId) ||
      this.findUserByPhone(cleanId)
    );
  }

  createUser(userData) {
    const id = 'usr_' + crypto.randomBytes(8).toString('hex');
    const newUser = {
      id,
      ...userData,
      role: userData.role || 'user',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const user = this.data.users[index];
    const updated = {
      ...user,
      ...updates,
      id: user.id, // Immutable ID
      role: updates.role !== undefined ? updates.role : user.role,
      updated_at: new Date().toISOString()
    };
    this.data.users[index] = updated;
    this.save();
    return updated;
  }

  deleteUser(id) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.data.users.splice(index, 1);
    // Cascade delete BMI logs and notifications
    this.data.bmi_logs = this.data.bmi_logs.filter(b => b.user_id !== id);
    this.data.notifications = this.data.notifications.filter(n => n.user_id !== id);
    delete this.data.notification_preferences[id];
    this.save();
    return true;
  }

  getAllUsers() {
    return this.data.users;
  }

  // BMI methods
  addBmiLog(logData) {
    const log = {
      id: 'bmi_' + crypto.randomBytes(8).toString('hex'),
      ...logData,
      created_at: logData.created_at || new Date().toISOString()
    };
    this.data.bmi_logs.push(log);
    this.save();
    return log;
  }

  getBmiLogsByUserId(userId) {
    return this.data.bmi_logs
      .filter(l => l.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  deleteBmiLog(id, userId) {
    const index = this.data.bmi_logs.findIndex(l => l.id === id && (userId === null || l.user_id === userId));
    if (index === -1) return false;
    this.data.bmi_logs.splice(index, 1);
    this.save();
    return true;
  }

  // Calorie & Activity Tracking Methods
  addCalorieLog(logData) {
    const log = {
      id: 'cal_' + crypto.randomBytes(8).toString('hex'),
      activity: logData.activity || 'General Workout',
      duration_mins: Number(logData.duration_mins) || 30,
      calories_burned: Number(logData.calories_burned) || 0,
      notes: (logData.notes || '').trim(),
      created_at: logData.created_at || new Date().toISOString(),
      user_id: logData.user_id
    };
    if (!this.data.calorie_logs) this.data.calorie_logs = [];
    this.data.calorie_logs.push(log);
    this.save();
    return log;
  }

  getCalorieLogsByUserId(userId) {
    return (this.data.calorie_logs || [])
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  deleteCalorieLog(id, userId) {
    if (!this.data.calorie_logs) return false;
    const index = this.data.calorie_logs.findIndex(c => c.id === id && (userId === null || c.user_id === userId));
    if (index === -1) return false;
    this.data.calorie_logs.splice(index, 1);
    this.save();
    return true;
  }

  getCalorieSummary(userId) {
    const user = this.findUserById(userId);
    const logs = this.getCalorieLogsByUserId(userId);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

    let todayBurnt = 0;
    let weekBurnt = 0;
    let totalBurntTillNow = 0;

    logs.forEach(l => {
      const burn = Number(l.calories_burned) || 0;
      totalBurntTillNow += burn;
      const lDate = new Date(l.created_at);
      if (l.created_at.startsWith(todayStr) || lDate.toDateString() === now.toDateString()) {
        todayBurnt += burn;
      }
      if (lDate >= sevenDaysAgo) {
        weekBurnt += burn;
      }
    });

    // Compute BMR & Energy Expenditure
    const age = user ? (Number(user.age) || 28) : 28;
    const height = user ? (Number(user.height) || 175) : 175;
    const weight = user ? (Number(user.weight) || 70) : 70;
    const gender = user ? (user.gender || 'Male') : 'Male';

    // Mifflin-St Jeor equation
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender.toLowerCase() === 'female') {
      bmr -= 161;
    } else if (gender.toLowerCase() === 'male') {
      bmr += 5;
    } else {
      bmr -= 78;
    }
    bmr = Math.round(bmr);

    // TDEE with moderate activity factor (1.4)
    const tdee = Math.round(bmr * 1.4);

    // BMI and ideal weight bounds
    const hM = height / 100;
    const currentBmi = Number((weight / (hM * hM)).toFixed(1));
    const minIdealWeight = Number((18.5 * hM * hM).toFixed(1));
    const maxIdealWeight = Number((24.9 * hM * hM).toFixed(1));

    let weightDelta = 0;
    let dailyTargetBurn = 500; // default active calorie burn goal
    let totalCaloriesToBurnForGoal = 0;
    let goalType = 'maintain';

    if (currentBmi >= 25.0) {
      weightDelta = Number((weight - maxIdealWeight).toFixed(1));
      totalCaloriesToBurnForGoal = Math.round(weightDelta * 7700); // 7700 kcal per kg fat
      dailyTargetBurn = 550; // Active deficit goal
      goalType = 'weight_loss';
    } else if (currentBmi < 18.5) {
      weightDelta = Number((minIdealWeight - weight).toFixed(1));
      totalCaloriesToBurnForGoal = 0;
      dailyTargetBurn = 300; // Active strength goal
      goalType = 'weight_gain';
    } else {
      weightDelta = 0;
      totalCaloriesToBurnForGoal = 0;
      dailyTargetBurn = 450; // Active wellness maintenance
      goalType = 'maintain';
    }

    const remainingTodayToBurn = Math.max(0, dailyTargetBurn - todayBurnt);
    const progressPercent = Math.min(100, Math.round((todayBurnt / dailyTargetBurn) * 100));

    return {
      today_burnt: todayBurnt,
      total_burnt_till_now: totalBurntTillNow,
      week_burnt: weekBurnt,
      daily_target_burn: dailyTargetBurn,
      remaining_today_to_burn: remainingTodayToBurn,
      progress_percent: progressPercent,
      total_calories_to_burn_for_goal: totalCaloriesToBurnForGoal,
      weight_delta_kg: weightDelta,
      goal_type: goalType,
      bmr,
      tdee,
      current_bmi: currentBmi,
      ideal_weight_range: { min: minIdealWeight, max: maxIdealWeight, unit: 'kg' },
      logs_count: logs.length
    };
  }

  // Notification methods
  addNotification(notifData) {
    const notif = {
      id: 'notif_' + crypto.randomBytes(8).toString('hex'),
      is_read: false,
      created_at: new Date().toISOString(),
      ...notifData
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  getNotificationsByUserId(userId) {
    return this.data.notifications
      .filter(n => n.user_id === userId || n.user_id === 'all')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  markNotificationRead(id, userId) {
    const notif = this.data.notifications.find(n => n.id === id && (n.user_id === userId || n.user_id === 'all'));
    if (notif) {
      notif.is_read = true;
      this.save();
      return true;
    }
    return false;
  }

  markAllNotificationsRead(userId) {
    let count = 0;
    this.data.notifications.forEach(n => {
      if ((n.user_id === userId || n.user_id === 'all') && !n.is_read) {
        n.is_read = true;
        count++;
      }
    });
    if (count > 0) this.save();
    return count;
  }

  deleteNotification(id, userId) {
    const index = this.data.notifications.findIndex(n => n.id === id && (n.user_id === userId || n.user_id === 'all'));
    if (index === -1) return false;
    this.data.notifications.splice(index, 1);
    this.save();
    return true;
  }

  // Notification Preferences
  getNotificationPreferences(userId) {
    return this.data.notification_preferences[userId] || {
      daily_reminders: true,
      health_alerts: true,
      hydration_reminders: true,
      admin_broadcasts: true,
      email_digest: false
    };
  }

  setNotificationPreferences(userId, prefs) {
    this.data.notification_preferences[userId] = {
      ...this.getNotificationPreferences(userId),
      ...prefs
    };
    this.save();
    return this.data.notification_preferences[userId];
  }

  // Password reset tokens & OTP
  createPasswordReset(userId, identifier) {
    // Invalidate old active resets for this user
    this.data.password_resets = this.data.password_resets.filter(r => r.user_id !== userId || r.used);

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const resetToken = crypto.randomBytes(24).toString('hex');
    const resetRecord = {
      id: 'rst_' + crypto.randomBytes(6).toString('hex'),
      user_id: userId,
      identifier: identifier,
      otp_code: otp,
      reset_token: resetToken,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins
      used: false,
      created_at: new Date().toISOString()
    };
    this.data.password_resets.push(resetRecord);
    this.save();
    return resetRecord;
  }

  verifyPasswordReset(identifier, otpOrToken) {
    const user = this.findUserByAnyIdentifier(identifier);
    if (!user) return null;

    const now = new Date();
    const record = this.data.password_resets.find(r => 
      r.user_id === user.id && 
      !r.used && 
      new Date(r.expires_at) > now &&
      (r.otp_code === otpOrToken || r.reset_token === otpOrToken)
    );

    if (!record) return null;
    return { record, user };
  }

  markPasswordResetUsed(resetId) {
    const record = this.data.password_resets.find(r => r.id === resetId);
    if (record) {
      record.used = true;
      this.save();
    }
  }

  // Audit Logs
  logAudit(userId, action, details, ip = '127.0.0.1') {
    const log = {
      id: 'aud_' + crypto.randomBytes(6).toString('hex'),
      user_id: userId || 'anonymous',
      action,
      details,
      ip_address: ip,
      timestamp: new Date().toISOString()
    };
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
    this.save();
    return log;
  }

  getAuditLogs(limit = 100) {
    return this.data.audit_logs.slice(0, limit);
  }

  // System Settings
  getSystemSettings() {
    return this.data.system_settings;
  }

  updateSystemSettings(updates) {
    this.data.system_settings = {
      ...this.data.system_settings,
      ...updates,
      last_updated: new Date().toISOString()
    };
    this.save();
    return this.data.system_settings;
  }
}

const db = new Database();

module.exports = {
  db,
  hashPassword,
  verifyPassword
};
