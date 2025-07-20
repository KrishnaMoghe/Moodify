import React, { useState, useEffect } from "react";
import LoginButton from "../components/LoginButton";
import MoodSelector from "../components/MoodSelector";
import ArtistSelector from "../components/ArtistSelector";
import PlaylistResult from "../components/PlaylistResult";
import { generatePlaylist, logout } from "../api/spotify";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [displayName, setDisplayName] = useState(null);
  const [mood, setMood] = useState("");
  const [artists, setArtists] = useState([]);
  const [playlistUrl, setPlaylistUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Current auth state:", { isAuthenticated, displayName });
    console.log("All cookies:", document.cookie);
    
    const params = new URLSearchParams(window.location.search);
    const name = params.get("displayName");
    
    if (name) {
      // User just returned from Spotify OAuth
      setDisplayName(name);
      localStorage.setItem("displayName", name);
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, "/");
    } else if (localStorage.getItem("displayName")) {
      // User was previously logged in
      setDisplayName(localStorage.getItem("displayName"));
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!mood || artists.length === 0) {
      alert("Please select both mood and artist(s)!");
      return;
    }
    
    console.log("Generating playlist with:", {
      mood,
      artistIds: artists.map(a => a.value),
      artists: artists
    });
    
    try {
      const response = await generatePlaylist(
        mood,
        artists.map(a => a.value)
      );
      setPlaylistUrl(response.data.playlistUrl);
    } catch (err) {
      console.error("Playlist generation error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        handleLogout();
      } else if (err.response?.status === 500) {
        alert(`Server error: ${err.response?.data?.details || 'Unknown error'}`);
      } else {
        alert("Error generating playlist. Please try again.");
      }
    }
  }
  
  function handleLogout() {
    logout().then(() => {
      localStorage.removeItem("displayName");
      setIsAuthenticated(false);
      setDisplayName(null);
      setPlaylistUrl(null);
      setMood("");
      setArtists([]);
    });
  }

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <div>
        <h2>Welcome to Moodify!</h2>
        <p>Login with Spotify to create personalized playlists based on your mood.</p>
        <LoginButton />
      </div>
    );
  }

  // Show playlist result if generated
  if (playlistUrl) {
    return (
      <div>
        <PlaylistResult url={playlistUrl} />
        <button onClick={() => setPlaylistUrl(null)}>Create Another Playlist</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  // Show main form only when authenticated
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <strong>Logged in as:</strong> {displayName}
        <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
          Logout
        </button>
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
