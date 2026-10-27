const { findCommentRule, findDmRule, fillTemplate, pickRandom } = require('./rules');
const { buildMessage, buildTextFallback } = require('./instagram');

function createHandlers({ ig, store, getRules, log = console }) {
  // Send a message, retrying as plain text if Instagram rejects the button template.
  async function sendWithFallback(send, variants, vars) {
    const msg = Array.isArray(variants) ? pickRandom(variants) : variants;
    const fill = (t) => fillTemplate(t, vars);
    try {
      await send(buildMessage(msg, fill));
    } catch (err) {
      const hasButtons = typeof msg === 'object' && msg.buttons?.length;
      if (!hasButtons) throw err;
      log.warn(`Button message rejected (${err.message}); sending as plain text`);
      await send(buildTextFallback(msg, fill));
    }
  }

  async function handleComment(accountId, value) {
    const commentId = value.id;
    const from = value.from || {};
    const text = value.text || '';
    if (!commentId || !from.id) return;
    // Skip our own comments, including the replies this bot posts.
    if (from.id === accountId) return;
    if (store.has(`comment:${commentId}`)) return;

    const rule = findCommentRule(getRules(), text, value.media?.id);
    if (!rule) return;
    store.add(`comment:${commentId}`);

    const vars = { username: from.username };
    log.info(`Comment from @${from.username} matched "${rule.name || rule.keywords[0]}": ${text}`);

    if (rule.dm) {
      try {
        await sendWithFallback((m) => ig.sendPrivateReply(commentId, m), rule.dm, vars);
        log.info(`  -> DM sent to @${from.username}`);
      } catch (err) {
        log.error(`  -> DM to @${from.username} failed: ${err.message}`);
      }
    }
    if (rule.commentReplies?.length) {
      try {
        await ig.replyToComment(commentId, fillTemplate(pickRandom(rule.commentReplies), vars));
        log.info('  -> replied to comment');
      } catch (err) {
        log.error(`  -> comment reply failed: ${err.message}`);
      }
    }
  }

  async function handleMessage(accountId, event) {
    const message = event.message;
    const senderId = event.sender?.id;
    if (!message || !senderId || message.is_echo || senderId === accountId) return;
    if (!message.text || !message.mid) return;
    if (store.has(`dm:${message.mid}`)) return;

    const rule = findDmRule(getRules(), message.text);
    if (!rule) return;
    store.add(`dm:${message.mid}`);

    log.info(`DM matched "${rule.name || rule.keywords[0]}": ${message.text}`);
    try {
      await sendWithFallback((m) => ig.sendMessage(senderId, m), rule.reply, {});
      log.info('  -> DM reply sent');
    } catch (err) {
      log.error(`  -> DM reply failed: ${err.message}`);
    }
  }

  // Handle one webhook body from Instagram.
  async function handleWebhook(body) {
    if (body?.object !== 'instagram') return;
    for (const entry of body.entry || []) {
      const accountId = entry.id;
      for (const change of entry.changes || []) {
        if (change.field === 'comments' || change.field === 'live_comments') {
          await handleComment(accountId, change.value || {});
        }
      }
      for (const event of entry.messaging || []) {
        await handleMessage(accountId, event);
      }
    }
  }

  return { handleWebhook, handleComment, handleMessage };
}

module.exports = { createHandlers };
