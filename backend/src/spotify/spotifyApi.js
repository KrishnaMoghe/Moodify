import axios from 'axios';


import { stringify } from 'querystring';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI } from '../config.js';

const { get, post } = axios;
function getAuthorizationUrl(state) {
  const scope = [
    "playlist-modify-public",
    "playlist-modify-private",
    "user-top-read",
    "user-read-private",
    "user-read-email"
  ].join(" ");
  const params = stringify({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    state
  });
  return `https://accounts.spotify.com/authorize?${params}`;
}

async function getTokens(code) {
  const params = stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: SPOTIFY_CLIENT_ID,
    client_secret: SPOTIFY_CLIENT_SECRET,
  });
  const res = await post(
    'https://accounts.spotify.com/api/token',
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return res.data;
}

async function refreshAccessToken(refreshToken) {
  const params = stringify({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: SPOTIFY_CLIENT_ID,
    client_secret: SPOTIFY_CLIENT_SECRET,
  });
  const res = await post(
    'https://accounts.spotify.com/api/token',
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return res.data;
}

async function getUserProfile(accessToken) {
  const res = await get("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return res.data;
}

async function getUserTopArtists(accessToken, limit = 10) {
  const res = await get('https://api.spotify.com/v1/me/top/artists?limit=' + limit, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return res.data.items;
}

async function searchArtists(accessToken, query) {
  const res = await get(
    'https://api.spotify.com/v1/search',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { q: query, type: "artist", limit: 5 }
    }
  );
  return res.data.artists.items;
}

async function getRecommendations(accessToken, artists, moodParams, limit = 20) {
  // Use up to 5 artist seed IDs
  const seed_artists = artists.slice(0, 5).join(',');
  const params = {
    seed_artists,
    limit,
    ...moodParams,
  };
  const res = await get(
    'https://api.spotify.com/v1/recommendations',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params
    }
  );
  return res.data.tracks;
}

async function createPlaylist(accessToken, userId, name, description) {
  const res = await post(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    { name, description, public: false },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.data;
}

async function addTracksToPlaylist(accessToken, playlistId, uris) {
  await post(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    { uris },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
}

export {
  getAuthorizationUrl,
  getTokens,
  refreshAccessToken,
  getUserProfile,
  getUserTopArtists,
  searchArtists,
  getRecommendations,
  createPlaylist,
  addTracksToPlaylist,
};
