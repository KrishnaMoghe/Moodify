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
  const [playlistHistory, setPlaylistHistory] = useState([]);

  const moods = [
    { 
      id: 'happy', 
      name: 'Happy', 
      desc: 'Upbeat and positive vibes',
      emoji: '😊',
      color: '#FFD93D'
    },
    { 
      id: 'sad', 
      name: 'Sad', 
      desc: 'Melancholic and emotional',
      emoji: '😢',
      color: '#6C7CE0'
    },
    { 
      id: 'energetic', 
      name: 'Energetic', 
      desc: 'High energy and danceable',
      emoji: '⚡',
      color: '#FF6B6B'
    },
    { 
      id: 'chill', 
      name: 'Chill', 
      desc: 'Relaxed and peaceful',
      emoji: '😌',
      color: '#4ECDC4'
    },
    { 
      id: 'romantic', 
      name: 'Romantic', 
      desc: 'Love and heartfelt moments',
      emoji: '💕',
      color: '#FF8A95'
    },
    { 
      id: 'angry', 
      name: 'Angry', 
      desc: 'Intense and powerful',
      emoji: '😤',
      color: '#FF5722'
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setAccessToken(token);
      setIsLoggedIn(true);
      loadUserProfile(token);
      loadPlaylistHistory();
    }
    checkForCallback();
    
    // Auto-clear messages after 5 seconds
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const loadPlaylistHistory = () => {
    const history = JSON.parse(localStorage.getItem('playlist_history') || '[]');
    setPlaylistHistory(history);
  };

  const saveToHistory = (playlist) => {
    const history = JSON.parse(localStorage.getItem('playlist_history') || '[]');
    const newEntry = {
      id: Date.now(),
      mood: playlist.mood,
      trackCount: playlist.tracks.length,
      createdAt: new Date().toLocaleDateString(),
      preview: playlist.tracks.slice(0, 3)
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
    localStorage.setItem('playlist_history', JSON.stringify(updatedHistory));
    setPlaylistHistory(updatedHistory);
  };

  const checkForCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError(`Login failed: ${errorParam.replace('_', ' ')}`);
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
      setMessage('🎉 Successfully connected to Spotify!');
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
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/login`);
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (err) {
      setError('Could not start login process');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setAccessToken(null);
    setUser(null);
    setPlaylist(null);
    setSelectedMood('');
    setPlaylistHistory([]);
    setMessage('👋 Successfully logged out');
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
          limit: 15,
          saveToSpotify: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylist(data.playlist);
        saveToHistory(data.playlist);
        setMessage(`🎵 Generated ${data.playlist.tracks.length} ${selectedMood} songs!`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate playlist');
      }
    } catch (err) {
      setError('Network error - please check your connection');
    }
    setLoading(false);
  };

  const saveToSpotify = async () => {
    if (!playlist) return;

    setLoading(true);
    setError('');

    try {
      const currentMood = moods.find(m => m.id === selectedMood);
      const playlistName = `Moodify ${currentMood?.emoji || '🎵'} ${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}`;

      const response = await fetch(`${API_URL}/playlist/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          mood: selectedMood,
          limit: 15,
          saveToSpotify: true,
          playlistName
        })
      });

      if (response.ok) {
        setMessage('✅ Playlist saved to your Spotify account!');
      } else {
        setError('Failed to save playlist to Spotify');
      }
    } catch (err) {
      setError('Network error while saving');
    }
    setLoading(false);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="card">
          <h1>🎵 Moodify</h1>
          <p style={{textAlign: 'center', fontSize: '1.2rem', marginBottom: '30px'}}>
            Discover music that perfectly matches your mood
          </p>
          
          <div style={{textAlign: 'center'}}>
            <button className="btn" onClick={handleLogin} disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Connecting...
                </>
              ) : (
                '🎧 Connect with Spotify'
              )}
            </button>
          </div>

          {error && <div className="error">❌ {error}</div>}
          {message && <div className="success">✅ {message}</div>}
          
          <div style={{textAlign: 'center', marginTop: '20px', opacity: '0.7'}}>
            <small>We'll never post anything without your permission</small>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="container">
      {/* Header */}
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1>🎵 Moodify</h1>
            {user && (
              <div className="user-welcome">
                {user.images?.[0] && (
                  <img 
                    src={user.images[0].url} 
                    alt={user.display_name}
                    className="user-avatar"
                  />
                )}
                <div>
                  <p style={{margin: 0, fontSize: '1.1rem'}}>
                    Welcome back, <strong>{user.display_name}</strong>! 👋
                  </p>
                  <small style={{opacity: 0.7}}>Ready to discover your perfect playlist?</small>
                </div>
              </div>
            )}
          </div>
          <button className="btn" onClick={handleLogout} style={{background: 'rgba(255,255,255,0.1)'}}>
            Logout
          </button>
        </div>
      </div>

      {/* Mood Selection */}
      <div className="card">
        <h2>🎭 What's your mood?</h2>
        <div className="mood-buttons">
          {moods.map(mood => (
            <button
              key={mood.id}
              className={`mood-btn ${selectedMood === mood.id ? 'selected' : ''}`}
              onClick={() => setSelectedMood(mood.id)}
              style={{
                borderColor: selectedMood === mood.id ? mood.color : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <strong>{mood.emoji} {mood.name}</strong>
              <small>{mood.desc}</small>
            </button>
          ))}
        </div>
        
        <div style={{textAlign: 'center'}}>
          <button 
            className="btn" 
            onClick={generatePlaylist} 
            disabled={loading || !selectedMood}
            style={{
              background: selectedMood ? `linear-gradient(45deg, ${moods.find(m => m.id === selectedMood)?.color || '#1DB954'}, #1ed760)` : '#666'
            }}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Generating your playlist...
              </>
            ) : (
              `🎵 Generate ${selectedMood ? selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1) : ''} Playlist`
            )}
          </button>
        </div>
        
        {error && <div className="error">❌ {error}</div>}
        {message && <div className="success">✅ {message}</div>}
      </div>

      {/* Generated Playlist */}
      {playlist && (
        <div className="card">
          <div className="playlist-header">
            <div>
              <h2>
                {moods.find(m => m.id === playlist.mood)?.emoji} Your {playlist.mood} playlist
              </h2>
              <div className="playlist-stats">
                {playlist.tracks.length} songs • ~{Math.round(playlist.tracks.reduce((total, track) => total + track.duration_ms, 0) / 60000)} minutes
              </div>
            </div>
            <button className="btn" onClick={saveToSpotify} disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Saving...
                </>
              ) : (
                '💾 Save to Spotify'
              )}
            </button>
          </div>
          
          <div>
            {playlist.tracks.map((track, index) => (
              <div key={track.id} className="track">
                <div style={{fontSize: '14px', opacity: '0.7', minWidth: '20px'}}>
                  {index + 1}
                </div>
                {track.album.images[0] && (
                  <img 
                    src={track.album.images[0].url} 
                    alt={track.album.name}
                  />
                )}
                <div className="track-info">
                  <div className="track-title">{track.name}</div>
                  <div className="track-artist">{track.artists.map(a => a.name).join(', ')}</div>
                </div>
                <div style={{fontSize: '14px', opacity: '0.7'}}>
                  {formatDuration(track.duration_ms)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playlist History */}
      {playlistHistory.length > 0 && (
        <div className="card">
          <h2>📚 Recent Playlists</h2>
          <div style={{display: 'grid', gap: '10px'}}>
            {playlistHistory.slice(0, 5).map(entry => (
              <div key={entry.id} className="track" style={{cursor: 'default'}}>
                <div style={{fontSize: '20px'}}>
                  {moods.find(m => m.id === entry.mood)?.emoji || '🎵'}
                </div>
                <div className="track-info">
                  <div className="track-title">{entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)} Playlist</div>
                  <div className="track-artist">{entry.trackCount} songs • {entry.createdAt}</div>
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
