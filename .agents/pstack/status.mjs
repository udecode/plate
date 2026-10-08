// Installed by the sync-pstack skill. A plan's state is the first word of its
// Status line, a panel row's kind is the first word of its decision, and a
// cited proof is a path under <plans>/artifacts/.

import { spawnSync } from 'node:child_process';
import { closeSync, existsSync, openSync, readSync, realpathSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const LANDED = ['done', 'complete', 'completed', 'shipped', 'executed', 'implemented', 'fixed', 'released', 'merged', 'verified', 'landed'];

export const STATES = {
  done: [...LANDED, 'superseded', 'replaced', 'closed', 'cancelled', 'canceled', 'abandoned', 'retired', 'terminated'],
  active: ['building', 'executing', 'in', 'active', 'resumed', 'reopened', 'rework', 'review', 'reviewing', 'awaiting', 'waiting'],
  held: ['blocked', 'paused'],
  planning: ['planning', 'planned', 'draft', 'proposed', 'ready', 'pending', 'scoped', 'partial', 'approved', 'accepted', 'open'],
};

function words(status) {
  return status
    .trim()
    .replace(/^[^a-z]+/i, '')
    .toLowerCase()
    .split(/[^a-z-]+/)
    .map((word) => word.replaceAll('-', ''))
    .filter(Boolean);
}

export function stateOf(status) {
  const [first, second] = words(status);
  if (first === 'in' && ['planning', 'draft'].includes(second)) return 'planning';
  return Object.keys(STATES).find((state) => STATES[state].includes(first)) ?? null;
}

export const SEATS = /^seats\s/u;

export const SEVERITIES = ['critical', 'warning', 'nit'];

// Superseded and cancelled plans close without their work, so only landed ones face the Done gate.
export const landed = (status) => LANDED.includes(words(status)[0]);

export const reopened = (status) => words(status)[0] === 'reopened';

const LOCATION = /(?::\d+){1,2}(?:-\d+)?$|#L\d+(?:-L?\d+)?$/u;
const TRAILING = /[.:,;!?*_–—]+$/u;
const NOT_ONE_FILE = /[*?<>{}|[\]]|\.\.|\$\{/u;
const tidy = (path) => path.replace(TRAILING, '').replace(LOCATION, '').replace(TRAILING, '');

const viaAnotherTree = (lead) => lead.endsWith('/') && !lead.startsWith('/') && lead !== './';
const firstExisting = (candidates) => candidates.find((candidate) => existsSync(candidate)) ?? candidates.at(-1);

function citation(token, root) {
  const at = token.indexOf(root);
  if (at === -1) return null;
  const lead = token.slice(Math.max(0, token.slice(0, at).search(/\S*$/u)), at);
  if (viaAnotherTree(lead)) return null;
  const path = token.slice(lead.startsWith('/') ? at - lead.length : at);
  const found = firstExisting([tidy(path.trim()), tidy(path.split(/\s/u)[0])]);
  return NOT_ONE_FILE.test(found) ? null : found;
}

export function runPaths(text, plans) {
  const root = `${plans}/artifacts/`;
  const spans = [...text.matchAll(/`([^`]+)`|\]\(([^)\s]+)\)/gu)].map((match) => match[1] ?? match[2]);
  const bare = text.replace(/`[^`]*`|\]\([^)]*\)/gu, ' ').split(/[\s,;()'"=]+/u);
  return [...new Set([...spans, ...bare].map((token) => citation(token, root)).filter(Boolean))];
}

const RECEIPT = /^exit=(?:-?\d+|SIG[A-Z]+|E[A-Z]{3,})$/u;
const isReceipt = (line) => RECEIPT.test(line.trimEnd());

export function recordsExit(path) {
  const fd = openSync(path, 'r');
  const buffer = Buffer.alloc(65_536);
  let carry = '';
  try {
    for (let read = readSync(fd, buffer); read > 0; read = readSync(fd, buffer)) {
      const lines = `${carry}${buffer.toString('utf8', 0, read)}`.split('\n');
      carry = lines.pop().slice(-4096);
      if (lines.some(isReceipt)) return true;
    }
    return isReceipt(carry);
  } finally {
    closeSync(fd);
  }
}

export function committedLines(path) {
  const base = process.env.PSTACK_BASE;
  if (base !== undefined && spawnSync('git', ['rev-parse', '--verify', '--quiet', `${base}^{commit}`]).status !== 0) {
    throw new Error(`PSTACK_BASE ${base} names no commit`);
  }
  const shown = spawnSync('git', ['show', `${base ?? 'HEAD'}:./${relative(process.cwd(), path)}`], { encoding: 'utf8' });
  return new Set(shown.status === 0 ? shown.stdout.split('\n') : []);
}

export const STATUSES = [
  'accepted',
  'applied',
  'blocked',
  'corrected',
  'decided',
  'deferred',
  'dismissed',
  'fixed',
  'gap',
  'inconclusive',
  'kept',
  'open',
  'partial',
  'proven',
  'recorded',
  'reverted',
  'skipped',
  'superseded',
  'verified',
];
export const PROVEN = ['fixed', 'proven', 'verified'];

export const statusOf = (result) => result.replace(/^'/u, '').match(/^[a-z]+/iu)?.[0]?.toLowerCase();

export function parseFence(line) {
  const match = line.match(/^\s*(```|~~~)(.*)$/);
  if (!match || (match[1] === '```' && match[2].includes('`'))) return null;
  const words = match[2].trim().split(/\s+/).filter(Boolean);
  const tag = ['before', 'after'].includes(words.at(-1)) ? words.pop() : undefined;
  return { marker: match[1], lang: words[0] ?? '', tag };
}
export const isFence = (line) => parseFence(line) !== null;

export function readFence(lines, start) {
  const { marker, lang, tag } = parseFence(lines[start]);
  const body = [];
  let index = start + 1;
  for (
    ;
    index < lines.length && !lines[index].trim().startsWith(marker);
    index += 1
  ) {
    body.push(lines[index]);
  }
  return { lang, tag, body: body.join('\n'), next: index + 1 };
}

export const TABLE_RULE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

export function splitRow(row) {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll('\\|', '|'));
}

export const NOT_PASSED = ['partial', 'open', 'gap', 'blocked', 'inconclusive'];

const realOf = (path) => (existsSync(path) ? realpathSync(path) : path);
export const proofKey = (path) => relative(realOf(process.cwd()), realOf(resolve(path)));

export function proofLabels(evidence, plans) {
  const root = `${plans}/artifacts/`;
  return [...evidence.matchAll(/(?:^|[\s;`])proof:\s+([^\s;,`]+)/gu)].flatMap(([, value]) => {
    if (value === 'none') return [{ none: true }];
    if (!value.includes(root)) return [];
    const path = tidy(value);
    return [{ path, key: proofKey(path), exists: existsSync(path) }];
  });
}

export const acceptedWord = (evidence) => evidence.match(/(?:^|[\s;`])word:\s*([^;]+?)\s*(?:;|$)/u)?.[1];

const plainWord = (text) =>
  text
    .replace(/[`"“”'‘’*_]/gu, '')
    .trim()
    .replace(/[.:,;!?]+$/u, '')
    .toLowerCase();

function blankFencesAndComments(lines) {
  let fence = null;
  let commented = false;
  return lines.map((line) => {
    if (fence) {
      const close = line.match(/^\s*(`{3,}|~{3,})\s*$/u);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      return '';
    }
    let kept = line;
    if (commented) {
      const end = kept.indexOf('-->');
      if (end === -1) return '';
      commented = false;
      kept = kept.slice(end + 3);
    }
    const open = kept.match(/^\s*(`{3,}|~{3,})/u);
    if (open) {
      fence = open[1];
      return '';
    }
    kept = kept.replace(/<!--.*?-->/gu, '');
    const start = kept.indexOf('<!--');
    if (start !== -1) {
      commented = true;
      kept = kept.slice(0, start);
    }
    return kept;
  });
}

export function defaultsWords(planText) {
  const lines = blankFencesAndComments(planText.split('\n'));
  const start = lines.findIndex((line) => /^##\s+Defaults\s*$/u.test(line));
  if (start === -1) return new Set();
  const end = lines.findIndex((line, index) => index > start && /^##\s/u.test(line));
  const words = new Set();
  for (const { head, rows } of tablesOf(lines.slice(start + 1, end === -1 ? undefined : end))) {
    const names = head.map((cell) => plainWord(cell));
    if (names.slice(0, 4).join('|') !== 'decision|pick|alternative|word') continue;
    const column = names.indexOf('word');
    for (const row of rows) {
      for (const option of (row[column] ?? '').split(/,|\bor\b/iu)) {
        const word = plainWord(option);
        if (word) words.add(word);
      }
    }
  }
  return words;
}

export const isAcceptingWord = (word, words) => Boolean(word) && words.has(plainWord(word));

export function proofStates(rows, plans) {
  const states = new Map();
  for (const [, phase = '', , , evidence = '', result = ''] of rows) {
    if (phase.startsWith('review')) continue;
    const status = statusOf(result);
    for (const label of proofLabels(evidence, plans)) {
      if (label.none) continue;
      const state = states.get(label.key) ?? { passed: true, word: null };
      if (NOT_PASSED.includes(status)) states.set(label.key, { passed: false, word: null });
      else if (status === 'accepted') states.set(label.key, { ...state, word: acceptedWord(evidence) ?? null });
      else if (PROVEN.includes(status)) states.set(label.key, { passed: true, word: null });
    }
  }
  return states;
}

export function tablesOf(lines) {
  const tables = [];
  for (let index = 0; index < lines.length; ) {
    if (isFence(lines[index])) {
      index = readFence(lines, index).next;
      continue;
    }
    if (!/^\s*\|/.test(lines[index]) || !TABLE_RULE.test(lines[index + 1] ?? '')) {
      index += 1;
      continue;
    }
    const head = splitRow(lines[index]);
    const rows = [];
    for (index += 2; index < lines.length && /^\s*\|/.test(lines[index]); index += 1) {
      rows.push(splitRow(lines[index]));
    }
    tables.push({ head, rows });
  }
  return tables;
}
