/**
 * OfflineProvider
 * ----------------
 * Wraps offlineChatService in the same provider interface as
 * OpenRouterProvider so ChatService can treat every provider uniformly
 * (strategy pattern). This provider is designed to NEVER throw — it is
 * the last line of defense and must always return a reply.
 */

const { getOfflineReply } = require('../services/offlineChatService');

class OfflineProvider {
  constructor() {
    this.name = 'offline';
  }

  async generateReply({ message }) {
    const reply = getOfflineReply(message);
    return { reply, provider: this.name };
  }
}

module.exports = new OfflineProvider();
