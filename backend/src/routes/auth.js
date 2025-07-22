import { Router } from 'express';
import { login, callback, refreshToken } from '../controllers/authController';

const router = Router();

router.get('/login', login);
router.get('/callback', callback);
router.post('/refresh', refreshToken);

export default router;
