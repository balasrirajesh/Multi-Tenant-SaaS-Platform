const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const tenantGuard = require('../middleware/tenantMiddleware');
const { getTenant, updateTenant } = require('../controllers/tenantController');

// Get tenant details
router.get(
  '/:tenantId',
  authMiddleware,
  tenantGuard('tenantId'),
  getTenant
);

// Update tenant
router.put(
  '/:tenantId',
  authMiddleware,
  allowRoles('super_admin', 'tenant_admin'),
  tenantGuard('tenantId'),
  updateTenant
);

module.exports = router;
