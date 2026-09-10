import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cpus, platform, release } from 'node:os';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

import {
  hasExactCodeHighlight,
  hasInsertedCodeHighlight,
} from './code-block-highlight-oracle.mjs';

const runnerPath = fileURLToPath(import.meta.url);
const repo = resolve(dirname(runnerPath), '../../..');
const readinessOnly =
  process.env.PLATE_CODE_BLOCK_BENCHMARK_READINESS_ONLY === '1';
const artifactPath = resolve(
  repo,
  process.env.PLATE_CODE_BLOCK_BENCHMARK_ARTIFACT ??
    (readinessOnly
      ? 'benchmarks/editor/benchmarks/results/plate-code-block-readiness.json'
      : 'benchmarks/editor/benchmarks/results/plate-code-block-latest.json')
);
const baseURL =
  process.env.PLATE_CODE_BLOCK_BENCHMARK_URL ?? 'http://localhost:3100';
const warmups = Number(process.env.PLATE_CODE_BLOCK_BENCHMARK_WARMUPS ?? 3);
const iterations = Number(
  process.env.PLATE_CODE_BLOCK_BENCHMARK_ITERATIONS ?? 15
);
const headless = process.env.PLATE_CODE_BLOCK_BENCHMARK_HEADLESS !== '0';
const strict = process.env.PLATE_CODE_BLOCK_BENCHMARK_STRICT !== '0';
const blockIndex = 2;
const lineCount = 10_000;
const insertedText = '\nconst __plateBenchmark = 1;';
const expectedInitialText = Array.from(
  { length: lineCount },
  (_value, index) =>
    `const result${String(index + 1).padStart(5, '0')} = transform(source[${index}]);`
).join('\n');
const expectedInitialHash = createHash('sha256')
  .update(expectedInitialText)
  .digest('hex');
const budgets = {
  highlightSettleMs: 600,
  inputToPaintMs: 200,
  navigationToQueryableMs: 5000,
};
const materialFloors = {
  highlightSettleMs: 20,
  inputToPaintMs: 4,
  navigationToQueryableMs: 50,
};
const strategies = process.env.PLATE_CODE_BLOCK_BENCHMARK_VARIANTS
  ? JSON.parse(process.env.PLATE_CODE_BLOCK_BENCHMARK_VARIANTS)
  : {
      codemirror: {
        mode: 'codemirror',
        route: '/blocks/code-block-codemirror-demo',
      },
      native: {
        mode: 'native',
        route: '/blocks/code-block-huge-demo',
      },
    };
const strategyNames = Object.keys(strategies);
for (const strategy of Object.values(strategies)) {
  if (
    !['native', 'codemirror'].includes(strategy.mode) ||
    !strategy.route?.startsWith('/')
  ) {
    throw new Error(
      'Each benchmark variant needs a native/codemirror mode and local route'
    );
  }
}
const baselineName = strategyNames.includes('native')
  ? 'native'
  : strategyNames[0];
const candidateName = strategyNames.includes('codemirror')
  ? 'codemirror'
  : strategyNames[1];
