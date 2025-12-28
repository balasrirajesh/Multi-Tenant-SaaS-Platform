const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

// FIX 1: Super Admin Visibility
async function listProjects(req, res) {
  const { tenantId, role } = req.user;
  
  try {
    let result;
    
    if (role === 'super_admin') {
      // Super Admin sees ALL projects + Tenant Name
      result = await db.query(
        `SELECT p.*, t.name as tenant_name 
         FROM projects p 
         JOIN tenants t ON p.tenant_id = t.id 
         ORDER BY p.created_at DESC`
      );
    } else {
      // Regular users/admins only see their own tenant's projects
      result = await db.query(
        `SELECT * FROM projects WHERE tenant_id = $1 ORDER BY created_at DESC`,
        [tenantId]
      );
    }
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function createProject(req, res) {
  const { tenantId, userId, role } = req.user;
  const { name, description } = req.body;

  // Super Admin cannot create projects (they don't have a tenant)
  if (role === 'super_admin') {
    return res.status(403).json({ success: false, message: "Super Admins cannot create projects. Log in as a Tenant Admin." });
  }

  const result = await db.query(
    `INSERT INTO projects (tenant_id, name, description, status, created_by)
     VALUES ($1, $2, $3, 'active', $4) RETURNING *`,
    [tenantId, name, description, userId]
  );

  await logAudit({ tenantId, userId, action: 'CREATE_PROJECT', entityType: 'project', entityId: result.rows[0].id });
  res.status(201).json({ success: true, data: result.rows[0] });
}

// FIX 2: Add Delete Logic
async function deleteProject(req, res) {
  const { id } = req.params;
  const { tenantId, userId, role } = req.user;

  try {
    let result;

    if (role === 'super_admin') {
      // Super Admin can delete ANY project
      result = await db.query(
        `DELETE FROM projects WHERE id = $1 RETURNING *`,
        [id]
      );
    } else {
      // Tenant Admin can only delete their OWN projects
      result = await db.query(
        `DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING *`,
        [id, tenantId]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Project not found or unauthorized" });
    }

    await logAudit({ tenantId, userId, action: 'DELETE_PROJECT', entityType: 'project', entityId: id });
    res.json({ success: true, message: "Project deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { listProjects, createProject, deleteProject };