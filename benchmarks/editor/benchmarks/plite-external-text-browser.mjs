import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { cpus, loadavg, tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import { chromium } from '@playwright/test';

import {
  evaluate,
  mountSampling,
  noisePolicy,
  noisy,
  summarize,
} from './external-text-measurement.mjs';

const runner = fileURLToPath(import.meta.url);
const repo = resolve(dirname(runner), '../../..');
const entry = resolve(dirname(runner), 'plite-external-text-entry.mjs');
const quick = process.argv.includes('--quick');
const only = process.argv
  .find((argument) => argument.startsWith('--only='))
  ?.slice(7);
const profile = process.argv.includes('--profile');
const output = resolve(
  repo,
  process.argv.find((argument) => argument.startsWith('--output='))?.slice(9) ??
    'tmp/plite-external-text-browser.json'
);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const sourceFiles = execFileSync('rg', ['--files', 'packages/plitejs/src'], {
  cwd: repo,
  encoding: 'utf-8',
})
  .trim()
  .split('\n')
  .concat([
    'pnpm-lock.yaml',
    'packages/plitejs/package.json',
    'packages/plitejs/tsdown.config.mts',
    runner,
    entry,
    resolve(dirname(runner), 'external-text-measurement.mjs'),
  ])
  .sort();
const fingerprint = async () =>
  Object.fromEntries(
    await Promise.all(
      sourceFiles.map(async (path) => [
        path,
        await readFile(resolve(repo, path))
          .then(sha256)
          .catch((error) => {
            if (error.code === 'ENOENT') return 'missing';
            throw error;
          }),
      ])
    )
  );
const hostSample = () => ({
  at: new Date().toISOString(),
  loadAverage: loadavg(),
  logicalCpus: cpus().length,
});
const hostBefore = hostSample();
const before = await fingerprint();
const temp = await mkdtemp(resolve(tmpdir(), 'plite-external-text-'));
const buildBundle = async (name) => {
  execFileSync('pnpm', ['--filter', 'plitejs', 'build'], {
    cwd: repo,
    stdio: 'inherit',
  });
  const bundlePath = resolve(temp, `${name}.js`);
  execFileSync(
    'bun',
    [
      'build',
      entry,
      '--target=browser',
      '--format=esm',
      '--outfile',
      bundlePath,
    ],
    {
      cwd: repo,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'inherit',
    }
  );
  return readFile(bundlePath, 'utf-8');
};
const targetBundle = await buildBundle('bundle');
const baselineDir = resolve(
  repo,
  'docs/plans/artifacts/external-text-execution'
);
const baselineReceipt = JSON.parse(
  await readFile(resolve(baselineDir, 'baseline.json'), 'utf-8')
);
const baselineBundle = gunzipSync(
  await readFile(resolve(baselineDir, 'baseline.js.gz'))
).toString();
if (sha256(baselineBundle) !== baselineReceipt.bundleSha256) {
  throw new Error('Frozen baseline hash mismatch');
}
const html = (bundle) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>html,body,#app{margin:0;padding:0}</style></head><body><div id="app"></div><script type="module">${bundle.replaceAll('</script', '<\\/script')}</script></body></html>`;
const browser = await chromium.launch({
  args: ['--enable-precise-memory-info'],
  headless: true,
});
const browserVersion = browser.version();
const failures = [];
const budgetFailures = [];
const noiseFailures = [];
const cells = [];
const pageFor = async (bundle) => {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });
  page.on('pageerror', (error) => failures.push(`browser: ${error.message}`));
  await page.setContent(html(bundle), { waitUntil: 'load' });
  await page.waitForFunction(
    () => globalThis.__PLITE_EXTERNAL_TEXT_BENCHMARK_READY__
  );
  return page;
};
const call = (page, method, input) =>
  page.evaluate(
    (request) =>
      globalThis.__PLITE_EXTERNAL_TEXT_BENCHMARK__[request.method](
        request.input
      ),
    { method, input }
  );
