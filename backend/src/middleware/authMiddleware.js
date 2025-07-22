import { createSpotifyApi } from '../config/spotify';

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
    const spotifyApi = createSpotifyApi(accessToken);

    try {
      await spotifyApi.getMe();
      req.spotifyAccessToken = accessToken;
      req.spotifyApi = spotifyApi;
      next();
    } catch (spotifyError) {
      if (spotifyError.statusCode === 401) {
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

export default { authenticateSpotify };
