import { Router } from 'express';
import { authenticateSpotify } from '../middleware/authMiddleware';
import { generatePlaylist, getMoods } from '../controllers/playlistController';

const router = Router();

router.get('/moods', getMoods);
router.post('/generate', authenticateSpotify, generatePlaylist);

export default router;
