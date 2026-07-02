/**
 * OpenRouterProvider
 * -------------------
 * Talks to OpenRouter's OpenAI-compatible chat completions endpoint.
 * Throws on ANY failure (missing key, invalid key, network error, timeout,
 * non-2xx response, malformed response, empty content) so that ChatService
 * can catch it and fall back to the next provider. This provider never
 * swallows its own errors — that responsibility belongs to ChatService.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
const REQUEST_TIMEOUT_MS = 15000;

class OpenRouterProvider {
  constructor() {
    this.name = 'openrouter';
  }

  async generateReply({ message, conversationHistory = [], systemPrompt = '' }) {
    const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...conversationHistory
        .filter(m => m && m.content)
        .map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content),
        })),
      { role: 'user', content: message },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          // Recommended by OpenRouter for analytics/rate-limit attribution; harmless if ignored.
          'HTTP-Referer': process.env.FRONTEND_URL || 'https://lecture-link.app',
          'X-Title': 'Lecture-Link LL Assistant',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('OpenRouter request timed out');
      }
      throw new Error(`OpenRouter network error: ${err.message}`);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      let detail = '';
      try {
        const errBody = await response.json();
        detail = errBody?.error?.message || JSON.stringify(errBody);
      } catch {
        detail = await response.text().catch(() => '');
      }
      throw new Error(`OpenRouter HTTP ${response.status}: ${detail}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (err) {
      throw new Error(`OpenRouter returned invalid JSON: ${err.message}`);
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error('OpenRouter returned an empty response');
    }

    return { reply, provider: this.name };
  }
}

module.exports = new OpenRouterProvider();
