// MeeDoo AI SDK — Main Client

const https = require('https');
const http = require('http');
const { URL } = require('url');
const {
  APIError,
  AuthenticationError,
  InsufficientCreditsError,
  ModelNotFoundError,
  RateLimitError,
} = require('./exceptions');

class ChatCompletions {
  constructor(client) {
    this._client = client;
  }

  /**
   * Create a chat completion.
   * @param {Object} params - Completion parameters
   * @param {string} params.model - Model ID (required)
   * @param {Array} params.messages - Chat messages [{role, content}] (required)
   * @param {boolean} params.stream - Enable SSE streaming
   * @param {number} params.temperature - 0.0-2.0
   * @param {number} params.top_p - 0.0-1.0
   * @param {number} params.min_p - 0.0-1.0
   * @param {number} params.max_tokens - Max output tokens
   * @param {number} params.frequency_penalty - -2.0 to 2.0
   * @param {number} params.presence_penalty - -2.0 to 2.0
   * @param {string} params.reasoning_effort - "low", "medium", "high"
   * @param {any} params.seed - Reproducibility seed
   * @param {Array} params.stop - Stop sequences
   * @param {Object} params.response_format - JSON mode or schema
   * @param {boolean} params.think - Think mode for reasoning
   * @param {Object} params.features - {web_search, memory, code_interpreter, ...}
   * @param {Array} params.tool_ids - Tool function IDs
   * @param {Array} params.tools - Native FC tool specs
   * @param {string} params.tool_choice - "auto", "none", specific
   * @param {Object} params.params - {function_calling, system, custom_params, ...}
   * @param {string} params.chat_id - Chat session ID
   * @param {Object} params.variables - Template variables
   * @param {Object} params.background_tasks - {title_generation, follow_ups, ...}
   * @param {boolean} params.use_credits - Use API credits
   * @returns {Promise<Object>|AsyncGenerator} Completion or stream of chunks
   */
  async create(params = {}) {
    const { stream = false, ...rest } = params;
    if (stream) {
      return this._stream({ stream: true, ...rest });
    }
    return this._client._post('/chat/completions', { stream: false, ...rest });
  }

  async *_stream(payload) {
    const url = new URL(`${this._client.baseURL}/chat/completions`);
    const body = JSON.stringify({ ...payload, stream: true });
    const isHttps = url.protocol === 'https:';
    const mod = isHttps ? https : http;

    yield new Promise((resolve, reject) => {
      const req = mod.request(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._client.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      }, (res) => {
        if (res.statusCode === 401) return reject(new AuthenticationError());
        if (res.statusCode === 429) return reject(new RateLimitError());
        if (res.statusCode >= 400) {
          let data = '';
          res.on('data', (c) => data += c);
          res.on('end', () => {
            try { reject(new APIError(JSON.parse(data).detail || `HTTP ${res.statusCode}`)); }
            catch { reject(new APIError(`HTTP ${res.statusCode}`)); }
          });
          return;
        }

        let buffer = '';
        res.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') return resolve();
              try { resolve({ chunk: JSON.parse(dataStr) }); } catch {}
            }
          }
        });
        res.on('end', () => resolve());
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  createSync = null; // placeholder for sync version
}

class Models {
  constructor(client) { this._client = client; }
  list() { return this._client._get('/models'); }
}

class Usage {
  constructor(client) { this._client = client; }
  credits() { return this._client._get('/v1/usage/credits'); }
  stats() { return this._client._get('/v1/usage/stats'); }
}

class MeeDooClient {
  /**
   * Create a MeeDoo AI client.
   * @param {string} apiKey - Your MeeDoo API key (starts with "md-")
   * @param {string} baseURL - API base URL (default: https://api.meedoo.co/api)
   * @param {number} timeout - Request timeout in ms (default: 120000)
   * @param {number} maxRetries - Max retries on 5xx (default: 3)
   */
  constructor(apiKey, baseURL = 'https://api.meedoo.co/api', timeout = 120000, maxRetries = 3) {
    if (!apiKey) throw new Error('apiKey is required');
    this.apiKey = apiKey;
    this.baseURL = baseURL.replace(/\/$/, '');
    this.timeout = timeout;
    this.maxRetries = maxRetries;

    this.chat = { completions: new ChatCompletions(this) };
    this.models = new Models(this);
    this.usage = new Usage(this);
  }

  _headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async _get(path) {
    const url = new URL(`${this.baseURL}${path}`);
    const isHttps = url.protocol === 'https:';
    const mod = isHttps ? https : http;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this._request(mod, url, 'GET');
      } catch (e) {
        if (e instanceof APIError && attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
          continue;
        }
        throw e;
      }
    }
  }

  async _post(path, payload) {
    const url = new URL(`${this.baseURL}${path}`);
    const isHttps = url.protocol === 'https:';
    const mod = isHttps ? https : http;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this._request(mod, url, 'POST', JSON.stringify(payload));
      } catch (e) {
        if (e instanceof APIError && attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
          continue;
        }
        throw e;
      }
    }
  }

  _request(mod, url, method, body) {
    return new Promise((resolve, reject) => {
      const options = {
        method,
        headers: this._headers(),
        timeout: this.timeout,
      };
      if (body) {
        options.headers['Content-Length'] = Buffer.byteLength(body);
      }
      const req = mod.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try { resolve(JSON.parse(data)); }
            catch { resolve(data); }
          } else if (res.statusCode === 401) {
            reject(new AuthenticationError());
          } else if (res.statusCode === 429) {
            reject(new RateLimitError());
          } else {
            let parsed;
            try { parsed = JSON.parse(data); } catch { parsed = { detail: data }; }
            const detail = parsed.detail || '';
            if (detail.includes('Insufficient API credits')) {
              reject(new InsufficientCreditsError(detail));
            } else if (detail.includes('Model not found')) {
              reject(new ModelNotFoundError(detail));
            } else {
              reject(new APIError(detail || `HTTP ${res.statusCode}`, res.statusCode, parsed));
            }
          }
        });
      });
      req.on('error', (e) => reject(new APIError(e.message)));
      req.on('timeout', () => { req.destroy(); reject(new APIError('Request timeout')); });
      if (body) req.write(body);
      req.end();
    });
  }

  async config() {
    const url = new URL(`${this.baseURL}/config`);
    return this._request(http, url, 'GET');
  }

  async health() {
    const healthURL = this.baseURL.replace(/\/api$/, '/health');
    const url = new URL(healthURL);
    return this._request(http, url, 'GET');
  }
}

module.exports = { MeeDooClient };