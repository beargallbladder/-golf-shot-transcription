const express = require('express');
const { requireJWT } = require('../middleware/auth');
const OpenAI = require('openai');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Language configurations
const SUPPORTED_LANGUAGES = {
  'english': { code: 'en', name: 'English' },
  'japanese': { code: 'ja', name: 'Japanese' },
  'korean': { code: 'ko', name: 'Korean' },
  'spanish': { code: 'es', name: 'Spanish' }
};

// Golf-specific terminology for better transcription
const GOLF_TERMINOLOGY = [
  'driver', 'iron', 'wedge', 'putter', 'hybrid', 'fairway wood',
  'loft', 'lie', 'shaft', 'grip', 'flex', 'regular', 'stiff', 'extra stiff',
  'graphite', 'steel', 'titleist', 'callaway', 'taylormade', 'ping', 'mizuno',
  'yards', 'meters', 'mph', 'rpm', 'launch angle', 'spin rate',
  'draw', 'fade', 'slice', 'hook', 'straight', 'ball speed', 'club speed',
  'fitting', 'custom', 'off the rack', 'adjustment', 'recommendation'
];

// POST /api/voice/transcribe - Transcribe and optionally translate voice
router.post('/transcribe', requireJWT, async (req, res) => {
  try {
    console.log('🎤 Voice transcription request received');
    
    // Voice transcription is now handled client-side using Web Speech API
    // This endpoint is kept for compatibility but transcription happens in browser
    res.status(200).json({
      message: 'Voice transcription is now handled client-side using Web Speech API',
      note: 'Real-time transcription happens in the browser for better performance',
      supportedLanguages: SUPPORTED_LANGUAGES
    });

  } catch (error) {
    console.error('❌ Voice transcription error:', error);
    res.status(500).json({
      error: 'Transcription service error',
      message: 'Failed to process voice transcription request.'
    });
  }
});

// GET /api/voice/languages - Get supported languages
router.get('/languages', (req, res) => {
  res.json({
    supportedLanguages: SUPPORTED_LANGUAGES,
    golfTerminology: GOLF_TERMINOLOGY.slice(0, 10) // Sample terms
  });
});

module.exports = router; 