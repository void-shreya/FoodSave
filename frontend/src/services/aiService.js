import api from './api';

export const aiService = {
  /**
   * Send a chat message to the FoodSave AI Assistant
   */
  async sendMessage(message, history = []) {
    const response = await api.post('/ai/chat', { message, history });
    return response.data.data;
  },

  /**
   * Fetch categorized prompt suggestions
   */
  async getQuickPrompts() {
    const response = await api.get('/ai/quick-prompts');
    return response.data.data;
  },

  /**
   * Run automated food safety evaluation on donation parameters
   */
  async checkFoodSafety(donationData) {
    const response = await api.post('/ai/safety-check', donationData);
    return response.data.data;
  }
};

export default aiService;
