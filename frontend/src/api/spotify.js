import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8888",
  withCredentials: true
});

export const getTopArtists = () => api.get("/playlist/top-artists");

export const searchArtists = (query) =>
  api.get("/playlist/search-artists", { params: { query } });

export const generatePlaylist = (mood, artistIds) =>
  api.post("/playlist/generate", { mood, artistIds });

export const logout = () => api.post("/auth/logout");

export const getProfile = async () => {
  // Could store profile in localStorage via initial backend redirect
  return { displayName: localStorage.getItem("displayName") };
};
