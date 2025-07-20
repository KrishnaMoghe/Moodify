export default function PlaylistResult({ url }) {
    return (
      <div>
        <h3>Your Spotify playlist is ready!</h3>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Open Playlist on Spotify
        </a>
      </div>
    );
  }
  