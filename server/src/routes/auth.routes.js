import express from 'express';
const router = express.Router();
import authController from '../controllers/auth.controller.js';

// Register
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);
// Logout
router.post('/logout', authController.logout);

export default router;