const measureMount = async (input, includeBaseline) => {
  const variants = includeBaseline ? ['target', 'baseline'] : ['target'];
  const result = Object.fromEntries(
    variants.map((name) => [name, { cold: [], warm: [], observations: [] }])
  );
  for (
    let round = 0;
    round < mountSampling.warmups + mountSampling.samples;
    round++
  ) {
    for (const name of round % 2 ? [...variants].reverse() : variants) {
      const baseline = name === 'baseline';
      const page = await pageFor(baseline ? baselineBundle : targetBundle);
      const args = baseline
        ? { ...input, surface: baselineReceipt.fixture }
        : input;
      try {
        const cold = await call(page, 'install', args);
        await call(page, 'install', args);
        const warm = await call(page, 'install', args);
        if (baseline && (!cold.directModelExact || !warm.directModelExact)) {
          throw new Error('Baseline canonical text mismatch');
        }
        if (round >= mountSampling.warmups) {
          result[name].cold.push(cold.renderToPaintMs);
          result[name].warm.push(warm.renderToPaintMs);
          result[name].observations.push({ cold, warm });
        }
        result[name].last = warm;
      } finally {
        await page.close();
      }
    }
  }
  return Object.fromEntries(
    Object.entries(result).map(([name, values]) => [
      name,
      {
        ...values,
        cold: summarize(values.cold),
        warm: summarize(values.warm),
      },
    ])
  );
};

const executeCell = async (input) => {
  const id = `${input.fixture}/${input.lineCount}/blocks-${input.blockCount ?? 1}/views-${input.viewCount ?? 1}${input.independent ? '+independent' : ''}/spans-${input.spans ?? 1}/decorations-${input.decorationCount ?? 0}-${input.decorationShape ?? 'sparse'}`;
  process.stdout.write(`Measuring ${id}\n`);
  const row = { id, input };
  cells.push(row);
  const includeBaseline =
    input.lineCount === 100_000 &&
    (input.viewCount ?? 1) === 1 &&
    (input.decorationCount ?? 0) === 0 &&
    (input.spans ?? 1) === 1;
  Object.assign(row, await measureMount(input, includeBaseline));
  if (profile) {
    const page = await pageFor(targetBundle);
    try {
      const profiler = await page.context().newCDPSession(page);
      await profiler.send('Profiler.enable');
      await profiler.send('Profiler.setSamplingInterval', { interval: 100 });
      await profiler.send('Profiler.start');
      await call(page, 'install', input);
      const result = await profiler.send('Profiler.stop');
      row.profilePath = `${output}.${cells.length}.cpuprofile`;
      await mkdir(dirname(output), { recursive: true });
      await writeFile(row.profilePath, JSON.stringify(result.profile));
      await profiler.detach();
    } finally {
      await page.close();
    }
  }
  const page = await pageFor(targetBundle);
  try {
    await call(page, 'install', input);
    const measured = await call(page, 'exercise', {
      iterations: 20,
      spans: input.spans ?? 1,
    });
    row.metrics = measured.metrics;
    row.operations = Object.fromEntries(
      Object.entries(measured.rows).map(([key, values]) => [
        key,
        {
          actionToFrameMs: summarize(
            values.map((value) => value.actionToFrameMs)
          ),
          syncMs: summarize(values.map((value) => value.syncMs)),
          samples: values,
        },
      ])
    );
  } finally {
    await page.close();
  }
  const views = input.viewCount ?? 1;
  const blocks = input.blockCount ?? 1;
  const independent = Number(input.independent ?? false);
  for (const mode of ['cold', 'warm']) {
    const timing = row.target[mode];
    if (noisy(timing)) {
      noiseFailures.push(
        `${id}/${mode}: jitter exceeds ratio ${noisePolicy.ratio} and ${noisePolicy.absoluteMs}ms`
      );
    }
    const budget =
      blocks === 1000
        ? 150
        : input.lineCount === 100_000
          ? 100
          : input.lineCount === 10_000
            ? 75
            : null;
    if (budget && timing.p95 > budget) {
      budgetFailures.push(
        `${id}/${mode}: mount ${timing.p95.toFixed(1)} ms > ${budget} ms`
      );
    }
    if (row.baseline) {
      if (noisy(row.baseline[mode])) {
        noiseFailures.push(
          `${id}/baseline/${mode}: jitter exceeds ratio ${noisePolicy.ratio} and ${noisePolicy.absoluteMs}ms`
        );
      }
      if (timing.p95 > row.baseline[mode].p95 / 2) {
        budgetFailures.push(
          `${id}/${mode}: mount exceeds half the matched baseline`
        );
      }
    }
  }
  for (const counters of row.target.observations.flatMap(({ cold, warm }) => [
    cold,
    warm,
  ])) {
    if (
      counters.pliteTextHosts !== 0 ||
      counters.domElements > (blocks * views + independent) * 3 ||
      counters.adapterElements !== blocks * views + independent
    ) {
      failures.push(`${id}: DOM budget`);
    }
    if (
      counters.metrics.commitSubscriptions !== views + independent ||
      counters.metrics.decorationSubscriptions !== views + independent
    ) {
      failures.push(`${id}: per-Editable subscription budget`);
    }
  }
  if (row.metrics.resets !== 0 || row.metrics.callbackFailures !== 0) {
    failures.push(`${id}: unexpected adapter reset/failure`);
  }
  for (const [kind, values] of Object.entries(row.operations)) {
    if (noisy(values.actionToFrameMs)) {
      noiseFailures.push(
        `${id}/${kind}: jitter exceeds ratio ${noisePolicy.ratio} and ${noisePolicy.absoluteMs}ms`
      );
    }
    const oneChange = (input.spans ?? 1) === 1 || kind === 'remote';
    const budget =
      kind === 'selection'
        ? 32
        : !oneChange
          ? null
          : input.lineCount === 100_000
            ? 100
            : input.lineCount === 10_000
              ? 50
              : null;
    if (
      budget &&
      ['selection', 'local', 'remote', 'undo', 'redo'].includes(kind) &&
      values.actionToFrameMs.p95 > budget
    ) {
      budgetFailures.push(
        `${id}/${kind}: ${values.actionToFrameMs.p95.toFixed(1)} ms > ${budget} ms`
      );
    }
    if (values.samples.some((value) => value.affectedViews > views)) {
      failures.push(`${id}/${kind}: unrelated view received an update`);
    }
    if (
      ['local', 'selection', 'remote', 'undo', 'redo'].includes(kind) &&
      values.samples.some(
        (value) => value.commitCount !== 1 || value.affectedViews !== views
      )
    ) {
      failures.push(`${id}/${kind}: one-commit/affected-view law`);
    }
    if (
      ['local', 'selection', 'remote', 'undo', 'redo'].includes(kind) &&
      values.samples.some(
        (value) =>
          value.metrics.visitedEntries !== views ||
          value.adapterUpdateCount !== views
      )
    ) {
      failures.push(`${id}/${kind}: changed-key fan-out law`);
    }
    if (values.samples.some((value) => value.metrics.documentListeners !== 0)) {
      failures.push(`${id}/${kind}: an action changed document listener count`);
    }
  }
  process.stdout.write(
    `${id}: mount cold/warm p95 ${row.target.cold.p95.toFixed(1)}/${row.target.warm.p95.toFixed(1)} ms; local frame/sync ${row.operations.local.actionToFrameMs.p95.toFixed(1)}/${row.operations.local.syncMs.p95.toFixed(1)} ms\n`
  );
};