if (strategyNames.length !== 2) {
  throw new Error('The paired benchmark requires exactly two variants');
}
const sourceRelativePaths = [
  ...new Set([
    ...execFileSync('rg', ['--files', 'packages', 'apps/www/src', 'config'], {
      cwd: repo,
      encoding: 'utf-8',
    })
      .trim()
      .split('\n')
      .filter((path) => path.includes('/src/') || path.startsWith('config/')),

    'benchmarks/editor/benchmarks/code-block-highlight-oracle.mjs',
    'apps/www/next.config.ts',
    'apps/www/package.json',
    'apps/www/public/r/code-block-codemirror.json',
    'apps/www/public/r/code-block-docs.json',
    'apps/www/public/r/code-block.json',
    'apps/www/public/r/registry.json',
    'apps/www/src/registry/components/editor/code-block-codemirror.tsx',
    'apps/www/src/registry/components/editor/code-block.tsx',
    'apps/www/src/registry/examples/code-block-codemirror-demo.tsx',
    'apps/www/src/registry/examples/code-block-demo.tsx',
    'apps/www/src/registry/examples/code-block-huge-demo.tsx',
    'apps/www/src/registry/examples/values/code-block-value.tsx',
    'apps/www/src/registry/examples/values/demo-values.tsx',
    'apps/www/src/registry/examples/values/huge-code-block-value.tsx',
    'apps/www/src/registry/registry-examples.ts',
    'apps/www/src/registry/registry-features.ts',
    'apps/www/tests/browser/code-block-codemirror.spec.ts',
    'apps/www/tests/browser/code-block-selection.spec.ts',
    'apps/www/tests/browser/code-block-syntax.spec.ts',
    'apps/www/tests/browser/code-block-views.spec.ts',
    'apps/www/tests/browser/code-block-demos.spec.ts',
    'pnpm-lock.yaml',
    'packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts',
    'packages/plitejs/src/react/components/editable-external-text.tsx',
    'packages/plitejs/src/react/editable/external-text-runtime.ts',
  ]),
];
const sourcePaths = sourceRelativePaths.map((path) => resolve(repo, path));
const metricNames = Object.keys(budgets);

const round = (value) =>
  value === null || value === undefined ? null : Math.round(value * 100) / 100;

const percentile = (values, ratio) => {
  const sorted = [...values].sort((left, right) => left - right);

  return sorted[
    Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)
  ];
};

const summarize = (values) => {
  if (values.length === 0) {
    return { max: null, p50: null, p75: null, p95: null, samples: [] };
  }

  return {
    max: round(Math.max(...values)),
    p50: round(percentile(values, 0.5)),
    p75: round(percentile(values, 0.75)),
    p95: round(percentile(values, 0.95)),
    samples: values.map(round),
  };
};

const hashFile = async (path) => {
  try {
    return createHash('sha256')
      .update(await readFile(path))
      .digest('hex');
  } catch (error) {
    if (error.code === 'ENOENT') return 'missing';
    throw error;
  }
};

const hashSourceInputs = async () => {
  const files = Object.fromEntries(
    await Promise.all(
      sourcePaths.map(async (path, index) => [
        sourceRelativePaths[index],
        await hashFile(path),
      ])
    )
  );
  const aggregate = createHash('sha256');

  for (const [path, hash] of Object.entries(files).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    aggregate.update(path).update('\0').update(hash).update('\0');
  }
  aggregate.update('runner\0').update(await hashFile(runnerPath));

  return {
    aggregateSha256: aggregate.digest('hex'),
    files,
    runnerSha256: await hashFile(runnerPath),
  };
};

const waitForPaint = () =>
  new Promise((resolvePaint) => {
    requestAnimationFrame(() => requestAnimationFrame(resolvePaint));
  });

