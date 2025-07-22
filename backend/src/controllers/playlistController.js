import PlaylistGenerator from '../services/playlistGenerator';
import { getAvailableMoods, getMoodDescription, getMoodParameters } from '../services/moodAnalyzer';

const generatePlaylist = async (req, res) => {
  try {
    const { mood, limit, customArtists, playlistName, saveToSpotify } = req.body;

    if (!mood) {
      return res.status(400).json({
        error: 'Missing mood parameter',
        message: 'Mood is required to generate playlist',
        availableMoods: getAvailableMoods()
      });
    }

    const generator = new PlaylistGenerator(req.spotifyAccessToken);
    const playlist = await generator.generatePlaylist(mood, {
      limit: limit || 20,
      customArtists: customArtists || [],
      playlistName,
      saveToSpotify: saveToSpotify || false
    });

    res.json({
      success: true,
      playlist
    });
  } catch (error) {
    console.error('Generate playlist error:', error);
    res.status(400).json({
      error: 'Playlist generation failed',
      message: error.message
    });
  }
};

const getMoods = (req, res) => {
  try {
    const moods = getAvailableMoods().map(mood => ({
      id: mood,
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      description: getMoodDescription(mood),
      parameters: getMoodParameters(mood)
    }));

    res.json({
      success: true,
      moods
    });
  } catch (error) {
    console.error('Get moods error:', error);
    res.status(500).json({
      error: 'Failed to retrieve moods',
      message: error.message
    });
  }
};

export default {
  generatePlaylist,
  getMoods
};
