// const express = require('express');
// const router = express.Router();
// const { login } = require('../controllers/authController');
// const authMiddleware = require('../middleware/authMiddleware');
// const { getCurrentUser } = require('../controllers/authController');

// router.get('/me', authMiddleware, getCurrentUser);

// router.post('/login', login);


// // Placeholder routes (logic will be added step-by-step)
// router.post('/register-tenant', (req, res) => {
//   res.status(501).json({ success: false, message: 'Not implemented yet' });
// });

// router.post('/login', (req, res) => {
//   res.status(501).json({ success: false, message: 'Not implemented yet' });
// });

// router.get('/me', (req, res) => {
//   res.status(501).json({ success: false, message: 'Not implemented yet' });
// });

// router.post('/logout', (req, res) => {
//   res.status(501).json({ success: false, message: 'Not implemented yet' });
// });

// module.exports = router;


const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
  login,
  getCurrentUser,
  logout
} = require('../controllers/authController');

// LOGIN
router.post('/login', login);

// GET CURRENT USER
router.get('/me', authMiddleware, getCurrentUser);

// LOGOUT
router.post('/logout', authMiddleware, logout);

// PLACEHOLDER (keep only if required by instructions)
router.post('/register-tenant', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Not implemented yet'
  });
});

module.exports = router;
