const express = require('express');
const router = express.Router();
const { db, hashPassword, verifyPassword } = require('../db');
const { generateToken, authenticateToken } = require('../auth');

// Helper to sanitize user object
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, password_salt, ...safeUser } = user;
  return safeUser;
}

// Validation helpers
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  // Allow international and standard formats (at least 7 digits)
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

// POST /api/auth/register
// Required fields: Full Name, Email ID, Phone Number, Age, Height, Weight, Gender, Password
router.post('/register', (req, res) => {
  try {
    const { full_name, email, phone, age, height, weight, gender, username, password } = req.body;

    // Validate required fields
    if (!full_name || !email || !phone || !age || !height || !weight || !gender || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Full Name, Email, Phone, Age, Height, Weight, Gender, and Password are all required.'
      });
    }

    // Validate Email
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // Validate Phone
    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number (7-15 digits).' });
    }

    // Validate Age
    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 1 || numAge > 125) {
      return res.status(400).json({ success: false, message: 'Age must be a valid number between 1 and 125.' });
    }

    // Validate Height (cm)
    const numHeight = parseFloat(height);
    if (isNaN(numHeight) || numHeight < 50 || numHeight > 300) {
      return res.status(400).json({ success: false, message: 'Height must be between 50 cm and 300 cm.' });
    }

    // Validate Weight (kg)
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight < 10 || numWeight > 500) {
      return res.status(400).json({ success: false, message: 'Weight must be between 10 kg and 500 kg.' });
    }

    // Validate Gender
    const validGenders = ['Male', 'Female', 'Non-Binary', 'Other', 'Prefer not to say'];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ success: false, message: 'Please select a valid gender option.' });
    }

    // Validate Password strength (at least 6 chars)
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check duplicate email
    if (db.findUserByEmail(email)) {
      return res.status(409).json({ success: false, message: 'An account with this Email ID already exists.' });
    }

    // Check duplicate phone
    if (db.findUserByPhone(phone)) {
      return res.status(409).json({ success: false, message: 'An account with this Phone Number already exists.' });
    }

    // Check username if supplied, or generate default from email
    const finalUsername = username ? username.trim().toLowerCase() : email.split('@')[0].toLowerCase();
    if (db.findUserByUsername(finalUsername)) {
      return res.status(409).json({ success: false, message: 'Username is already taken. Please choose another.' });
    }

    // Hash password
    const { hash, salt } = hashPassword(password);

    // Create user
    const newUser = db.createUser({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      age: numAge,
      height: numHeight,
      weight: numWeight,
      gender,
      username: finalUsername,
      password_hash: hash,
      password_salt: salt,
      role: 'user'
    });

    // Auto calculate initial BMI record
    const heightInMeters = numHeight / 100;
    const bmiValue = Number((numWeight / (heightInMeters * heightInMeters)).toFixed(1));
    let category = 'Normal';
    if (bmiValue < 18.5) category = 'Underweight';
    else if (bmiValue < 25) category = 'Normal';
    else if (bmiValue < 30) category = 'Overweight';
    else category = 'Obese';

    db.addBmiLog({
      user_id: newUser.id,
      height: numHeight,
      weight: numWeight,
      bmi_value: bmiValue,
      category,
      notes: 'Initial registration baseline'
    });

    // Welcome Notification
    db.addNotification({
      user_id: newUser.id,
      type: 'health_alert',
      title: 'Welcome to Health Monitoring System! 🎉',
      message: `Hi ${newUser.full_name}, your account is ready. Your initial BMI is ${bmiValue} (${category}). Track your progress anytime!`,
      link: '#calculator'
    });

    // Audit log
    db.logAudit(newUser.id, 'USER_REGISTERED', `User registered with email ${newUser.email}`, req.ip);

    // Generate session token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered!',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
