const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🎵 Moodify Backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});
