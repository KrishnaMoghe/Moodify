export default function LoginButton() {
  // Fallback to localhost if env var not set
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://moodify-backend-ujf6.onrender.com' 
      : 'http://localhost:8888');
  
  const handleLogin = () => {
    window.location.href = `${backendUrl}/auth/login`;
  };

  return (
    <button onClick={handleLogin}>
      Login with Spotify
    </button>
  );
}
