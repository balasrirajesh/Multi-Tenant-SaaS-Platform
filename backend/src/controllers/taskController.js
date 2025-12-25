const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

async function listTasks(req, res) {
  const { tenantId } = req.user;
  const result = await db.query(
    `SELECT * FROM tasks WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId]
  );
  res.json({ success: true, data: result.rows });
}

async function createTask(req, res) {
  const { tenantId, userId } = req.user;
  const { projectId, title, description, priority, dueDate, assignedTo } = req.body;
  const result = await db.query(
    `INSERT INTO tasks
     (project_id, tenant_id, title, description, status, priority, due_date, assigned_to)
     VALUES ($1, $2, $3, $4, 'todo', $5, $6, $7)
     RETURNING *`,
    [projectId, tenantId, title, description || null, priority, dueDate || null, assignedTo || null]
  );
  await logAudit({
    tenantId,
    userId,
    action: 'CREATE_TASK',
    entityType: 'task',
    entityId: result.rows[0].id,
    ipAddress: req.ip
  });
  res.status(201).json({ success: true, data: result.rows[0] });
}

module.exports = { listTasks, createTask };