#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  changedSince,
  run,
  showAt,
  untrackedFiles,
  UPSTREAM,
} from './private-files.mjs';

const CUT =
  /\b(?:hard[- ]cuts?|cut(?:s|ting)?|remov(?:e|es|ed|ing|al)|delet(?:e|es|ed|ing|ion)|drop(?:s|ped|ping)?|earns? (?:its|their) place)\b/iu;

const NOT = String.raw`(?:did not|didn't|does not|doesn't|never|has not|hasn't|have not|haven't|was not|wasn't|were not|weren't|is not|isn't|not)\s+(?:been\s+|yet\s+)?`;

const UNASKED_FORMS = {
  nobodyAsked: String.raw`\b(?:no ?one|nobody|no request)\s+(?:has\s+|had\s+|ever\s+)?(?:asked|requested|cleared|ordered)\b`,
  notAskedForIt: String.raw`\b${NOT}ask(?:ed)?\s+(?:for|to)\b`,
  notAskedWithoutObject: String.raw`\b${NOT}asked\b(?!\s+(?:the|a|an|its|their)\b)`,
  notRequested: String.raw`\b${NOT}requested\b`,
  notOrdered: String.raw`\b${NOT}order(?:s|ed)?\b(?=\s*[,.;]|\s+(?:it|this|that|them|the (?:cut|removal))\b)`,
  unaskedCut: String.raw`\bun(?:asked|requested)\s+(?:for\s+)?(?:hard[- ])?(?:cut|removal|deletion)\b`,
  withoutRequest: String.raw`\bwithout (?:being asked|a request|an ask|the owner's word)\b`,
  hardCutSoItWaits: String.raw`\bhard[- ]cut\b[^.;]*?\b(?:so|which|that)\b[^.;]*?\b(?:stays?|waits?|is kept|keeps? (?:it|them|the)|goes to|only on the owner|for the owner|owner's word)\b`,
  hardCutQuestion: String.raw`\bhard[- ]cut question\b`,
  hardCutRuleKeeps: String.raw`\bhard[- ]cut (?:rule|section)\b[^.;]*?\bkeeps?\b`,
};
const UNASKED = new RegExp(Object.values(UNASKED_FORMS).join('|'), 'iu');

const OPEN_WORK_ITEM = /\bstop:/u;
const IS_HARD_CUT =
  /\b(?:is|are|was|were|would be|will be|becomes|counts as|stays)\s+(?:still\s+)?an?\s+hard[- ]cut\b/iu;

const CHIP = /\bt_[0-9a-f]{8}\b/gu;

const maskQuoted = (line) => line.replaceAll(/"[^"]*"|`[^`]*`/gu, '""');

const splitSentences = (line) =>
  line
    .split(/\s\|\s|(?<=[.;!?])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);

const parksCut = (sentence) => UNASKED.test(sentence) && CUT.test(sentence);

const parksOpenWorkItem = (line, sentence) =>
  OPEN_WORK_ITEM.test(line) && IS_HARD_CUT.test(sentence);

const decideChips = (ledger) => {
  const ids = new Set();
  for (const row of ledger.split('\n')) {
    const cells = row.split('\t');
    if (cells[1] !== 'chip' || !/\bkind: decide\b/u.test(cells[4] ?? '')) {
      continue;
    }
    const id = /^t_[0-9a-f]{8}\b/u.exec(cells[2] ?? '')?.[0];
    if (id) ids.add(id);
  }
  return ids;
};

export function cutProblems(text, { chips, lines } = {}) {
  const problems = [];
  text.split('\n').forEach((line, index) => {
    const number = index + 1;
    if (lines && !lines.has(number)) return;
    const parked = splitSentences(maskQuoted(line)).some(
      (sentence) => parksCut(sentence) || parksOpenWorkItem(line, sentence)
    );
    if (!parked) return;
    const named = line.match(CHIP) ?? [];
    if (named.length === 0) {
      problems.push({
        line: number,
        message:
          'leaves a cut waiting because nobody asked. Judge the cut on its merits and give that reason, since nobody asking only stops the run from making the cut. When the cut stays undecided, offer its question as a decide chip and name the task id on this line',
      });
      return;
    }
    if (!chips) {
      problems.push({
        line: number,
        message: `names ${named.join(', ')}, but the suggested-task ledger cannot be read to confirm it is a decide chip`,
      });
      return;
    }
    if (!named.some((id) => chips.has(id))) {
      problems.push({
        line: number,
        message: `names ${named.join(', ')}, which the suggested-task ledger holds as no decide chip. Offer the cut's question with kind: decide and name that task id`,
      });
    }
  });
  return problems;
}

const readChips = (root) => {
  const common = run(root, [
    'rev-parse',
    '--path-format=absolute',
    '--git-common-dir',
  ]).stdout?.trim();
  const ledger = common
    ? join(
        dirname(common),
        'docs/plans/artifacts/suggested-tasks.decisions.tsv'
      )
    : null;
  return ledger && existsSync(ledger)
    ? decideChips(readFileSync(ledger, 'utf-8'))
    : null;
};

const isPlan = (path) =>
  path.startsWith('docs/plans/') &&
  !path.startsWith('docs/plans/artifacts/') &&
  path.endsWith('.md');

const report = (path, problems) =>
  problems.map(({ line, message }) => `${path}:${line}: ${message}`);

const linesBeyondBase = (before, after) => {
  const left = new Map();
  for (const line of before.split('\n')) {
    left.set(line, (left.get(line) ?? 0) + 1);
  }
  const lines = new Set();
  after.split('\n').forEach((line, index) => {
    const count = left.get(line) ?? 0;
    if (count > 0) left.set(line, count - 1);
    else lines.add(index + 1);
  });
  return lines;
};

export function checkLanding(root, { base, chips = readChips(root) }) {
  const changed = changedSince(root, base);
  if (!changed) {
    throw new Error(
      `Cannot diff against the base commit ${base}. Pass a base this checkout holds.`
    );
  }
  const errors = [];
  const paths = [
    ...new Set([...changed, ...untrackedFiles(root, ['docs/plans'])]),
  ].filter((path) => isPlan(path) && existsSync(join(root, path)));
  for (const path of paths) {
    const after = readFileSync(join(root, path), 'utf-8');
    const shown = showAt(root, base, path);
    const before = shown.status === 0 ? shown.stdout : '';
    const lines = linesBeyondBase(before, after);
    errors.push(...report(path, cutProblems(after, { chips, lines })));
  }
  return errors;
}

export function checkFiles(root, paths, { chips = readChips(root) } = {}) {
  return paths.flatMap((path) =>
    report(
      relative(root, resolve(root, path)),
      cutProblems(readFileSync(resolve(root, path), 'utf-8'), { chips })
    )
  );
}

const usage =
  'Usage: node tooling/scripts/plan-cuts.mjs land [--base <rev>] | check <file>...';

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
