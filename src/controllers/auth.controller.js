const prisma = require('../config/db');
const { signToken } = require('../utils/token');
const { isAuthorizedAdmin, PRIMARY_ADMIN_EMAIL } = require('../middlewares/auth');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '63633754239-m8rcv6tl3qhqng2fce4vj9ei1gkhtsmr.apps.googleusercontent.com';

/**
 * Public endpoint to get client-side auth configuration
 */
async function getConfig(req, res) {
  res.json({
    success: true,
    googleClientId: GOOGLE_CLIENT_ID,
    primaryEmail: PRIMARY_ADMIN_EMAIL
  });
}

/**
 * Get current authenticated admin profile
 */
async function getMe(req, res) {
  if (!req.admin) {
    return res.json({
      success: true,
      authenticated: false,
      user: null
    });
  }

  res.json({
    success: true,
    authenticated: true,
    user: req.admin
  });
}

/**
 * Verify Google Token & Sign In Admin
 */
async function googleLogin(req, res) {
  try {
    const { credential, accessToken, testEmail } = req.body;

    let googleUser = null;

    // 1. Verify Google ID Token (from Google Identity Services GIS button)
    if (credential) {
      const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
      const googleRes = await fetch(verifyUrl);
      const googleData = await googleRes.json();

      if (!googleRes.ok || googleData.error || !googleData.email) {
        return res.status(400).json({
          success: false,
          error: 'Google ID token verification failed. Please try signing in again.'
        });
      }

      // Check client_id if configured
      if (GOOGLE_CLIENT_ID && googleData.aud !== GOOGLE_CLIENT_ID) {
        console.warn('[Google Auth] aud mismatch:', googleData.aud, 'expected:', GOOGLE_CLIENT_ID);
        return res.status(401).json({
          success: false,
          error: 'ID token Google tidak cocok dengan Google Client ID yang terdaftar.'
        });
      }

      googleUser = {
        email: googleData.email.toLowerCase().trim(),
        name: googleData.name || googleData.email.split('@')[0],
        picture: googleData.picture || null,
        email_verified: googleData.email_verified === 'true' || googleData.email_verified === true
      };
    } 
    // 2. Verify Google OAuth Access Token
    else if (accessToken) {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userData = await userInfoRes.json();

      if (!userInfoRes.ok || !userData.email) {
        return res.status(400).json({
          success: false,
          error: 'Google access token verification failed.'
        });
      }

      googleUser = {
        email: userData.email.toLowerCase().trim(),
        name: userData.name || userData.email.split('@')[0],
        picture: userData.picture || null,
        email_verified: userData.email_verified === true
      };
    } 
    // 3. Optional Local Dev simulation (Only allowed in development or when explicitly requested for primary email)
    else if (testEmail && (process.env.NODE_ENV !== 'production' || req.headers['x-admin-test-key'])) {
      googleUser = {
        email: testEmail.toLowerCase().trim(),
        name: testEmail === PRIMARY_ADMIN_EMAIL ? 'Muhammad Haerul' : testEmail.split('@')[0],
        picture: null,
        email_verified: true
      };
    } 
    else {
      return res.status(400).json({
        success: false,
        error: 'Missing Google credential or access token.'
      });
    }

    const email = googleUser.email;

    // 4. Check if the user's email is an authorized administrator
    const authorized = await isAuthorizedAdmin(email);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        error: `Akses ditolak: Akun ${email} tidak memiliki izin akses ke Dashboard Admin. Hubungi ${PRIMARY_ADMIN_EMAIL} untuk meminta akses.`,
        email
      });
    }

    const isPrimary = email === PRIMARY_ADMIN_EMAIL;

    // 5. Upsert admin record with latest Google profile data
    await prisma.allowedAdmin.upsert({
      where: { email },
      update: {
        name: googleUser.name || undefined,
        avatar: googleUser.picture || undefined,
        is_primary: isPrimary
      },
      create: {
        email,
        name: googleUser.name || email.split('@')[0],
        avatar: googleUser.picture || null,
        is_primary: isPrimary,
        added_by: 'google_login'
      }
    });

    // 6. Sign JWT session token (7-day validity)
    const token = signToken({
      email,
      name: googleUser.name,
      avatar: googleUser.picture,
      is_primary: isPrimary
    }, 7 * 24 * 3600);

    // 7. Set secure HTTP-only Cookie
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      `mh_admin_session=${encodeURIComponent(token)}`,
      'Path=/',
      `Max-Age=${7 * 24 * 3600}`,
      'HttpOnly',
      'SameSite=Lax'
    ];
    if (isProd) {
      cookieOptions.push('Secure');
    }
    res.setHeader('Set-Cookie', cookieOptions.join('; '));

    return res.json({
      success: true,
      token,
      user: {
        email,
        name: googleUser.name,
        avatar: googleUser.picture,
        is_primary: isPrimary
      }
    });
  } catch (err) {
    console.error('[Google Login Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat memproses autentikasi Google.',
      details: err.message
    });
  }
}

