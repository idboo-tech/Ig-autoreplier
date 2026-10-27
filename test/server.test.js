const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const { createServer } = require('../src/server');

const SECRET = 'app-secret';

async function withServer(fn) {
  const received = [];
  const server = createServer({
    verifyToken: 'tok',
    appSecret: SECRET,
    handleWebhook: async (body) => received.push(body),
  });
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base, received);
  } finally {
    server.close();
  }
}

test('webhook verification echoes the challenge only with the right token', async () => {
  await withServer(async (base) => {
    const ok = await fetch(`${base}/webhook?hub.mode=subscribe&hub.verify_token=tok&hub.challenge=42`);
    assert.strictEqual(ok.status, 200);
    assert.strictEqual(await ok.text(), '42');
    const bad = await fetch(`${base}/webhook?hub.mode=subscribe&hub.verify_token=no&hub.challenge=42`);
    assert.strictEqual(bad.status, 403);
  });
});

test('POST requires a valid Instagram signature', async () => {
  await withServer(async (base, received) => {
    const body = JSON.stringify({ object: 'instagram', entry: [] });
    const sig = 'sha256=' + crypto.createHmac('sha256', SECRET).update(body).digest('hex');

    const forged = await fetch(`${base}/webhook`, {
      method: 'POST',
      headers: { 'x-hub-signature-256': 'sha256=deadbeef' },
      body,
    });
    assert.strictEqual(forged.status, 401);

    const real = await fetch(`${base}/webhook`, {
      method: 'POST',
      headers: { 'x-hub-signature-256': sig },
      body,
    });
    assert.strictEqual(real.status, 200);
    assert.strictEqual(received.length, 1);
  });
});
