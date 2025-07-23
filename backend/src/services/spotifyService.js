const axios = require('axios');

class SpotifyService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.spotify.com/v1';
  }

  // Generic request helper
  async makeRequest(endpoint, params = {}, method = 'GET', data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    };
    if (method === 'GET') {
      config.params = params;
    } else if (data) {
      config.data = data;
    }
    const response = await axios(config);
    return response.data;
  }

  // Get current user profile
  async getUserProfile() {
    const data = await this.makeRequest('/me');
    return data;
  }

  // Get user's top artists
  async getUserTopArtists(limit = 20, timeRange = 'medium_term') {
    const data = await this.makeRequest('/me/top/artists', { limit, time_range: timeRange });
    return data.items;
  }

  // Create a new playlist
  async createPlaylist(userId, name, description = '', isPublic = false) {
    const body = { name, description, public: isPublic };
    return await this.makeRequest(`/users/${userId}/playlists`, {}, 'POST', body);
  }

  // Add tracks (URIs) to a playlist
  async addTracksToPlaylist(playlistId, uris) {
    return await this.makeRequest(`/playlists/${playlistId}/tracks`, {}, 'POST', { uris });
  }

  // Main recommendation method: searches tracks for each top artist + mood keywords
  async getRecommendations(seedArtists, mood, limit = 20) {
    // Map of mood to search keywords
    const moodQueries = {
      happy: 'upbeat cheerful',
      sad: 'melancholic sad',
      energetic: 'energetic dance',
      chill: 'chill relaxed',
      romantic: 'romantic love',
      angry: 'angry intense'
    };
    const queryKeywords = moodQueries[mood] || mood;

    // Fetch artist names
    const artistNames = [];
    for (const artistId of seedArtists.slice(0, 5)) {
      try {
        const artist = await this.makeRequest(`/artists/${artistId}`);
        artistNames.push(artist.name);
      } catch {
        // skip if artist fetch fails
      }
    }

    // Search tracks per artist
    const trackMap = new Map();
    const perArtistLimit = Math.ceil(limit / (artistNames.length || 1));
    for (const name of artistNames) {
      const q = `artist:"${name}" ${queryKeywords}`;
      try {
        const data = await this.makeRequest('/search', {
          q,
          type: 'track',
          market: 'US',
          limit: perArtistLimit
        });
        for (const track of data.tracks.items) {
          if (!trackMap.has(track.id)) {
            trackMap.set(track.id, track);
          }
        }
      } catch {
        // skip search failures
      }
    }

    // If no seeds or no results, fallback to pure mood-based search
    if (trackMap.size === 0) {
      try {
        const data = await this.makeRequest('/search', {
          q: queryKeywords,
          type: 'track',
          market: 'US',
          limit
        });
        for (const track of data.tracks.items) {
          if (!trackMap.has(track.id)) {
            trackMap.set(track.id, track);
          }
        }
      } catch {
        // final fallback empty
      }
    }

    // Return up to limit unique tracks
    return Array.from(trackMap.values()).slice(0, limit);
  }
}

module.exports = SpotifyService;
