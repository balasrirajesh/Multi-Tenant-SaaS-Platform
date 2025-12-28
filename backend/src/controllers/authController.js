// CHANGE THIS:
// const bcrypt = require('bcrypt'); 

// TO THIS:
const bcrypt = require('bcryptjs'); 
const db = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { logAudit } = require('../utils/auditLogger');
// ... rest of the file stays the same
/**
 * LOGIN
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password, tenantSubdomain } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // 1️⃣ Fetch user
    const userResult = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // 2️⃣ Password check
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // ================= SUPER ADMIN LOGIN =================
    if (user.role === 'super_admin') {
      const token = generateToken({
        userId: user.id,
        tenantId: null,
        role: user.role
      });

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role
          },
          token
        }
      });
    }

    // ================= TENANT USERS LOGIN =================
    if (!tenantSubdomain) {
      return res.status(400).json({
        success: false,
        message: 'tenantSubdomain is required'
      });
    }

    // 3️⃣ Verify tenant
    const tenantResult = await db.query(
      `SELECT * FROM tenants WHERE id = $1 AND subdomain = $2`,
      [user.tenant_id, tenantSubdomain]
    );

    if (tenantResult.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: 'Tenant access denied'
      });
    }

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role
    });

    await logAudit({
      tenantId: user.tenant_id,
      userId: user.id,
      action: 'LOGIN',
      entityType: 'auth',
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * GET CURRENT USER
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
  try {
    const { userId } = req.user;

    const result = await db.query(
      `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.is_active,
        t.id AS tenant_id,
        t.name AS tenant_name,
        t.subdomain,
        t.subscription_plan,
        t.max_users,
        t.max_projects
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1
      `,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const row = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        isActive: row.is_active,
        tenant: row.tenant_id ? {
          id: row.tenant_id,
          name: row.tenant_name,
          subdomain: row.subdomain,
          subscriptionPlan: row.subscription_plan,
          maxUsers: row.max_users,
          maxProjects: row.max_projects
        } : null
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * LOGOUT
 */
async function logout(req, res) {
  try {
    const { userId, tenantId } = req.user;

    await logAudit({
      tenantId,
      userId,
      action: 'LOGOUT',
      entityType: 'auth',
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  login,
  getCurrentUser,
  logout
};
