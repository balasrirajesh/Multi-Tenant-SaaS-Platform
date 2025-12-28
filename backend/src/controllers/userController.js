// const db = require('../config/db'); // db is the pool directly
// const bcrypt = require('bcryptjs');
// const { logAudit } = require('../utils/auditLogger');

// // 1. List Users
// async function listUsers(req, res) {
//   const { tenantId, role } = req.user;
//   const targetTenantId = req.params.tenantId;

//   // Security: Ensure Tenant Admin only accesses their own tenant
//   if (role !== 'super_admin' && tenantId !== targetTenantId) {
//     return res.status(403).json({ success: false, message: 'Access denied' });
//   }

//   try {
//     const result = await db.query(
//       `SELECT id, email, full_name, role, is_active, created_at 
//        FROM users 
//        WHERE tenant_id = $1 
//        ORDER BY created_at DESC`,
//       [targetTenantId]
//     );
//     res.json({ success: true, data: result.rows });
//   } catch (err) {
//     console.error("List Users Error:", err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// }

// // 2. Create User
// async function createUser(req, res) {
//   const { tenantId: requesterTenantId, role: requesterRole } = req.user;
//   const targetTenantId = req.params.tenantId;
//   const { email, password, fullName, role } = req.body; // Expecting 'fullName' from frontend

//   // Security Check
//   if (requesterRole !== 'super_admin' && requesterTenantId !== targetTenantId) {
//     return res.status(403).json({ success: false, message: 'Access denied' });
//   }

//   try {
//     // A. Check Subscription Limits (CRITICAL REQUIREMENT)
//     const limitCheck = await db.query(
//       `SELECT max_users, 
//        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as current_count 
//        FROM tenants WHERE id = $1`,
//       [targetTenantId]
//     );

//     if (limitCheck.rowCount === 0) return res.status(404).json({ message: 'Tenant not found' });

//     const { max_users, current_count } = limitCheck.rows[0];
    
//     if (parseInt(current_count) >= max_users) {
//       return res.status(403).json({ 
//         success: false, 
//         message: `Plan limit reached (${max_users} users). Upgrade to add more.` 
//       });
//     }

//     // B. Check if email exists
//     const emailCheck = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
//     if (emailCheck.rowCount > 0) {
//       return res.status(400).json({ success: false, message: 'Email already exists' });
//     }

//     // C. Hash Password
//     const hash = await bcrypt.hash(password, 10);

//     // D. Insert into DB (Using full_name)
//     const result = await db.query(
//       `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
//        VALUES ($1, $2, $3, $4, $5) 
//        RETURNING id, email, full_name, role, is_active, created_at`,
//       [targetTenantId, email, hash, fullName, role || 'user']
//     );

//     const newUser = result.rows[0];

//     // E. Log Audit
//     await logAudit({ 
//       tenantId: targetTenantId, 
//       userId: req.user.userId, 
//       action: 'CREATE_USER', 
//       entityType: 'user', 
//       entityId: newUser.id,
//       ipAddress: req.ip
//     });

//     res.status(201).json({ success: true, data: newUser, message: 'User added successfully' });

//   } catch (err) {
//     console.error("Create User Error:", err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// }

// module.exports = { listUsers, createUser };

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { logAudit } = require('../utils/auditLogger');

// Helper to validate UUID
const isUUID = (str) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

// 1. LIST USERS
async function listUsers(req, res) {
  const { tenantId, role } = req.user;
  const targetTenantId = req.params.tenantId;

  // Validation: Stop "undefined" errors
  if (!targetTenantId || !isUUID(targetTenantId)) {
    return res.status(400).json({ success: false, message: 'Invalid Tenant ID provided' });
  }

  // Security: Ensure Tenant Admin only accesses their own tenant
  if (role !== 'super_admin' && tenantId !== targetTenantId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  try {
    const result = await db.query(
      `SELECT id, email, full_name, role, is_active, created_at 
       FROM users 
       WHERE tenant_id = $1 
       ORDER BY created_at DESC`,
      [targetTenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("List Users Error:", err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// 2. CREATE USER
async function createUser(req, res) {
  console.log("Create User Request:", req.body); // Debug log

  const { tenantId: requesterTenantId, role: requesterRole } = req.user;
  const targetTenantId = req.params.tenantId;
  const { email, password, fullName, role } = req.body;

  // Validation: Stop "undefined" errors
  if (!targetTenantId || !isUUID(targetTenantId)) {
    return res.status(400).json({ success: false, message: 'Invalid Tenant ID provided' });
  }

  // Security Check
  if (requesterRole !== 'super_admin' && requesterTenantId !== targetTenantId) {
    return res.status(403).json({ success: false, message: 'Access denied: Tenant mismatch' });
  }

  try {
    // A. Check Subscription Limits
    const limitCheck = await db.query(
      `SELECT max_users, 
       (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as current_count 
       FROM tenants WHERE id = $1`,
      [targetTenantId]
    );

    if (limitCheck.rowCount === 0) return res.status(404).json({ message: 'Tenant not found' });

    const { max_users, current_count } = limitCheck.rows[0];
    
    if (parseInt(current_count) >= max_users) {
      return res.status(403).json({ 
        success: false, 
        message: `Plan limit reached (${max_users} users). Upgrade to add more.` 
      });
    }

    // B. Check if email exists
    const emailCheck = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (emailCheck.rowCount > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // C. Hash Password
    const hash = await bcrypt.hash(password, 10);

    // D. Insert into DB
    const result = await db.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, full_name, role, is_active, created_at`,
      [targetTenantId, email, hash, fullName, role || 'user']
    );

    const newUser = result.rows[0];

    // E. Audit Log (Safe Mode)
    try {
      const activeUserId = req.user.id || req.user.userId;
      if (activeUserId && isUUID(activeUserId)) {
        await logAudit({ 
          tenantId: targetTenantId, 
          userId: activeUserId, 
          action: 'CREATE_USER', 
          entityType: 'user', 
          entityId: newUser.id,
          ipAddress: req.ip || '0.0.0.0'
        });
      }
    } catch (auditErr) {
      console.warn("Audit log skipped:", auditErr.message);
    }

    res.status(201).json({ success: true, data: newUser, message: 'User added successfully' });

  } catch (err) {
    console.error("Create User CRASH:", err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
}

module.exports = { listUsers, createUser };