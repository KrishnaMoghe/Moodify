const SpotifyService = require('../services/spotifyService');

const authenticateSpotify = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        message: 'Please provide a valid Spotify access token'
      });
    }

    const accessToken = authHeader.split(' ')[1];
    
    // Create SpotifyService instance to verify token
    const spotifyService = new SpotifyService(accessToken);

    try {
      // Verify token by making a simple API call
      const profile = await spotifyService.getUserProfile();
      console.log('✅ Token verified for user:', profile.id);
      
      // Store the access token and service for use in routes
      req.spotifyAccessToken = accessToken;
      req.spotifyService = spotifyService;
      next();
    } catch (spotifyError) {
      console.error('❌ Token verification failed:', spotifyError.message);
      
      if (spotifyError.message.includes('401')) {
        return res.status(401).json({
          error: 'Invalid or expired access token',
          message: 'Please re-authenticate with Spotify'
        });
      }
      throw spotifyError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

module.exports = { authenticateSpotify };
