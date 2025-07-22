import { v4 as uuidv4 } from 'uuid';
import { createSpotifyApi, scopes } from '../config/spotify';

const stateStore = new Map();

const login = (req, res) => {
  try {
    const state = uuidv4();
    const spotifyApi = createSpotifyApi();
    
    stateStore.set(state, { timestamp: Date.now() });
    
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    
    res.json({
      authUrl: authorizeURL,
      state
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Failed to generate auth URL',
      message: error.message
    });
  }
};

const callback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).json({
        error: 'Spotify authorization failed',
        message: error
      });
    }

    if (!code || !state) {
      return res.status(400).json({
        error: 'Missing authorization code or state',
        message: 'Invalid callback request'
      });
    }

    const storedState = stateStore.get(state);
    if (!storedState) {
      return res.status(400).json({
        error: 'Invalid state parameter',
        message: 'State verification failed'
      });
    }

    stateStore.delete(state);

    const spotifyApi = createSpotifyApi();
    const data = await spotifyApi.authorizationCodeGrant(code);
    
    const { access_token, refresh_token, expires_in } = data.body;

    res.json({
      access_token,
      refresh_token,
      expires_in,
      token_type: 'Bearer'
    });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({
      error: 'Token exchange failed',
      message: error.message
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Missing refresh token',
        message: 'Refresh token is required'
      });
    }

    const spotifyApi = createSpotifyApi();
    spotifyApi.setRefreshToken(refresh_token);

    const data = await spotifyApi.refreshAccessToken();
    const { access_token, expires_in } = data.body;

    res.json({
      access_token,
      expires_in,
      token_type: 'Bearer'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(400).json({
      error: 'Token refresh failed',
      message: 'Invalid refresh token'
    });
  }
};

export default {
  login,
  callback,
  refreshToken
};
