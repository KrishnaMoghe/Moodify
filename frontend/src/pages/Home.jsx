import React, { useState, useEffect } from "react";
import LoginButton from "../components/LoginButton";
import MoodSelector from "../components/MoodSelector";
import ArtistSelector from "../components/ArtistSelector";
import PlaylistResult from "../components/PlaylistResult";
import { generatePlaylist, logout, getProfile } from "../api/spotify";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [displayName, setDisplayName] = useState(null);
  const [mood, setMood] = useState("");
  const [artists, setArtists] = useState([]);
  const [playlistUrl, setPlaylistUrl] = useState(null);

  // On load, check if profile info exists
  useEffect(() => {
    console.log("Current auth state:", { isAuthenticated, displayName });

    // Check if cookies are present
    console.log("All cookies:", document.cookie);
    const params = new URLSearchParams(window.location.search);
    const name = params.get("displayName");
    if (name) {
      setDisplayName(name);
      localStorage.setItem("displayName", name);
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, "/");
    } else if (localStorage.getItem("displayName")) {
      setDisplayName(localStorage.getItem("displayName"));
      setIsAuthenticated(true);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!mood || artists.length === 0) return alert("Pick mood and artist(s)!");
    try {
      const response = await generatePlaylist(
        mood,
        artists.map(a => a.value)
      );
      setPlaylistUrl(response.data.playlistUrl);
    } catch (err) {
      alert("Error generating playlist.");
    }
  }

  function handleLogout() {
    logout().then(() => {
      localStorage.removeItem("displayName");
      setIsAuthenticated(false);
      setPlaylistUrl(null);
    });
  }

  if (!isAuthenticated) return <LoginButton />;
  if (playlistUrl) return <PlaylistResult url={playlistUrl} />;

  return (
    <div>
      <div>
        <b>Logged in as:</b> {displayName} {" "}
        <button onClick={handleLogout}>Logout</button>
      </div>
      <form onSubmit={handleSubmit}>
        <MoodSelector mood={mood} setMood={setMood} />
        <br />
        <ArtistSelector artists={artists} setArtists={setArtists} />
        <br />
        <button type="submit">Generate Playlist</button>
      </form>
    </div>
  );
}
