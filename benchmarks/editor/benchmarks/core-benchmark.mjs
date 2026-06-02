import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

import {
  createEvidenceReadinessRows,
  normalizeBenchmarkRow,
  normalizeBenchmarkResult,
} from '../src/index.mjs';

const args = parseArgs(process.argv.slice(2));
const outPath = args.out || 'benchmarks/results/core-latest.json';
const samples = measureNormalization();
const rows = [
  ...createEvidenceReadinessRows(),
  normalizeBenchmarkRow({
    category: 'contract',
    fixture: 'benchmark-row-normalization',
    library: 'plate-editor-evidence',
    status: 'ok',
    medianUs: percentile(samples, 0.5),
    p95Us: percentile(samples, 0.95),
    ops: samples.length,
    note: 'normalizes Evidence Kit benchmark rows into required schema fields',
  }),
];
const payload = {
  name: 'editor-evidence-core',
  generatedAt: new Date().toISOString(),
  node: process.version,
  rows,
};

normalizeBenchmarkResult(payload);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
console.log(JSON.stringify(payload, null, 2));

function measureNormalization() {
  const rounds = readInt(args.rounds, 15);
  const iterations = readInt(args.iterations, 2000);
  const samples = [];

  for (let round = 0; round < rounds; round++) {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      normalizeBenchmarkRow({
        category: 'typing',
        fixture: 'type-middle-' + (i % 10),
        library: i % 2 === 0 ? 'slate-v2' : 'slate',
        status: 'ok',
        medianUs: 120 + i,
        p95Us: 160 + i,
        ops: i + 1,
      });
    }

    samples.push(((performance.now() - start) * 1000) / iterations);
  }

  return samples.sort((a, b) => a - b);
}

function percentile(sortedSamples, p) {
  if (sortedSamples.length === 0) return 0;
  const index = Math.min(
    sortedSamples.length - 1,
    Math.floor(sortedSamples.length * p)
  );

  return Number(sortedSamples[index].toFixed(3));
}

function parseArgs(argv) {
  const out = {};
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];
    i++;
    if (!arg.startsWith('--')) continue;
    out[arg.slice(2)] = argv[i] || true;
    i++;
  }
  return out;
}

function readInt(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
