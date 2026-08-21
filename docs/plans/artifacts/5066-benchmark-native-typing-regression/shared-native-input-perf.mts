import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const requireFromCwd = createRequire(path.join(process.cwd(), 'package.json'));
const puppeteer = requireFromCwd('puppeteer') as typeof import('puppeteer');

type TimingRow = {
  beforeinput?: number;
  domSync?: string | null;
  domSyncReason?: string | null;
  input?: number;
  inputTrusted?: boolean;
  key: string;
  keydown: number;
  mutation?: number;
  projectedDomSync?: string | null;
  raf1?: number;
  raf2?: number;
  textBefore: string;
};

type ProbeWindow = Window & {
  __sharedNativeInputProbe?: {
    longTasks: Array<{ duration: number; startTime: number }>;
    measurementEnd: number | null;
    measurementStart: number | null;
    rows: TimingRow[];
  };
};

const getArg = (name: string) => {
  const index = process.argv.indexOf(`--${name}`);

  return index === -1 ? undefined : process.argv[index + 1];
};

const hasArg = (name: string) => process.argv.includes(`--${name}`);

const percentile = (samples: number[], value: number) => {
  const sorted = [...samples].sort((left, right) => left - right);
  const index = Math.ceil((value / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)] ?? 0;
};

const summarize = (samples: number[]) => ({
  max: Math.max(...samples),
  mean: samples.reduce((total, sample) => total + sample, 0) / samples.length,
  p50: percentile(samples, 50),
  p75: percentile(samples, 75),
  p95: percentile(samples, 95),
  ...(samples.length >= 100 ? { p99: percentile(samples, 99) } : {}),
  samples,
});

const label = getArg('label') ?? 'unknown';
const out = getArg('out');
const url = getArg('url');
const failRuntimeErrors = hasArg('fail-runtime-errors');
const quiet = hasArg('quiet');
const requirePliteProof = hasArg('require-plite-proof');
const settleMs = Number(getArg('settle-ms') ?? 2500);
const warmupSamples = Number(getArg('warmups') ?? 5);
const measuredSamples = Number(getArg('samples') ?? 20);

if (!url) {
  throw new Error('Pass --url for the exact measured host.');
}

const browser = await puppeteer.launch({ headless: true });

