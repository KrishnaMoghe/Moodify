import { createSpotifyApi } from '../config/spotify';

class SpotifyService {
  constructor(accessToken) {
    this.spotifyApi = createSpotifyApi(accessToken);
  }

  async getUserProfile() {
    try {
      const data = await this.spotifyApi.getMe();
      return data.body;
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  async getUserTopArtists(limit = 20, timeRange = 'medium_term') {
    try {
      const data = await this.spotifyApi.getMyTopArtists({
        limit,
        time_range: timeRange
      });
      return data.body.items;
    } catch (error) {
      throw new Error(`Failed to get top artists: ${error.message}`);
    }
  }

  async getRecommendations(seedArtists, audioFeatures, limit = 20) {
    try {
      const options = {
        seed_artists: seedArtists.slice(0, 5),
        limit,
        ...audioFeatures
      };

      const data = await this.spotifyApi.getRecommendations(options);
      return data.body.tracks;
    } catch (error) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }

  async createPlaylist(userId, name, description, isPublic = false) {
    try {
      const data = await this.spotifyApi.createPlaylist(userId, name, {
        description,
        public: isPublic
      });
      return data.body;
    } catch (error) {
      throw new Error(`Failed to create playlist: ${error.message}`);
    }
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    try {
      const data = await this.spotifyApi.addTracksToPlaylist(playlistId, trackUris);
      return data.body;
    } catch (error) {
      throw new Error(`Failed to add tracks to playlist: ${error.message}`);
    }
  }
}

export default SpotifyService;
