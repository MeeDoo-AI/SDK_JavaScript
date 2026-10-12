const { MeeDooClient } = require('./src');
const API_KEY = process.env.MEEDEO_API_KEY || '';
const BASE_URL = process.env.MEEDEO_BASE_URL || 'https://api.meedoo.co/api';
if (!API_KEY) { console.log('MEEDEO_API_KEY not set'); process.exit(1); }

const client = new MeeDooClient(API_KEY, BASE_URL);
(async () => {
  console.log("=== Test 1: Basic Chat ===");
  const r = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'Say hello in one word.' }] });
  console.log('AI says:', r.choices[0].message.content);

  console.log("\n=== Test 2: Web Search ===");
  const r2 = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'Bitcoin price today?' }], features: { web_search: true } });
  console.log('AI says:', r2.choices[0].message.content.substring(0, 100) + '...');

  console.log("\n=== Test 3: Think Mode ===");
  const r3 = await client.chat.completions.create({ model: 'meedoo:latest', messages: [{ role: 'user', content: 'What is 7*8?' }], think: true });
  console.log('AI says:', r3.choices[0].message.content.substring(0, 100));

  console.log("\n=== Test 4: Credits ===");
  const credits = await client.usage.credits();
  console.log('Balance: EUR' + credits.credit_balance);

  console.log("\n=== ALL TESTS PASSED ===");
})().catch(console.error);
