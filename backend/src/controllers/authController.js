const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const stateStore = new Map();

const login = (req, res) => {
  try {
    const state = uuidv4();
    stateStore.set(state, { timestamp: Date.now() });

    // Build auth URL manually for better control
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
    const scopes = encodeURIComponent(
      [
        "user-read-private",
        "user-read-email",
        "user-top-read",
        "playlist-modify-public",
        "playlist-modify-private",
        "playlist-read-private",
      ].join(" ")
    );

    const authorizeURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}`;

    console.log("Generated Auth URL:", authorizeURL);
    console.log("Redirect URI from env:", process.env.REDIRECT_URI);

    res.json({
      authUrl: authorizeURL,
      state,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Failed to generate auth URL",
      message: error.message,
    });
  }
};

const callback = async (req, res) => {
    try {
      const { code, state, error } = req.query;
  
      if (error) {
        return res.redirect(`http://localhost:3000/?error=${error}`);
      }
  
      if (!code || !state) {
        return res.redirect(`http://localhost:3000/?error=invalid_request`);
      }
  
      const storedState = stateStore.get(state);
      if (!storedState) {
        return res.redirect(`http://localhost:3000/?error=state_mismatch`);
      }
  
      stateStore.delete(state);
  
      const tokenData = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      };
  
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        new URLSearchParams(tokenData).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      const { access_token, refresh_token } = response.data;
  
      // Redirect back to frontend with tokens
      const redirectUrl = `http://localhost:3000/?access_token=${access_token}&refresh_token=${refresh_token || ''}`;
      res.redirect(redirectUrl);
  
    } catch (error) {
      console.error('Callback error:', error);
      res.redirect(`http://localhost:3000/?error=auth_failed`);
    }
  };
  

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: "Missing refresh token",
        message: "Refresh token is required",
      });
    }

    const tokenData = {
      grant_type: "refresh_token",
      refresh_token,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    };

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams(tokenData).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, expires_in } = response.data;

    res.json({
      access_token,
      expires_in,
      token_type: "Bearer",
    });
  } catch (error) {
    console.error(
      "Refresh token error:",
      error.response?.data || error.message
    );
    res.status(400).json({
      error: "Token refresh failed",
      message: "Invalid refresh token",
    });
  }
};

module.exports = {
  login,
  callback,
  refreshToken,
};