const runSample = async ({ browser, phase, roundIndex, strategyName }) => {
  const strategy = strategies[strategyName];
  const renderMode = strategy.mode;
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    viewport: { height: 720, width: 1280 },
  });
  const page = await context.newPage();
  await page.addInitScript({
    content: `globalThis.hasExactCodeHighlight = ${hasExactCodeHighlight.toString()}; globalThis.hasInsertedCodeHighlight = ${hasInsertedCodeHighlight.toString()}`,
  });
  const runtimeErrors = [];
  const networkErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('requestfailed', (request) => {
    networkErrors.push(
      `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`
    );
  });

  try {
    const navigationStartedAt = performance.now();
    const response = await page.goto(
      `${strategy.baseURL ?? baseURL}${strategy.route}`,
      {
        timeout: 30_000,
        waitUntil: 'commit',
      }
    );

    if (!response?.ok()) {
      throw new Error(
        `Route response ${response?.status() ?? 'missing'} for ${strategy.route}`
      );
    }

    await page.waitForFunction(
      ({
        blockIndex: targetBlockIndex,
        expectedLength,
        expectedLines,
        mode,
      }) => {
        const root = document.querySelector('.plite-editor');
        const handle = root?.__pliteBrowserHandle;
        const block = document.querySelector('.plite-codeBlock');
        const text = handle?.getBlockText(targetBlockIndex);

        if (
          !root ||
          !handle ||
          !block ||
          !text ||
          text.length !== expectedLength ||
          (text.match(/\n/g)?.length ?? 0) + 1 !== expectedLines
        ) {
          return false;
        }

        if (mode === 'codemirror') {
          const host = block.querySelector('[data-code-block-codemirror]');
          const input = host?.querySelector(
            '[data-code-block-codemirror-input]'
          );

          return Boolean(
            host &&
            input &&
            host.querySelector('.cm-line') &&
            host.querySelector('[class*="hljs-"]')
          );
        }

        const code = block.querySelector('pre code');

        return Boolean(
          code &&
          code.textContent === text &&
          block.querySelector('[data-plite-node="text"]') &&
          block.querySelector('[class*="hljs-"]') &&
          !block.querySelector('[data-code-block-codemirror]')
        );
      },
      {
        blockIndex,
        expectedLength: expectedInitialText.length,
        expectedLines: lineCount,
        mode: renderMode,
      },
      { timeout: 30_000 }
    );
    await page.evaluate(waitForPaint);

    const navigationToQueryableMs = performance.now() - navigationStartedAt;
    const before = await page.evaluate(
      async ({ blockIndex: targetBlockIndex, mode }) => {
        const root = document.querySelector('.plite-editor');
        const handle = root.__pliteBrowserHandle;
        const block = document.querySelector('.plite-codeBlock');
        const code = block.querySelector('pre code');
        const host = block.querySelector('[data-code-block-codemirror]');
        const measuredRoot = mode === 'codemirror' ? host : block;
        const domText =
          mode === 'codemirror'
            ? (host.querySelector('.cm-content')?.textContent ?? '')
            : (code?.textContent ?? '');
        const text = handle.getBlockText(targetBlockIndex);
        const digest = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(text)
        );
        const modelHash = [...new Uint8Array(digest)]
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');
        const selection = {
          anchor: { offset: text.length, path: [targetBlockIndex, 0] },
          focus: { offset: text.length, path: [targetBlockIndex, 0] },
        };

        handle.selectRange(selection);

        return {
          domElements: measuredRoot.querySelectorAll('*').length,
          domTextLength: domText.length,
          externalMetrics: handle.getExternalTextMetrics(),
          heapMB: performance.memory?.usedJSHeapSize
            ? performance.memory.usedJSHeapSize / 1024 / 1024
            : null,
          highlightedElements:
            measuredRoot.querySelectorAll('[class*="hljs-"]').length,
          modelHash,
          modelLineCount: (text.match(/\n/g)?.length ?? 0) + 1,
          modelTextLength: text.length,
          nativeTextHosts: block.querySelectorAll('[data-plite-node="text"]')
            .length,
          renderedLines:
            mode === 'codemirror'
              ? host.querySelectorAll('.cm-line').length
              : (domText.match(/\n/g)?.length ?? 0) + 1,
          totalDocumentElements: document.querySelectorAll('*').length,
        };
      },
      { blockIndex, mode: renderMode }
    );

    const input =
      renderMode === 'codemirror'
        ? page.locator('[data-code-block-codemirror-input]').first()
        : page.locator('.plite-editor').first();

    await input.focus();
    await page.waitForFunction(
      ({ blockIndex: targetBlockIndex, expectedOffset, mode }) => {
        const root = document.querySelector('.plite-editor');
        const handle = root?.__pliteBrowserHandle;
        const selection = handle?.getSelection();
        const active = document.activeElement;
        const focusReady =
          mode === 'codemirror'
            ? active?.matches('[data-code-block-codemirror-input]')
            : active === root;

        return Boolean(
          focusReady &&
          selection?.anchor?.path?.[0] === targetBlockIndex &&
          selection.anchor.offset === expectedOffset &&
          selection?.focus?.path?.[0] === targetBlockIndex &&
          selection.focus.offset === expectedOffset
        );
      },
      {
        blockIndex,
        expectedOffset: before.modelTextLength,
        mode: renderMode,
      }
    );
    await page.evaluate((mode) => {
      const target =
        mode === 'codemirror'
          ? document.querySelector('[data-code-block-codemirror-input]')
          : document.querySelector('.plite-editor');

      globalThis.__plateCodeBlockBenchmarkInputStartedAt = null;
      target.addEventListener(
        'beforeinput',
        () => {
          globalThis.__plateCodeBlockBenchmarkInputStartedAt =
            performance.now();
        },
        { once: true }
      );
    }, renderMode);

    await page.keyboard.insertText(insertedText);

    const timing = await page.evaluate(
      async ({ blockIndex: targetBlockIndex, expectedSuffix, mode }) => {
        const root = document.querySelector('.plite-editor');
        const handle = root.__pliteBrowserHandle;
        const block = document.querySelector('.plite-codeBlock');
        const startedAt =
          globalThis.__plateCodeBlockBenchmarkInputStartedAt ??
          performance.now();
        let inputPaintedAt = null;

        for (let frame = 0; frame < 600; frame += 1) {
          const text = handle.getBlockText(targetBlockIndex);
          const exactModel = text?.endsWith(expectedSuffix);

          if (exactModel && inputPaintedAt === null) {
            await new Promise((resolvePaint) => {
              requestAnimationFrame(() => requestAnimationFrame(resolvePaint));
            });
            inputPaintedAt = performance.now();
          }

          const renderedRoot =
            mode === 'codemirror'
              ? block.querySelector('[data-code-block-codemirror]')
              : block.querySelector('pre code');
          const insertedTokenHighlighted = globalThis.hasInsertedCodeHighlight({
            canonicalText: text,
            expectedSuffix,
            mode,
            root: renderedRoot,
          });
          if (inputPaintedAt !== null && insertedTokenHighlighted) {
            await new Promise((resolvePaint) => {
              requestAnimationFrame(() => requestAnimationFrame(resolvePaint));
            });

            return {
              highlightSettleMs: performance.now() - startedAt,
              inputToPaintMs: inputPaintedAt - startedAt,
            };
          }

          await new Promise(requestAnimationFrame);
        }

        throw new Error(
          `Timed out waiting for model and highlighted DOM: ${JSON.stringify({
            highlightedElements:
              block.querySelectorAll('[class*="hljs-"]').length,
            inputPaintedAt,
            lastKeyword:
              block
                .querySelectorAll('.hljs-keyword')
                .item(block.querySelectorAll('.hljs-keyword').length - 1)
                ?.textContent ?? null,
            mode,
            renderedTail:
              (mode === 'codemirror'
                ? block.querySelector('.cm-content')?.textContent
                : block.querySelector('pre code')?.textContent
              )?.slice(-80) ?? null,
            textLength: handle.getBlockText(targetBlockIndex)?.length,
          })}`
        );
      },
      { blockIndex, expectedSuffix: insertedText, mode: renderMode }
    );

    const after = await page.evaluate(
      ({ blockIndex: targetBlockIndex, expectedSuffix, mode }) => {
        const root = document.querySelector('.plite-editor');
        const handle = root.__pliteBrowserHandle;
        const block = document.querySelector('.plite-codeBlock');
        const code = block.querySelector('pre code');
        const host = block.querySelector('[data-code-block-codemirror]');
        const measuredRoot = mode === 'codemirror' ? host : block;
        const domText =
          mode === 'codemirror'
            ? (host.querySelector('.cm-content')?.textContent ?? '')
            : (code?.textContent ?? '');
        const text = handle.getBlockText(targetBlockIndex);

        return {
          domElements: measuredRoot.querySelectorAll('*').length,
          domTextLength: domText.length,
          externalMetrics: handle.getExternalTextMetrics(),
          heapMB: performance.memory?.usedJSHeapSize
            ? performance.memory.usedJSHeapSize / 1024 / 1024
            : null,
          highlightedElements:
            measuredRoot.querySelectorAll('[class*="hljs-"]').length,
          modelEndsWithProbe: text.endsWith(expectedSuffix),
          modelLineCount: (text.match(/\n/g)?.length ?? 0) + 1,
          modelTextLength: text.length,
          nativeTextHosts: block.querySelectorAll('[data-plite-node="text"]')
            .length,
          renderedLines:
            mode === 'codemirror'
              ? host.querySelectorAll('.cm-line').length
              : (domText.match(/\n/g)?.length ?? 0) + 1,
          totalDocumentElements: document.querySelectorAll('*').length,
        };
      },
      { blockIndex, expectedSuffix: insertedText, mode: renderMode }
    );

    const contractFailures = [];

    if (before.modelHash !== expectedInitialHash) {
      contractFailures.push(
        'initial model hash differs from the shared fixture'
      );
    }
    if (
      before.modelLineCount !== lineCount ||
      after.modelLineCount !== lineCount + 1 ||
      !after.modelEndsWithProbe
    ) {
      contractFailures.push('model line count or typed suffix is not exact');
    }
    if (renderMode === 'codemirror') {
      if (
        before.domElements >= 500 ||
        after.domElements >= 500 ||
        before.renderedLines >= 100 ||
        after.renderedLines >= 100 ||
        before.domTextLength >= 64_000 ||
        after.domTextLength >= 64_000 ||
        before.nativeTextHosts !== 0 ||
        after.nativeTextHosts !== 0
      ) {
        contractFailures.push('CodeMirror did not keep its DOM bounded');
      }
    } else if (
      before.domTextLength !== before.modelTextLength ||
      after.domTextLength !== after.modelTextLength ||
      before.renderedLines !== lineCount ||
      after.renderedLines !== lineCount + 1 ||
      before.nativeTextHosts < 1 ||
      after.nativeTextHosts < 1
    ) {
      contractFailures.push(
        'native Plate did not keep the full model DOM-present'
      );
    }
    if (before.highlightedElements === 0 || after.highlightedElements === 0) {
      contractFailures.push('syntax highlighting is absent');
    }
    if (runtimeErrors.length > 0) {
      contractFailures.push(`runtime errors: ${runtimeErrors.join(' | ')}`);
    }
    if (networkErrors.length > 0) {
      contractFailures.push(`network errors: ${networkErrors.join(' | ')}`);
    }
    if (contractFailures.length > 0) {
      throw new Error(contractFailures.join('; '));
    }

    return {
      after,
      before,
      earlyOracleWouldPassMs: timing.earlyOracleWouldPassMs,
      insertedTokenHighlightedAtEarlyPass:
        timing.insertedTokenHighlightedAtEarlyPass,
      highlightSettleMs: timing.highlightSettleMs,
      inputToPaintMs: timing.inputToPaintMs,
      navigationToQueryableMs,
      phase,
      round: roundIndex,
      strategy: strategyName,
    };
  } finally {
    await context.close();
  }
};

