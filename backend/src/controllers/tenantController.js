// const db = require('../config/db');
// const { logAudit } = require('../utils/auditLogger');

// // GET /api/tenants/:tenantId
// async function getTenant(req, res) {
//   try {
//     const { tenantId } = req.params;

//     const tenantResult = await db.query(
//       `
//       SELECT 
//         t.id,
//         t.name,
//         t.subdomain,
//         t.status,
//         t.subscription_plan,
//         t.max_users,
//         t.max_projects,
//         t.created_at,
//         (
//           SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id
//         ) AS total_users,
//         (
//           SELECT COUNT(*) FROM projects p WHERE p.tenant_id = t.id
//         ) AS total_projects,
//         (
//           SELECT COUNT(*) FROM tasks tk WHERE tk.tenant_id = t.id
//         ) AS total_tasks
//       FROM tenants t
//       WHERE t.id = $1
//       `,
//       [tenantId]
//     );

//     if (tenantResult.rowCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Tenant not found'
//       });
//     }

//     const t = tenantResult.rows[0];

//     return res.status(200).json({
//       success: true,
//       data: {
//         id: t.id,
//         name: t.name,
//         subdomain: t.subdomain,
//         status: t.status,
//         subscriptionPlan: t.subscription_plan,
//         maxUsers: t.max_users,
//         maxProjects: t.max_projects,
//         createdAt: t.created_at,
//         stats: {
//           totalUsers: Number(t.total_users),
//           totalProjects: Number(t.total_projects),
//           totalTasks: Number(t.total_tasks)
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Get tenant error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// // PUT /api/tenants/:tenantId
// async function updateTenant(req, res) {
//   try {
//     const { tenantId } = req.params;
//     const { role, userId } = req.user;
//     const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;

//     // Tenant admin can only update name
//     if (role === 'tenant_admin') {
//       if (status || subscriptionPlan || maxUsers || maxProjects) {
//         return res.status(403).json({
//           success: false,
//           message: 'Forbidden: cannot update restricted fields'
//         });
//       }
//     }

//     const fields = [];
//     const values = [];
//     let idx = 1;

//     if (name) {
//       fields.push(`name = $${idx++}`);
//       values.push(name);
//     }

//     if (role === 'super_admin') {
//       if (status) {
//         fields.push(`status = $${idx++}`);
//         values.push(status);
//       }
//       if (subscriptionPlan) {
//         fields.push(`subscription_plan = $${idx++}`);
//         values.push(subscriptionPlan);
//       }
//       if (maxUsers) {
//         fields.push(`max_users = $${idx++}`);
//         values.push(maxUsers);
//       }
//       if (maxProjects) {
//         fields.push(`max_projects = $${idx++}`);
//         values.push(maxProjects);
//       }
//     }

//     if (fields.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No valid fields to update'
//       });
//     }

//     values.push(tenantId);

//     const result = await db.query(
//       `
//       UPDATE tenants
//       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
//       WHERE id = $${idx}
//       RETURNING id, name, updated_at
//       `,
//       values
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Tenant not found'
//       });
//     }

//     await logAudit({
//       tenantId,
//       userId,
//       action: 'UPDATE_TENANT',
//       entityType: 'tenant',
//       entityId: tenantId,
//       ipAddress: req.ip
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Tenant updated successfully',
//       data: {
//         id: result.rows[0].id,
//         name: result.rows[0].name,
//         updatedAt: result.rows[0].updated_at
//       }
//     });
//   } catch (error) {
//     console.error('Update tenant error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }
// // GET /api/tenants
// async function listTenants(req, res) {
//   try {
//     const result = await db.query(`
//       SELECT id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at
//       FROM tenants
//       ORDER BY created_at DESC
//     `);

//     return res.status(200).json({
//       success: true,
//       data: result.rows
//     });
//   } catch (err) {
//     console.error('List tenants error', err);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// }