/**
 * Log out current admin
 */
async function logout(req, res) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = [
    'mh_admin_session=',
    'Path=/',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'HttpOnly',
    'SameSite=Lax'
  ];
  if (isProd) {
    cookieOptions.push('Secure');
  }
  res.setHeader('Set-Cookie', cookieOptions.join('; '));

  res.json({
    success: true,
    message: 'Berhasil keluar dari sesi admin.'
  });
}

/**
 * List all authorized Google accounts (Protected)
 */
async function listAdmins(req, res) {
  try {
    // Ensure primary admin always exists in DB
    await prisma.allowedAdmin.upsert({
      where: { email: PRIMARY_ADMIN_EMAIL },
      update: { is_primary: true },
      create: {
        email: PRIMARY_ADMIN_EMAIL,
        name: 'Muhammad Haerul',
        is_primary: true,
        added_by: 'system'
      }
    });

    const admins = await prisma.allowedAdmin.findMany({
      orderBy: [
        { is_primary: 'desc' },
        { created_at: 'asc' }
      ]
    });

    res.json({
      success: true,
      count: admins.length,
      data: admins,
      currentAdmin: req.admin
    });
  } catch (err) {
    console.error('[List Admins Error]:', err);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil daftar administrator.',
      details: err.message
    });
  }
}

/**
 * Add a new authorized Google account (Protected)
 */
async function addAdmin(req, res) {
  try {
    const { email, name } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email Google harus diisi.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Format email tidak valid.'
      });
    }

    // Check if already registered
    const existing = await prisma.allowedAdmin.findUnique({
      where: { email: cleanEmail }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Akun Google ${cleanEmail} sudah terdaftar sebagai administrator.`
      });
    }

    const newAdmin = await prisma.allowedAdmin.create({
      data: {
        email: cleanEmail,
        name: name ? name.trim() : cleanEmail.split('@')[0],
        is_primary: cleanEmail === PRIMARY_ADMIN_EMAIL,
        added_by: req.admin ? req.admin.email : 'system'
      }
    });

    res.status(201).json({
      success: true,
      message: `Akun Google ${cleanEmail} berhasil ditambahkan sebagai administrator.`,
      data: newAdmin
    });
  } catch (err) {
    console.error('[Add Admin Error]:', err);
    res.status(500).json({
      success: false,
      error: 'Gagal menambahkan administrator.',
      details: err.message
    });
  }
}

/**
 * Remove an authorized Google account (Protected)
 */
async function removeAdmin(req, res) {
  try {
    const email = req.params.email ? req.params.email.toLowerCase().trim() : '';

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Parameter email harus disertakan.'
      });
    }

    // Protect primary super admin from being removed
    if (email === PRIMARY_ADMIN_EMAIL) {
      return res.status(400).json({
        success: false,
        error: `Primary Super Admin (${PRIMARY_ADMIN_EMAIL}) tidak dapat dihapus.`
      });
    }

    const existing = await prisma.allowedAdmin.findUnique({
      where: { email }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Akun administrator ${email} tidak ditemukan.`
      });
    }

    if (existing.is_primary) {
      return res.status(400).json({
        success: false,
        error: 'Super Admin utama tidak dapat dihapus.'
      });
    }

    await prisma.allowedAdmin.delete({
      where: { email }
    });

    res.json({
      success: true,
      message: `Izin akses administrator untuk ${email} berhasil dicabut.`
    });
  } catch (err) {
    console.error('[Remove Admin Error]:', err);
    res.status(500).json({
      success: false,
      error: 'Gagal mencabut izin administrator.',
      details: err.message
    });
  }
}

module.exports = {
  getConfig,
  getMe,
  googleLogin,
  logout,
  listAdmins,
  addAdmin,
  removeAdmin
};
