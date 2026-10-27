const fs = require('node:fs');
const path = require('node:path');

const MAX_AGE_MS = 8 * 24 * 60 * 60 * 1000; // a little over Instagram's 7-day reply window

// Remembers which comments/messages were already handled, so retries from
// Instagram or restarts never send the same DM twice.
function createStore(file) {
  let seen = {};
  try {
    seen = JSON.parse(fs.readFileSync(file, 'utf8')).seen || {};
  } catch {
    seen = {};
  }

  function save() {
    const cutoff = Date.now() - MAX_AGE_MS;
    for (const [id, ts] of Object.entries(seen)) if (ts < cutoff) delete seen[id];
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ seen }));
    fs.renameSync(tmp, file);
  }

  return {
    has: (id) => Object.hasOwn(seen, id),
    add(id) {
      seen[id] = Date.now();
      save();
    },
  };
}

module.exports = { createStore };
