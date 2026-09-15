import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { arch, cpus, platform, release, tmpdir } from 'node:os';
import path from 'node:path';

import { createEditor } from '../../../packages/plitejs/src';
import { authored } from '../../../packages/plitejs/src/authored';
import { records } from '../../../packages/plitejs/src/authored/record-tree';
import { authoredState } from '../../../packages/plitejs/src/authored/state';
import { writeBenchmarkArtifact } from './benchmark-artifact';

const contractPath =
  'docs/plans/artifacts/native-authored-changes/retention-heap-contract.json';
const contractText = readFileSync(contractPath, 'utf-8');
const contract = JSON.parse(contractText) as {
  budget: { matchedHeapRatio: number };
  cohorts: number[];
  constructionRestoreInterval: number;
  passes: number;
  textLength: number;
};
const option = (name: string) =>
  process.argv
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number) => ({ path: [0, 0], offset });
const body = (index: number) => {
  const prefix = `retention-heap:${index.toString(36)}:`;
  return `${prefix}${'x'.repeat(
    Math.max(0, contract.textLength - prefix.length)
  )}`.slice(0, contract.textLength);
};
const collect = () => {
  for (let pass = 0; pass < 5; pass += 1) Bun.gc(true);
};

const runGenerate = () => {
  const entries = Number(option('entries'));
  const policy = option('policy');
  const output = option('result');
  const envelope = option('envelope');
  assert.ok(contract.cohorts.includes(entries));
  assert.ok(policy === 'archive' || policy === 'default');
  assert.ok(output && envelope);
  let editor: ReturnType<typeof createEditor> | undefined = createEditor({
    plugins: [
      authored({
        authorId: 'retention-heap',
        retainHistory: policy === 'archive',
      }),
    ],
    initialValue: [paragraph('')],
  });
  const started = performance.now();
  for (let index = 0; index < entries; index += 1) {
    const payload = body(index);
    editor.update.text.insert(payload, { at: point(0) });
    editor.update.text.delete({
      at: { anchor: point(0), focus: point(payload.length) },
    });
    if (
      (index + 1) % contract.constructionRestoreInterval === 0 &&
      index + 1 < entries
    ) {
      const checkpoint = JSON.parse(JSON.stringify(editor.read.value()));
      editor = undefined;
      collect();
      editor = createEditor({
        plugins: [
          authored({
            authorId: 'retention-heap',
            retainHistory: policy === 'archive',
          }),
        ],
        initialValue: checkpoint,
      });
    }
  }
  const constructionMs = performance.now() - started;
  const value = editor.read.value();
  assert.deepEqual(editor.read.children(), [paragraph('')]);
  assert.equal(
    [...records(editor.read.getField(authoredState).operations)].length,
    entries * 2
  );
  assert.equal(
    editor.read.authored.select({ status: 'pending' }).changes.length,
    0
  );
  const saved = JSON.stringify(value);
  assert.equal(saved.includes('retention-heap:'), policy === 'archive');
  writeFileSync(envelope, saved);
  writeFileSync(
    output,
    JSON.stringify({
      constructionMs,
      entries,
      policy,
      savedBytes: Buffer.byteLength(saved),
    })
  );
};

const runLoad = () => {
  const entries = Number(option('entries'));
  const policy = option('policy');
  const output = option('result');
  const envelope = option('envelope');
  assert.ok(contract.cohorts.includes(entries));
  assert.ok(policy === 'archive' || policy === 'default');
  assert.ok(output && envelope);
  let warm: ReturnType<typeof createEditor> | undefined = createEditor({
    plugins: [
      authored({
        authorId: 'retention-heap-warm',
        retainHistory: policy === 'archive',
      }),
    ],
    initialValue: [paragraph('')],
  });
  warm.read.children();
  warm = undefined;
  collect();
  const before = process.memoryUsage();
  const started = performance.now();
  const editor = createEditor({
    plugins: [
      authored({
        authorId: 'retention-heap-reader',
        retainHistory: policy === 'archive',
      }),
    ],
    initialValue: JSON.parse(readFileSync(envelope, 'utf-8')),
  });
  const loadMs = performance.now() - started;
  collect();
  const after = process.memoryUsage();
  assert.deepEqual(editor.read.children(), [paragraph('')]);
  assert.equal(
    [...records(editor.read.getField(authoredState).operations)].length,
    entries * 2
  );
  assert.equal(
    editor.read.authored.select({ status: 'pending' }).changes.length,
    0
  );
  writeFileSync(
    output,
    JSON.stringify({
      after,
      before,
      entries,
      loadMs,
      policy,
    })
  );
};

