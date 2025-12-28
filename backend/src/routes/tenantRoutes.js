const express = require('express');
const router = express.Router();

// Middleware Imports
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const tenantGuard = require('../middleware/tenantMiddleware');

// Controller Imports (Consolidated into one block)
const { 
  listTenants, 
  createTenant, 
  getTenant, 
  updateTenant 
} = require('../controllers/tenantController');

// 1. List All Tenants (Super Admin Only)
router.get(
  '/',
  authMiddleware,
  allowRoles('super_admin'),
  listTenants
);

// 2. Create New Tenant (Super Admin Only)
router.post(
  '/',
  authMiddleware,
  allowRoles('super_admin'),
  createTenant
);

// 3. Get Tenant Details
// (Super Admin can see any; Tenant Admin can see their own)
router.get(
  '/:tenantId',
  authMiddleware,
  // Note: tenantGuard ensures a tenant_admin only accesses their own ID
  tenantGuard('tenantId'), 
  getTenant
);

// 4. Update Tenant
router.put(
  '/:tenantId',
  authMiddleware,
  allowRoles('super_admin', 'tenant_admin'),
  tenantGuard('tenantId'),
  updateTenant
);

module.exports = router;