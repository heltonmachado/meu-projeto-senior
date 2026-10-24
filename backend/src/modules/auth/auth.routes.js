import { Router } from 'express';
import { register, login, refresh, logout, me, forgotPassword, resetPassword } from './auth.controller.js';
import { protect } from '../../shared/middlewares/auth.js';

const router = Router();

// públicas - sem auth
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// protegidas
router.post('/logout', protect, logout);
router.get('/me', protect, me);

export default router;