const { verifyToken } = require('../utils/token');
const prisma = require('../config/db');

const PRIMARY_ADMIN_EMAIL = (process.env.PRIMARY_ADMIN_EMAIL || 'haerulmuhammad01@gmail.com').toLowerCase().trim();

/**
 * Helper to parse cookies from req.headers.cookie without requiring external packages
 */
function parseCookies(req) {
  const cookies = {};
  const header = req.headers.cookie;
  if (!header) return cookies;

  header.split(';').forEach(pair => {
    const parts = pair.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      try {
        cookies[key] = decodeURIComponent(val);
      } catch (e) {
        cookies[key] = val;
      }
    }
  });
  return cookies;
}

/**
 * Extracts session token from Cookie or Bearer header
 */
function extractToken(req) {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Cookie: mh_admin_session=<token>
  const cookies = parseCookies(req);
  if (cookies['mh_admin_session']) {
    return cookies['mh_admin_session'];
  }

  return null;
}

/**
 * Checks if an email is an authorized administrator
 */
async function isAuthorizedAdmin(email) {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.toLowerCase().trim();

  // 1. Primary Owner is always authorized
  if (cleanEmail === PRIMARY_ADMIN_EMAIL) return true;

  // 2. Check dynamic whitelist in allowed_admins table
  try {
    const admin = await prisma.allowedAdmin.findUnique({
      where: { email: cleanEmail }
    });
    return !!admin;
  } catch (err) {
    console.error('[isAuthorizedAdmin DB check error]:', err.message);
    return false;
  }
}

/**
 * Strict authentication middleware: blocks request if not logged in as authorized admin
 */
async function requireAdminAuth(req, res, next) {
  // Test bypass key for CI/CD automated routing tests (strictly requires environment variable)
  const testKey = req.headers['x-admin-test-key'];
  if (testKey && process.env.ADMIN_TEST_KEY && testKey === process.env.ADMIN_TEST_KEY) {
    req.admin = {
      email: PRIMARY_ADMIN_EMAIL,
      name: 'Muhammad Haerul (Automated Test)',
      is_primary: true
    };
    return next();
  }

  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in with an authorized Google account.'
    });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.email) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid. Please sign in again.'
    });
  }

  const cleanEmail = payload.email.toLowerCase().trim();
  const authorized = await isAuthorizedAdmin(cleanEmail);
  if (!authorized) {
    return res.status(403).json({
      success: false,
      error: `Access denied. Account ${cleanEmail} is not authorized to access the Admin Dashboard.`
    });
  }

  req.admin = {
    email: cleanEmail,
    name: payload.name || 'Administrator',
    avatar: payload.avatar || null,
    is_primary: cleanEmail === PRIMARY_ADMIN_EMAIL || !!payload.is_primary
  };

  next();
}

/**
 * Optional authentication middleware: attaches req.admin if valid, but allows unauthenticated
 */
async function optionalAdminAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    req.admin = null;
    return next();
  }

  const payload = verifyToken(token);
  if (payload && payload.email) {
    const cleanEmail = payload.email.toLowerCase().trim();
    const authorized = await isAuthorizedAdmin(cleanEmail);
    if (authorized) {
      req.admin = {
        email: cleanEmail,
        name: payload.name || 'Administrator',
        avatar: payload.avatar || null,
        is_primary: cleanEmail === PRIMARY_ADMIN_EMAIL || !!payload.is_primary
      };
      return next();
    }
  }

  req.admin = null;
  next();
}

module.exports = {
  requireAdminAuth,
  optionalAdminAuth,
  isAuthorizedAdmin,
  PRIMARY_ADMIN_EMAIL
};
