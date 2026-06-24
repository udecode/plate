import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';
import handler from 'serve-handler';

import {
  round,
  summarize,
  writeBenchmarkArtifact,
} from '../../shared/stats.mjs';

const currentRepo = process.cwd();
const legacyRepo = resolve(
  currentRepo,
  process.env.SLATE_LEGACY_BROWSER_TRACE_REPO || '../../../slate'
);
const siteOutRoot = resolve(legacyRepo, 'site/out');
const blocks = Number(process.env.SLATE_LEGACY_BROWSER_TRACE_BLOCKS || 5000);
const iterations = Number(
  process.env.SLATE_LEGACY_BROWSER_TRACE_ITERATIONS || 3
);
const typeOps = Number(process.env.SLATE_LEGACY_BROWSER_TRACE_TYPE_OPS || 10);
const port = Number(process.env.SLATE_LEGACY_BROWSER_TRACE_PORT || 0);
const nativeSurfaceTimeoutMs = Number(
  process.env.SLATE_LEGACY_BROWSER_TRACE_NATIVE_TIMEOUT_MS || 20_000
);
const materializationTimeoutMs = Number(
  process.env.SLATE_LEGACY_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS || 20_000
);
const headless = process.env.SLATE_LEGACY_BROWSER_TRACE_HEADLESS !== '0';
const buildLegacySite = process.env.SLATE_LEGACY_BROWSER_TRACE_BUILD === '1';
const selectedSurfaces = new Set(
  (process.env.SLATE_LEGACY_BROWSER_TRACE_SURFACES || 'legacyChunkOn')
    .split(',')
    .map((surface) => surface.trim())
    .filter(Boolean)
);

const latestArtifactPath =
  'tmp/slate-react-huge-document-slate-browser-trace-benchmark.json';

const sanitizeArtifactSegment = (value) =>
  String(value)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180) || 'default';

const runArtifactPath = `${[
  'tmp/slate-react-huge-document-slate-browser-trace-benchmark',
  `surfaces-${sanitizeArtifactSegment(Array.from(selectedSurfaces).join('-'))}`,
  `blocks-${blocks}`,
  `iters-${iterations}`,
  `ops-${typeOps}`,
].join('-')}.json`;

const typeText = 'X'.repeat(typeOps);

const surfaces = [
  {
    key: 'legacyChunkOn',
    label: 'Slate chunk-on',
    path: `/examples/huge-document?blocks=${blocks}&chunking=true&chunk_size=1000&chunk_divs=true&content_visibility=none&strict=false`,
  },
].filter((surface) => selectedSurfaces.has(surface.key));

const lanes = [
  {
    blockIndex: 0,
    key: 'startBlock',
  },
  {
    blockIndex: Math.floor(blocks / 2),
    key: 'middleBlock',
  },
];

const nextPaint = (page) =>
  page.evaluate(
    () =>
      new Promise((resolvePromise) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolvePromise(performance.now());
          });
        });
      })
  );

const runCommand = (command, args, cwd) =>
  new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
    });

    child.once('error', rejectPromise);
    child.once('exit', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(
        new Error(`${command} ${args.join(' ')} exited with code ${code}`)
      );
    });
  });

const buildSite = async () => {
  if (!buildLegacySite) {
    if (!existsSync(siteOutRoot)) {
      throw new Error(
        `Missing ${siteOutRoot}; run with SLATE_LEGACY_BROWSER_TRACE_BUILD=1 or build the Slate site first`
      );
    }
    return;
  }

  await runCommand('yarn', ['build:next'], legacyRepo);
};

const startStaticServer = async () => {
  const server = createServer((request, response) => {
    Promise.resolve()
      .then(() =>
        handler(request, response, {
          cleanUrls: true,
          directoryListing: false,
          public: siteOutRoot,
        })
      )
      .catch((error) => {
        console.error('Slate browser trace server request failed:', error);

        if (response.headersSent) {
          response.destroy();
          return;
        }

        response.statusCode = 500;
        response.end('Internal Server Error');
      });
  });

  await new Promise((resolvePromise, rejectPromise) => {
    server.once('error', rejectPromise);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', rejectPromise);
      resolvePromise();
    });
  });

  const address = server.address();
  const actualPort =
    typeof address === 'object' && address ? address.port : port;

  return {
    close: () => new Promise((resolvePromise) => server.close(resolvePromise)),
    url: `http://127.0.0.1:${actualPort}`,
  };
};

