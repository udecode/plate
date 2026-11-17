import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { databaseItems, dropDatabase } from './databases.mjs';

const DAY = 86_400_000;

// A stand-in docker publishes port 55432 from one container and answers the
// listing query from a TSV file, and records each drop it is sent.
function fixture(rows) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'cleanup-db-')));
  const bin = join(root, 'bin');
  mkdirSync(bin);
  const state = join(root, 'databases.tsv');
  writeFileSync(state, rows.map((row) => row.join('\t')).join('\n'));
  writeFileSync(
    join(bin, 'docker'),
    `#!/bin/sh
case "$1" in
  ps) printf 'other\\t0.0.0.0:5431->5432/tcp\\npg\\t0.0.0.0:55432->5432/tcp, [::]:55432->5432/tcp\\n' ;;
  exec) sql=$(cat); case "$sql" in drop*) echo "$sql" >> '${root}/drops' ;; *) cat '${state}' ;; esac ;;
esac
`,
    { mode: 0o755 }
  );
  const main = join(root, 'app');
  const worktree = join(root, 'app-lane');
  const beside = join(root, 'other');
  for (const dir of [main, worktree, beside]) mkdirSync(dir);
  writeFileSync(join(main, '.env.local'), 'DATABASE_URL=postgresql://app:secret@localhost:55432/app\n');
  writeFileSync(join(worktree, '.env.development.local'), 'DATABASE_URL="postgres://app@127.0.0.1:55432/app_lane"\n');
  writeFileSync(join(beside, '.env'), 'DATABASE_URL=postgresql://app@localhost:55432/other_app\n');
  const path = process.env.PATH;
  process.env.PATH = `${bin}:${path}`;
  return { root, main, worktrees: [{ path: worktree }], restore: () => (process.env.PATH = path) };
}

const seconds = (ms) => Math.floor(ms / 1000);

test('a database no env file names and nothing wrote for a day is safe, and every other one stays', (t) => {
  const now = Date.now();
  const old = seconds(now - 3 * DAY);
  const f = fixture([
    ['postgres', '1', old, '100'],
    ['app', '0', old, '100'],
    ['app_lane', '0', old, '100'],
    ['other_app', '0', old, '100'],
    ['proof_open', '1', old, '100'],
    ['proof_fresh', '0', seconds(now - 3_600_000), '100'],
    ['proof_old', '0', old, '5000'],
  ]);
  t.after(f.restore);
  const rows = Object.fromEntries(databaseItems({ main: f.main, worktrees: f.worktrees, now }).map((item) => [item.name, item]));
  assert.deepEqual(Object.keys(rows).sort(), ['app', 'app_lane', 'other_app', 'proof_fresh', 'proof_old', 'proof_open']);
  for (const name of ['app', 'app_lane', 'other_app']) assert.deepEqual([rows[name].verdict, rows[name].reason], ['keep', 'an env file of a checkout names it']);
  assert.deepEqual([rows.proof_open.verdict, rows.proof_open.reason], ['keep', '1 open connection']);
  assert.equal(rows.proof_fresh.verdict, 'keep');
  assert.deepEqual([rows.proof_old.verdict, rows.proof_old.path, rows.proof_old.bytes], ['safe', 'postgres://localhost:55432/proof_old', 5000]);
});

test('the drop judges the database again and skips one that gained a connection', (t) => {
  const now = Date.now();
  const old = seconds(now - 3 * DAY);
  const f = fixture([['proof_old', '0', old, '5000'], ['proof_busy', '0', old, '5000']]);
  t.after(f.restore);
  const items = databaseItems({ main: f.main, worktrees: f.worktrees, now });
  writeFileSync(join(f.root, 'databases.tsv'), [['proof_old', '0', old, '5000'], ['proof_busy', '2', old, '5000']].map((row) => row.join('\t')).join('\n'));
  assert.equal(dropDatabase(items.find((item) => item.name === 'proof_old'), now), null);
  assert.deepEqual(dropDatabase(items.find((item) => item.name === 'proof_busy'), now), ['keep', '2 open connections']);
  assert.equal(readFileSync(join(f.root, 'drops'), 'utf8'), 'drop database "proof_old"\n');
});
