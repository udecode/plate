#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { linesBeyondBase } from './plan-cuts.mjs';
import {
  changedSince,
  landingPair,
  run,
  showAt,
  untrackedFiles,
  UPSTREAM,
} from './private-files.mjs';

const ROOTS = ['docs/plans', 'content/docs', 'apps/www/src/registry'];

const REGISTRY_CONTEXT =
  /\b(?:apps?|registry|copied|compil(?:e|es|ed|ing)|CLI|shadcn|overwrites?|re-?install(?:s|ed)?)\b|\.tsx\b/iu;

const OLDER_COPY_FORMS = {
  olderCopy: String.raw`\b(?:older|old|outdated|earlier|existing|previous|stale)\s+(?:[\w-]+\s+){0,2}cop(?:y|ies)\b(?!'s)`,
  copyPredates: String.raw`\bcop(?:y|ies)\b[^.;]*?\bpredates?\b`,
  everyCopy: String.raw`\bevery\s+(?:v\d+\s+)?cop(?:y|ies)\s+of\b`,
};
const OLDER_COPY = new RegExp(Object.values(OLDER_COPY_FORMS).join('|'), 'iu');

const APP_COPIED =
  /\bapps?\s+(?:that\s+|which\s+)?(?:already\s+|previously\s+|have\s+|has\s+)?copied\b/iu;

const splitSentences = (line) =>
  line
    .split(/\s\|\s|(?<=[.;!?])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);

const reasonsAboutOlderCopies = (sentence) =>
  APP_COPIED.test(sentence) ||
  (OLDER_COPY.test(sentence) && REGISTRY_CONTEXT.test(sentence));

const MESSAGE =
  "reasons about an app's older copy of registry code. An app installs each registry item with its registry dependencies at their latest version, as docs/vision/plate.md's rule Copied registry code targets the current registry says, so drop the fallback, probe, docs note, criterion or owner question built on older copies";

export function copyProblems(text, { lines } = {}) {
  const problems = [];
  text.split('\n').forEach((line, index) => {
    const number = index + 1;
    if (lines && !lines.has(number)) return;
    if (splitSentences(line).some(reasonsAboutOlderCopies)) {
      problems.push({ line: number, message: MESSAGE });
    }
  });
  return problems;
}

const isScanned = (path) =>
  ROOTS.some((root) => path.startsWith(`${root}/`)) &&
  !path.startsWith('docs/plans/artifacts/') &&
  /\.(?:md|mdx|ts|tsx)$/u.test(path);

const report = (path, problems) =>
  problems.map(({ line, message }) => `${path}:${line}: ${message}`);

export function checkLanding(root, { base }) {
  const pairing = { pair: landingPair };
  const changed = changedSince(root, base, pairing);
  if (!changed) {
    throw new Error(
      `Cannot diff against the base commit ${base}. Pass a base this checkout holds.`
    );
  }
  const errors = [];
  const paths = [
    ...new Set([...changed, ...untrackedFiles(root, ROOTS)]),
  ].filter((path) => isScanned(path) && existsSync(join(root, path)));
  for (const path of paths) {
    const after = readFileSync(join(root, path), 'utf-8');
    const shown = showAt(root, base, path, pairing);
    const before = shown.status === 0 ? shown.stdout : '';
    errors.push(
      ...report(
        path,
        copyProblems(after, { lines: linesBeyondBase(before, after) })
      )
    );
  }
  return errors;
}

export function checkFiles(root, paths) {
  return paths.flatMap((path) =>
    report(
      relative(root, resolve(root, path)),
      copyProblems(readFileSync(resolve(root, path), 'utf-8'))
    )
  );
}

const usage =
  'Usage: node tooling/scripts/registry-copies.mjs land [--base <rev>] | check <file>...';

function main(root, args) {
  const [command, ...rest] = args;
  if (command === 'check' && rest.length) return checkFiles(root, rest);
  if (command === 'land') {
    const at = rest.indexOf('--base');
    const base =
      at === -1
        ? run(root, ['merge-base', 'HEAD', UPSTREAM]).stdout?.trim()
        : rest[at + 1];
    if (!base) {
      throw new Error(
        `Cannot find where HEAD meets ${UPSTREAM}; pass --base <rev>.`
      );
    }
    return checkLanding(root, { base });
  }
  throw new Error(usage);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const errors = main(
      resolve(dirname(fileURLToPath(import.meta.url)), '../..'),
      process.argv.slice(2)
    );
    if (errors.length) {
      process.stderr.write(`${errors.join('\n')}\n`);
      process.exit(1);
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(2);
  }
}
