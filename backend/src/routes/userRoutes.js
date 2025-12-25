const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const allow = require('../middleware/roleMiddleware');
const tenantGuard = require('../middleware/tenantMiddleware');
const { listUsers, createUser } = require('../controllers/userController');

router.get('/', auth, allow('super_admin','tenant_admin'), listUsers);
router.post('/', auth, allow('tenant_admin'), createUser);

module.exports = router;
