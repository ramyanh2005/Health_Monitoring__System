const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../auth');

// Structured Privacy Policy Data
const PRIVACY_POLICY = {
  title: 'Privacy Policy & Health Data Protection',
  last_updated: 'August 24, 2026',
  version: '2026.1',
  dpo_contact: 'privacy@healthapp.com',
  sections: [
    {
      id: 'collection',
      title: '1. Information We Collect',
      content: 'We collect information you provide directly during registration and when utilizing our health tracking tools.',
      points: [
        'Personal Identifiers: Full Name, Email ID, Phone Number, Username, and Age.',
        'Health & Physical Metrics: Height (cm/ft), Weight (kg/lbs), Gender, and calculated Body Mass Index (BMI).',
        'Activity & Fitness Records: Historical BMI calculation timestamps, notes, and progress logs.',
        'Technical & Log Data: IP address, device operating system, session timestamps, and authentication audit logs.'
      ]
    },
    {
      id: 'usage',
      title: '2. How We Use Your Data',
      content: 'Your health and personal metrics are strictly processed to provide personalized fitness tracking, health categorization, and system alerts.',
      points: [
        'Calculating Body Mass Index (BMI) and providing personalized health and nutrition guidance.',
        'Delivering proactive fitness reminders, hydration alerts, and platform announcements.',
        'Maintaining secure authentication, account recovery (3-way verification), and fraud prevention.',
        'Generating anonymized, aggregated platform health trends for research and performance monitoring.'
      ]
    },
    {
      id: 'storage_security',
      title: '3. Data Storage & Cryptographic Security',
      content: 'We adhere to the highest standard of data encryption in transit and at rest.',
      points: [
        'Cryptographic Password Hashing: Passwords are protected using salted PBKDF2 / SHA-512 cryptographic hashing.',
        'Session Integrity: Protected HMAC-SHA256 authenticated security tokens with automated expiration.',
        'Zero Data Monetization: We never sell, rent, or trade your personal or health data to third-party advertisers.'
      ]
    },
    {
      id: 'user_rights',
      title: '4. Your Data Rights (GDPR & CCPA Compliant)',
      content: 'You maintain absolute ownership and control over your personal and health records.',
      points: [
        'Right to Access & Portability: Download a complete copy of all your health records and personal data anytime.',
        'Right to Rectification: Instantly update your profile metrics (height, weight, phone number) from Account Settings.',
        'Right to Erasure (To Be Forgotten): Permanently delete your account and all associated health history at any time.'
      ]
    }
  ]
};

// GET /api/privacy
router.get('/', (req, res) => {
  return res.json({
    success: true,
    policy: PRIVACY_POLICY
  });
});

// POST /api/privacy/export-my-data
// Export all personal data for the logged-in user (GDPR Article 20)
router.post('/export-my-data', authenticateToken, (req, res) => {
  try {
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { password_hash, password_salt, ...safeUser } = user;
    const bmiLogs = db.getBmiLogsByUserId(user.id);
    const notifications = db.getNotificationsByUserId(user.id);
    const preferences = db.getNotificationPreferences(user.id);

    const exportPayload = {
      exported_at: new Date().toISOString(),
      user_profile: safeUser,
      fitness_records: bmiLogs,
      notifications: notifications,
      preferences: preferences,
      compliance_statement: 'Exported under GDPR Data Portability Article 20'
    };

    db.logAudit(user.id, 'DATA_EXPORT_REQUESTED', `User exported personal health archives`, req.ip);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="health_data_${user.username || 'user'}.json"`);
    return res.json(exportPayload);
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during data export.' });
  }
});

// POST /api/privacy/request-deletion
// Permanent account deletion (GDPR Article 17 Right to Erasure)
router.post('/request-deletion', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Primary administrator accounts cannot be deleted directly via self-service. Contact platform owner.'
      });
    }

    db.logAudit(userId, 'ACCOUNT_SELF_DELETED', `User ${user.email} initiated complete account purge`, req.ip);
    db.deleteUser(userId);

    return res.json({
      success: true,
      message: 'Your account and all associated health metrics have been permanently deleted.'
    });
  } catch (err) {
    console.error('Account deletion error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during account deletion.' });
  }
});

module.exports = router;
