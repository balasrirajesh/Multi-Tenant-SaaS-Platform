const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

// 1. LIST TENANTS
async function listTenants(req, res) {
  try {
    const result = await db.query(`SELECT id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at FROM tenants ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error('List tenants error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// 2. CREATE TENANT
async function createTenant(req, res) {
  try {
    const { userId } = req.user; 
    const { name, subdomain, subscription_plan } = req.body;

    const check = await db.query(`SELECT 1 FROM tenants WHERE subdomain = $1`, [subdomain]);
    if (check.rowCount > 0) return res.status(400).json({ success: false, message: 'Subdomain already exists' });

    const result = await db.query(
      `INSERT INTO tenants (name, subdomain, subscription_plan, status) VALUES ($1, $2, $3, 'active') RETURNING *`,
      [name, subdomain, subscription_plan || 'basic']
    );
    const newTenant = result.rows[0];

    await logAudit({ tenantId: newTenant.id, userId, action: 'CREATE_TENANT', entityType: 'tenant', entityId: newTenant.id, ipAddress: req.ip });

    res.status(201).json({ success: true, data: newTenant });
  } catch (err) {
    console.error('Create tenant error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// 3. GET TENANT
async function getTenant(req, res) {
  try {
    const { tenantId } = req.params;
    const result = await db.query(
      `SELECT t.*, 
       (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) AS total_users,
       (SELECT COUNT(*) FROM projects p WHERE p.tenant_id = t.id) AS total_projects
       FROM tenants t WHERE t.id = $1`,
      [tenantId]
    );

    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Tenant not found' });
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// 4. UPDATE TENANT
async function updateTenant(req, res) {
  try {
    const { tenantId } = req.params;
    const { name } = req.body; 
    
    const result = await db.query(
      `UPDATE tenants SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [name, tenantId]
    );

    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Tenant not found' });
    res.status(200).json({ success: true, data: result.rows[0], message: 'Tenant updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// 5. DELETE TENANT
async function deleteTenant(req, res) {
  const { tenantId } = req.params;
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM users WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM projects WHERE tenant_id = $1', [tenantId]);
    const result = await client.query('DELETE FROM tenants WHERE id = $1 RETURNING id', [tenantId]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Tenant deleted' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
}

// --- CORRECT EXPORT (ONLY ONE BLOCK) ---
module.exports = {
  listTenants,
  createTenant,
  getTenant,
  updateTenant,
  deleteTenant 
};