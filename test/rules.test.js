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

test('example rules file is valid', () => {
  const { loadRules } = require('../src/rules');
  const rules = loadRules(require('node:path').join(__dirname, '..', 'rules.example.json'));
  assert.ok(rules.commentRules.length > 0);
});

test('fillTemplate inserts the username', () => {
  assert.strictEqual(fillTemplate('Hey {username}!', { username: 'sam' }), 'Hey @sam!');
  assert.strictEqual(fillTemplate('Hey {username}!', {}), 'Hey there!');
});
