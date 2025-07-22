const express = require('express');
const { authenticateSpotify } = require('../middleware/authMiddleware');

// Debug the controller import

const playlistController = require('../controllers/playlistController');
const { generatePlaylist, getMoods } = playlistController;

const router = express.Router();

router.get('/moods', getMoods);
router.post('/generate', authenticateSpotify, generatePlaylist);

module.exports = router;
