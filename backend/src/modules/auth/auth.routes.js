import { Router } from 'express';
import { register, login, refresh, logout, me } from './auth.controller.js';
import { protect } from '../../shared/middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

export default router;
