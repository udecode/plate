// Lists doc wording that a change removed from one live doc but that a live doc still holds, the
// way a claim narrowed in a changeset stays wide in an API page. Usage:
//   node tooling/scripts/stale-claims.mjs [--base <rev>] [--head <rev>]
// The base defaults to PLATE_BASELINE_BASE, then HEAD; without --head it reads the working tree.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const WINDOW = 10;
const DOC_ROOTS = [
  'content/docs',
  '.changeset',
  'docs/editor-behavior',
  'docs/vision',
  'VISION.md',
];

export const isLiveDoc = (file) =>
  file === 'VISION.md' ||
  (file.startsWith('content/docs/') &&
    file.endsWith('.mdx') &&
    !file.endsWith('.cn.mdx')) ||
  (/^(\.changeset|docs\/editor-behavior|docs\/vision)\//.test(file) &&
    file.endsWith('.md'));

const wordsOf = (line) => line.toLowerCase().match(/[a-z0-9]+/g) ?? [];

const windowsOf = (line, size) => {
  const words = wordsOf(line);
  const windows = [];
  for (let index = 0; index + size <= words.length; index++) {
    windows.push(words.slice(index, index + size).join(' '));
  }
  return windows;
};

const parseDiff = (diff) => {
  const files = new Map();
  let current;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      current = { added: [], removed: [] };
      files.set(line.slice(6), current);
    } else if (!current || line.startsWith('--- ')) {
      continue;
    } else if (line.startsWith('-')) {
      current.removed.push(line.slice(1));
    } else if (line.startsWith('+')) {
      current.added.push(line.slice(1));
    }
  }
  return files;
};

/** Each window of wording removed from a doc, mapped to that doc, minus the wording it kept. */
export const removedWording = (diff, size = WINDOW) => {
  const removed = new Map();
  for (const [file, { added, removed: lines }] of parseDiff(diff)) {
    if (!isLiveDoc(file)) continue;
    const kept = new Set(added.flatMap((line) => windowsOf(line, size)));
    for (const window of lines.flatMap((line) => windowsOf(line, size))) {
      if (!kept.has(window) && !removed.has(window)) removed.set(window, file);
    }
  }
  return removed;
};

/**
 * Each line of `docs` that still holds a window of `removed`, outside the doc it was removed from,
 * where repeated table and list wording would drown the claims.
 */
export const staleLines = (removed, docs, size = WINDOW) => {
  const hits = [];
  for (const [file, text] of docs) {
    text.split('\n').forEach((line, index) => {
      const window = windowsOf(line, size).find(
        (candidate) => removed.has(candidate) && removed.get(candidate) !== file
      );
      if (window) {
        hits.push({ file, from: removed.get(window), line: index + 1, window });
      }
    });
  }
  return hits;
};

export const staleClaims = ({
  base,
  cwd = process.cwd(),
  head,
  window = WINDOW,
}) => {
  const git = (args) =>
    spawnSync('git', args, {
      cwd,
      encoding: 'utf-8',
      maxBuffer: 256 * 1024 * 1024,
    });
  const resolved = (rev) =>
    git(['rev-parse', '--verify', '--quiet', `${rev}^{commit}`]).status === 0;
  for (const rev of [base, head].filter(Boolean)) {
    if (!resolved(rev)) throw new Error(`cannot resolve ${rev} to a commit`);
  }
  const diff = git([
    'diff',
    '--unified=0',
    '--find-renames',
    '--diff-filter=MR',
    '--no-color',
    '--no-ext-diff',
    base,
    ...(head ? [head] : []),
    '--',
    ...DOC_ROOTS,
  ]);
  if (diff.status !== 0) throw new Error(diff.stderr);
  const removed = removedWording(diff.stdout, window);
  if (removed.size === 0) return [];
  const listed = head
    ? git(['ls-tree', '-r', '--name-only', head, '--', ...DOC_ROOTS])
    : git([
        'ls-files',
        '--cached',
        '--others',
        '--exclude-standard',
        '--',
        ...DOC_ROOTS,
      ]);
  if (listed.status !== 0) throw new Error(listed.stderr);
  const docs = listed.stdout
    .split('\n')
    .filter(isLiveDoc)
    .map((file) => [
      file,
      head
        ? git(['show', `${head}:${file}`]).stdout
        : readFileSync(join(cwd, file), 'utf-8'),
    ]);
  return staleLines(removed, docs, window);
};

const describe = (hit) =>
  `${hit.file}:${hit.line}: still says "${hit.window}", which this change removed from ${hit.from}`;

/**
 * Claude Code's PostToolUse hook: after `freeze.mjs --parent <commit>` freezes a review round's
 * tree and prints it, it adds each stale line between the two trees to Claude's context. It never
 * blocks, and stays silent without both commits, because the working tree holds other sessions'
 * edits.
 */
export const hookOutput = (input) => {
  const parent = /freeze\.mjs\b.*--parent\s+([0-9a-f]{7,40})\b/.exec(
    input.tool_input?.command ?? ''
  )?.[1];
  const frozen = [
    ...String(input.tool_response?.stdout ?? '').matchAll(/\b[0-9a-f]{40}\b/g),
  ].at(-1)?.[0];
  if (!parent || !frozen) return null;
  let hits;
  try {
    hits = staleClaims({ base: parent, cwd: input.cwd, head: frozen });
  } catch {
    return null;
  }
  if (hits.length === 0) return null;
  return {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: [
        `stale-claims: this round's tree (${frozen}) still repeats wording that the round removed from another doc since ${parent}. Restate each line to match, or reword it if it means something else, then freeze again.`,
        ...hits.map(describe),
      ].join('\n'),
    },
  };
};

const main = () => {
  const args = process.argv.slice(2);
  if (args.includes('--hook')) {
    let input;
    try {
      input = JSON.parse(readFileSync(0, 'utf-8'));
    } catch {
      return 0;
    }
    const output = hookOutput(input);
    if (output) console.log(JSON.stringify(output));
    return 0;
  }
  const option = (name) => {
    const index = args.indexOf(name);
    return index === -1 ? undefined : args[index + 1];
  };
  const base = option('--base') ?? (process.env.PLATE_BASELINE_BASE || 'HEAD');
  let hits;
  try {
    hits = staleClaims({ base, head: option('--head') });
  } catch (error) {
    console.error(
      `[stale-claims] ${error.message}; pass a base and head this checkout holds.`
    );
    return 2;
  }
  for (const hit of hits) console.error(describe(hit));
  if (hits.length > 0) {
    console.error(
      '[stale-claims] Each line above repeats wording the change removed from another doc. Restate it to match, or reword it if it means something else.'
    );
    return 1;
  }
  return 0;
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = main();
}
