const axios = require('axios');

class SpotifyService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.spotify.com/v1';
  }

  async makeRequest(endpoint, params = {}, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (method === 'GET' && Object.keys(params).length > 0) {
        config.params = params;
      } else if (data) {
        config.data = data;
      }

      console.log(`Making ${method} request to:`, config.url);
      if (config.params) {
        console.log('With params:', config.params);
      }

      const response = await axios(config);
      console.log(`✅ ${endpoint} request successful`);
      return response.data;
    } catch (error) {
      console.error(`❌ ${endpoint} request failed:`, error.response?.status, error.response?.statusText);
      console.error('Error details:', error.response?.data);
      throw new Error(`Spotify API error: ${error.response?.status} ${error.response?.statusText}`);
    }
  }

  async getUserProfile() {
    return await this.makeRequest('/me');
  }

  async getUserTopArtists(limit = 20, timeRange = 'medium_term') {
    const params = {
      limit,
      time_range: timeRange
    };
    const data = await this.makeRequest('/me/top/artists', params);
    return data.items;
  }

  async generatePlaylist(mood, options = {}) {
    const {
      limit = 20,
      includeUserTopArtists = true,
      customArtists = [],
      playlistName = null,
      saveToSpotify = false
    } = options;
  
    try {
      if (!MoodAnalyzer.validateMood(mood)) {
        throw new Error(`Invalid mood: ${mood}`);
      }
  
      const moodParams = MoodAnalyzer.getMoodParameters(mood);
  
      let seedArtists = [];
      if (includeUserTopArtists) {
        const topArtists = await this.spotifyService.getUserTopArtists(10);
        seedArtists = topArtists.map(artist => artist.id);
      }
  
      if (customArtists.length > 0) {
        seedArtists = [...seedArtists, ...customArtists];
      }
  
      seedArtists = seedArtists.slice(0, 5);
  
      if (seedArtists.length === 0) {
        throw new Error('No seed artists available for recommendations');
      }
  
      // Use alternative recommendation method
      let tracks;
      try {
        tracks = await this.spotifyService.getAlternativeRecommendations(
          seedArtists,
          moodParams,
          limit
        );
      } catch (error) {
        console.warn('Alternative recommendations failed, trying search-based approach...');
        tracks = await this.spotifyService.getSearchBasedRecommendations(
          seedArtists,
          moodParams,
          limit
        );
      }
  
      // Rest of your playlist creation logic remains the same...
      const playlist = {
        mood,
        moodDescription: MoodAnalyzer.getMoodDescription(mood),
        tracks: tracks.map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(artist => ({
            id: artist.id,
            name: artist.name
          })),
          album: {
            id: track.album.id,
            name: track.album.name,
            images: track.album.images
          },
          duration_ms: track.duration_ms,
          preview_url: track.preview_url,
          external_urls: track.external_urls,
          uri: track.uri
        })),
        parameters: moodParams,
        seedArtists,
        createdAt: new Date().toISOString(),
        method: 'alternative_recommendation' // Track which method was used
      };
  
      // Playlist saving logic remains the same...
      if (saveToSpotify) {
        const user = await this.spotifyService.getUserProfile();
        const playlistTitle = playlistName || `Moodify - ${mood.charAt(0).toUpperCase() + mood.slice(1)}`;
        const description = `Generated playlist for ${mood} mood • Created by Moodify (Alternative Method)`;
  
        const spotifyPlaylist = await this.spotifyService.createPlaylist(
          user.id,
          playlistTitle,
          description,
          false
        );
  
        const trackUris = tracks.map(track => track.uri);
        await this.spotifyService.addTracksToPlaylist(spotifyPlaylist.id, trackUris);
  
        playlist.spotifyPlaylist = {
          id: spotifyPlaylist.id,
          external_urls: spotifyPlaylist.external_urls,
          name: spotifyPlaylist.name
        };
      }
  
      return playlist;
    } catch (error) {
      throw new Error(`Playlist generation failed: ${error.message}`);
    }
  }
  
  async getSearchBasedRecommendations(seedArtists, audioFeatures, limit = 20) {
    try {
      console.log('=== USING SEARCH-BASED RECOMMENDATIONS ===');
      
      // Get artist names for search queries
      const artistPromises = seedArtists.slice(0, 3).map(async (artistId) => {
        try {
          const artist = await this.makeRequest(`/artists/${artistId}`);
          return artist.name;
        } catch (error) {
          return null;
        }
      });
  
      const artistNames = (await Promise.all(artistPromises)).filter(name => name);
      
      // Search for tracks by these artists and similar genres
      const searchResults = [];
      for (const artistName of artistNames) {
        try {
          const results = await this.makeRequest('/search', {
            q: `artist:"${artistName}"`,
            type: 'track',
            limit: Math.ceil(limit / artistNames.length),
            market: 'US'
          });
          searchResults.push(...results.tracks.items);
        } catch (error) {
          console.warn(`Search failed for artist ${artistName}`);
        }
      }
  
      console.log(`Search-based method returned ${searchResults.length} tracks`);
      console.log('=======================================');
      
      return searchResults.slice(0, limit);
    } catch (error) {
      throw new Error(`Search-based recommendations failed: ${error.message}`);
    }
  }
  

  async createPlaylist(userId, name, description, isPublic = false) {
    const data = {
      name,
      description,
      public: isPublic
    };
    return await this.makeRequest(`/users/${userId}/playlists`, {}, 'POST', data);
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    const data = {
      uris: trackUris
    };
    return await this.makeRequest(`/playlists/${playlistId}/tracks`, {}, 'POST', data);
  }

  async getAudioFeatures(trackIds) {
    const params = {
      ids: trackIds.join(',')
    };
    const data = await this.makeRequest('/audio-features', params);
    return data.audio_features;
  }
}

module.exports = SpotifyService;
