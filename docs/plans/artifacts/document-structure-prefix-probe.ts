import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

type Node = { type: string; level?: number };

const allowed = new Set(['heading', 'paragraph', 'table']);
const title: Node = { type: 'heading', level: 1 };
const paragraph: Node = { type: 'paragraph' };
const table: Node = { type: 'table' };

// Isolate the existing compiled type-membership check from an ordered-prefix
// check. This is a disposable design probe, not a Plite implementation.
const current = (node: Node, _index: number) => allowed.has(node.type);
const prefix = (node: Node, index: number) =>
  index === 0
    ? node.type === 'heading' && node.level === 1
    : index === 1
      ? node.type === 'paragraph'
      : allowed.has(node.type);

assert.equal(prefix(title, 0), true);
assert.equal(prefix({ type: 'heading', level: 2 }, 0), false);
assert.equal(prefix(table, 0), false);
assert.equal(prefix(paragraph, 1), true);
assert.equal(prefix(title, 1), false);
assert.equal(prefix(table, 2), true);
assert.equal(current({ type: 'heading', level: 2 }, 0), true);

const cohorts = [100, 1_000, 10_000, 50_000] as const;
const samples = 15;
const iterations = 200_000;
const budget = {
  maxExtraNanoseconds: 100,
  maxNanoseconds: 1_000,
  maxRelative: 3,
  maxVisitedNodesPerCheck: 1,
};
const percentile = (values: number[], ratio: number) =>
  [...values].sort((a, b) => a - b)[Math.ceil(values.length * ratio) - 1];

let checksum = 0;
const measure = (fn: (node: Node, index: number) => boolean, nodes: Node[]) => {
  const started = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    const index = i % 4 === 0 ? 0 : i % 4 === 1 ? 1 : nodes.length - 1;
    checksum += Number(fn(nodes[index]!, index));
  }
  return Number(process.hrtime.bigint() - started) / iterations;
};

const results = cohorts.map((count) => {
  const nodes = [title, paragraph, ...Array.from({ length: count - 2 }, () => table)];
  for (let i = 0; i < 5; i++) {
    measure(current, nodes);
    measure(prefix, nodes);
  }
  const baseline: number[] = [];
  const target: number[] = [];
  for (let sample = 0; sample < samples; sample++) {
    if (sample % 2 === 0) {
      baseline.push(measure(current, nodes));
      target.push(measure(prefix, nodes));
    } else {
      target.push(measure(prefix, nodes));
      baseline.push(measure(current, nodes));
    }
  }
  const currentP50 = percentile(baseline, 0.5);
  const prefixP50 = percentile(target, 0.5);
  return {
    count,
    currentP50Ns: currentP50,
    prefixP50Ns: prefixP50,
    currentP95Ns: percentile(baseline, 0.95),
    prefixP95Ns: percentile(target, 0.95),
    visitedNodesPerCheck: 1,
    pass:
      prefixP50 <= budget.maxNanoseconds &&
      prefixP50 <= currentP50 * budget.maxRelative + budget.maxExtraNanoseconds,
  };
});

const sources = [
  'packages/plitejs/src/core/schema-compiler.ts',
  'packages/plitejs/src/core/editor-schema.ts',
  'packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts',
  'docs/plans/artifacts/document-structure-prefix-probe.ts',
];
const sha256 = (path: string) =>
  createHash('sha256').update(readFileSync(path)).digest('hex');
console.log(JSON.stringify({
  kind: 'disposable-prefix-matcher-probe',
  runtime: `bun ${Bun.version}`,
  budget,
  cohorts,
  samples,
  iterations,
  checksum,
  sourceSha256: Object.fromEntries(sources.map((path) => [path, sha256(path)])),
  results,
  result: results.every((row) => row.pass) ? 'pass' : 'fail',
}, null, 2));
