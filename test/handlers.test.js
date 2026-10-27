const test = require('node:test');
const assert = require('node:assert');
const { createHandlers } = require('../src/handlers');
const { validateRules } = require('../src/rules');

const ACCOUNT = '17840000000000001';
const quiet = { info() {}, warn() {}, error() {} };

function setup(rules, igOverrides = {}) {
  const calls = [];
  const ig = {
    async sendPrivateReply(commentId, message) {
      calls.push(['privateReply', commentId, message]);
    },
    async replyToComment(commentId, text) {
      calls.push(['commentReply', commentId, text]);
    },
    async sendMessage(userId, message) {
      calls.push(['dm', userId, message]);
    },
    ...igOverrides,
  };
  const seen = new Set();
  const store = { has: (id) => seen.has(id), add: (id) => seen.add(id) };
  const parsed = validateRules(rules);
  const handlers = createHandlers({ ig, store, getRules: () => parsed, log: quiet });
  return { calls, ig, handlers };
}

function commentEvent(text, { id = 'c1', fromId = '999', username = 'fan' } = {}) {
  return {
    object: 'instagram',
    entry: [
      {
        id: ACCOUNT,
        changes: [
          {
            field: 'comments',
            value: { id, text, from: { id: fromId, username }, media: { id: 'm1' } },
          },
        ],
      },
    ],
  };
}

const rules = {
  commentRules: [
    {
      keywords: ['guide'],
      commentReplies: ['Check your DMs {username}'],
      dm: { text: 'Hi {username}', buttons: [{ title: 'Open', url: 'https://x.test' }] },
    },
  ],
  dmRules: [{ keywords: ['price'], reply: 'It costs $10' }],
};

test('matching comment gets a private DM and a public reply', async () => {
  const { calls, handlers } = setup(rules);
  await handlers.handleWebhook(commentEvent('send the guide pls'));
  assert.strictEqual(calls.length, 2);
  const [dm, reply] = calls;
  assert.strictEqual(dm[0], 'privateReply');
  assert.strictEqual(dm[1], 'c1');
  assert.strictEqual(dm[2].attachment.payload.text, 'Hi @fan');
  assert.deepStrictEqual(reply, ['commentReply', 'c1', 'Check your DMs @fan']);
});

test('non-matching comments are ignored', async () => {
  const { calls, handlers } = setup(rules);
  await handlers.handleWebhook(commentEvent('nice post'));
  assert.strictEqual(calls.length, 0);
});

test('own comments are ignored so the bot never replies to itself', async () => {
  const { calls, handlers } = setup(rules);
  await handlers.handleWebhook(commentEvent('guide', { fromId: ACCOUNT }));
  assert.strictEqual(calls.length, 0);
});

test('the same comment delivered twice is only handled once', async () => {
  const { calls, handlers } = setup(rules);
  await handlers.handleWebhook(commentEvent('guide'));
  await handlers.handleWebhook(commentEvent('guide'));
  assert.strictEqual(calls.length, 2);
});

test('falls back to plain text when buttons are rejected', async () => {
  const sent = [];
  const { handlers } = setup(rules, {
    async sendPrivateReply(commentId, message) {
      if (message.attachment) throw new Error('template not supported');
      sent.push(message);
    },
  });
  await handlers.handleWebhook(commentEvent('guide'));
  assert.deepStrictEqual(sent, [{ text: 'Hi @fan\nOpen: https://x.test' }]);
});

test('a failed DM still posts the public reply', async () => {
  const { calls, handlers } = setup(
    { commentRules: [{ keywords: ['guide'], commentReplies: ['ok'], dm: 'hi' }] },
    {
      async sendPrivateReply() {
        throw new Error('boom');
      },
    },
  );
  await handlers.handleWebhook(commentEvent('guide'));
  assert.deepStrictEqual(calls, [['commentReply', 'c1', 'ok']]);
});

test('DM keyword gets an automatic reply, echoes are ignored', async () => {
  const { calls, handlers } = setup(rules);
  const dm = (message) => ({
    object: 'instagram',
    entry: [{ id: ACCOUNT, messaging: [{ sender: { id: '555' }, recipient: { id: ACCOUNT }, message }] }],
  });
  await handlers.handleWebhook(dm({ mid: 'a', text: 'what is the price?' }));
  await handlers.handleWebhook(dm({ mid: 'b', text: 'price', is_echo: true }));
  assert.deepStrictEqual(calls, [['dm', '555', { text: 'It costs $10' }]]);
});

test('a list of DM variants sends exactly one of them', async () => {
  const { calls, handlers } = setup({
    commentRules: [{ keywords: ['free'], dm: ['Version A {username}', { text: 'Version B' }] }],
  });
  await handlers.handleWebhook(commentEvent('FREE'));
  const dms = calls.filter((c) => c[0] === 'privateReply');
  assert.strictEqual(dms.length, 1);
  const text = JSON.stringify(dms[0][2]);
  assert.ok(text.includes('Version A @fan') || text.includes('Version B'), text);
});
