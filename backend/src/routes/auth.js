const express = require('express');
const router = express.Router();
const { register, login, me, updateProfile, changePassword, getUserStats } = require('../controllers/authController');
const { registerRules, loginRules, handleValidation } = require('../validators/authValidator');
const authMiddleware = require('../middlewares/auth');

router.post('/register', registerRules, handleValidation, register);
router.post('/login', loginRules, handleValidation, login);

// current user
router.get('/me', authMiddleware, me);

// profile management
router.patch('/profile', authMiddleware, updateProfile);
router.patch('/password', authMiddleware, changePassword);
router.get('/stats', authMiddleware, getUserStats);

module.exports = router;
