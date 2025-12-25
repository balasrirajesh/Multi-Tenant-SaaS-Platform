const bcrypt = require('bcrypt');
const db = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { logAudit } = require('../utils/auditLogger');

// EXISTING login function (unchanged)
async function login(req, res) {
  // your existing login code here
}

// GET CURRENT USER
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
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
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
        tenant: row.tenant_id
          ? {
              id: row.tenant_id,
              name: row.tenant_name,
              subdomain: row.subdomain,
              subscriptionPlan: row.subscription_plan,
              maxUsers: row.max_users,
              maxProjects: row.max_projects
            }
          : null
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// LOGOUT
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

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = {
  login,
  getCurrentUser,
  logout
};
