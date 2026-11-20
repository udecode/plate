import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, realpathSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { clearItem, machineItems, volumeRows } from './machine.mjs';

const DAY = 86_400;

// A stand-in docker answers the volume listing, and PATH leaves out uv.
function fixture() {
  const home = realpathSync(mkdtempSync(join(tmpdir(), 'cleanup-machine-')));
  const bin = join(home, 'bin');
  mkdirSync(bin);
  writeFileSync(join(bin, 'docker'), `#!/bin/sh\necho '[{"Name":"anon","Links":"0","Labels":"com.docker.volume.anonymous=","Size":"1.5GB"}]'\n`, { mode: 0o755 });
  const path = process.env.PATH;
  process.env.PATH = `${bin}:/usr/bin:/bin`;
  const old = Date.now() / 1000 - 10 * DAY;
  const file = (at, content, quiet) => {
    mkdirSync(join(at, '..'), { recursive: true });
    writeFileSync(at, content);
    if (quiet) utimesSync(at, old, old);
  };
  const piles = join(home, 'Library', 'Caches', 'bun', '@t@');
  file(join(piles, 'old.pile'), 'x'.repeat(100), true);
  file(join(piles, 'new.pile'), 'x'.repeat(100), false);
  const npx = join(home, '.npm', '_npx');
  for (const [name, quiet] of [['idle', true], ['running', true], ['fresh', false]]) {
    file(join(npx, name, 'package.json'), '{}', quiet);
    if (quiet) utimesSync(join(npx, name), old, old);
  }
  return { home, piles, npx, restore: () => (process.env.PATH = path) };
}

test('quiet Bun transpiled files and idle npx installs go, and a running or fresh one stays', (t) => {
  const f = fixture();
  t.after(f.restore);
  const options = { home: f.home, env: {}, running: `node ${join(f.npx, 'running')}/node_modules/.bin/server\n` };
  const items = Object.fromEntries(machineItems(options).map((item) => [item.kind, item]));
  assert.deepEqual(Object.keys(items).sort(), ['bun', 'npx', 'volume']);
  assert.deepEqual([items.bun.verdict, items.bun.bytes, items.npx.verdict], ['safe', 100, 'safe']);
  assert.match(items.npx.reason, /^1 npx installs/u);
  clearItem(items.bun, options);
  clearItem(items.npx, options);
  assert.deepEqual([existsSync(join(f.piles, 'old.pile')), existsSync(join(f.piles, 'new.pile'))], [false, true]);
  assert.deepEqual(['idle', 'running', 'fresh'].map((name) => existsSync(join(f.npx, name))), [false, true, true]);
});

test('an anonymous unused volume is safe, and named unused volumes are asked about once per compose project', () => {
  const rows = volumeRows([
    { Name: 'anon', Links: '0', Labels: 'com.docker.volume.anonymous=', Size: '1.5GB' },
    { Name: 'used', Links: '1', Labels: 'com.docker.volume.anonymous=', Size: '1GB' },
    { Name: 'api_db', Links: '0', Labels: 'com.docker.compose.project=api,com.docker.compose.volume=db', Size: '2GB' },
    { Name: 'api_cache', Links: '0', Labels: 'com.docker.compose.project=api', Size: '500MB' },
    { Name: 'loose', Links: '0', Labels: '', Size: '0B' },
  ]);
  assert.deepEqual(
    rows.map((row) => [row.verdict, row.path, row.names, row.bytes]),
    [
      ['safe', 'docker volume anon', ['anon'], 1_500_000_000],
      ['ask', 'docker compose project api', ['api_db', 'api_cache'], 2_500_000_000],
      ['ask', 'docker volume loose', ['loose'], 0],
    ]
  );
});