try {
  const inputs = quick
    ? [
        { fixture: 'code', lineCount: 100_000 },
        { fixture: 'code', lineCount: 1, blockCount: 1000 },
      ]
    : [
        ...['plain', 'marked', 'code'].flatMap((fixture) =>
          [200, 2000, 10_000, 100_000].map((lineCount) => ({
            fixture,
            lineCount,
          }))
        ),
        ...[1, 100, 1000].flatMap((blockCount) =>
          [1, 2, 4].map((viewCount) => ({
            fixture: 'code',
            lineCount: 1,
            blockCount,
            viewCount,
          }))
        ),
        ...[2, 4].map((viewCount) => ({
          fixture: 'code',
          lineCount: 100_000,
          viewCount,
        })),
        {
          fixture: 'code',
          lineCount: 100_000,
          viewCount: 4,
          independent: true,
        },
        ...[10, 100, 1000].map((spans) => ({
          fixture: 'code',
          lineCount: 100_000,
          spans,
        })),
        ...[
          { decorationCount: 1000 },
          { decorationCount: 40_000 },
          { decorationCount: 30_000, decorationShape: 'overlapping' },
        ].map((input) => ({ fixture: 'code', lineCount: 100_000, ...input })),
      ];
  for (const input of inputs) {
    if (only && !new RegExp(only).test(JSON.stringify(input))) continue;
    await executeCell(input);
  }
  if (cells.length === 0) failures.push('No matching benchmark cohorts');
  for (const views of [1, 2, 4]) {
    const matching = cells.filter(
      ({ input }) => input.lineCount === 1 && (input.viewCount ?? 1) === views
    );
    const reference = matching.find(
      ({ input }) => (input.blockCount ?? 1) === 1
    );
    if (!reference) continue;
    for (const cell of matching) {
      if (
        cell.target.last.metrics.documentListeners !==
        reference.target.last.metrics.documentListeners
      ) {
        failures.push(
          `${cell.id}: document listeners grow with external block count`
        );
      }
    }
  }
} catch (error) {
  failures.push(String(error.stack ?? error));
} finally {
  await browser.close();
}
const after = await fingerprint();
const sourceChanged = JSON.stringify(before) !== JSON.stringify(after);
const harnessChanged = [
  runner,
  resolve(dirname(runner), 'external-text-measurement.mjs'),
  'pnpm-lock.yaml',
].some((path) => before[path] !== after[path]);
if (harnessChanged) {
  failures.push(
    'Runner or dependency inputs changed during measurement; receipt is invalid'
  );
}
let rebuiltBundleSha256 = null;
let verifiedSource = after;
if (sourceChanged && !harnessChanged) {
  try {
    rebuiltBundleSha256 = sha256(await buildBundle('source-recheck'));
    verifiedSource = await fingerprint();
    if (
      JSON.stringify(after) !== JSON.stringify(verifiedSource) ||
      rebuiltBundleSha256 !== sha256(targetBundle)
    ) {
      failures.push(
        'Effective build inputs changed during measurement; receipt is invalid'
      );
    }
  } catch (error) {
    failures.push(`Source recheck failed: ${error.message}`);
  }
}
const evaluation = evaluate({ failures, budgetFailures, noiseFailures });
const receipt = {
  artifactVersion: 2,
  createdAt: new Date().toISOString(),
  environment: {
    browserVersion,
    platform: process.platform,
    production: true,
    before: hostBefore,
    after: hostSample(),
  },
  boundaries: {
    adapter:
      'Bounded DOM test adapter. Independent mirror applies exact patches; its copying is measured separately. Not CodeMirror performance.',
    timing:
      'Shared-host elapsed timings are observations, not correctness or causal speed proof. Mount ends after two animation frames. Operations start at a frame and end at the next rendering opportunity; synchronous work is separate. Profiles never enter timing samples.',
    suite:
      quick || only || profile
        ? 'Diagnostic subset only; not a full checkpoint.'
        : 'Frozen substrate packet.',
  },
  config: {
    charsPerLine: 48,
    mountSamples: mountSampling.samples,
    noisePolicy,
    mountOrder:
      'AB/BA by round when a matched baseline applies; each pair uses fresh contexts',
    warmSampling:
      'one measured remount per fresh context after one unmeasured remount',
    operationSamples: 20,
    discardedWarmups: mountSampling.warmups,
    projectedTextUnits: 4096,
  },
  source: {
    baselineBundleSha256: baselineReceipt.bundleSha256,
    targetBundleSha256: sha256(targetBundle),
    before,
    after,
    sourceChanged,
    harnessChanged,
    rebuiltBundleSha256,
    verifiedSource,
  },
  cells,
  evaluation,
};
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(receipt, null, 2)}\n`);
process.stdout.write(
  `METRIC plite_external_text_pass=${Number(evaluation.pass)}\nRESULT ${evaluation.status}\nCORRECTNESS_AND_VALIDITY ${evaluation.correctnessAndValidityPass ? 'PASS' : 'FAIL'}\nBUDGETS ${evaluation.budgetPass ? 'PASS' : 'FAIL'}\nNOISE ${evaluation.noisePass ? 'PASS' : 'FAIL'}\nARTIFACT ${output}\n`
);
const diagnostics = [...failures, ...budgetFailures, ...noiseFailures];
if (diagnostics.length) process.stderr.write(`${diagnostics.join('\n')}\n`);
process.exitCode = evaluation.exitCode;
