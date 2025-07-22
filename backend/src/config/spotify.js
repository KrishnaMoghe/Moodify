const SpotifyService = require('../services/spotifyService');

// Keep for backward compatibility in auth controller
const createSpotifyApi = (accessToken = null) => {
  return {
    getAccessToken: () => accessToken,
    setAccessToken: (token) => { accessToken = token; }
  };
};

const scopes = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private'
];

module.exports = { createSpotifyApi, scopes };
