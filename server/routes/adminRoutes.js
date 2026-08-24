const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireAdmin } = require('../auth');

// Protect all admin routes
router.use(authenticateToken, requireAdmin);

// Helper to sanitize users
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, password_salt, ...safe } = user;
  return safe;
}

// GET /api/admin/overview
// Aggregate statistics, KPI metrics, BMI distribution, system health
router.get('/overview', (req, res) => {
  try {
    const users = db.getAllUsers();
    const allBmiLogs = db.data.bmi_logs;
    const settings = db.getSystemSettings();

    const totalUsers = users.length;
    const regularUsers = users.filter(u => u.role !== 'admin').length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const suspendedUsers = users.filter(u => u.status === 'suspended' || u.status === 'banned').length;

    // Calculate latest BMI category distribution
    const categoryCounts = {
      Underweight: 0,
      Normal: 0,
      Overweight: 0,
      Obese: 0
    };

    // Find latest BMI for each user
    users.forEach(user => {
      const userLogs = allBmiLogs
        .filter(l => l.user_id === user.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (userLogs.length > 0) {
        const cat = userLogs[0].category;
        if (categoryCounts[cat] !== undefined) {
          categoryCounts[cat]++;
        }
      }
    });

    const recentUsers = users
      .slice(-5)
      .reverse()
      .map(u => sanitizeUser(u));

    return res.json({
      success: true,
      stats: {
        totalUsers,
        regularUsers,
        activeUsers,
        suspendedUsers,
        totalBmiRecords: allBmiLogs.length,
        categoryCounts,
        systemSettings: settings,
        recentUsers
      }
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/admin/users
// Search and filter user accounts
router.get('/users', (req, res) => {
  try {
    const { search = '', status = 'all', role = 'all' } = req.query;
    let users = db.getAllUsers();

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      users = users.filter(u =>
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))
      );
    }

    if (status !== 'all') {
      users = users.filter(u => u.status === status);
    }

    if (role !== 'all') {
      users = users.filter(u => u.role === role);
    }

    // Attach latest BMI info
    const enrichedUsers = users.map(user => {
      const logs = db.getBmiLogsByUserId(user.id);
      const latestLog = logs.length > 0 ? logs[0] : null;
      return {
        ...sanitizeUser(user),
        latest_bmi: latestLog ? latestLog.bmi_value : null,
        latest_category: latestLog ? latestLog.category : null,
        bmi_records_count: logs.length
      };
    });

    return res.json({
      success: true,
      count: enrichedUsers.length,
      users: enrichedUsers
    });
  } catch (err) {
    console.error('Admin users fetch error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/admin/users/:id
// Get user details with full health history
router.get('/users/:id', (req, res) => {
  try {
    const user = db.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const bmiLogs = db.getBmiLogsByUserId(user.id);
    const notifications = db.getNotificationsByUserId(user.id);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      bmi_logs: bmiLogs,
      notifications: notifications
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// PUT /api/admin/users/:id/status
// Update user status (active, suspended, banned)
router.put('/users/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'suspended', 'banned'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const targetUser = db.findUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot modify your own administrator account status.' });
    }

    const updated = db.updateUser(targetUser.id, { status });
    db.logAudit(req.user.id, 'USER_STATUS_CHANGED', `User ${targetUser.email} status changed to ${status}`, req.ip);

    return res.json({
      success: true,
      message: `User status changed to ${status}.`,
      user: sanitizeUser(updated)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// DELETE /api/admin/users/:id
// Delete a user account
router.delete('/users/:id', (req, res) => {
  try {
    const targetUser = db.findUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active administrator account.' });
    }

    db.deleteUser(targetUser.id);
    db.logAudit(req.user.id, 'USER_DELETED', `Admin deleted user ${targetUser.email}`, req.ip);

    return res.json({ success: true, message: `User ${targetUser.email} has been permanently deleted.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/admin/broadcast
// Send broadcast notification to all users or specific user
router.post('/broadcast', (req, res) => {
  try {
    const { title, message, target = 'all', type = 'admin_broadcast', link = '#privacy' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required for broadcast.' });
    }

    if (target === 'all') {
      const users = db.getAllUsers().filter(u => u.role !== 'admin');
      users.forEach(u => {
        db.addNotification({
          user_id: u.id,
          type,
          title: `📢 ${title}`,
          message,
          link
        });
      });

      db.logAudit(req.user.id, 'BROADCAST_SENT', `Broadcast "${title}" sent to ${users.length} users`, req.ip);

      return res.status(201).json({
        success: true,
        message: `Broadcast successfully dispatched to ${users.length} users!`
      });
    } else {
      const singleUser = db.findUserById(target);
      if (!singleUser) {
        return res.status(404).json({ success: false, message: 'Target user not found.' });
      }

      db.addNotification({
        user_id: singleUser.id,
        type,
        title: `📢 ${title}`,
        message,
        link
      });

      db.logAudit(req.user.id, 'ADMIN_MESSAGE_SENT', `Admin message sent to ${singleUser.email}`, req.ip);

      return res.status(201).json({
        success: true,
        message: `Direct message dispatched to ${singleUser.full_name}!`
      });
    }
  } catch (err) {
    console.error('Broadcast error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/admin/audit-logs
// View system audit trail
router.get('/audit-logs', (req, res) => {
  try {
    const logs = db.getAuditLogs(100);
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/admin/export-users
// Export user dataset
router.get('/export-users', (req, res) => {
  try {
    const users = db.getAllUsers().map(u => {
      const safe = sanitizeUser(u);
      const bmiLogs = db.getBmiLogsByUserId(u.id);
      return {
        ...safe,
        bmi_records_count: bmiLogs.length,
        latest_bmi: bmiLogs[0] ? bmiLogs[0].bmi_value : 'N/A',
        latest_category: bmiLogs[0] ? bmiLogs[0].category : 'N/A'
      };
    });

    db.logAudit(req.user.id, 'ADMIN_EXPORT_USERS', `Admin exported full user registry`, req.ip);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="health_users_export.json"');
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// PUT /api/admin/settings
// Update system settings
router.put('/settings', (req, res) => {
  try {
    const { maintenance_mode, registration_enabled, policy_version } = req.body;
    const updates = {};
    if (maintenance_mode !== undefined) updates.maintenance_mode = Boolean(maintenance_mode);
    if (registration_enabled !== undefined) updates.registration_enabled = Boolean(registration_enabled);
    if (policy_version !== undefined) updates.policy_version = policy_version;

    const updated = db.updateSystemSettings(updates);
    db.logAudit(req.user.id, 'SYSTEM_SETTINGS_UPDATED', `Admin updated platform configuration`, req.ip);

    return res.json({
      success: true,
      message: 'System settings updated successfully!',
      settings: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