const mode = option('mode');
if (mode === 'generate') {
  runGenerate();
} else if (mode === 'load') {
  runLoad();
} else {
  const output =
    option('output') ?? 'tmp/plite-authored-retention-benchmark.json';
  const temporary = path.join(
    tmpdir(),
    `plite-authored-retention-${process.pid}`
  );
  const metafile = `${temporary}-build.json`;
  execFileSync(
    'bun',
    [
      'build',
      'benchmarks/editor/benchmarks/plite-authored-retention-benchmark.ts',
      '--target=bun',
      '--packages=external',
      `--outfile=${temporary}-build.mjs`,
      `--metafile=${metafile}`,
    ],
    { stdio: 'pipe' }
  );
  const inputPaths = [
    ...new Set([
      ...Object.keys(JSON.parse(readFileSync(metafile, 'utf-8')).inputs),
      contractPath,
      'packages/plitejs/package.json',
      'pnpm-lock.yaml',
    ]),
  ].sort();
  const fingerprint = () =>
    inputPaths.map((file) => ({
      path: file,
      sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
    }));
  const sourceBefore = fingerprint();
  const rows = [];
  const script =
    'benchmarks/editor/benchmarks/plite-authored-retention-benchmark.ts';
  for (const entries of contract.cohorts) {
    const generated = new Map<
      'archive' | 'default',
      { constructionMs: number; savedBytes: number }
    >();
    for (const policy of ['archive', 'default'] as const) {
      const envelope = `${temporary}-${policy}-${entries}.json`;
      const result = `${temporary}-${policy}-${entries}-generate.json`;
      execFileSync(
        'bun',
        [
          '--expose-gc',
          '--preload',
          './config/plite-source-aliases.ts',
          script,
          '--mode=generate',
          `--entries=${entries}`,
          `--policy=${policy}`,
          `--envelope=${envelope}`,
          `--result=${result}`,
        ],
        { stdio: 'inherit' }
      );
      generated.set(policy, JSON.parse(readFileSync(result, 'utf-8')));
    }
    const samples = { archive: [], default: [] } as Record<
      'archive' | 'default',
      Array<{
        after: NodeJS.MemoryUsage;
        before: NodeJS.MemoryUsage;
        loadMs: number;
      }>
    >;
    for (let pass = 0; pass < contract.passes; pass += 1) {
      const policies =
        pass % 2
          ? (['default', 'archive'] as const)
          : (['archive', 'default'] as const);
      for (const policy of policies) {
        const result = `${temporary}-${policy}-${entries}-load-${pass}.json`;
        execFileSync(
          'bun',
          [
            '--expose-gc',
            '--preload',
            './config/plite-source-aliases.ts',
            script,
            '--mode=load',
            `--entries=${entries}`,
            `--policy=${policy}`,
            `--envelope=${temporary}-${policy}-${entries}.json`,
            `--result=${result}`,
          ],
          { stdio: 'inherit' }
        );
        samples[policy].push(JSON.parse(readFileSync(result, 'utf-8')));
      }
    }
    const sortedHeap = (policy: 'archive' | 'default') =>
      samples[policy]
        .map((sample) => sample.after.heapUsed)
        .sort((left, right) => left - right);
    const archiveHeap = sortedHeap('archive');
    const defaultHeap = sortedHeap('default');
    const archiveMedian = archiveHeap[Math.floor(archiveHeap.length / 2)];
    const defaultMedian = defaultHeap[Math.floor(defaultHeap.length / 2)];
    const matchedHeapRatio = defaultMedian / archiveMedian;
    const row = {
      archive: {
        ...generated.get('archive'),
        heapUsedBytes: archiveHeap,
        samples: samples.archive,
      },
      default: {
        ...generated.get('default'),
        heapUsedBytes: defaultHeap,
        samples: samples.default,
      },
      entries,
      matchedHeapRatio,
      passed: matchedHeapRatio <= contract.budget.matchedHeapRatio,
    };
    rows.push(row);
    process.stderr.write(
      `${JSON.stringify({ entries, matchedHeapRatio, passed: row.passed })}\n`
    );
  }
  const sourceAfter = fingerprint();
  const sourceMatches =
    JSON.stringify(sourceBefore) === JSON.stringify(sourceAfter);
  const result = {
    benchmark: 'plite-authored-retention',
    contract,
    contractSha256: createHash('sha256').update(contractText).digest('hex'),
    createdAt: new Date().toISOString(),
    environment: {
      arch: arch(),
      cpu: cpus()[0]?.model,
      platform: platform(),
      release: release(),
      runtime: process.versions,
    },
    fullContractComplete: false,
    limitations: [
      'Measures cold retained JavaScript heap after forced GC; transient construction peak, browser DOM memory, provider memory, zero-review overhead and mounted-view heap remain separate gates.',
      'The archive arm is the same-payload full-retention control. Its installed archive ratio is exactly one by construction and is not inferred from the archive-free default arm.',
    ],
    passed: sourceMatches && rows.every((row) => row.passed),
    rows,
    sourceAfter,
    sourceBefore,
    sourceMatches,
    version: 1,
  };
  writeBenchmarkArtifact(output, `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(
    `METRIC plite_authored_retention_passed=${Number(result.passed)}\n`
  );
  if (process.env.PLITE_AUTHORED_RETENTION_STRICT === '1' && !result.passed) {
    process.exitCode = 1;
  }
}
