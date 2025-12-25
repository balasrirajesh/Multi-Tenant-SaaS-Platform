const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

router.post('/login', login);


// Placeholder routes (logic will be added step-by-step)
router.post('/register-tenant', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

router.post('/login', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

router.get('/me', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

router.post('/logout', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

module.exports = router;