const installTraceObserver = async (page) => {
  await page.evaluate(() => {
    const target = globalThis;

    if (target.__SLATE_LEGACY_BROWSER_TRACE_OBSERVER__) {
      target.__SLATE_LEGACY_BROWSER_TRACE__?.reset?.();
      return;
    }

    const trace = {
      longAnimationFrames: [],
      longTasks: [],
      reset() {
        this.longAnimationFrames.length = 0;
        this.longTasks.length = 0;
      },
      snapshot() {
        return {
          longAnimationFrames: this.longAnimationFrames.slice(),
          longTasks: this.longTasks.slice(),
        };
      },
    };

    target.__SLATE_LEGACY_BROWSER_TRACE__ = trace;
    target.__SLATE_LEGACY_BROWSER_TRACE_OBSERVER__ = true;

    if ('PerformanceObserver' in target) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            trace.longTasks.push({
              duration: entry.duration,
              name: entry.name,
              startTime: entry.startTime,
            });
          }
        });

        longTaskObserver.observe({ type: 'longtask', buffered: false });
      } catch {}

      try {
        const loafObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            trace.longAnimationFrames.push({
              duration: entry.duration,
              name: entry.name,
              startTime: entry.startTime,
            });
          }
        });

        loafObserver.observe({
          type: 'long-animation-frame',
          buffered: false,
        });
      } catch {}
    }
  });
};

const waitForEditorReady = async (page) => {
  await page.waitForFunction(
    () => !!document.querySelector('[data-slate-editor="true"]'),
    undefined,
    { timeout: 30_000 }
  );
};

const waitForNativeSurface = async (page) => {
  const start = await page.evaluate(() => performance.now());

  const completed = await page
    .waitForFunction(
      (expectedBlocks) => {
        const root = document.querySelector('[data-slate-editor="true"]');

        if (!root) {
          return false;
        }

        return (
          root.querySelectorAll('[data-slate-node="text"]').length >=
          expectedBlocks
        );
      },
      blocks,
      { timeout: nativeSurfaceTimeoutMs }
    )
    .then(() => true)
    .catch(() => false);

  const end = await nextPaint(page);
  const domTags = await getMemoryAndDomTags(page);

  return {
    complete: completed,
    durationMs: end - start,
    observedBlocks: domTags.editorElementCount,
  };
};

const resetTrace = async (page) => {
  await page.evaluate(() => {
    globalThis.__SLATE_LEGACY_BROWSER_TRACE__?.reset?.();
  });
};

const getTraceSnapshot = async (page) =>
  page.evaluate(
    () => globalThis.__SLATE_LEGACY_BROWSER_TRACE__?.snapshot?.() ?? null
  );

const readBlockText = async (page, blockIndex) =>
  page.evaluate((index) => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const textElements = Array.from(
      root?.querySelectorAll('[data-slate-node="text"]') ?? []
    );
    const textElement =
      root?.querySelector(
        `[data-slate-node="text"][data-slate-path="${index},0"]`
      ) ?? textElements[index];
    const block = textElement?.closest('[data-slate-node="element"]');

    return (block ?? textElement)?.textContent?.replace(/\uFEFF/g, '') ?? null;
  }, blockIndex);

const getMemoryAndDomTags = async (page) =>
  page.evaluate(() => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const performanceMemory =
      'memory' in performance ? performance.memory : null;

    return {
      domNodeCount: document.querySelectorAll('*').length,
      editorElementCount:
        root?.querySelectorAll('[data-slate-node="element"]').length ?? 0,
      editorTextNodeCount:
        root?.querySelectorAll('[data-slate-node="text"]').length ?? 0,
      jsHeapUsedMB:
        performanceMemory &&
        typeof performanceMemory.usedJSHeapSize === 'number'
          ? performanceMemory.usedJSHeapSize / 1024 / 1024
          : null,
    };
  });

const waitForMaterializedText = async (page, blockIndex) => {
  await page.waitForFunction(
    (index) => {
      const root = document.querySelector('[data-slate-editor="true"]');
      const textElements = Array.from(
        root?.querySelectorAll('[data-slate-node="text"]') ?? []
      );

      return !!(
        root?.querySelector(
          `[data-slate-node="text"][data-slate-path="${index},0"]`
        ) ?? textElements[index]
      );
    },
    blockIndex,
    { timeout: materializationTimeoutMs }
  );
};

