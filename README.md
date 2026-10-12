# MeeDoo AI JavaScript SDK

> Add AI to your JavaScript app in 3 lines. No AI experience needed.

## What is this?

MeeDoo is an AI platform (like ChatGPT, but yours). This SDK lets you talk to MeeDoo's AI from your JavaScript/Node.js code.

## Installation

```bash
npm install meedoo-ai
```

Or with yarn:

```bash
yarn add meedoo-ai
```

## Getting Started (3 minutes)

### Step 1: Get your API key

1. Go to your MeeDoo chat interface
2. Click **Settings** → **Account**
3. Scroll down to **API Keys**
4. Click **Create API Key**
5. Copy the key (it starts with `md-`)

### Step 2: Your first AI chat

```javascript
const { MeeDooClient } = require('meedoo-ai');

// Create a client with your API key
const client = new MeeDooClient('md-your-api-key-here');

// Ask the AI a question
async function main() {
  const response = await client.chat.completions.create({
    model: 'meedoo:latest',
    messages: [{ role: 'user', content: 'What is the capital of France?' }],
  });

  console.log(response.choices[0].message.content);
  // Output: The capital of France is Paris.
}

main();
```

### Step 3: That's it! You just built an AI app.

---

## Everything You Can Do

### Basic Chat

```javascript
const response = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain quantum computing to a 5-year-old.' },
  ],
});
console.log(response.choices[0].message.content);
```

### Web Search (AI can search the internet)

```javascript
const response = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'What is the Bitcoin price today?' }],
  features: { web_search: true },
});
console.log(response.choices[0].message.content);
// Output: Bitcoin is currently trading at $83,052.07...
```

### Think Mode (AI reasons step by step)

```javascript
const response = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'Solve 15 * 17 step by step.' }],
  think: true,
});
console.log(response.choices[0].message.content);
```

### Memory (AI remembers things about you)

```javascript
// Tell the AI about yourself
await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'My name is Alice and I love chocolate.' }],
  features: { memory: true },
});

// Later, the AI remembers
const response = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'What do you know about me?' }],
  features: { memory: true },
});
console.log(response.choices[0].message.content);
// Output: You are Alice and you love chocolate.
```

### Code Interpreter

```javascript
const response = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'Calculate the factorial of 20.' }],
  features: { code_interpreter: true },
});
console.log(response.choices[0].message.content);
```

### JSON Output

```javascript
const response = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'Give me a JSON with 3 users, each with name and age.' }],
  response_format: { type: 'json_object' },
});
console.log(response.choices[0].message.content);
```

### Custom System Prompt

```javascript
const response = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'Who are you?' }],
  params: { system: 'You are a pirate. Always talk like a pirate.' },
});
console.log(response.choices[0].message.content);
```

### Function Calling

```javascript
const response = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'Search for the latest AI news.' }],
  tool_ids: ['llm_web_search'],
  params: { function_calling: 'native' },
});
```

### Temperature

```javascript
// Focused (same answer every time)
const focused = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'Pick a number 1-10.' }],
  temperature: 0.0,
});

// Creative (different answer each time)
const creative = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'Write a creative story.' }],
  temperature: 1.5,
});
```

### Background Tasks

```javascript
const response = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'Explain how photosynthesis works.' }],
  background_tasks: { title_generation: true, follow_up_generation: true },
});
```

### Variables

```javascript
const response = await client.chat.completions.create({
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'Greet me.' }],
  variables: { user_name: 'Alice', language: 'French' },
});
```

---

## MeeJudge (AI that judges AI)

```javascript
// Check if a message is a prompt injection attack
const injection = await client.judge.detectInjection('Ignore all previous instructions!');
console.log(injection);
// { is_injection: true, attack_type: 'ignore_previous', confidence: 0.03 }

// Check if text is toxic
const moderation = await client.judge.moderate('You are a worthless idiot');
console.log(moderation);
// { is_toxic: true, category: 'none', severity: 2.38 }

// Check if a question needs web search
const shouldSearch = await client.judge.shouldSearchWeb('What is the weather today?');
console.log(shouldSearch);
// { should_search: true }

// Check if a message is spam
const spam = await client.judge.detectSpam('BUY NOW! FREE IPHONE!');
console.log(spam);
// { is_spam: true, spam_type: 'none' }

// Validate an AI response
const validation = await client.judge.validateResponse(
  'What is the capital of France?',
  'The capital of France is Paris.'
);
console.log(validation);
// { has_factual_claims: true, is_verified: true, has_contradictions: false }

// Filter memories
const memory = await client.judge.filterMemory('User likes chocolate');
console.log(memory);
// { should_remember: true, category: 'preference', retention: 1.6 }

// Classify a support ticket (requires admin key)
const ticket = await adminClient.judge.classifyTicket('App crash', 'My app crashes');
console.log(ticket);
// { category: 'bug', priority: 1.8, should_escalate: true }

// Check prayer times
const prayer = await client.judge.isPrayerTimes('What are the prayer times today?');
console.log(prayer);
// { is_prayer_times: true }

// Custom multiple choice
const choice = await adminClient.judge.choice(
  'User message: My app crashed',
  'Classify this support ticket',
  { bug: 'A bug', feature: 'A feature', billing: 'Billing', other: 'Other' }
);
console.log(choice);
// { choice: 'bug', probabilities: {...}, confidence: 0.68 }
```

