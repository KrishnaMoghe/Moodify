const express = require('express');
const { login, callback, refreshToken } = require('../controllers/authController');
const router = express.Router();

router.get('/login', login);
router.get('/callback', callback);
router.post('/refresh', refreshToken);

module.exports = router;
