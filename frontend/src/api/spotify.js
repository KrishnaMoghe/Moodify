import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}`,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Authentication expired, redirecting to login");
      localStorage.removeItem("displayName");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);


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
