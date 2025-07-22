const SpotifyService = require('../services/spotifyService');
const getProfile = async (req, res) => {
    try {
      // Use the service from middleware instead of creating new one
      const profile = await req.spotifyService.getUserProfile();
  
      res.json({
        success: true,
        user: {
          id: profile.id,
          display_name: profile.display_name,
          email: profile.email,
          country: profile.country,
          followers: profile.followers.total,
          images: profile.images,
          external_urls: profile.external_urls
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(400).json({
        error: 'Failed to get user profile',
        message: error.message
      });
    }
  };
  
  const getTopArtists = async (req, res) => {
    try {
      const { limit = 20, time_range = 'medium_term' } = req.query;
      
      // Use the service from middleware
      const artists = await req.spotifyService.getUserTopArtists(
        parseInt(limit), 
        time_range
      );
  
      res.json({
        success: true,
        artists: artists.map(artist => ({
          id: artist.id,
          name: artist.name,
          genres: artist.genres,
          popularity: artist.popularity,
          images: artist.images,
          external_urls: artist.external_urls
        }))
      });
    } catch (error) {
      console.error('Get top artists error:', error);
      res.status(400).json({
        error: 'Failed to get top artists',
        message: error.message
      });
    }
  };
  
  module.exports = {
    getProfile,
    getTopArtists
  };
  