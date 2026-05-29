import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';

import {
  createEvidenceReadinessRows,
  normalizeSlateLegacyCompareArtifact,
  normalizeBenchmarkRow,
} from '../../src/index.mjs';

const args = parseArgs(process.argv.slice(2));
const cases = readInt(args.cases, 200);
const seed = readInt(args.seed, 0x5e_ed);
const corpusPath = path.resolve(args.corpus || 'test/fixtures/corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const rng = mulberry32(seed);
let executed = 0;

for (const seedCase of corpus.cases || []) {
  runCase(seedCase, 'corpus:' + seedCase.name);
}

for (let i = 0; i < cases; i++) {
  runCase(buildGeneratedCase(i, rng), 'generated:' + i);
}

const readinessRows = createEvidenceReadinessRows();
if (readinessRows.length < 3) {
  throw new Error('expected evidence readiness rows');
}
for (const row of readinessRows) {
  normalizeBenchmarkRow(row);
}

const slateCompareRows = normalizeSlateLegacyCompareArtifact(
  buildSlateCompareArtifact(),
  {
    artifactPath:
      '../../.tmp/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark-test.json',
    rootDir: process.cwd(),
  }
);
if (slateCompareRows.length !== 3) {
  throw new Error(
    'expected one normalized row for each active Slate compare surface'
  );
}
if (
  !slateCompareRows.some((row) => row.library === 'slate-v2:dom-present') ||
  !slateCompareRows.some((row) => row.library === 'slate')
) {
  throw new Error('expected Slate v2 and Slate compare row libraries');
}

console.log(
  'editor evidence fuzz passed executed=' +
    executed +
    ' generated=' +
    cases +
    ' seed=' +
    seed
);

function runCase(testCase, id) {
  try {
    const actual = normalizeBenchmarkRow(testCase.input);
    if (!isDeepStrictEqual(actual, testCase.expected)) {
      throw new Error('case mismatch ' + id);
    }
    executed++;
  } catch (error) {
    if (args.writeRepro) writeRepro(args.writeRepro, testCase, id, error);
    throw error;
  }
}

function buildGeneratedCase(index, rng) {
  const category = pick(rng, [
    'large-document',
    'typing',
    'selection',
    'clipboard',
    'history',
    'evidence-readiness',
  ]);
  const library = pick(rng, ['slate-v2', 'slate']);
  const status = pick(rng, ['ok', 'partial', 'unsupported', 'timeout']);
  const medianUs = Math.round((1 + rng() * 5000) * 100) / 100;
  const p95Us = Math.round((medianUs + rng() * 5000) * 100) / 100;

  return {
    name: 'generated-row-' + index,
    input: {
      category,
      fixture: category + '-' + index,
      library,
      status,
      medianUs,
      p95Us,
      ops: index + 1,
      note: `${library} ${category} generated contract case`,
    },
    expected: {
      category,
      fixture: category + '-' + index,
      library,
      status,
      medianUs,
      p95Us,
      ops: index + 1,
      note: `${library} ${category} generated contract case`,
    },
  };
}

function buildSlateCompareArtifact() {
  const stats = (median, p95) => ({
    samples: [median, p95],
    mean: (median + p95) / 2,
    median,
    p95,
  });

  return {
    lane: 'slate-react-huge-document-legacy-compare',
    currentRepo: '/Users/zbeyens/git/plate-2/.tmp/slate-v2',
    legacyRepo: '/Users/zbeyens/git/slate',
    config: {
      blocks: 5000,
      iterations: 2,
      splitSelectionLanes: true,
      typeOps: 10,
    },
    surfaces: {
      legacyChunkOn: { readyMs: stats(80, 120) },
      v2DefaultRenderAuto: { readyMs: stats(20, 30) },
      v2DomPresent: { readyMs: stats(22, 32) },
    },
  };
}

function writeRepro(outPath, testCase, id, error) {
  const resolved = path.resolve(outPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(
    resolved,
    JSON.stringify(
      {
        id,
        error: error && error.stack ? error.stack : String(error),
        case: testCase,
      },
      null,
      2
    ) + '\n'
  );
}

function pick(rng, values) {
  return values[Math.floor(rng() * values.length)];
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state += 0x6d_2b_79_f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function parseArgs(argv) {
  const out = {};
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];
    i++;
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = argv[i] || true;
    i++;

    if (key === 'writeRepro' || key === 'write-repro') out.writeRepro = value;
    else out[key] = value;
  }
  return out;
}

function readInt(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}
