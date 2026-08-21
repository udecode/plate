import { writeFileSync } from 'node:fs';

import { history } from '../../../packages/plite-history/src/index';
import { createEditor, type Element } from '../../../packages/plite/src/index';

const outputArgument = process.argv.find((argument) =>
  argument.startsWith('--output=')
);
const remoteCommitsArgument = process.argv.find((argument) =>
  argument.startsWith('--remote-commits=')
);
const remoteCommits = remoteCommitsArgument
  ? Number(remoteCommitsArgument.slice('--remote-commits='.length))
  : 1000;

if (!Number.isInteger(remoteCommits) || remoteCommits < 1) {
  throw new Error('--remote-commits must be a positive integer.');
}

const percentile = (values: readonly number[], ratio: number) =>
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)]!;

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const rows = [100, 1000].map((depth) => {
  const editor = createEditor({
    extensions: [history({ maxDepth: depth })],
    initialValue: [paragraph('body')],
  });

  for (let index = 0; index < depth; index++) {
    editor.update((tx) => {
      tx.history.newBatch();
      tx.text.insert('l', { at: { offset: 4 + index, path: [0, 0] } });
    });
  }

  const historyDepthBeforeBurst = editor.read.history().undos.length;
  const heapBefore = process.memoryUsage().heapUsed;
  const samples: number[] = [];
  const burstStartedAt = performance.now();

  for (let index = 0; index < remoteCommits; index++) {
    const startedAt = performance.now();

    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('r', { at: { offset: 0, path: [0, 0] } });
    });
    samples.push(performance.now() - startedAt);
  }

  const remoteBurstMs = performance.now() - burstStartedAt;
  const heapDeltaBytes = process.memoryUsage().heapUsed - heapBefore;
  const undoStartedAt = performance.now();

  editor.update((tx) => tx.history.undo());

  const undoResolutionMs = performance.now() - undoStartedAt;
  const expected = `${'r'.repeat(remoteCommits)}body${'l'.repeat(depth - 1)}`;

  if (editor.read.text.string([]) !== expected) {
    throw new Error(`${depth}: lazy history resolved to the wrong document.`);
  }

  samples.sort((left, right) => left - right);

  return {
    depth,
    heapDeltaBytes,
    historyDepthBeforeBurst,
    p50Ms: percentile(samples, 0.5),
    p95Ms: percentile(samples, 0.95),
    p99Ms: percentile(samples, 0.99),
    remoteBurstMs,
    remoteCommits,
    repeatedUnit: 'one history-skipped remote commit',
    undoResolutionMs,
  };
});

const normal = rows[0]!;
const stress = rows[1]!;
const medianDepthRatio = stress.p50Ms / Math.max(normal.p50Ms, 0.000_001);
const p95DepthRatio = stress.p95Ms / Math.max(normal.p95Ms, 0.000_001);
const strict = process.env.PLITE_HISTORY_DEPTH_STRICT === '1';

if (strict && (medianDepthRatio > 4 || p95DepthRatio > 4)) {
  throw new Error(
    `Lazy history remote commits scaled ${medianDepthRatio.toFixed(2)}x median / ${p95DepthRatio.toFixed(2)}x p95 from depth 100 to 1,000.`
  );
}

const result = {
  benchmark: 'plite-history-depth',
  cohorts: {
    normal: '100 retained undo batches plus 1,000 remote commits',
    stress: '1,000 retained undo batches plus 1,000 remote commits',
  },
  generatedAt: new Date().toISOString(),
  medianDepthRatio,
  p95DepthRatio,
  rows,
  thresholdPolicy: {
    medianDepthRatioMax: 4,
    p95DepthRatioMax: 4,
    undoCorrectnessRequired: true,
  },
  version: 1,
};
const output = `${JSON.stringify(result, null, 2)}\n`;

process.stdout.write(
  `METRIC plite_history_depth_median_ratio=${medianDepthRatio}\n`
);
process.stdout.write(`METRIC plite_history_depth_p95_ratio=${p95DepthRatio}\n`);

if (outputArgument) {
  writeFileSync(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}
