const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const { config, assertConfig } = require('./config');
const { loadRules } = require('./rules');
const { createInstagramClient } = require('./instagram');
const { createStore } = require('./store');
const { createHandlers } = require('./handlers');

const log = {
  info: (...a) => console.log(new Date().toISOString(), ...a),
  warn: (...a) => console.warn(new Date().toISOString(), 'WARN', ...a),
  error: (...a) => console.error(new Date().toISOString(), 'ERROR', ...a),
};

function isValidSignature(rawBody, header, appSecret) {
  if (!header || !header.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const given = header.slice('sha256='.length);
  return (
    given.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  );
}

function createServer({ verifyToken, appSecret, handleWebhook }) {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ig-autoreplier is running');
      return;
    }

    if (url.pathname !== '/webhook') {
      res.writeHead(404).end();
      return;
    }

    // Meta calls this once when you save the webhook URL in the app dashboard.
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      if (mode === 'subscribe' && token === verifyToken) {
        res.writeHead(200, { 'Content-Type': 'text/plain' }).end(challenge);
      } else {
        res.writeHead(403).end();
      }
      return;
    }

    if (req.method !== 'POST') {
      res.writeHead(405).end();
      return;
    }

    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks);
      if (!isValidSignature(raw, req.headers['x-hub-signature-256'], appSecret)) {
        log.warn('Rejected webhook with a bad signature');
        res.writeHead(401).end();
        return;
      }
      let body;
      try {
        body = JSON.parse(raw.toString('utf8'));
      } catch {
        res.writeHead(400).end();
        return;
      }
      // Answer right away; Instagram retries if we take too long.
      res.writeHead(200).end('EVENT_RECEIVED');
      handleWebhook(body).catch((err) => log.error('Webhook handling failed:', err));
    });
  });
}

async function main() {
  assertConfig();

  let rules = loadRules(config.rulesFile);
  log.info(
    `Loaded ${rules.commentRules.length} comment rule(s) and ${rules.dmRules.length} DM rule(s)`,
  );
  // Pick up edits to the rules file without a restart.
  fs.watchFile(config.rulesFile, { interval: 2000 }, () => {
    try {
      rules = loadRules(config.rulesFile);
      log.info('Rules file changed, reloaded');
    } catch (err) {
      log.error(`Kept previous rules: ${err.message}`);
    }
  });

  const ig = createInstagramClient({ ...config, log });
  if (!config.dryRun) {
    const me = await ig.getMe();
    log.info(`Connected to Instagram account @${me.username} (${me.user_id})`);
  } else {
    log.info('DRY_RUN is on: nothing will be sent to Instagram');
  }

  const store = createStore(config.stateFile);
  const { handleWebhook } = createHandlers({ ig, store, getRules: () => rules, log });

  createServer({ ...config, handleWebhook }).listen(config.port, () => {
    log.info(`Listening on port ${config.port}; webhook URL path is /webhook`);
  });
}

if (require.main === module) {
  main().catch((err) => {
    log.error(err.message);
    process.exit(1);
  });
}

module.exports = { createServer, isValidSignature };
