import { Router } from "express";
const router = Router();
import { getAuthorizationUrl, getTokens, getUserProfile } from "../spotify/spotifyApi.js";
import { FRONTEND_URI } from "../config.js";

// 1. Step: user goes to /auth/login, gets redirected to Spotify login/consent
router.get("/login", (req, res) => {
  const state = Math.random().toString(36).substring(2, 15);
  res.redirect(getAuthorizationUrl(state));
});

// 2. Step: Spotify calls this endpoint after user auth
router.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  if (!code) return res.status(400).send("Missing code");

  try {
    const tokens = await getTokens(code);
    // Retrieve basic user info to pass to frontend
    const profile = await getUserProfile(tokens.access_token);

    // Set tokens as HttpOnly cookie (simplest)
    res.cookie("access_token", tokens.access_token, { httpOnly: true, maxAge: 3600*1000 });
    res.cookie("refresh_token", tokens.refresh_token, { httpOnly: true, maxAge: 30*24*3600*1000 });

    // Send profile and tokens to frontend (or redirect with short-lived state)
    res.redirect(`${FRONTEND_URI}/?displayName=${encodeURIComponent(profile.display_name)}`);
  } catch (err) {
    res.status(500).send("Error authenticating");
  }
});

// 3. Logout
router.post("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.sendStatus(204);
});

export default router;