// Supports login using Email ID, Username, or Phone Number + Password
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Username/Email/Phone and Password.'
      });
    }

    const user = db.findUserByAnyIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. No account matches the provided identifier.' });
    }

    if (user.status === 'suspended' || user.status === 'banned') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. Please contact administrator.' });
    }

    const isMatch = verifyPassword(password, user.password_hash, user.password_salt);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
    }

    // Generate Token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Audit Log
    db.logAudit(user.id, 'USER_LOGIN', `User logged in via identifier: ${identifier}`, req.ip);

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// POST /api/auth/forgot-password/request
// Step 1: Request password recovery using Username, Email ID, or Phone Number
router.post('/forgot-password/request', (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Username, Email ID, or Phone Number to recover your account.'
      });
    }

    const user = db.findUserByAnyIdentifier(identifier);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found matching this Username, Email, or Phone number.'
      });
    }

    // Generate OTP & reset token
    const resetRecord = db.createPasswordReset(user.id, identifier);

    // Audit log
    db.logAudit(user.id, 'FORGOT_PASSWORD_REQUEST', `Password recovery requested for ${user.email}`, req.ip);

    // Notification
    db.addNotification({
      user_id: user.id,
      type: 'health_alert',
      title: 'Security Alert: Password Recovery',
      message: `A password recovery OTP (${resetRecord.otp_code}) was generated for your account. Valid for 15 minutes.`,
      link: '#profile'
    });

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched for ${user.full_name}.`,
      recovery_preview: {
        method: user.email === identifier.toLowerCase() ? 'Email' : (user.phone === identifier ? 'SMS' : 'Account Identifier'),
        destination: user.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + '***') + '@' + user.email.split('@')[1],
        // Provide OTP in response for instant demo testing convenience & simulated environment
        demo_otp: resetRecord.otp_code,
        reset_token: resetRecord.reset_token
      }
    });
  } catch (err) {
    console.error('Forgot password request error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during password reset request.' });
  }
});

// POST /api/auth/forgot-password/verify-and-reset
// Step 2: Verify OTP or Reset Token and update to new password
router.post('/forgot-password/verify-and-reset', (req, res) => {
  try {
    const { identifier, otp_code, new_password } = req.body;

    if (!identifier || !otp_code || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier, verification code, and new password are required.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const verification = db.verifyPasswordReset(identifier, otp_code.trim());
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please request a new one.'
      });
    }

    const { record, user } = verification;

    // Update password
    const { hash, salt } = hashPassword(new_password);
    db.updateUser(user.id, {
      password_hash: hash,
      password_salt: salt
    });

    // Mark reset record as used
    db.markPasswordResetUsed(record.id);

    // Audit log
    db.logAudit(user.id, 'PASSWORD_RESET_SUCCESS', `Password successfully reset for ${user.email}`, req.ip);

    // Add notification
    db.addNotification({
      user_id: user.id,
      type: 'health_alert',
      title: 'Password Successfully Changed 🔒',
      message: 'Your account password has been successfully updated. If this was not you, please contact support immediately.',
      link: '#profile'
    });

    return res.json({
      success: true,
      message: 'Password successfully updated! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Forgot password reset error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during password reset.' });
  }
});

// GET /api/auth/me
// Get current authenticated user profile
router.get('/me', authenticateToken, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  return res.json({ success: true, user: sanitizeUser(user) });
});

// PUT /api/auth/profile
// Update profile info (Full name, phone, age, height, weight, gender)
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { full_name, phone, age, height, weight, gender } = req.body;
    const updates = {};

    if (full_name) updates.full_name = full_name.trim();
    if (gender) updates.gender = gender;

    if (phone) {
      if (!isValidPhone(phone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone format.' });
      }
      // Check if phone taken by other user
      const existingPhoneUser = db.findUserByPhone(phone);
      if (existingPhoneUser && existingPhoneUser.id !== req.user.id) {
        return res.status(409).json({ success: false, message: 'Phone number already in use by another account.' });
      }
      updates.phone = phone.trim();
    }

    if (age !== undefined) {
      const numAge = parseInt(age, 10);
      if (isNaN(numAge) || numAge < 1 || numAge > 125) {
        return res.status(400).json({ success: false, message: 'Age must be between 1 and 125.' });
      }
      updates.age = numAge;
    }

    if (height !== undefined) {
      const numHeight = parseFloat(height);
      if (isNaN(numHeight) || numHeight < 50 || numHeight > 300) {
        return res.status(400).json({ success: false, message: 'Height must be between 50 and 300 cm.' });
      }
      updates.height = numHeight;
    }

    if (weight !== undefined) {
      const numWeight = parseFloat(weight);
      if (isNaN(numWeight) || numWeight < 10 || numWeight > 500) {
        return res.status(400).json({ success: false, message: 'Weight must be between 10 and 500 kg.' });
      }
      updates.weight = numWeight;
    }

    const updatedUser = db.updateUser(req.user.id, updates);
    db.logAudit(req.user.id, 'PROFILE_UPDATED', `Profile updated by ${req.user.email}`, req.ip);

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: sanitizeUser(updatedUser)
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error updating profile.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = db.findUserById(req.user.id);
    const isMatch = verifyPassword(current_password, user.password_hash, user.password_salt);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const { hash, salt } = hashPassword(new_password);
    db.updateUser(user.id, {
      password_hash: hash,
      password_salt: salt
    });

    db.logAudit(user.id, 'PASSWORD_CHANGED', `User changed password from settings`, req.ip);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error changing password.' });
  }
});

module.exports = router;
