import SpotifyService from './spotifyService';
import { validateMood, getMoodParameters, getMoodDescription } from './moodAnalyzer';

class PlaylistGenerator {
  constructor(accessToken) {
    this.spotifyService = new SpotifyService(accessToken);
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
      if (!validateMood(mood)) {
        throw new Error(`Invalid mood: ${mood}`);
      }

      const moodParams = getMoodParameters(mood);

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

      const tracks = await this.spotifyService.getRecommendations(
        seedArtists,
        moodParams,
        limit
      );

      const playlist = {
        mood,
        moodDescription: getMoodDescription(mood),
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
        createdAt: new Date().toISOString()
      };

      if (saveToSpotify) {
        const user = await this.spotifyService.getUserProfile();
        const playlistTitle = playlistName || `Moodify - ${mood.charAt(0).toUpperCase() + mood.slice(1)}`;
        const description = `Generated playlist for ${mood} mood • Created by Moodify`;

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
}

export default PlaylistGenerator;
