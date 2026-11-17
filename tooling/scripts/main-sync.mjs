#!/usr/bin/env node
// Keeps docs/plans/main-sync.tsv, one row per `main` commit that `next`'s
// history lacks. A merge of `main` into `next` can drop a change to a path
// `next` removed, so only a recorded outcome marks a row `synced`, never git
// ancestry.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const STATUSES = new Set(['gap', 'pending', 'synced']);

const RELEASE_OUTPUT = [
  /^\.changeset\/[^/]+\.md$/,
  /^packages\/.+\/CHANGELOG\.md$/,
  /^apps\/www\/public\/r\//,
  /^apps\/www\/src\/generated\//,
];
const TEMPLATE_SYNC = [/^templates\//];
const VERSION_PACKAGES =
  /^(\[Release\] Version packages|Merge pull request #\d+ from [^/\s]+\/changeset-release\/)/;
const PR_NUMBER = /\(#(\d+)\)(?: \[[^\]]+\])*$|^Merge pull request #(\d+) /;
const VERSION_BUMP = [
  /^packages\/.+\/package\.json$/,
  /^pnpm-lock\.yaml$/,
  /^bun\.lock$/,
];
const AGENT_WORKFLOW = [
  /^\.agents\//,
  /^\.claude\//,
  /^\.codex\//,
  /^AGENTS\.md$/,
  /^CLAUDE\.md$/,
  /^skills-lock\.json$/,
  /^skiller-lock\.json$/,
  /^docs\/(plans|development)\//,
];

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
  '--reverse',
  '--format=%H%x09%as%x09%s',
  'origin/next..origin/main'
).split('\n')) {
  if (!line) continue;

  const [sha, date, subject] = line.split('\t');
  const commit = sha.slice(0, 10);

  if (!known.has(commit)) rows.push([commit, date, 'pending', '', subject]);
}

const mootNote = (commit, subject) => {
  const [author, ...files] = git(
    'show',
    '--diff-merges=first-parent',
    '--name-only',
    '--format=%an',
    commit
  )
    .split('\n')
    .filter(Boolean);
  const release = [
    ...RELEASE_OUTPUT,
    ...(author === 'github-actions[bot]' ? TEMPLATE_SYNC : []),
    ...(VERSION_PACKAGES.test(subject) ? VERSION_BUMP : []),
  ];
  const within = (rules) => (file) => rules.some((rule) => rule.test(file));

  if (files.length === 0) return null;
  if (files.every(within(release))) return 'moot: release output';
  if (files.every(within([...release, ...AGENT_WORKFLOW]))) {
    return 'moot: agent workflow';
  }

  return null;
};

for (const row of rows) {
  if (row[2] !== 'pending' || row[3]) continue;

  const note = mootNote(row[0], row[4]);

  if (note) {
    row[2] = 'synced';
    row[3] = note;
  }
}

const [flag, target, status, note = ''] = process.argv.slice(2);
let changed;

if (flag === '--set') {
  if (!STATUSES.has(status)) {
    console.error(`Status must be one of ${[...STATUSES].join(', ')}.`);
    process.exit(1);
  }

  const row = rows.find((candidate) =>
    target.startsWith('#')
      ? PR_NUMBER.exec(candidate[4])?.slice(1).find(Boolean) === target.slice(1)
      : candidate[0].startsWith(target.slice(0, 10))
  );

  if (!row) {
    console.error(`No main-sync row matches ${target}.`);
    process.exit(1);
  }

  row[2] = status;
  row[3] = note;
  changed = row;
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
if (changed) {
  console.log(changed.join('  '));
} else {
  for (const row of open.slice(-10)) console.log(row.join('  '));
  if (open.length > 10) {
    console.log(`...and ${open.length - 10} more in docs/plans/main-sync.tsv`);
  }
}
