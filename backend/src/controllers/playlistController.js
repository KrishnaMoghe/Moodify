const PlaylistGenerator = require('../services/playlistGenerator');
const MoodAnalyzer = require('../services/moodAnalyzer');

const generatePlaylist = async (req, res) => {
  try {
    const { mood, limit, customArtists, playlistName, saveToSpotify } = req.body;

    if (!mood) {
      return res.status(400).json({
        error: 'Missing mood parameter',
        message: 'Mood is required to generate playlist',
        availableMoods: MoodAnalyzer.getAvailableMoods()
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
    const moods = MoodAnalyzer.getAvailableMoods().map(mood => ({
      id: mood,
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      description: MoodAnalyzer.getMoodDescription(mood),
      parameters: MoodAnalyzer.getMoodParameters(mood)
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

module.exports = {
  generatePlaylist,
  getMoods
};
