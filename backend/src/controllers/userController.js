const db = require('../config/db');
const bcrypt = require('bcrypt');
const { logAudit } = require('../utils/auditLogger');

async function listUsers(req, res) {
  const { tenantId, role } = req.user;

  const result = await db.query(
    role === 'super_admin'
      ? `SELECT id, email, full_name, role, tenant_id FROM users`
      : `SELECT id, email, full_name, role FROM users WHERE tenant_id = $1`,
    role === 'super_admin' ? [] : [tenantId]
  );

  res.json({ success: true, data: result.rows });
}

async function createUser(req, res) {
  const { tenantId, userId } = req.user;
  const { email, password, fullName, role } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const result = await db.query(
    `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
     VALUES ($1,$2,$3,$4,$5) RETURNING id,email,full_name,role`,
    [tenantId, email, hash, fullName, role]
  );

  await logAudit({ tenantId, userId, action: 'CREATE_USER', entityType: 'user', entityId: result.rows[0].id });

  res.status(201).json({ success: true, data: result.rows[0] });
}

module.exports = { listUsers, createUser };