const syncDOMSelection = async (page, blockIndex) =>
  page.evaluate((index) => {
    const root = document.querySelector('[data-slate-editor="true"]');

    if (!(root instanceof HTMLElement)) {
      throw new Error('Missing Slate editor root');
    }

    const textElements = Array.from(
      root.querySelectorAll('[data-slate-node="text"]')
    );
    const textElement =
      root.querySelector(
        `[data-slate-node="text"][data-slate-path="${index},0"]`
      ) ?? textElements[index];

    if (!textElement) {
      throw new Error(`Missing DOM text node for block ${index}`);
    }

    textElement.scrollIntoView({ block: 'center', inline: 'nearest' });

    const walker = document.createTreeWalker(textElement, NodeFilter.SHOW_TEXT);
    const textNode = walker.nextNode();

    if (!textNode) {
      throw new Error(`Missing DOM text leaf for block ${index}`);
    }

    const range = document.createRange();
    const domSelection = document.getSelection();

    range.setStart(textNode, 0);
    range.collapse(true);
    domSelection?.removeAllRanges();
    domSelection?.addRange(range);
    root.focus();
    document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
  }, blockIndex);

const selectCollapsed = async (page, blockIndex) => {
  await waitForMaterializedText(page, blockIndex);
  await syncDOMSelection(page, blockIndex);
  await nextPaint(page);
};

const measureInteraction = async (page, lane) => {
  await resetTrace(page);

  const combinedStart = await page.evaluate(() => performance.now());
  await selectCollapsed(page, lane.blockIndex);
  const selectPaint = await nextPaint(page);
  const beforeText = await readBlockText(page, lane.blockIndex);

  if (beforeText == null) {
    throw new Error(`Missing initial block text for ${lane.key}`);
  }

  const typeStart = await page.evaluate(() => performance.now());
  await page.keyboard.type(typeText);

  await page.waitForFunction(
    ({ expectedPrefix, index }) => {
      const root = document.querySelector('[data-slate-editor="true"]');
      const textElements = Array.from(
        root?.querySelectorAll('[data-slate-node="text"]') ?? []
      );
      const textElement =
        root?.querySelector(
          `[data-slate-node="text"][data-slate-path="${index},0"]`
        ) ?? textElements[index];
      const block = textElement?.closest('[data-slate-node="element"]');
      const text =
        (block ?? textElement)?.textContent?.replace(/\uFEFF/g, '') ?? '';

      return text.startsWith(expectedPrefix);
    },
    { expectedPrefix: typeText, index: lane.blockIndex },
    { timeout: 10_000 }
  );

  const updateTime = await page.evaluate(() => performance.now());
  const paintTime = await nextPaint(page);
  const afterText = await readBlockText(page, lane.blockIndex);
  const trace = await getTraceSnapshot(page);
  const memory = await getMemoryAndDomTags(page);

  if (!afterText?.startsWith(typeText) || afterText === beforeText) {
    throw new Error(`Typing did not update ${lane.key}`);
  }

  return {
    domTags: memory,
    longAnimationFrameCount: trace?.longAnimationFrames?.length ?? 0,
    longAnimationFrameMaxMs: Math.max(
      0,
      ...(trace?.longAnimationFrames ?? []).map((entry) => entry.duration)
    ),
    longTaskCount: trace?.longTasks?.length ?? 0,
    longTaskMaxMs: Math.max(
      0,
      ...(trace?.longTasks ?? []).map((entry) => entry.duration)
    ),
    selectMs: selectPaint - combinedStart,
    interactionSequenceToPaintMs: paintTime - combinedStart,
    typeToPaintMs: paintTime - typeStart,
    typeToUpdateMs: updateTime - typeStart,
  };
};

const summarizeMetric = (samples, key) =>
  summarize(samples.map((sample) => sample[key]));

const summarizeTagSamples = (samples, key) =>
  summarize(
    samples.map((sample) => sample.domTags[key]).filter(Number.isFinite)
  );

const summarizeNumberSamples = (samples, key) =>
  summarize(samples.map((sample) => sample[key]).filter(Number.isFinite));

