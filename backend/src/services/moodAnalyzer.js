const MOOD_MAPPINGS = {
    happy: {
      target_energy: 0.8,
      min_energy: 0.6,
      max_energy: 1.0,
      target_valence: 0.8,
      min_valence: 0.6,
      max_valence: 1.0,
      target_danceability: 0.7,
      min_danceability: 0.5,
      max_danceability: 1.0,
      mode: 1
    },
    sad: {
      target_energy: 0.3,
      min_energy: 0.0,
      max_energy: 0.5,
      target_valence: 0.2,
      min_valence: 0.0,
      max_valence: 0.4,
      target_acousticness: 0.6,
      min_acousticness: 0.3,
      max_acousticness: 1.0,
      mode: 0
    },
    energetic: {
      target_energy: 0.9,
      min_energy: 0.7,
      max_energy: 1.0,
      target_danceability: 0.8,
      min_danceability: 0.6,
      max_danceability: 1.0,
      target_tempo: 120,
      min_tempo: 100,
      max_tempo: 180
    },
    chill: {
      target_energy: 0.4,
      min_energy: 0.2,
      max_energy: 0.6,
      target_valence: 0.5,
      min_valence: 0.3,
      max_valence: 0.7,
      target_acousticness: 0.5,
      min_acousticness: 0.2,
      max_acousticness: 0.8
    }
  };
  
  class MoodAnalyzer {
    static getAvailableMoods() {
      return Object.keys(MOOD_MAPPINGS);
    }
  
    static getMoodParameters(mood) {
      if (!MOOD_MAPPINGS[mood]) {
        throw new Error(`Unknown mood: ${mood}. Available moods: ${this.getAvailableMoods().join(', ')}`);
      }
      return MOOD_MAPPINGS[mood];
    }
  
    static validateMood(mood) {
      return MOOD_MAPPINGS.hasOwnProperty(mood);
    }
  
    static getMoodDescription(mood) {
      const descriptions = {
        happy: 'Upbeat, positive, and energizing tracks',
        sad: 'Melancholic, emotional, and introspective songs',
        energetic: 'High-energy, danceable, and pump-up music',
        chill: 'Relaxed, laid-back, and peaceful vibes'
      };
      return descriptions[mood] || 'Custom mood playlist';
    }
  }
  
  export default MoodAnalyzer;
  