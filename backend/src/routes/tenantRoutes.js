// const express = require('express');
// const router = express.Router();

// // Middleware Imports
// const authMiddleware = require('../middleware/authMiddleware');
// const allowRoles = require('../middleware/roleMiddleware');
// const tenantGuard = require('../middleware/tenantMiddleware');

// // Controller Imports (Consolidated into one block)
// const { 
//   listTenants, 
//   createTenant, 
//   getTenant, 
//   updateTenant 
// } = require('../controllers/tenantController');

// // 1. List All Tenants (Super Admin Only)
// router.get(
//   '/',
//   authMiddleware,
//   allowRoles('super_admin'),
//   listTenants
// );

// // 2. Create New Tenant (Super Admin Only)
// router.post(
//   '/',
//   authMiddleware,
//   allowRoles('super_admin'),
//   createTenant
// );

// // 3. Get Tenant Details
// // (Super Admin can see any; Tenant Admin can see their own)
// router.get(
//   '/:tenantId',
//   authMiddleware,
//   // Note: tenantGuard ensures a tenant_admin only accesses their own ID
//   tenantGuard('tenantId'), 
//   getTenant
// );

// // 4. Update Tenant
// router.put(
//   '/:tenantId',
//   authMiddleware,
//   allowRoles('super_admin', 'tenant_admin'),
//   tenantGuard('tenantId'),
//   updateTenant
// );

// module.exports = router;


const express = require('express');
const router = express.Router();

// Middleware Imports
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const tenantGuard = require('../middleware/tenantMiddleware');

// Controller Imports
const { 
  listTenants, 
  createTenant, 
  getTenant, 
  updateTenant 
} = require('../controllers/tenantController');

// Import the User Controller we just fixed
const { listUsers, createUser } = require('../controllers/userController');

// --- TENANT ROUTES ---

// 1. List All Tenants (Super Admin)
router.get('/', authMiddleware, allowRoles('super_admin'), listTenants);

// 2. Create Tenant (Super Admin)
router.post('/', authMiddleware, allowRoles('super_admin'), createTenant);

// 3. Get Tenant Details
router.get('/:tenantId', authMiddleware, tenantGuard('tenantId'), getTenant);

// 4. Update Tenant
router.put('/:tenantId', authMiddleware, allowRoles('super_admin', 'tenant_admin'), tenantGuard('tenantId'), updateTenant);


// --- USER MANAGEMENT ROUTES (The missing part) ---

// 5. List Users for a Tenant
router.get(
  '/:tenantId/users',
  authMiddleware,
  tenantGuard('tenantId'), // Ensures admin belongs to this tenant
  listUsers
);

// 6. Add User to Tenant
router.post(
  '/:tenantId/users',
  authMiddleware,
  allowRoles('super_admin', 'tenant_admin'), // Only admins can add users
  tenantGuard('tenantId'),
  createUser
);

module.exports = router;