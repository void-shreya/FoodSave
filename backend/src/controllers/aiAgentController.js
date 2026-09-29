const aiAgentService = require('../services/aiAgentService');

/**
 * AI Assistant Chat Controller
 */
const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const userContext = req.user ? {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      email: req.user.email
    } : null;

    const result = await aiAgentService.processQuery({
      message,
      history,
      userContext
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Quick Suggested Prompts
 */
const getQuickPrompts = async (req, res, next) => {
  try {
    const categories = aiAgentService.getQuickPrompts();
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Automated Safety Check for a listing
 */
const checkSafety = async (req, res, next) => {
  try {
    const evaluation = await aiAgentService.evaluateFoodSafety(req.body);
    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  chat,
  getQuickPrompts,
  checkSafety
};
