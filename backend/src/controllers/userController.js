const db = require('../config/db');
const bcrypt = require('bcryptjs'); // Use bcryptjs for compatibility
const { logAudit } = require('../utils/auditLogger');

// 1. List Users
async function listUsers(req, res) {
  const { tenantId, role } = req.user;

  try {
    let result;
    if (role === 'super_admin') {
      // Super Admin: See ALL users + their company name
      result = await db.query(
        `SELECT u.id, u.email, u.name, u.role, u.tenant_id, t.name as tenant_name 
         FROM users u
         LEFT JOIN tenants t ON u.tenant_id = t.id
         ORDER BY u.created_at DESC`
      );
    } else {
      // Tenant Admin: See ONLY users in their company
      result = await db.query(
        `SELECT id, email, name, role FROM users WHERE tenant_id = $1 ORDER BY created_at DESC`,
        [tenantId]
      );
    }
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("List Users Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// 2. Create User (Fixes "Invalid Credentials")
async function createUser(req, res) {
  const { tenantId, userId } = req.user; // The person CREATING the user
  const { email, password, name, role } = req.body; // Note: using 'name' not 'fullName'

  try {
    // Hash the password (CRITICAL STEP)
    const hash = await bcrypt.hash(password, 10);

    // Insert into DB
    const result = await db.query(
      `INSERT INTO users (tenant_id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role`,
      [tenantId, email, hash, name, role]
    );

    // Log the action
    await logAudit({ tenantId, userId, action: 'CREATE_USER', entityType: 'user', entityId: result.rows[0].id });

    res.status(201).json({ success: true, data: result.rows[0] });

  } catch (err) {
    console.error("Create User Error:", err);
    // Handle duplicate email error
    if (err.code === '23505') {
       return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { listUsers, createUser };