// module.exports = {
//   getTenant,
//   updateTenant,
//   listTenants
// };


const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

// 1. GET /api/tenants (List all tenants)
async function listTenants(req, res) {
  try {
    const result = await db.query(`
      SELECT id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at
      FROM tenants
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('List tenants error', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// 2. POST /api/tenants (Create NEW tenant) - THIS WAS MISSING
async function createTenant(req, res) {
  try {
    const { userId } = req.user; // Get the ID of the admin creating it
    const { name, subdomain, subscription_plan } = req.body;

    // Check if subdomain already exists
    const check = await db.query(`SELECT 1 FROM tenants WHERE subdomain = $1`, [subdomain]);
    if (check.rowCount > 0) {
      return res.status(400).json({ success: false, message: 'Subdomain already exists' });
    }

    // Insert new tenant
    const result = await db.query(
      `INSERT INTO tenants (name, subdomain, subscription_plan, status)
       VALUES ($1, $2, $3, 'active') RETURNING *`,
      [name, subdomain, subscription_plan || 'basic']
    );

    const newTenant = result.rows[0];

    // Log the action
    await logAudit({
      tenantId: newTenant.id, 
      userId,
      action: 'CREATE_TENANT',
      entityType: 'tenant',
      entityId: newTenant.id,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: newTenant });
  } catch (err) {
    console.error('Create tenant error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// 3. GET /api/tenants/:tenantId (Get details)
async function getTenant(req, res) {
  try {
    const { tenantId } = req.params;

    const tenantResult = await db.query(
      `
      SELECT 
        t.id, t.name, t.subdomain, t.status, t.subscription_plan,
        t.max_users, t.max_projects, t.created_at,
        (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) AS total_users,
        (SELECT COUNT(*) FROM projects p WHERE p.tenant_id = t.id) AS total_projects,
        (SELECT COUNT(*) FROM tasks tk WHERE tk.tenant_id = t.id) AS total_tasks
      FROM tenants t
      WHERE t.id = $1
      `,
      [tenantId]
    );

    if (tenantResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const t = tenantResult.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: t.id,
        name: t.name,
        subdomain: t.subdomain,
        status: t.status,
        subscriptionPlan: t.subscription_plan,
        maxUsers: t.max_users,
        maxProjects: t.max_projects,
        createdAt: t.created_at,
        stats: {
          totalUsers: Number(t.total_users),
          totalProjects: Number(t.total_projects),
          totalTasks: Number(t.total_tasks)
        }
      }
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// 4. PUT /api/tenants/:tenantId (Update tenant)
async function updateTenant(req, res) {
  try {
    const { tenantId } = req.params;
    const { role, userId } = req.user;
    const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;

    // Tenant admin can only update name
    if (role === 'tenant_admin') {
      if (status || subscriptionPlan || maxUsers || maxProjects) {
        return res.status(403).json({ success: false, message: 'Forbidden: cannot update restricted fields' });
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }

    if (role === 'super_admin') {
      if (status) { fields.push(`status = $${idx++}`); values.push(status); }
      if (subscriptionPlan) { fields.push(`subscription_plan = $${idx++}`); values.push(subscriptionPlan); }
      if (maxUsers) { fields.push(`max_users = $${idx++}`); values.push(maxUsers); }
      if (maxProjects) { fields.push(`max_projects = $${idx++}`); values.push(maxProjects); }
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    values.push(tenantId);

    const result = await db.query(
      `UPDATE tenants SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, name, updated_at`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    await logAudit({
      tenantId,
      userId,
      action: 'UPDATE_TENANT',
      entityType: 'tenant',
      entityId: tenantId,
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: { id: result.rows[0].id, name: result.rows[0].name, updatedAt: result.rows[0].updated_at }
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// EXPORT ALL FUNCTIONS
module.exports = {
  listTenants,
  createTenant, // <--- Make sure this is exported!
  getTenant,
  updateTenant
};