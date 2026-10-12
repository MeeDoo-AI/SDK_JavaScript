// MeeDoo AI JavaScript SDK — Tests
// Set env vars before running:
//   export MEEDEO_API_KEY="md-your-api-key"
//   export MEEDEO_BASE_URL="https://api.meedoo.co/api"
// Run: node tests/test_sdk.js

const { MeeDooClient, AuthenticationError, ModelNotFoundError } = require('../src');

const API_KEY = process.env.MEEDEO_API_KEY || '';
const BASE_URL = process.env.MEEDEO_BASE_URL || 'https://api.meedoo.co/api';

if (!API_KEY) {
  console.log('MEEDEO_API_KEY not set — skipping tests');
  process.exit(0);
}

const client = new MeeDooClient(API_KEY, BASE_URL);

let passed = 0, failed = 0;

async function test(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) { console.log(`  ✗ ${name}: ${e.message}`); failed++; }
}
function assert(c, m = 'Assertion failed') { if (!c) throw new Error(m); }

async function runTests() {
  console.log('\n=== Models ===');
  await test('list models', async () => {
    const m = await client.models.list();
    assert(m.data.length > 0);
    assert(m.data.some(x => x.id === 'meedoo:latest'));
  });

  console.log('\n=== Basic Chat ===');
  await test('basic chat', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'Say hello' }] });
    assert(r.choices[0].message.content);
  });

  await test('chat with usage', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'What is 2+2? Just the number.' }] });
    assert(r.usage && r.usage.total_tokens > 0);
  });

  console.log('\n=== LLM Params ===');
  await test('temperature', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'Pick a number' }], temperature: 0.0 });
    assert(r.choices[0].message.content);
  });

  await test('stop sequence', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'Count: one two three four' }], stop: ['three'] });
    assert(!r.choices[0].message.content.includes('three'));
  });

  await test('response format json', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'Return JSON {"name":"test"}' }], response_format: { type: 'json_object' } });
    assert(r.choices[0].message.content.includes('{') || r.choices[0].message.content.includes('json'));
  });

  console.log('\n=== Features ===');
  await test('web search', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'What is the Bitcoin price today?' }], features: { web_search: true } });
    assert(r.usage.input_tokens > 100);
  });

  await test('think mode', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'What is 15*17?' }], think: true });
    assert(r.choices[0].message.content);
  });

  await test('memory', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'What do you know about me?' }], features: { memory: true } });
    assert(r.choices[0].message.content);
  });

  console.log('\n=== Tools ===');
  await test('native function calling', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'What tools do you have?' }], params: { function_calling: 'native' } });
    assert(r.choices[0].message.content);
  });

  await test('tool_ids', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'Search for AI news' }], tool_ids: ['llm_web_search'], params: { function_calling: 'native' } });
    assert(r.choices[0].message.content || (r.choices[0].message.tool_calls && r.choices[0].message.tool_calls.length > 0));
  });

  console.log('\n=== Context ===');
  await test('custom system prompt', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'Who are you?' }], params: { system: 'You are a pirate.' } });
    assert(r.choices[0].message.content);
  });

  await test('use credits', async () => {
    const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'Say OK' }], use_credits: true });
    assert(r.choices[0].message.content);
  });

  console.log('\n=== Endpoints ===');
  await test('credits', async () => {
    const c = await client.usage.credits();
    assert(c.credit_balance >= 0);
  });

  await test('stats', async () => {
    const s = await client.usage.stats();
    assert(['explorer','creator','business','scale'].includes(s.plan));
  });

  await test('config', async () => {
    const c = await client.config();
    assert(c.status === true);
  });

  await test('health', async () => {
    const h = await client.health();
    assert(h.status === true);
  });

  console.log('\n=== Errors ===');
  await test('no auth', async () => {
    try { await new MeeDooClient('invalid', BASE_URL).models.list(); throw new Error('should fail'); }
    catch (e) { assert(e instanceof AuthenticationError); }
  });

  await test('invalid model', async () => {
    try { await client.chat.completions.create({ model: 'nonexistent:latest', messages: [{ role: 'user', content: 'test' }] }); throw new Error('should fail'); }
    catch (e) { assert(e instanceof ModelNotFoundError); }
  });

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
