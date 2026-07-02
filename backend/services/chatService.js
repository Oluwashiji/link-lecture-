/**
 * ChatService
 * ------------
 * Strategy/provider-pattern orchestrator. Tries each provider in order and
 * returns the first successful reply. Any provider that throws — for ANY
 * reason (missing key, invalid key, network failure, timeout, quota
 * exceeded, rate limit, server error, malformed response, or any other
 * unexpected exception) — is skipped in favor of the next provider.
 * OfflineProvider is last in the chain and is guaranteed to succeed, so
 * getReply() itself never throws and the frontend never sees an error.
 *
 * To add or reorder providers in the future, just edit the array passed
 * into `new ChatService([...])` below — nothing else in the app needs to
 * change (open/closed principle).
 */

const openRouterProvider = require('../providers/openRouterProvider');
const offlineProvider = require('../providers/offlineProvider');

class ChatService {
  constructor(providers) {
    this.providers = providers;
  }

  async getReply(payload) {
    for (const provider of this.providers) {
      try {
        const result = await provider.generateReply(payload);
        if (result && result.reply) {
          console.log(`[ChatService] Response served by: ${provider.name}`);
          return result;
        }
        console.warn(`[ChatService] Provider "${provider.name}" returned no reply — falling back`);
      } catch (err) {
        // Internal error detail is logged server-side only; it is never
        // sent to the client. This is exactly what lets us fail silently
        // from the user's perspective and fall through to the next provider.
        console.error(`[ChatService] Provider "${provider.name}" failed: ${err.message}`);
      }
    }
    // Unreachable in practice as long as OfflineProvider (which never
    // throws) remains last in the chain — kept as a final safety net.
    return { reply: "I'm currently unable to respond. Please try again shortly.", provider: 'none' };
  }
}

module.exports = new ChatService([openRouterProvider, offlineProvider]);