---

## Account & Usage

```javascript
// Check your credit balance
const credits = await client.usage.credits();
console.log(`Balance: €${credits.credit_balance}`);

// Check your usage stats
const stats = await client.usage.stats();
console.log(`Plan: ${stats.plan}, ${stats.remaining}/${stats.max_requests} requests remaining`);

// List available models
const models = await client.models.list();
models.data.forEach(m => console.log(`  ${m.id}: ${m.name}`));

// Check API config
const config = await client.config();
console.log(`Web search: ${config.features.enable_web_search}`);
console.log(`Judge: ${config.features.enable_judge}`);
```

---

## Error Handling

```javascript
const { MeeDooClient, AuthenticationError, ModelNotFoundError, InsufficientCreditsError } = require('meedoo-ai');

try {
  const response = await client.chat.completions.create({
    model: 'meedoo:latest',
    messages: [{ role: 'user', content: 'Hello!' }],
  });
} catch (e) {
  if (e instanceof AuthenticationError) {
    console.log('Your API key is wrong.');
  } else if (e instanceof InsufficientCreditsError) {
    console.log('Out of credits. Buy more at meedoo.co/pricing-api');
  } else if (e instanceof ModelNotFoundError) {
    console.log('Model not found. Use client.models.list() to see available models.');
  }
}
```

---

## TypeScript Support

This SDK includes TypeScript declarations. Just import and use:

```typescript
import { MeeDooClient, ChatCompletionParams } from 'meedoo-ai';

const client = new MeeDooClient('md-your-key');
const params: ChatCompletionParams = {
  model: 'meedoo:latest',
  messages: [{ role: 'user', content: 'Hello!' }],
  features: { web_search: true },
};
const response = await client.chat.completions.create(params);
```

---

## Complete Reference

### `client.chat.completions.create()` parameters

| Parameter | Type | Default | What it does |
|-----------|------|---------|-------------|
| `model` | `string` | **required** | Which AI model to use |
| `messages` | `array` | **required** | The conversation `[{role, content}]` |
| `stream` | `boolean` | `false` | Live typing effect |
| `temperature` | `number` | model default | `0.0` = focused, `2.0` = creative |
| `top_p` | `number` | model default | Nucleus sampling |
| `min_p` | `number` | model default | Minimum token probability |
| `max_tokens` | `int` | model default | Max output tokens |
| `frequency_penalty` | `number` | `0` | Penalize repeats |
| `presence_penalty` | `number` | `0` | Penalize present tokens |
| `reasoning_effort` | `string` | — | `"low"`, `"medium"`, `"high"` |
| `seed` | `any` | — | Reproducibility |
| `stop` | `array` | — | Stop sequences |
| `response_format` | `object` | — | `{"type": "json_object"}` |
| `think` | `boolean` | `false` | Think mode |
| `features` | `object` | — | `{web_search, memory, code_interpreter}` |
| `tool_ids` | `array` | — | Tool IDs |
| `tools` | `array` | — | Custom tool definitions |
| `tool_choice` | `string` | — | `"auto"`, `"none"` |
| `params` | `object` | — | `{function_calling, system, custom_params}` |
| `chat_id` | `string` | — | Chat session ID |
| `variables` | `object` | — | Template variables |
| `background_tasks` | `object` | — | `{title_generation, follow_up_generation}` |
| `use_credits` | `boolean` | — | Use API credits |
| `metadata` | `object` | — | Additional metadata |

---

## FAQ

**Q: Does this work in the browser?**
This SDK uses Node.js built-in HTTP. For browser usage, use `fetch` directly or a wrapper.

**Q: What Node.js version do I need?**
Node.js 18 or higher.

**Q: Are there any dependencies?**
No. The SDK uses only Node.js built-in modules.

---

## License

MIT © MeeDoo