const sourceIdentitiesBefore = await hashSourceInputs();
const browser = await chromium.launch({
  args: ['--enable-precise-memory-info'],
  headless,
});
const browserVersion = browser.version();

let receipt;
if (readinessOnly) {
  const results = [];
  const failures = [];

  try {
    for (const strategyName of strategyNames) {
      try {
        results.push(
          await runSample({
            browser,
            phase: 'readiness',
            roundIndex: 0,
            strategyName,
          })
        );
      } catch (error) {
        failures.push({
          error:
            error instanceof Error
              ? (error.stack ?? error.message)
              : String(error),
          strategy: strategyName,
        });
      }
    }
  } finally {
    await browser.close();
  }

  const sourceIdentitiesAfter = await hashSourceInputs();
  const sourceStable =
    sourceIdentitiesBefore.aggregateSha256 ===
    sourceIdentitiesAfter.aggregateSha256;
  receipt = {
    artifactVersion: 1,
    config: {
      baseURL,
      blockIndex,
      expectedInitialHash,
      headless,
      hostMode:
        process.env.PLATE_CODE_BLOCK_BENCHMARK_HOST_MODE ?? 'unspecified',
      hostStartedAt:
        process.env.PLATE_CODE_BLOCK_BENCHMARK_HOST_STARTED_AT ?? 'unspecified',
      lineCount,
      strategies,
      viewport: { deviceScaleFactor: 1, height: 720, width: 1280 },
    },
    evaluation: {
      failures,
      pass: failures.length === 0 && sourceStable,
      sourceStable,
    },
    identity: {
      browser: browserVersion,
      commit: execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: repo,
        encoding: 'utf-8',
      }).trim(),
      machine: {
        cpu: cpus()[0]?.model ?? 'unknown',
        cpuCount: cpus().length,
        os: `${platform()} ${release()}`,
      },
      sourceIdentitiesAfter,
      sourceIdentitiesBefore,
    },
    kind: 'code-block-comparison-readiness',
    results,
  };

  process.stdout.write(`ARTIFACT ${artifactPath}\n`);
  process.stdout.write(
    `READINESS ${receipt.evaluation.pass ? 'PASS' : 'FAIL'}\n`
  );
} else {
  const measuredSamples = Object.fromEntries(
    strategyNames.map((name) => [name, []])
  );
  const warmupSamples = Object.fromEntries(
    strategyNames.map((name) => [name, []])
  );
  const failures = [];
  const disabledStrategies = new Set();

  try {
    for (
      let roundIndex = 0;
      roundIndex < warmups + iterations;
      roundIndex += 1
    ) {
      const phase = roundIndex < warmups ? 'warmup' : 'measured';
      const order =
        roundIndex % 2 === 0 ? strategyNames : [...strategyNames].reverse();

      for (const strategyName of order) {
        if (disabledStrategies.has(strategyName)) continue;

        try {
          const sample = await runSample({
            browser,
            phase,
            roundIndex,
            strategyName,
          });

          if (phase === 'warmup') {
            warmupSamples[strategyName].push(sample);
          } else {
            measuredSamples[strategyName].push(sample);
          }
        } catch (error) {
          failures.push({
            error:
              error instanceof Error
                ? (error.stack ?? error.message)
                : String(error),
            phase,
            round: roundIndex,
            strategy: strategyName,
          });

          if (
            failures.filter((failure) => failure.strategy === strategyName)
              .length >= 3
          ) {
            disabledStrategies.add(strategyName);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }

  const sourceIdentitiesAfter = await hashSourceInputs();
  const sourceStable =
    sourceIdentitiesBefore.aggregateSha256 ===
    sourceIdentitiesAfter.aggregateSha256;
  const measurements = Object.fromEntries(
    Object.keys(strategies).map((strategyName) => [
      strategyName,
      Object.fromEntries(
        metricNames.map((metricName) => [
          metricName,
          summarize(
            measuredSamples[strategyName].map((sample) => sample[metricName])
          ),
        ])
      ),
    ])
  );
  const structural = Object.fromEntries(
    Object.keys(strategies).map((strategyName) => [
      strategyName,
      Object.fromEntries(
        [
          'domElements',
          'domTextLength',
          'heapMB',
          'highlightedElements',
          'nativeTextHosts',
          'renderedLines',
          'totalDocumentElements',
        ].map((field) => [
          field,
          summarize(
            measuredSamples[strategyName]
              .map((sample) => sample.before[field])
              .filter((value) => typeof value === 'number')
          ),
        ])
      ),
    ])
  );
  const comparisons = Object.fromEntries(
    metricNames.map((metricName) => {
      const baselineP95 = measurements[baselineName][metricName].p95;
      const candidateP95 = measurements[candidateName][metricName].p95;
      const deltaMs =
        baselineP95 === null || candidateP95 === null
          ? null
          : candidateP95 - baselineP95;
      const deltaPercent =
        deltaMs === null || baselineP95 === 0
          ? null
          : (deltaMs / baselineP95) * 100;

      return [
        metricName,
        {
          baseline: baselineName,
          baselineP95,
          candidate: candidateName,
          candidateP95,
          deltaMs: round(deltaMs),
          deltaPercent: round(deltaPercent),
          material:
            deltaMs !== null &&
            deltaPercent !== null &&
            Math.abs(deltaMs) > materialFloors[metricName] &&
            Math.abs(deltaPercent) > 10,
          winner:
            deltaMs === null
              ? 'censored'
              : deltaMs < 0
                ? candidateName
                : baselineName,
        },
      ];
    })
  );
  const budgetFailures = Object.entries(measurements).flatMap(
    ([strategyName, strategyMeasurements]) =>
      Object.entries(budgets).flatMap(([metricName, budget]) => {
        const value = strategyMeasurements[metricName].p95;

        return value !== null && value > budget
          ? [`${strategyName}.${metricName} p95 ${value} > ${budget}`]
          : [];
      })
  );
  const validityFailures = [
    ...(iterations < 15
      ? [`iterations ${iterations} is below the required 15 samples`]
      : []),
    ...Object.keys(strategies).flatMap((strategyName) =>
      measuredSamples[strategyName].length === iterations
        ? []
        : [
            `${strategyName} retained ${measuredSamples[strategyName].length}/${iterations} measured samples`,
          ]
    ),
    ...(failures.length > 0
      ? [`${failures.length} retry-free browser attempts failed`]
      : []),
    ...(!sourceStable ? ['source inputs changed during measurement'] : []),
  ];
  receipt = {
    artifactVersion: 1,
    budgets,
    comparisons,
    config: {
      baseURL,
      blockIndex,
      expectedInitialHash,
      headless,
      hostMode:
        process.env.PLATE_CODE_BLOCK_BENCHMARK_HOST_MODE ?? 'unspecified',
      hostStartedAt:
        process.env.PLATE_CODE_BLOCK_BENCHMARK_HOST_STARTED_AT ?? 'unspecified',
      insertedText,
      interleave: 'AB/BA by round',
      iterations,
      lineCount,
      materialFloors,
      strategies,
      viewport: { deviceScaleFactor: 1, height: 720, width: 1280 },
      warmups,
    },
    evaluation: {
      budgetFailures,
      budgetPass: budgetFailures.length === 0,
      censoredStrategies: [...disabledStrategies],
      pass: validityFailures.length === 0,
      sourceStable,
      validityFailures,
    },
    failures,
    identity: {
      browser: browserVersion,
      commit: execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: repo,
        encoding: 'utf-8',
      }).trim(),
      machine: {
        cpu: cpus()[0]?.model ?? 'unknown',
        cpuCount: cpus().length,
        os: `${platform()} ${release()}`,
      },
      sourceIdentitiesAfter,
      sourceIdentitiesBefore,
    },
    kind: 'code-block-native-vs-codemirror-product-benchmark',
    measurements,
    samples: measuredSamples,
    structural,
    warmups: warmupSamples,
  };

  for (const strategyName of Object.keys(strategies)) {
    for (const metricName of metricNames) {
      process.stdout.write(
        `METRIC code_block_${strategyName}_${metricName}_p95=${measurements[strategyName][metricName].p95}\n`
      );
    }
  }
  process.stdout.write(`ARTIFACT ${artifactPath}\n`);
  process.stdout.write(
    `VALIDITY ${receipt.evaluation.pass ? 'PASS' : 'FAIL'}\n`
  );
  process.stdout.write(
    `BUDGETS ${receipt.evaluation.budgetPass ? 'PASS' : 'FAIL'}\n`
  );
}

await mkdir(dirname(artifactPath), { recursive: true });
await writeFile(artifactPath, `${JSON.stringify(receipt, null, 2)}\n`);
if (
  strict &&
  (!receipt.evaluation.pass || receipt.evaluation.budgetPass === false)
) {
  process.exitCode = 1;
}
