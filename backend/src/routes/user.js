const express = require('express');
const { authenticateSpotify } = require('../middleware/authMiddleware');
const { getProfile, getTopArtists } = require('../controllers/userController');

const router = express.Router();

router.use(authenticateSpotify);
router.get('/profile', getProfile);
router.get('/top-artists', getTopArtists);

module.exports = router;