const summarizeLane = (samples) => ({
  domTags: {
    domNodeCount: summarizeTagSamples(samples, 'domNodeCount'),
    editorElementCount: summarizeTagSamples(samples, 'editorElementCount'),
    editorTextNodeCount: summarizeTagSamples(samples, 'editorTextNodeCount'),
    jsHeapUsedMB: summarizeTagSamples(samples, 'jsHeapUsedMB'),
  },
  longAnimationFrameCount: summarizeMetric(samples, 'longAnimationFrameCount'),
  longAnimationFrameMaxMs: summarizeMetric(samples, 'longAnimationFrameMaxMs'),
  longTaskCount: summarizeMetric(samples, 'longTaskCount'),
  longTaskMaxMs: summarizeMetric(samples, 'longTaskMaxMs'),
  selectMs: summarizeMetric(samples, 'selectMs'),
  interactionSequenceToPaintMs: summarizeMetric(
    samples,
    'interactionSequenceToPaintMs'
  ),
  typeToPaintMs: summarizeMetric(samples, 'typeToPaintMs'),
  typeToUpdateMs: summarizeMetric(samples, 'typeToUpdateMs'),
});

const measureSurface = async ({ browser, baseUrl, surface }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const laneSamples = Object.fromEntries(lanes.map((lane) => [lane.key, []]));
  const nativeSurfaceSamples = [];

  try {
    for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
      const url = `${baseUrl}${surface.path}`;

      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForEditorReady(page);
      await installTraceObserver(page);
      nativeSurfaceSamples.push(await waitForNativeSurface(page));

      for (const lane of lanes) {
        const sample = await measureInteraction(page, lane);

        if (iteration > 0) {
          laneSamples[lane.key].push(sample);
        }
      }
    }
  } finally {
    await context.close();
  }

  return {
    label: surface.label,
    lanes: Object.fromEntries(
      Object.entries(laneSamples).map(([key, samples]) => [
        key,
        summarizeLane(samples),
      ])
    ),
    nativeSurface: {
      completeCount: nativeSurfaceSamples
        .slice(1)
        .filter((sample) => sample.complete).length,
      durationMs: summarizeNumberSamples(
        nativeSurfaceSamples.slice(1),
        'durationMs'
      ),
      observedBlocks: summarizeNumberSamples(
        nativeSurfaceSamples.slice(1),
        'observedBlocks'
      ),
      timeoutCount: nativeSurfaceSamples
        .slice(1)
        .filter((sample) => !sample.complete).length,
      timeoutMs: nativeSurfaceTimeoutMs,
    },
    path: surface.path,
  };
};

const run = async () => {
  if (surfaces.length === 0) {
    throw new Error(
      'SLATE_LEGACY_BROWSER_TRACE_SURFACES selected no known surfaces'
    );
  }

  await buildSite();

  const server = await startStaticServer();
  const browser = await chromium.launch({ headless });

  try {
    const summary = {
      artifactPaths: {
        latest: latestArtifactPath,
        run: runArtifactPath,
      },
      legacyRepo,
      meta: {
        blocks,
        browser: 'chromium',
        buildLegacySite,
        headless,
        iterations,
        siteOutRoot,
        typeOps,
      },
      surfaces: {},
    };

    for (const surface of surfaces) {
      summary.surfaces[surface.key] = await measureSurface({
        baseUrl: server.url,
        browser,
        surface,
      });
    }

    await writeBenchmarkArtifact(latestArtifactPath, summary);
    await writeBenchmarkArtifact(runArtifactPath, summary);

    for (const [key, surface] of Object.entries(summary.surfaces)) {
      console.log(`\n${key} (${surface.label})`);
      console.log(
        `nativeSurface durationMs p95=${surface.nativeSurface.durationMs.p95}, complete=${surface.nativeSurface.completeCount}, timedOut=${surface.nativeSurface.timeoutCount}, observedBlocks p95=${surface.nativeSurface.observedBlocks.p95}`
      );

      for (const [laneKey, lane] of Object.entries(surface.lanes)) {
        console.log(
          `${laneKey}: interactionSequenceToPaintMs p95=${lane.interactionSequenceToPaintMs.p95}, typeToPaintMs p95=${lane.typeToPaintMs.p95}, longTaskMaxMs p95=${lane.longTaskMaxMs.p95}, domNodes p95=${lane.domTags.domNodeCount.p95}, heapMB p95=${round(lane.domTags.jsHeapUsedMB.p95)}`
        );
      }
    }

    console.log(`\nWrote ${runArtifactPath}`);
  } finally {
    await browser.close();
    await server.close();
  }
};

await run();
