const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../auth');

// GET /api/notifications
// Get all notifications for authenticated user
router.get('/', authenticateToken, (req, res) => {
  try {
    const list = db.getNotificationsByUserId(req.user.id);
    const unreadCount = list.filter(n => !n.is_read).length;

    return res.json({
      success: true,
      unreadCount,
      notifications: list
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/notifications/read/:id
// Mark specific notification as read
router.post('/read/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const marked = db.markNotificationRead(id, req.user.id);
    if (!marked) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/notifications/read-all
// Mark all notifications as read
router.post('/read-all', authenticateToken, (req, res) => {
  try {
    const count = db.markAllNotificationsRead(req.user.id);
    return res.json({ success: true, message: `Marked ${count} notifications as read.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// DELETE /api/notifications/:id
// Delete a notification
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteNotification(id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    return res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/notifications/preferences
// Get notification preferences
router.get('/preferences', authenticateToken, (req, res) => {
  try {
    const prefs = db.getNotificationPreferences(req.user.id);
    return res.json({ success: true, preferences: prefs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// PUT /api/notifications/preferences
// Update notification preferences
router.put('/preferences', authenticateToken, (req, res) => {
  try {
    const updated = db.setNotificationPreferences(req.user.id, req.body);
    return res.json({
      success: true,
      message: 'Notification preferences updated successfully!',
      preferences: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/notifications/trigger-reminder
// Trigger on-demand fitness/hydration/health reminder
router.post('/trigger-reminder', authenticateToken, (req, res) => {
  try {
    const { type = 'hydration' } = req.body;
    let title = 'Health Reminder';
    let message = 'Stay active and take care of your body!';
    let link = '#calculator';

    if (type === 'hydration') {
      title = 'Hydration Reminder 💧';
      message = 'Drink a refreshing glass of water now. Proper hydration boosts energy and recovery!';
      link = '#dashboard';
    } else if (type === 'workout') {
      title = 'Workout Time 🏋️';
      message = 'Time for your daily workout session! Even 15-20 minutes of movement makes a big difference.';
      link = '#calculator';
    } else if (type === 'posture') {
      title = 'Posture & Stretch Check 🧘';
      message = 'Take a deep breath, roll your shoulders back, and do a quick 60-second stretch.';
      link = '#dashboard';
    } else if (type === 'bmi_check') {
      title = 'Weekly BMI Checkup ⚖️';
      message = 'Time to measure your weight and record your latest BMI progress in the fitness calculator.';
      link = '#calculator';
    }

    const notif = db.addNotification({
      user_id: req.user.id,
      type: 'reminder',
      title,
      message,
      link
    });

    return res.status(201).json({
      success: true,
      message: 'Reminder sent to your notification center!',
      notification: notif
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
