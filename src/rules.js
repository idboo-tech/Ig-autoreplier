const fs = require('node:fs');

const MATCH_TYPES = ['contains', 'word', 'exact'];

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Does `text` trigger a rule with these keywords and match type?
function matches(text, keywords, match = 'word') {
  const body = normalize(text);
  if (!body) return false;
  return keywords.some((kw) => {
    const key = normalize(kw);
    if (!key) return false;
    if (match === 'contains') return body.includes(key);
    if (match === 'exact') {
      // Ignore punctuation/emoji around the comment, e.g. "GUIDE!!" or "guide 🙏".
      const stripped = body.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
      return stripped === key;
    }
    // "word": the keyword appears as a whole word or phrase.
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegex(key)}($|[^\\p{L}\\p{N}])`, 'u');
    return re.test(body);
  });
}

function validateMessage(msg, where) {
  if (typeof msg === 'string') return;
  if (!msg || typeof msg.text !== 'string' || !msg.text.trim()) {
    throw new Error(`${where}: needs a "text"`);
  }
  for (const [i, b] of (msg.buttons || []).entries()) {
    if (!b.title || !b.url) throw new Error(`${where}.buttons[${i}]: needs "title" and "url"`);
  }
  if ((msg.buttons || []).length > 3) throw new Error(`${where}: at most 3 buttons`);
}

function validateRules(data) {
  const commentRules = data.commentRules || [];
  const dmRules = data.dmRules || [];
  const check = (rule, where) => {
    if (!Array.isArray(rule.keywords) || rule.keywords.length === 0) {
      throw new Error(`${where}: "keywords" must be a non-empty list`);
    }
    if (rule.match && !MATCH_TYPES.includes(rule.match)) {
      throw new Error(`${where}: "match" must be one of ${MATCH_TYPES.join(', ')}`);
    }
  };
  commentRules.forEach((rule, i) => {
    const where = `commentRules[${i}]${rule.name ? ` (${rule.name})` : ''}`;
    check(rule, where);
    if (!rule.dm && !(rule.commentReplies || []).length) {
      throw new Error(`${where}: needs a "dm", "commentReplies", or both`);
    }
    if (rule.dm) validateMessage(rule.dm, `${where}.dm`);
  });
  dmRules.forEach((rule, i) => {
    const where = `dmRules[${i}]${rule.name ? ` (${rule.name})` : ''}`;
    check(rule, where);
    validateMessage(rule.reply, `${where}.reply`);
  });
  return { commentRules, dmRules };
}

function loadRules(file) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`Could not read rules file ${file}: ${err.message}`);
  }
  return validateRules(data);
}

// First comment rule that applies to this comment on this post, or null.
function findCommentRule(rules, text, mediaId) {
  return (
    rules.commentRules.find((rule) => {
      const posts = rule.posts || [];
      if (posts.length && !posts.includes(mediaId)) return false;
      return matches(text, rule.keywords, rule.match);
    }) || null
  );
}

function findDmRule(rules, text) {
  return rules.dmRules.find((rule) => matches(text, rule.keywords, rule.match)) || null;
}

function fillTemplate(text, vars) {
  return text.replace(/\{(\w+)\}/g, (whole, name) => {
    if (name === 'username') return vars.username ? `@${vars.username}` : 'there';
    return vars[name] ?? whole;
  });
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

module.exports = {
  normalize,
  matches,
  validateRules,
  loadRules,
  findCommentRule,
  findDmRule,
  fillTemplate,
  pickRandom,
};
