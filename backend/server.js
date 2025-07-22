import { listen } from './src/app';
require('dotenv').config();

const PORT = process.env.PORT || 3001;

listen(PORT, () => {
  console.log(`🎵 Moodify Backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});
