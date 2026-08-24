const crypto = require('crypto');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'health_monitoring_system_secret_key_2026';

// Token generation using signed HMAC-SHA256
function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours expiry
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (expectedSig !== signature) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }

  const user = db.findUserById(payload.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User account not found.' });
  }

  if (user.status === 'suspended' || user.status === 'banned') {
    return res.status(403).json({ success: false, message: 'Account is currently suspended. Contact support.' });
  }

  req.user = {
    id: user.id,
    email: user.email,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    status: user.status
  };

  next();
}

// Admin Authorization Middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Administrator privileges required.' });
  }
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  requireAdmin
};
