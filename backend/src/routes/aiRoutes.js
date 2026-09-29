const express = require('express');
const router = express.Router();
const aiAgentController = require('../controllers/aiAgentController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Quick prompt suggestions
router.get('/quick-prompts', aiAgentController.getQuickPrompts);

// Chat with the AI Agent
router.post('/chat', optionalAuth, aiAgentController.chat);

// Run AI food safety pre-check
router.post('/safety-check', optionalAuth, aiAgentController.checkSafety);

module.exports = router;
