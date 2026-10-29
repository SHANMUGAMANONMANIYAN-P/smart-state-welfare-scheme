import express from 'express';
import { answerSchemeQuestion, DEFAULT_SUGGESTIONS } from '../services/chatbotService.js';

const router = express.Router();

/**
 * POST /api/v1/chatbot/query
 * Query the Scheme Assistant with natural language
 */
router.post('/query', async (req, res, next) => {
  try {
    const { question, language = 'en', userProfile } = req.body;
    const result = await answerSchemeQuestion({
      question,
      language,
      userProfile,
    });
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/chatbot/suggestions
 * Retrieve suggested questions in specified language
 */
router.get('/suggestions', (req, res) => {
  const lang = req.query.lang === 'ta' ? 'ta' : 'en';
  res.json({
    success: true,
    data: DEFAULT_SUGGESTIONS[lang] || DEFAULT_SUGGESTIONS.en,
  });
});

export default router;
