const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
  
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: 'Spotify API Error',
        message: error.message || 'An error occurred with Spotify API',
        details: error.body?.error
      });
    }
  
    if (error.message.includes('Invalid mood:')) {
      return res.status(400).json({
        error: 'Invalid Mood',
        message: error.message
      });
    }
  
    if (error.message.includes('No seed artists')) {
      return res.status(400).json({
        error: 'Insufficient Data',
        message: error.message
      });
    }
  
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  };
  
  module.exports = errorHandler;