const fs = require('node:fs');
const path = require('node:path');

const envFile = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const config = {
  port: Number(process.env.PORT) || 3000,
  verifyToken: process.env.VERIFY_TOKEN || '',
  appSecret: process.env.APP_SECRET || '',
  accessToken: process.env.IG_ACCESS_TOKEN || '',
  apiVersion: process.env.IG_API_VERSION || 'v23.0',
  rulesFile: path.resolve(process.cwd(), process.env.RULES_FILE || './rules.json'),
  stateFile: path.resolve(process.cwd(), process.env.STATE_FILE || './data/state.json'),
  dryRun: process.env.DRY_RUN === 'true',
};

function assertConfig() {
  const missing = [];
  if (!config.verifyToken) missing.push('VERIFY_TOKEN');
  if (!config.appSecret) missing.push('APP_SECRET');
  if (!config.accessToken && !config.dryRun) missing.push('IG_ACCESS_TOKEN');
  if (missing.length) {
    throw new Error(`Missing required settings in .env: ${missing.join(', ')}`);
  }
}

module.exports = { config, assertConfig };
