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
// In spotify/spotifyApi.js
async function makeSpotifyRequest(accessToken, refreshToken, requestFn) {
  try {
    return await requestFn(accessToken);
  } catch (error) {
    if (error.response?.status === 401 && refreshToken) {
      // Try to refresh token
      const newTokens = await refreshAccessToken(refreshToken);
      return await requestFn(newTokens.access_token);
    }
    throw error;
  }
}

// Verify this function in backend/src/spotify/spotifyApi.js
async function getRecommendations(accessToken, artists, moodParams, limit = 20) {
  console.log("=== GET RECOMMENDATIONS DEBUG ===");
  console.log("Artists received:", artists);
  console.log("Mood params:", moodParams);
  
  if (!artists || artists.length === 0) {
    throw new Error("No artists provided for recommendations");
  }
  
  // Ensure we have valid artist IDs
  const validArtists = artists.filter(id => id && typeof id === 'string' && id.length > 0);
  console.log("Valid artists after filtering:", validArtists);
  
  if (validArtists.length === 0) {
    throw new Error("No valid artist IDs after filtering");
  }
  
  const seed_artists = validArtists.slice(0, 5).join(',');
  console.log("Seed artists string:", seed_artists);
  
  const params = {
    seed_artists,
    limit,
    ...moodParams,
  };
  console.log("Request params:", params);
  
  try {
    const res = await axios.get(
      'https://api.spotify.com/v1/recommendations',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params
      }
    );
    console.log("Spotify recommendations response status:", res.status);
    return res.data.tracks;
  } catch (error) {
    console.error("Spotify recommendations API error:", error.response?.status, error.response?.data);
    throw error;
  }
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
