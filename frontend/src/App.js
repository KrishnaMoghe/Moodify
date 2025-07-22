import React, { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:3001';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const moods = [
    { id: 'happy', name: 'Happy', desc: 'Upbeat and positive' },
    { id: 'sad', name: 'Sad', desc: 'Melancholic and emotional' },
    { id: 'energetic', name: 'Energetic', desc: 'High energy and danceable' },
    { id: 'chill', name: 'Chill', desc: 'Relaxed and peaceful' },
    { id: 'romantic', name: 'Romantic', desc: 'Love and heartfelt' },
    { id: 'angry', name: 'Angry', desc: 'Intense and powerful' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setAccessToken(token);
      setIsLoggedIn(true);
      loadUserProfile(token);
    }
    checkForCallback();
  }, []);

  const checkForCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError(`Login failed: ${errorParam}`);
      window.history.replaceState({}, document.title, "/");
      return;
    }

    if (accessToken) {
      localStorage.setItem('spotify_access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('spotify_refresh_token', refreshToken);
      }
      
      setAccessToken(accessToken);
      setIsLoggedIn(true);
      loadUserProfile(accessToken);
      setMessage('Successfully logged in!');
      window.history.replaceState({}, document.title, "/");
    }
  };

  const loadUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      console.log('Could not load profile');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/login`);
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (err) {
      setError('Could not start login');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setAccessToken(null);
    setUser(null);
    setPlaylist(null);
    setSelectedMood('');
    setMessage('Logged out successfully');
  };

  const generatePlaylist = async () => {
    if (!selectedMood) {
      setError('Please select a mood first');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/playlist/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          mood: selectedMood,
          limit: 10,
          saveToSpotify: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylist(data.playlist);
        setMessage('Playlist generated!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate playlist');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const saveToSpotify = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/playlist/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          mood: selectedMood,
          limit: 10,
          saveToSpotify: true,
          playlistName: `Moodify - ${selectedMood}`
        })
      });

      if (response.ok) {
        setMessage('Playlist saved to Spotify!');
      } else {
        setError('Failed to save playlist');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="card">
          <h1>🎵 Moodify</h1>
          <p>Create playlists based on your mood</p>
          <button className="btn" onClick={handleLogin}>
            Connect with Spotify
          </button>
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>🎵 Moodify</h1>
        {user && (
          <>
            <p>Welcome back, <strong>{user.display_name}</strong>!</p>
            <button className="btn" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>

      <div className="card">
        <h2>What's your mood?</h2>
        <div className="mood-buttons">
          {moods.map(mood => (
            <button
              key={mood.id}
              className={`mood-btn ${selectedMood === mood.id ? 'selected' : ''}`}
              onClick={() => setSelectedMood(mood.id)}
            >
              <strong>{mood.name}</strong><br />
              <small>{mood.desc}</small>
            </button>
          ))}
        </div>
        
        <button 
          className="btn" 
          onClick={generatePlaylist} 
          disabled={loading || !selectedMood}
        >
          {loading ? 'Generating...' : 'Generate Playlist'}
        </button>
        
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}
      </div>

      {playlist && (
        <div className="card">
          <h2>Your {selectedMood} playlist</h2>
          <p>{playlist.tracks.length} songs generated</p>
          
          <button className="btn" onClick={saveToSpotify} disabled={loading}>
            {loading ? 'Saving...' : 'Save to Spotify'}
          </button>
          
          <div style={{marginTop: '20px'}}>
            {playlist.tracks.map(track => (
              <div key={track.id} className="track">
                {track.album.images[0] && (
                  <img 
                    src={track.album.images[0].url} 
                    alt={track.album.name}
                  />
                )}
                <div>
                  <div><strong>{track.name}</strong></div>
                  <div>{track.artists.map(a => a.name).join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;