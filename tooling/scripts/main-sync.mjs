#!/usr/bin/env node
// Keeps docs/plans/main-sync.tsv, one row per `main` commit that `next`'s
// history lacks. A merge of `main` into `next` can drop a change to a path
// `next` removed, so only a recorded outcome marks a row `synced`, never git
// ancestry.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const STATUSES = new Set(['gap', 'pending', 'synced']);

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf-8' }).trimEnd();

const ledger = path.join(
  git('rev-parse', '--show-toplevel'),
  'docs/plans/main-sync.tsv'
);
const rows = existsSync(ledger)
  ? readFileSync(ledger, 'utf-8')
      .trimEnd()
      .split('\n')
      .slice(1)
      .map((line) => line.split('\t'))
  : [];
const known = new Set(rows.map(([commit]) => commit));

git('fetch', '--quiet', 'origin', 'main', 'next');

for (const line of git(
  'log',
  '--first-parent',
  '--no-merges',
  '--reverse',
  '--format=%H%x09%as%x09%s',
  'origin/next..origin/main'
).split('\n')) {
  if (!line) continue;

  const [sha, date, subject] = line.split('\t');
  const commit = sha.slice(0, 10);

  if (!known.has(commit)) rows.push([commit, date, 'pending', '', subject]);
}

const [flag, target, status, note = ''] = process.argv.slice(2);

if (flag === '--set') {
  if (!STATUSES.has(status)) {
    console.error(`Status must be one of ${[...STATUSES].join(', ')}.`);
    process.exit(1);
  }

  const row = rows.find((candidate) =>
    target.startsWith('#')
      ? candidate[4].endsWith(`(${target})`)
      : candidate[0].startsWith(target.slice(0, 10))
  );

  if (!row) {
    console.error(`No main-sync row matches ${target}.`);
    process.exit(1);
  }

  row[2] = status;
  row[3] = note;
} else if (flag) {
  console.error(
    'Usage: main-sync.mjs [--set <commit | #pr> <gap | pending | synced> [note]]'
  );
  process.exit(1);
}

writeFileSync(
  ledger,
  `${['commit\tdate\tstatus\tnote\tsubject', ...rows.map((row) => row.join('\t'))].join('\n')}\n`
);

const open = rows.filter((row) => row[2] !== 'synced');
const count = (name) => rows.filter((row) => row[2] === name).length;

console.log(
  `main-sync: ${count('pending')} pending, ${count('gap')} gap, ${count('synced')} synced`
);
for (const row of open.slice(-10)) console.log(row.join('  '));
if (open.length > 10) {
  console.log(`...and ${open.length - 10} more in docs/plans/main-sync.tsv`);
}