try {
  const page = await browser.newPage();
  const runtimeErrors: Array<{
    message: string;
    type: 'console' | 'pageerror' | 'requestfailed';
    url?: string;
  }> = [];

  page.on('pageerror', (error) =>
    runtimeErrors.push({ message: error.message, type: 'pageerror' })
  );
  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeErrors.push({
        message: message.text(),
        type: 'console',
        url: message.location().url || undefined,
      });
    }
  });
  page.on('requestfailed', (request) => {
    runtimeErrors.push({
      message: request.failure()?.errorText ?? 'request failed',
      type: 'requestfailed',
      url: request.url(),
    });
  });

  await page.goto(url, { timeout: 120_000, waitUntil: 'domcontentloaded' });
  const rootSelector = '[contenteditable="true"][role="textbox"]';

  await page.waitForSelector(rootSelector, { timeout: 120_000 });
  await new Promise((resolve) => setTimeout(resolve, settleMs));

  const target = await page.evaluate((selector) => {
    const root = document.querySelector(selector);
    const heading = root?.querySelector('h1');
    const fallback = root?.querySelector(
      '[data-plite-path], [data-slate-node="element"]'
    );
    const element = heading ?? fallback;

    if (!(element instanceof HTMLElement)) return null;

    return {
      initialText: element.textContent ?? '',
      plitePath: element.getAttribute('data-plite-path'),
      slateNode: element.getAttribute('data-slate-node'),
      tag: element.tagName,
    };
  }, rootSelector);

  if (!target) {
    throw new Error('No comparable text target exists inside the editor.');
  }

  const targetSelector = `${rootSelector} h1`;

  await page.evaluate(
    ({ rootSelector, targetSelector }) => {
      const root = document.querySelector(rootSelector);
      const target = document.querySelector(targetSelector);

      if (!(root instanceof HTMLElement) || !(target instanceof HTMLElement)) {
        throw new Error('The editor target disappeared before setup.');
      }

      const lastTextNode = (() => {
        const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
        let current: Node | null = null;
        let last: Node | null = null;

        while ((current = walker.nextNode())) last = current;

        return last;
      })();

      if (!(lastTextNode instanceof Text)) {
        throw new Error('The editor target has no text node for caret setup.');
      }

      root.focus();
      const range = document.createRange();
      const selection = window.getSelection();

      range.setStart(lastTextNode, lastTextNode.data.length);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));

      const probeWindow = window as ProbeWindow;

      probeWindow.__sharedNativeInputProbe = {
        longTasks: [],
        measurementEnd: null,
        measurementStart: null,
        rows: [],
      };

      document.addEventListener(
        'keydown',
        (event) => {
          if (event.key.length !== 1 || !root.contains(event.target as Node)) {
            return;
          }

          const liveTarget = document.querySelector(targetSelector);
          const textHost = liveTarget?.querySelector('[data-plite-node="text"]');

          const row: TimingRow = {
            domSync: textHost?.getAttribute('data-plite-dom-sync') ?? null,
            domSyncReason:
              textHost?.getAttribute('data-plite-dom-sync-reason') ?? null,
            key: event.key,
            keydown: performance.now(),
            projectedDomSync:
              textHost?.getAttribute('data-plite-projected-dom-sync') ?? null,
            textBefore: liveTarget?.textContent ?? '',
          };

          probeWindow.__sharedNativeInputProbe!.rows.push(row);
          requestAnimationFrame((time) => {
            row.raf1 = time;
            requestAnimationFrame((nextTime) => {
              row.raf2 = nextTime;
            });
          });
        },
        true
      );
      document.addEventListener(
        'beforeinput',
        () => {
          const row = probeWindow.__sharedNativeInputProbe!.rows.at(-1);

          if (row && row.beforeinput === undefined) {
            row.beforeinput = performance.now();
          }
        },
        true
      );
      document.addEventListener(
        'input',
        (event) => {
          const row = probeWindow.__sharedNativeInputProbe!.rows.at(-1);

          if (row && row.input === undefined) {
            row.input = performance.now();
            row.inputTrusted = event.isTrusted;
          }
        },
        true
      );
      new MutationObserver(() => {
        const row = probeWindow.__sharedNativeInputProbe!.rows.at(-1);
        const liveTarget = document.querySelector(targetSelector);

        if (
          row &&
          row.mutation === undefined &&
          liveTarget?.textContent === `${row.textBefore}${row.key}`
        ) {
          row.mutation = performance.now();
        }
      }).observe(root, {
        characterData: true,
        childList: true,
        subtree: true,
      });

      if ('PerformanceObserver' in window) {
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            probeWindow.__sharedNativeInputProbe!.longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
            });
          });
        }).observe({ entryTypes: ['longtask'] });
      }
    },
    { rootSelector, targetSelector }
  );

  await new Promise((resolve) => setTimeout(resolve, 50));

  let measuredInput = '';
  let measuredStartCommit: number | null = null;
  let measuredStartText = '';

  for (
    let sampleIndex = 0;
    sampleIndex < warmupSamples + measuredSamples;
    sampleIndex++
  ) {
    if (sampleIndex === warmupSamples) {
      measuredStartText = await page.$eval(
        targetSelector,
        (element) => element.textContent ?? ''
      );
      measuredStartCommit = await page.$eval(
        rootSelector,
        (element: Element & {
          __pliteBrowserHandle?: {
            getLastCommit?: () => { version?: number } | null;
          };
        }) => element.__pliteBrowserHandle?.getLastCommit?.()?.version ?? null
      );
      await page.evaluate(() => {
        const probe = (window as ProbeWindow).__sharedNativeInputProbe!;

        probe.longTasks = [];
        probe.measurementEnd = null;
        probe.measurementStart = performance.now();
      });
    }

    const key = String.fromCharCode(97 + (sampleIndex % 26));

    if (sampleIndex >= warmupSamples) measuredInput += key;

    await page.keyboard.type(key);
    try {
      await page.waitForFunction(
        ({ expectedRows, targetSelector }) => {
          const probe = (window as ProbeWindow).__sharedNativeInputProbe;
          const row = probe?.rows[expectedRows - 1];
          const target = document.querySelector(targetSelector);

          return (
            probe?.rows.length === expectedRows &&
            Number.isFinite(row?.mutation) &&
            Number.isFinite(row?.raf2) &&
            target?.textContent === `${row?.textBefore}${row?.key}`
          );
        },
        { timeout: 5000 },
        { expectedRows: sampleIndex + 1, targetSelector }
      );
    } catch (error) {
      const diagnostics = await page.evaluate(
        ({ rootSelector, targetSelector }) => {
          const probe = (window as ProbeWindow).__sharedNativeInputProbe;
          const root = document.querySelector(rootSelector);
          const target = document.querySelector(targetSelector);
          const selection = window.getSelection();

          return {
            activeInsideRoot: root?.contains(document.activeElement) ?? false,
            rows: probe?.rows,
            selection: {
              anchorInsideTarget: target?.contains(
                selection?.anchorNode ?? null
              ),
              anchorOffset: selection?.anchorOffset,
              collapsed: selection?.isCollapsed,
            },
            targetText: target?.textContent,
          };
        },
        { rootSelector, targetSelector }
      );

      console.error(JSON.stringify({ diagnostics }, null, 2));
      throw error;
    }
  }

  const probe = await page.evaluate(
    ({ rootSelector, targetSelector }) => {
      const probeWindow = window as ProbeWindow;
      const liveProbe = probeWindow.__sharedNativeInputProbe!;
      const root = document.querySelector(rootSelector) as
        | (HTMLElement & {
            __pliteBrowserHandle?: {
              getBlockText?: (index: number) => string | null;
              getLastCommit?: () => { version?: number } | null;
              getSelection?: () => unknown;
            };
          })
        | null;
      const target = document.querySelector(targetSelector);
      const selection = window.getSelection();

      liveProbe.measurementEnd = performance.now();

      return {
        ...liveProbe,
        domSelection: {
          anchorInsideTarget: target?.contains(selection?.anchorNode ?? null),
          collapsed: selection?.isCollapsed ?? false,
        },
        finalText: target?.textContent ?? null,
        finalCommit: root?.__pliteBrowserHandle?.getLastCommit?.()?.version ?? null,
        focusPreserved: root?.contains(document.activeElement) ?? false,
        hasPliteProofHandle: !!root?.__pliteBrowserHandle,
        modelSelection: root?.__pliteBrowserHandle?.getSelection?.() ?? null,
        modelText: root?.__pliteBrowserHandle?.getBlockText?.(0) ?? null,
      };
    },
    { rootSelector, targetSelector }
  );

  const measuredRows = probe.rows.slice(warmupSamples);
  const measuredLongTasks = probe.longTasks.filter(
    (entry) =>
      probe.measurementStart !== null &&
      probe.measurementEnd !== null &&
      entry.startTime >= probe.measurementStart &&
      entry.startTime < probe.measurementEnd
  );
  const expectedFinalText = measuredStartText + measuredInput;
  const commitDelta =
    measuredStartCommit === null || probe.finalCommit === null
      ? null
      : probe.finalCommit - measuredStartCommit;
  const missingTimings = measuredRows.flatMap((row, index) =>
    (['keydown', 'beforeinput', 'input', 'mutation', 'raf1', 'raf2'] as const)
      .filter((field) => !Number.isFinite(row[field]))
      .map((field) => `${index + 1}:${field}`)
  );
  const result = {
    beforeInput: summarize(
      measuredRows.map((row) => row.beforeinput! - row.keydown)
    ),
    comparisonContract: {
      action: 'trusted single-character keyboard input at the end of the first h1',
      selector: rootSelector,
      settleMs,
      target,
    },
    correctness: {
      domSelection: probe.domSelection,
      commitDelta,
      exactFinalText: probe.finalText === expectedFinalText,
      expectedFinalText,
      finalText: probe.finalText,
      focusPreserved: probe.focusPreserved,
      hasPliteProofHandle: probe.hasPliteProofHandle,
      measuredRows: measuredRows.length,
      missingTimings,
      modelSelection: probe.modelSelection,
      modelText: probe.modelText,
      nativeInputSamples: measuredRows.filter((row) => row.inputTrusted).length,
      runtimeErrors,
      synchronizedPliteRows: measuredRows.filter(
        (row) =>
          row.domSync === 'true' &&
          row.domSyncReason === null &&
          row.projectedDomSync === null
      ).length,
    },
    firstPaint: summarize(
      measuredRows.map((row) => row.raf1! - row.keydown)
    ),
    inputMutation: summarize(
      measuredRows.map((row) => row.mutation! - row.beforeinput!)
    ),
    label,
    longTasks: {
      count: measuredLongTasks.length,
      max: Math.max(0, ...measuredLongTasks.map((entry) => entry.duration)),
      samples: measuredLongTasks,
    },
    measuredInput,
    measuredSamples,
    mutation: summarize(
      measuredRows.map((row) => row.mutation! - row.keydown)
    ),
    secondPaint: summarize(
      measuredRows.map((row) => row.raf2! - row.keydown)
    ),
    url,
    warmupSamples,
  };
  const failures = [
    measuredRows.length !== measuredSamples
      ? `expected ${measuredSamples} measured rows, received ${measuredRows.length}`
      : null,
    missingTimings.length > 0
      ? `missing timings: ${missingTimings.join(', ')}`
      : null,
    !result.correctness.exactFinalText ? 'final DOM text differs' : null,
    !result.correctness.focusPreserved ? 'focus was not preserved' : null,
    !result.correctness.domSelection.collapsed
      ? 'DOM selection is not collapsed'
      : null,
    !result.correctness.domSelection.anchorInsideTarget
      ? 'DOM caret left the target'
      : null,
    result.correctness.nativeInputSamples !== measuredSamples
      ? `expected ${measuredSamples} trusted input events, received ${result.correctness.nativeInputSamples}`
      : null,
    requirePliteProof && !result.correctness.hasPliteProofHandle
      ? 'Plite model proof handle is missing'
      : null,
    requirePliteProof && result.correctness.commitDelta !== measuredSamples
      ? `expected ${measuredSamples} Plite commits, received ${String(result.correctness.commitDelta)}`
      : null,
    requirePliteProof && result.correctness.modelText !== result.correctness.finalText
      ? 'Plite model text differs from rendered text'
      : null,
    requirePliteProof &&
    result.correctness.synchronizedPliteRows !== measuredSamples
      ? `expected ${measuredSamples} synchronized Plite rows, received ${result.correctness.synchronizedPliteRows}`
      : null,
    failRuntimeErrors && runtimeErrors.length > 0
      ? `${runtimeErrors.length} runtime errors were recorded`
      : null,
  ].filter(Boolean);

  if (out) {
    const absoluteOut = path.resolve(out);

    await mkdir(path.dirname(absoluteOut), { recursive: true });
    await writeFile(absoluteOut, `${JSON.stringify(result, null, 2)}\n`);
  }

  console.log(
    JSON.stringify(
      quiet
        ? {
            correctness: result.correctness,
            label: result.label,
            longTasks: result.longTasks,
            mutation: result.mutation,
            secondPaint: result.secondPaint,
          }
        : result,
      null,
      2
    )
  );

  if (failures.length > 0) {
    throw new Error(`Shared native-input proof failed: ${failures.join('; ')}`);
  }
} finally {
  await browser.close();
}
