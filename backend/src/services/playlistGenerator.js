const SpotifyService = require('./spotifyService');
const MoodAnalyzer = require('./moodAnalyzer');

class PlaylistGenerator {
  constructor(accessToken) {
    this.spotifyService = new SpotifyService(accessToken);
  }

  async generatePlaylist(mood, options = {}) {
    const { limit = 20, includeUserTopArtists = true, customArtists = [], saveToSpotify = false } = options;

    if (!MoodAnalyzer.validateMood(mood)) {
      throw new Error(`Invalid mood: ${mood}`);
    }

    // Determine seed artists
    let seedArtists = customArtists;
    if (includeUserTopArtists) {
      const top = await this.spotifyService.getUserTopArtists(5);
      seedArtists = [...new Set([...seedArtists, ...top.map(a => a.id)])];
    }

    if (seedArtists.length === 0) {
      throw new Error('No seed artists available');
    }

    // Get recommendations
    const tracks = await this.spotifyService.getRecommendations(seedArtists, mood, limit);

    const playlist = {
      mood,
      moodDescription: MoodAnalyzer.getMoodDescription(mood),
      tracks: tracks.map(t => ({
        id: t.id,
        name: t.name,
        artists: t.artists.map(a => ({ id: a.id, name: a.name })),
        album: { id: t.album.id, name: t.album.name, images: t.album.images },
        duration_ms: t.duration_ms,
        preview_url: t.preview_url,
        external_urls: t.external_urls,
        uri: t.uri
      }))
    };

    if (saveToSpotify) {
      const user = await this.spotifyService.getUserProfile();
      const title = `Moodify - ${mood.charAt(0).toUpperCase() + mood.slice(1)}`;
      const desc = `Generated playlist for ${mood}`;
      const pl = await this.spotifyService.createPlaylist(user.id, title, desc, false);
      const uris = playlist.tracks.map(t => t.uri);
      await this.spotifyService.addTracksToPlaylist(pl.id, uris);
      playlist.spotifyPlaylist = pl;
    }

    return playlist;
  }
}

module.exports = PlaylistGenerator;
