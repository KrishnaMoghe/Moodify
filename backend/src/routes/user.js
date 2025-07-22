import { Router } from 'express';
import { authenticateSpotify } from '../middleware/authMiddleware';
import { getProfile, getTopArtists } from '../controllers/userController';

const router = Router();

router.use(authenticateSpotify);
router.get('/profile', getProfile);
router.get('/top-artists', getTopArtists);

export default router;
