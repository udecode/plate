#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const LIST = 'tooling/scripts/position-inference.json';
const WATCHED = [
  'packages/plitejs/src/core/change',
  'packages/plitejs/src/history',
];
const SOURCE = /\.[cm]?[jt]sx?$/u;
const SKIPPED = /\.(?:spec|test)\.[cm]?[jt]sx?$|\.d\.[cm]?ts$/u;

const git = (root, args) =>
  spawnSync('git', args, { cwd: root, encoding: 'utf-8' });

const fail = (message) => {
  console.error(`[position-inference] ${message}`);
  process.exit(1);
};

const withoutComments = (text) => {
  let code = '';
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\\') {
      code += char + (text[i + 1] ?? '');
      i += 1;
    } else if (quote) {
      code += char;
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'" || char === '`') {
      quote = char;
      code += char;
    } else if (char === '/' && text[i + 1] === '/') {
      while (i + 1 < text.length && text[i + 1] !== '\n') i += 1;
    } else if (char === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end === -1 ? text.length : end + 2;
      code += '\n'.repeat(text.slice(i, stop).split('\n').length - 1);
      i = stop - 1;
    } else {
      code += char;
    }
  }
  return code;
};

const codeLines = (text) =>
  withoutComments(text)
    .split('\n')
    .filter((line) => line.trim() !== '').length;

const isSource = (file) => SOURCE.test(file) && !SKIPPED.test(file);
const paths = (output) => output.split('\0').filter(Boolean);

const root = git(process.cwd(), ['rev-parse', '--show-toplevel']).stdout.trim();
const exists = (file) => existsSync(path.join(root, file));
const base = git(root, ['merge-base', 'HEAD', 'origin/next']).stdout.trim();

if (!base) {
  fail('Cannot find where HEAD left origin/next. Fetch origin/next.');
}

const readAt = (rev, files) => {
  const output = spawnSync('git', ['cat-file', '--batch', '-Z'], {
    cwd: root,
    input: files.map((file) => `${rev}:${file}\0`).join(''),
    maxBuffer: 1024 * 1024 * 64,
  }).stdout;
  const copies = new Map();
  let offset = 0;
  for (const file of files) {
    const end = output.indexOf(0, offset);
    const header = output.toString('utf-8', offset, end).split(' ');
    offset = end + 1;
    if (header.at(-1) === 'missing') {
      copies.set(file, null);
      continue;
    }
    if (header.length !== 3 || header[1] !== 'blob') {
      fail(`Git answered "${header.join(' ')}" for ${rev}:${file}.`);
    }
    const size = Number(header[2]);
    copies.set(file, output.toString('utf-8', offset, offset + size));
    offset += size + 1;
  }
  const missing = files.filter((file) => copies.get(file) === null);
  const unreadable =
    missing.length > 0
      ? paths(
          git(root, ['ls-tree', '-z', '--name-only', rev, '--', ...missing])
            .stdout
        )
      : [];
  if (unreadable.length > 0) {
    fail(`${rev} names ${unreadable.join(', ')}, but Git cannot read it.`);
  }
  return copies;
};

const parseList = (text, where) => {
  const { files = [], uncounted = {} } = text ? JSON.parse(text) : {};
  if (
    !Array.isArray(files) ||
    !files.every((file) => typeof file === 'string') ||
    typeof uncounted !== 'object' ||
    uncounted === null ||
    Array.isArray(uncounted)
  ) {
    fail(
      `${LIST} ${where} needs a files array of paths and an uncounted object.`
    );
  }
  return { files, uncounted };
};

const nextList = parseList(
  readAt('origin/next', [LIST]).get(LIST),
  'on origin/next'
);
const nowList = parseList(
  exists(LIST) ? readFileSync(path.join(root, LIST), 'utf-8') : null,
  'in the checkout'
);
const isListedNow = (file) =>
  nowList.files.includes(file) || Object.hasOwn(nowList.uncounted, file);

const renames = new Map();
const diff = paths(
  git(root, ['diff', '-M', '--name-status', '-z', base]).stdout
);
for (let i = 0; i < diff.length; i++) {
  if (/^[RC]/u.test(diff[i])) {
    if (diff[i].startsWith('R')) renames.set(diff[i + 1], diff[i + 2]);
    i += 2;
  } else {
    i += 1;
  }
}
const currentPath = (file) => {
  if (exists(file)) return file;
  const moved = renames.get(file);
  return moved && exists(moved) ? moved : null;
};

const baseFiles = new Set(
  paths(
    git(root, ['ls-tree', '-r', '-z', '--name-only', base, '--', ...WATCHED])
      .stdout
  )
);
const watchedNow = paths(
  git(root, [
    'ls-files',
    '-z',
    '--cached',
    '--others',
    '--exclude-standard',
    '--',
    ...WATCHED,
  ]).stdout
).filter((file) => isSource(file) && exists(file));
const listProblems = [
  ...watchedNow
    .filter((file) => !baseFiles.has(file) && !isListedNow(file))
    .map(
      (file) =>
        `  ${file} is new in a folder this check watches. List it under files, or under uncounted with the reason it records facts instead of working them out.`
    ),
  ...nextList.files.flatMap((file) => {
    const now = currentPath(file);
    if (!now || isListedNow(now)) return [];
    return [
      `  ${now}${now === file ? '' : ` (moved from ${file})`} is counted on origin/next. Keep it under files, or move it under uncounted with the reason it records facts instead of working them out.`,
    ];
  }),
  ...nowList.files
    .filter((file) => !exists(file))
    .map(
      (file) =>
        `  ${file} is listed under files but does not exist. Drop its entry when the change deletes the file, or name its new path.`
    ),
  ...Object.entries(nowList.uncounted).flatMap(([file, reason]) => [
    ...(typeof reason === 'string' && reason.trim() !== ''
      ? []
      : [
          `  ${file} is uncounted without a reason. Say why it records facts instead of working them out.`,
        ]),
    ...(exists(file)
      ? []
      : [`  ${file} is uncounted but does not exist. Drop its entry.`]),
  ]),
];

if (listProblems.length > 0) {
  fail(`${LIST} needs an edit:\n${listProblems.join('\n')}`);
}

const counted = [...new Set([...nextList.files, ...nowList.files])].sort(
  (a, b) => a.localeCompare(b)
);
const baseCopies = readAt(base, counted);
const rows = new Map();
for (const file of counted) {
  const now = currentPath(file);
  const key = now ?? file;
  const row = rows.get(key) ?? {
    file: key,
    moved: [],
    before: 0,
    after: now ? codeLines(readFileSync(path.join(root, now), 'utf-8')) : 0,
  };
  const copy = baseCopies.get(file);
  if (copy !== null) row.before += codeLines(copy);
  if (now && now !== file) row.moved.push(file);
  rows.set(key, row);
}
const before = [...rows.values()].reduce((sum, row) => sum + row.before, 0);
const after = [...rows.values()].reduce((sum, row) => sum + row.after, 0);
const short = base.slice(0, 10);

if (after > before) {
  fail(
    [
      `The code that works out moves, splits, joins, wraps and restored letters from positions grew from ${before} to ${after} code lines since ${short}:`,
      ...[...rows.values()]
        .filter((row) => row.after !== row.before)
        .map((row) => {
          const delta = row.after - row.before;
          const from =
            row.moved.length > 0
              ? `, moved from ${row.moved.join(' and ')}`
              : '';
          return `  ${row.file} ${row.before} -> ${row.after} (${delta > 0 ? '+' : ''}${delta})${from}`;
        }),
      'This code never grows while element ids replace its block guesses (docs/plans/2026-11-18-collaboration-element-ids.md) and its letter guesses wait for a design of their own. Instead:',
      '  - record the fact when the command runs, as draft-facts.ts and record.ts do, and read it back;',
      '  - put code that works nothing out from positions in a file this check does not count;',
      '  - delete at least as many of these code lines as the change adds;',
      "  - or leave the case open and name it in the plan's Open work.",
      'Moving code that works a fact out from positions into an uncounted file does not fix it.',
    ].join('\n')
  );
}

console.info(
  `[position-inference] ${after} code lines in ${rows.size} files, ${after - before} since ${short}.`
);
