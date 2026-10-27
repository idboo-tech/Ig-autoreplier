// Minimal client for the Instagram API with Instagram Login (graph.instagram.com).

class InstagramError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function createInstagramClient({ accessToken, apiVersion, dryRun = false, log = console }) {
  const base = `https://graph.instagram.com/${apiVersion}`;

  async function call(method, path, body) {
    if (dryRun) {
      log.info(`[dry-run] ${method} ${path} ${body ? JSON.stringify(body) : ''}`);
      return { dryRun: true };
    }
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      const msg = data.error?.message || `HTTP ${res.status}`;
      throw new InstagramError(`Instagram API ${method} ${path} failed: ${msg}`, res.status, data);
    }
    return data;
  }

  return {
    getMe: () => call('GET', '/me?fields=user_id,username'),

    // Public reply under a comment.
    replyToComment: (commentId, text) =>
      call('POST', `/${commentId}/replies`, { message: text }),

    // "Private reply": DM the person who wrote a comment. Allowed once per
    // comment, within 7 days of it being posted.
    sendPrivateReply: (commentId, message) =>
      call('POST', '/me/messages', { recipient: { comment_id: commentId }, message }),

    // Regular DM. Only allowed within 24h of the user's last message to you.
    sendMessage: (userId, message) =>
      call('POST', '/me/messages', { recipient: { id: userId }, message }),
  };
}

// Turn a rule message ({text, buttons} or a plain string) into an API payload.
function buildMessage(msg, fillText) {
  const spec = typeof msg === 'string' ? { text: msg } : msg;
  const text = fillText(spec.text);
  if (!spec.buttons || spec.buttons.length === 0) return { text };
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text,
        buttons: spec.buttons.map((b) => ({ type: 'web_url', url: b.url, title: b.title })),
      },
    },
  };
}

// Same message as plain text with links written out, for when buttons are rejected.
function buildTextFallback(msg, fillText) {
  const spec = typeof msg === 'string' ? { text: msg } : msg;
  const lines = [fillText(spec.text)];
  for (const b of spec.buttons || []) lines.push(`${b.title}: ${b.url}`);
  return { text: lines.join('\n') };
}

module.exports = { createInstagramClient, buildMessage, buildTextFallback, InstagramError };
