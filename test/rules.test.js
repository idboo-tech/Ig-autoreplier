const test = require('node:test');
const assert = require('node:assert');
const { matches, validateRules, findCommentRule, fillTemplate } = require('../src/rules');

test('word match finds whole words only', () => {
  assert.ok(matches('Send me the GUIDE please', ['guide'], 'word'));
  assert.ok(matches('guide!!', ['guide'], 'word'));
  assert.ok(!matches('guidebook', ['guide'], 'word'));
  assert.ok(matches('i want the free guide 🙏', ['free guide'], 'word'));
});

test('contains match finds substrings', () => {
  assert.ok(matches('guidebook', ['guide'], 'contains'));
  assert.ok(matches('How much is it?', ['how much'], 'contains'));
});

test('exact match ignores case, accents and surrounding punctuation', () => {
  assert.ok(matches('  Guide!! 🔥', ['guide'], 'exact'));
  assert.ok(matches('Café', ['cafe'], 'exact'));
  assert.ok(!matches('the guide', ['guide'], 'exact'));
});

test('rules can be limited to specific posts', () => {
  const rules = validateRules({
    commentRules: [
      { keywords: ['guide'], posts: ['111'], dm: 'a' },
      { keywords: ['guide'], dm: 'b' },
    ],
  });
  assert.strictEqual(findCommentRule(rules, 'guide', '111').dm, 'a');
  assert.strictEqual(findCommentRule(rules, 'guide', '222').dm, 'b');
  assert.strictEqual(findCommentRule(rules, 'hello', '111'), null);
});

test('invalid rules are rejected with a clear message', () => {
  assert.throws(() => validateRules({ commentRules: [{ keywords: [] }] }), /keywords/);
  assert.throws(() => validateRules({ commentRules: [{ keywords: ['x'] }] }), /dm/);
  assert.throws(
    () => validateRules({ commentRules: [{ keywords: ['x'], match: 'fuzzy', dm: 'a' }] }),
    /match/,
  );
});

test('DM variant lists are validated item by item', () => {
  assert.doesNotThrow(() => validateRules({ commentRules: [{ keywords: ['x'], dm: ['a', { text: 'b' }] }] }));
  assert.throws(() => validateRules({ commentRules: [{ keywords: ['x'], dm: [] }] }), /empty/);
  assert.throws(() => validateRules({ commentRules: [{ keywords: ['x'], dm: ['a', {}] }] }), /dm\[1\]/);
});

test('category rules reuse one template with a different link per post', () => {
  const rules = validateRules({
    categories: {
      game: {
        keywords: ['game'],
        commentReplies: ['Sent'],
        dm: [{ text: 'Here', buttons: [{ title: 'Store page', url: '{link}' }] }],
      },
    },
    commentRules: [
      { category: 'game', posts: ['111'], link: 'https://a.test' },
      { category: 'game', posts: ['222'], link: 'https://b.test' },
    ],
  });
  assert.strictEqual(findCommentRule(rules, 'GAME', '111').dm[0].buttons[0].url, 'https://a.test');
  assert.strictEqual(findCommentRule(rules, 'GAME', '222').dm[0].buttons[0].url, 'https://b.test');
  assert.strictEqual(findCommentRule(rules, 'GAME', '333'), null);
  assert.throws(
    () => validateRules({ categories: { game: { keywords: ['g'], dm: '{link}' } }, commentRules: [{ category: 'game' }] }),
    /needs a "link"/,
  );
  assert.throws(() => validateRules({ commentRules: [{ category: 'nope' }] }), /unknown category/);
});

test('example rules file is valid', () => {
  const { loadRules } = require('../src/rules');
  const rules = loadRules(require('node:path').join(__dirname, '..', 'rules.example.json'));
  loadRules(require('node:path').join(__dirname, '..', 'rules.json'));
  assert.ok(rules.commentRules.length > 0);
});

test('fillTemplate inserts the username', () => {
  assert.strictEqual(fillTemplate('Hey {username}!', { username: 'sam' }), 'Hey @sam!');
  assert.strictEqual(fillTemplate('Hey {username}!', {}), 'Hey there!');
});
