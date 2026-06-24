import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import handler from 'serve-handler';

import {
  round,
  summarize,
  writeBenchmarkArtifact,
} from '../../shared/stats.mjs';

const siteOutRoot = fileURLToPath(
  new URL('../../../../site/out', import.meta.url)
);
const siteRoot = fileURLToPath(new URL('../../../../site', import.meta.url));

const iterations = Number(
  process.env.SLATE_PAGINATION_REAL_OPS_ITERATIONS || 5
);
const headless = process.env.SLATE_PAGINATION_REAL_OPS_HEADLESS !== '0';
const useDevServer = process.env.SLATE_PAGINATION_REAL_OPS_DEV === '1';
const skipStaticBuild =
  process.env.SLATE_PAGINATION_REAL_OPS_SKIP_BUILD === '1' ||
  process.env.SLATE_PAGINATION_REAL_OPS_SKIP_STATIC_BUILD === '1';
const traceProfiler = process.env.SLATE_PAGINATION_REAL_OPS_PROFILER !== '0';
const artifactPath =
  process.env.SLATE_PAGINATION_REAL_OPS_ARTIFACT ||
  'tmp/slate-pagination-virtualized-real-editor-ops-benchmark.json';

const cohortKeys = (
  process.env.SLATE_PAGINATION_REAL_OPS_COHORTS || 'current,rows800'
)
  .split(',')
  .map((key) => key.trim())
  .filter(Boolean);
const requestedLaneKeys = process.env.SLATE_PAGINATION_REAL_OPS_LANES?.split(
  ','
)
  .map((key) => key.trim())
  .filter(Boolean);

const allCohorts = new Map([
  [
    'current',
    {
      key: 'current',
      label: 'default virtualized pagination',
      path: '/examples/pagination?page_layout=single&strategy=virtualized',
    },
  ],
  [
    'rows8',
    {
      key: 'rows8',
      label: 'rows=8 virtualized pagination',
      path: '/examples/pagination?page_layout=single&rows=8&strategy=virtualized',
    },
  ],
  [
    'rows800',
    {
      key: 'rows800',
      label: 'rows=800 virtualized pagination',
      path: '/examples/pagination?page_layout=single&rows=800&strategy=virtualized',
    },
  ],
  [
    'rows800_table',
    {
      key: 'rows800_table',
      label: 'rows=800 table-only virtualized pagination',
      path: '/examples/pagination?page_layout=single&rows=800&stress_pages=0&strategy=virtualized',
    },
  ],
]);

const cohorts = cohortKeys.map((key) => {
  const cohort = allCohorts.get(key);

  if (!cohort) {
    throw new Error(`Unknown pagination real-ops cohort: ${key}`);
  }

  return cohort;
});

const allLanes = [
  {
    key: 'click_to_caret',
    run: async (page) => {
      const target = await getTextTarget(page, '1');

      await page.mouse.click(target.x, target.y);
      await waitForCollapsedSelection(page);
    },
  },
  {
    key: 'double_click_word',
    run: async (page) => {
      const target = await getTextTarget(page, '1');

      await page.mouse.dblclick(target.x, target.y);
      await waitForSelectionText(page);
    },
  },
  {
    key: 'drag_select',
    run: async (page) => {
      const from = await getTextTarget(page, '1');
      const to = await getTextTarget(page, '2');

      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.mouse.move(to.x + 80, to.y, { steps: 4 });
      await page.mouse.up();
      await waitForSelectionText(page);
    },
  },
  {
    key: 'type_burst',
    run: async (page, token) => {
      const target = await getTextTarget(page, '1');

      await page.mouse.click(target.x, target.y);
      await waitForCollapsedSelection(page);
      await page.keyboard.type(token);
      await waitForBodyText(page, token);
    },
  },
  {
    key: 'insert_break_only',
    run: async (page) => {
      const target = await getTextTarget(page, '1', 'end');
      const beforeCount = await getTopLevelElementCount(page);

      await page.mouse.click(target.x, target.y);
      await waitForCollapsedSelection(page);
      await page.keyboard.press('Enter');
      await waitForTopLevelElementCount(page, beforeCount + 1);
      await waitForCollapsedSelection(page);
    },
  },
  {
    key: 'preselected_type_burst',
    setup: async (page) => {
      const target = await getTextTarget(page, '1');

      await page.mouse.click(target.x, target.y);
      await waitForCollapsedSelection(page);
    },
    run: async (page, token) => {
      await page.keyboard.type(token);
      await waitForBodyText(page, token);
    },
  },
  {
    key: 'preselected_insert_break_only',
    setup: async (page) => {
      const target = await getTextTarget(page, '1', 'end');

      await page.mouse.click(target.x, target.y);
      await waitForCollapsedSelection(page);

      return {
        beforeCount: await getTopLevelElementCount(page),
      };
    },
    run: async (page, _token, setup) => {
      await page.keyboard.press('Enter');
      await waitForTopLevelElementCount(page, setup.beforeCount + 1);
      await waitForCollapsedSelection(page);
    },
  },
  {
    key: 'preselected_insert_break_type',
    setup: async (page) => {
      const target = await getTextTarget(page, '1', 'end');

      await page.mouse.click(target.x, target.y);
      await waitForCollapsedSelection(page);

      return {
        beforeCount: await getTopLevelElementCount(page),
      };
    },
    run: async (page, token, setup) => {
      await page.keyboard.press('Enter');
      await waitForTopLevelElementCount(page, setup.beforeCount + 1);
      await waitForCollapsedSelection(page);
      await page.keyboard.type(token);
      await waitForBodyText(page, token);
    },
  },
  {
    key: 'insert_break_type',
    run: async (page, token) => {
      const target = await getTextTarget(page, '1', 'end');

      await page.mouse.click(target.x, target.y);
      await waitForCollapsedSelection(page);
      await page.keyboard.press('Enter');
      await page.keyboard.type(token);
      await waitForBodyText(page, token);
    },
  },
  {
    key: 'delete_backward',
    run: async (page) => {
      const target = await getTextTarget(page, '1', 'end');
      const beforeLength = await getBlockTextLength(page, '1');

      await page.mouse.click(target.x, target.y);
      await waitForCollapsedSelection(page);
      await page.keyboard.press('Backspace');
      await page.waitForFunction(
        ({ beforeLength: expectedBeforeLength, path }) => {
          const block = document.querySelector(
            `[data-slate-node="element"][data-slate-path="${path}"]`
          );

          return (
            typeof block?.textContent === 'string' &&
            block.textContent.length < expectedBeforeLength
          );
        },
        { beforeLength, path: '1' },
        { timeout: 5000 }
      );
    },
  },
  {
    key: 'undo_redo',
    run: async (page, token) => {
      const target = await getTextTarget(page, '1');
      const modKey = await getBrowserModKey(page);

      await page.mouse.click(target.x, target.y);
      await waitForCollapsedSelection(page);
      await page.keyboard.type(token);
      await waitForBodyText(page, token);
      await page.keyboard.press(`${modKey}+Z`);
      await waitForBodyText(page, token, false);
      await page.keyboard.press(
        modKey === 'Meta' ? `${modKey}+Shift+Z` : `${modKey}+Y`
      );
      await waitForBodyText(page, token);
    },
  },
  {
    key: 'scroll_click',
    run: async (page) => {
      await page.evaluate(() => {
        const viewport = document.querySelector(
          '[data-testid="pagination-viewport"]'
        );

        if (viewport instanceof HTMLElement) {
          viewport.scrollTop = viewport.scrollHeight * 0.55;
        }
      });
      await nextPaint(page);

      const target = await getVisibleTextTarget(page);

      await page.mouse.click(target.x, target.y);
      await waitForCollapsedSelection(page);
    },
  },
];

const lanes = (requestedLaneKeys ?? allLanes.map((lane) => lane.key)).map(
  (key) => {
    const lane = allLanes.find((candidate) => candidate.key === key);

    if (!lane) {
      throw new Error(`Unknown pagination real-ops lane: ${key}`);
    }

    return lane;
  }
);

const runStaticBuild = async () =>
  new Promise((resolve, reject) => {
    if (skipStaticBuild) {
      resolve();
      return;
    }

    const child = spawn('bun', ['next', 'build'], {
      cwd: siteRoot,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const logs = [];
    const collectLog = (chunk) => {
      logs.push(Buffer.from(chunk));
      if (logs.length > 40) {
        logs.shift();
      }
    };

    child.stdout.on('data', collectLog);
    child.stderr.on('data', collectLog);
    child.once('error', reject);
    child.once('exit', (status) => {
      if (status === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Pagination real-ops static build exited with ${status}:\n${Buffer.concat(
            logs
          ).toString('utf8')}`
        )
      );
    });
  });

const startStaticServer = async () => {
  await runStaticBuild();

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
        console.error('Pagination real-ops server failed:', error);

        if (response.headersSent) {
          response.destroy();
          return;
        }

        response.statusCode = 500;
        response.end('Internal Server Error');
      });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });

  const address = server.address();
  const port =
    typeof address === 'object' && address !== null ? address.port : null;

  if (!port) {
    throw new Error('Unable to allocate pagination real-ops server port');
  }

  return {
    close: () => new Promise((resolve) => server.close(resolve)),
    url: `http://127.0.0.1:${port}`,
  };
};

const getOpenPort = async () => {
  const server = createServer();

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });

  const address = server.address();
  const port =
    typeof address === 'object' && address !== null ? address.port : null;

  await new Promise((resolve) => server.close(resolve));

  if (!port) {
    throw new Error('Unable to allocate pagination real-ops dev server port');
  }

  return port;
};

const waitForURL = async (url, timeoutMs = 60_000) => {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(
    `Timed out waiting for pagination real-ops server at ${url}: ${
      lastError instanceof Error ? lastError.message : 'not ready'
    }`
  );
};

const startNextDevServer = async () => {
  const port = await getOpenPort();
  const child = spawn('bun', ['next', 'dev', '-p', String(port)], {
    cwd: siteRoot,
    detached: true,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logs = [];
  const collectLog = (chunk) => {
    logs.push(Buffer.from(chunk));
    if (logs.length > 20) {
      logs.shift();
    }
  };

  child.stdout.on('data', collectLog);
  child.stderr.on('data', collectLog);

  const exitPromise = new Promise((_, reject) => {
    child.once('exit', (status) => {
      reject(
        new Error(
          `Pagination real-ops dev server exited with ${status}:\n${Buffer.concat(
            logs
          ).toString('utf8')}`
        )
      );
    });
  });
  const url = `http://127.0.0.1:${port}`;

  await Promise.race([waitForURL(`${url}/examples/pagination`), exitPromise]);

  return {
    close: () =>
      new Promise((resolve) => {
        let resolved = false;
        const finish = () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };
        const killGroup = (signal) => {
          try {
            process.kill(-child.pid, signal);
          } catch {
            try {
              child.kill(signal);
            } catch {}
          }
        };

        killGroup('SIGTERM');
        setTimeout(() => {
          killGroup('SIGKILL');
          finish();
        }, 5000);
        child.once('exit', finish);
      }),
    url,
  };
};

const nextPaint = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve(performance.now());
          });
        });
      })
  );

const installTraceObserver = async (page) => {
  await page.addInitScript(
    ({ traceProfiler: shouldTraceProfiler }) => {
      const target = globalThis;

      const trace = {
        beforeInputEvents: [],
        inputEvents: [],
        longAnimationFrames: [],
        longTasks: [],
        profilerEvents: [],
        reset() {
          this.beforeInputEvents.length = 0;
          this.inputEvents.length = 0;
          this.longAnimationFrames.length = 0;
          this.longTasks.length = 0;
          this.profilerEvents.length = 0;
        },
        snapshot() {
          return {
            beforeInputEvents: this.beforeInputEvents.slice(),
            inputEvents: this.inputEvents.slice(),
            longAnimationFrames: this.longAnimationFrames.slice(),
            longTasks: this.longTasks.slice(),
            profilerEvents: this.profilerEvents.slice(),
          };
        },
      };

      target.__SLATE_PAGINATION_REAL_OPS_TRACE__ = trace;
      if (shouldTraceProfiler) {
        target.__SLATE_REACT_RENDER_PROFILER__ = {
          record(event) {
            trace.profilerEvents.push({ ...event });
          },
        };
      }

      const recordInputEvent = (event) => {
        const active = document.activeElement;

        trace[
          event.type === 'beforeinput' ? 'beforeInputEvents' : 'inputEvents'
        ].push({
          activeTag: active instanceof HTMLElement ? active.tagName : null,
          inputType: 'inputType' in event ? event.inputType : null,
          time: performance.now(),
          type: event.type,
        });
      };

      document.addEventListener('beforeinput', recordInputEvent, {
        capture: true,
      });
      document.addEventListener('input', recordInputEvent, { capture: true });

      try {
        new PerformanceObserver((list) => {
          trace.longTasks.push(
            ...list.getEntries().map((entry) => ({
              duration: entry.duration,
              startTime: entry.startTime,
            }))
          );
        }).observe({ entryTypes: ['longtask'] });
      } catch {}

      try {
        new PerformanceObserver((list) => {
          trace.longAnimationFrames.push(
            ...list.getEntries().map((entry) => ({
              duration: entry.duration,
              startTime: entry.startTime,
            }))
          );
        }).observe({ entryTypes: ['long-animation-frame'] });
      } catch {}
    },
    { traceProfiler }
  );
};

const resetTrace = (page) =>
  page.evaluate(() => {
    globalThis.__SLATE_PAGINATION_REAL_OPS_TRACE__?.reset?.();
  });

const readTrace = (page) =>
  page.evaluate(
    () => globalThis.__SLATE_PAGINATION_REAL_OPS_TRACE__?.snapshot?.() ?? null
  );

const readProof = (page) =>
  page.evaluate(() => {
    const editor = document.querySelector('[contenteditable="true"]');
    const meta = document.querySelector('.slate-pagination-meta');

    return {
      layoutComposeCount: Number(
        meta?.getAttribute('data-layout-compose-count') ?? 0
      ),
      layoutComposeMs: Number(
        meta?.getAttribute('data-layout-compose-ms') ?? 0
      ),
      pageSurfaceCount: document.querySelectorAll('[data-slate-page-surface]')
        .length,
      pageVirtualizationEnabled: Boolean(
        document.querySelector(
          '[data-slate-paged-editable-page-virtualization="true"]'
        )
      ),
      totalElementCount:
        editor?.querySelectorAll('*').length ??
        document.querySelectorAll('*').length,
    };
  });

const getProfilerEventKey = (event) => {
  const id = event.id ?? event.runtimeId;

  return id ? `${event.kind}:${id}` : event.kind;
};

const summarizeProfilerEvents = (events) => {
  const byKey = {};
  const durationByKey = {};
  const durationByKind = {};

  for (const event of events) {
    const key = getProfilerEventKey(event);
    const duration =
      typeof event.duration === 'number' && Number.isFinite(event.duration)
        ? event.duration
        : 0;

    byKey[key] = (byKey[key] ?? 0) + 1;
    durationByKey[key] = round((durationByKey[key] ?? 0) + duration);
    durationByKind[event.kind] = round(
      (durationByKind[event.kind] ?? 0) + duration
    );
  }

  return {
    byKey,
    durationByKey,
    durationByKind,
    total: events.length,
  };
};

const openCohortPage = async (page, baseURL, cohort) => {
  await page.goto(new URL(cohort.path, baseURL).toString(), {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector('[data-testid="pagination-viewport"]', {
    timeout: 20_000,
  });
  await page.waitForSelector(
    '[data-slate-node="element"][data-slate-path="1"] [data-slate-string]',
    { timeout: 20_000 }
  );
  await nextPaint(page);
};

const getBrowserModKey = (page) =>
  page.evaluate(() =>
    navigator.userAgent.includes('Mac OS X') ? 'Meta' : 'Control'
  );

const getBlockTextLength = (page, path) =>
  page.evaluate((blockPath) => {
    const block = document.querySelector(
      `[data-slate-node="element"][data-slate-path="${blockPath}"]`
    );

    return block?.textContent?.length ?? 0;
  }, path);

const getTopLevelElementCount = (page) =>
  page.evaluate(
    () =>
      Array.from(
        document.querySelectorAll(
          '[data-slate-node="element"][data-slate-path]'
        )
      ).filter((element) => {
        const path = element.getAttribute('data-slate-path');

        return path != null && !path.includes(',');
      }).length
  );

const waitForTopLevelElementCount = (page, count) =>
  page.waitForFunction(
    (expectedCount) =>
      Array.from(
        document.querySelectorAll(
          '[data-slate-node="element"][data-slate-path]'
        )
      ).filter((element) => {
        const path = element.getAttribute('data-slate-path');

        return path != null && !path.includes(',');
      }).length >= expectedCount,
    count,
    { timeout: 5000 }
  );

const getTextTarget = async (page, path, placement = 'start') => {
  const target = await page.evaluate(
    ({ path: blockPath, placement: targetPlacement }) => {
      const viewport = document.querySelector(
        '[data-testid="pagination-viewport"]'
      );
      const viewportRect =
        viewport instanceof HTMLElement
          ? viewport.getBoundingClientRect()
          : {
              bottom: innerHeight,
              top: 0,
            };
      const block = document.querySelector(
        `[data-slate-node="element"][data-slate-path="${blockPath}"]`
      );
      const leaves = Array.from(
        block?.querySelectorAll('[data-slate-leaf]') ?? []
      ).filter((node) => node instanceof HTMLElement);
      const leaf = leaves.find((candidate) => {
        const rect = candidate.getBoundingClientRect();

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom > viewportRect.top + 8 &&
          rect.top < viewportRect.bottom - 8
        );
      });

      if (!(block instanceof HTMLElement) || !(leaf instanceof HTMLElement)) {
        return null;
      }

      const rect = leaf.getBoundingClientRect();
      const x =
        targetPlacement === 'end'
          ? Math.max(rect.left + 4, rect.right - 4)
          : Math.min(rect.right - 4, rect.left + 60);

      return {
        blockText: block.textContent ?? '',
        path: blockPath,
        x,
        y: (rect.top + rect.bottom) / 2,
      };
    },
    { path, placement }
  );

  if (!target) {
    throw new Error(`Unable to find visible pagination text target at ${path}`);
  }

  return target;
};

const getVisibleTextTarget = async (page) => {
  const target = await page.evaluate(() => {
    const viewport = document.querySelector(
      '[data-testid="pagination-viewport"]'
    );
    const viewportRect =
      viewport instanceof HTMLElement
        ? viewport.getBoundingClientRect()
        : {
            bottom: innerHeight,
            top: 0,
          };
    const blocks = Array.from(
      document.querySelectorAll('[data-slate-node="element"][data-slate-path]')
    );

    for (const block of blocks) {
      if (!(block instanceof HTMLElement)) {
        continue;
      }

      const leaf = Array.from(block.querySelectorAll('[data-slate-leaf]')).find(
        (candidate) => {
          if (!(candidate instanceof HTMLElement)) {
            return false;
          }

          const rect = candidate.getBoundingClientRect();

          return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.bottom > viewportRect.top + 40 &&
            rect.top < viewportRect.bottom - 40
          );
        }
      );

      if (!(leaf instanceof HTMLElement)) {
        continue;
      }

      const rect = leaf.getBoundingClientRect();

      return {
        path: block.getAttribute('data-slate-path'),
        x: Math.min(rect.right - 4, rect.left + 60),
        y: (rect.top + rect.bottom) / 2,
      };
    }

    return null;
  });

  if (!target) {
    throw new Error(
      'Unable to find visible pagination text target after scroll'
    );
  }

  return target;
};

const waitForCollapsedSelection = (page) =>
  page.waitForFunction(
    () => {
      const selection = document.getSelection();

      if (!selection?.isCollapsed) {
        return false;
      }

      const anchor =
        selection.anchorNode instanceof Element
          ? selection.anchorNode
          : selection.anchorNode?.parentElement;

      return Boolean(anchor?.closest('[data-slate-node="text"]'));
    },
    undefined,
    { timeout: 5000 }
  );

const waitForSelectionText = (page) =>
  page.waitForFunction(
    () => {
      const text = document.getSelection()?.toString() ?? '';

      return text.trim().length > 0;
    },
    undefined,
    { timeout: 5000 }
  );

const waitForBodyText = (page, text, present = true) =>
  page.waitForFunction(
    ({ expectedText, shouldBePresent }) =>
      document.body.textContent?.includes(expectedText) === shouldBePresent,
    { expectedText: text, shouldBePresent: present },
    { timeout: 5000 }
  );

const measureLane = async ({ cohort, iteration, lane, page }) => {
  const token = `realops-${cohort.key}-${iteration}-${lane.key}`;
  let error = null;

  const setup = await lane.setup?.(page, token);

  await resetTrace(page);
  const beforeProof = await readProof(page);
  const start = await page.evaluate(() => performance.now());

  try {
    await lane.run(page, token, setup);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }

  await nextPaint(page);
  const end = await page.evaluate(() => performance.now());
  const proof = await readProof(page);
  const trace = await readTrace(page);
  const profilerEvents = trace?.profilerEvents ?? [];
  const renderEvents = profilerEvents.filter(
    (event) =>
      event.kind !== 'core-time' &&
      event.kind !== 'dom-text-sync' &&
      event.kind !== 'layout-time' &&
      event.kind !== 'runtime-time' &&
      event.kind !== 'selector'
  );
  const renderByKind = profilerEvents.reduce((accumulator, event) => {
    accumulator[event.kind] = (accumulator[event.kind] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    cohort: cohort.key,
    durationMs: round(end - start),
    error,
    iteration,
    lane: lane.key,
    longAnimationFrameMaxMs: round(
      Math.max(
        0,
        ...(trace?.longAnimationFrames ?? []).map((entry) => entry.duration)
      )
    ),
    longTaskMaxMs: round(
      Math.max(0, ...(trace?.longTasks ?? []).map((entry) => entry.duration))
    ),
    proof,
    layoutComposeDelta:
      proof.layoutComposeCount - beforeProof.layoutComposeCount,
    profiler: summarizeProfilerEvents(profilerEvents),
    renderByKind,
    renderEventCount: renderEvents.length,
  };
};

const toMetricKey = (parts) => parts.filter(Boolean).join('_');

const samplesFor = (samples, predicate) =>
  samples.filter(predicate).map((sample) => sample.durationMs);

const summarizeProof = (samples, key) =>
  summarize(
    samples
      .map((sample) => sample.proof?.[key])
      .filter((value) => typeof value === 'number')
  );

const server = process.env.SLATE_PAGINATION_REAL_OPS_BASE_URL
  ? null
  : useDevServer || process.env.SLATE_PAGINATION_REAL_OPS_STATIC === '0'
    ? await startNextDevServer()
    : await startStaticServer();
const baseURL = process.env.SLATE_PAGINATION_REAL_OPS_BASE_URL ?? server?.url;

if (!baseURL) {
  throw new Error('Unable to resolve pagination real-ops base URL');
}

const browser = await chromium.launch({ headless });
const samples = [];

try {
  for (const cohort of cohorts) {
    for (let iteration = 0; iteration < iterations; iteration += 1) {
      const context = await browser.newContext({
        viewport: { height: 637, width: 1533 },
      });
      const page = await context.newPage();

      await installTraceObserver(page);

      for (const lane of lanes) {
        await openCohortPage(page, baseURL, cohort);

        const sample = await measureLane({
          cohort,
          iteration,
          lane,
          page,
        });

        samples.push(sample);

        console.log(
          `${cohort.key} ${lane.key} #${iteration + 1}: ${sample.durationMs}ms${
            sample.error ? ` ERROR ${sample.error}` : ''
          }`
        );
      }

      await context.close();
    }
  }
} finally {
  await browser.close();
  await server?.close();
}

const successfulSamples = samples.filter((sample) => !sample.error);
const failures = samples.filter((sample) => sample.error);
const metrics = {
  pagination_virtualized_real_ops_click_to_caret_p95_ms: summarize(
    samplesFor(successfulSamples, (sample) => sample.lane === 'click_to_caret')
  ).p95,
  pagination_virtualized_real_ops_dom_nodes_p95: summarizeProof(
    successfulSamples,
    'totalElementCount'
  ).p95,
  pagination_virtualized_real_ops_drag_select_p95_ms: summarize(
    samplesFor(successfulSamples, (sample) => sample.lane === 'drag_select')
  ).p95,
  pagination_virtualized_real_ops_failure_count: failures.length,
  pagination_virtualized_real_ops_insert_break_p95_ms: summarize(
    samplesFor(
      successfulSamples,
      (sample) => sample.lane === 'insert_break_type'
    )
  ).p95,
  pagination_virtualized_real_ops_preselected_insert_break_p95_ms: summarize(
    samplesFor(
      successfulSamples,
      (sample) => sample.lane === 'preselected_insert_break_only'
    )
  ).p95,
  pagination_virtualized_real_ops_preselected_insert_break_type_p95_ms:
    summarize(
      samplesFor(
        successfulSamples,
        (sample) => sample.lane === 'preselected_insert_break_type'
      )
    ).p95,
  pagination_virtualized_real_ops_preselected_type_burst_p95_ms: summarize(
    samplesFor(
      successfulSamples,
      (sample) => sample.lane === 'preselected_type_burst'
    )
  ).p95,
  pagination_virtualized_real_ops_long_animation_frame_max_ms: round(
    Math.max(
      0,
      ...successfulSamples.map((sample) => sample.longAnimationFrameMaxMs)
    )
  ),
  pagination_virtualized_real_ops_long_task_max_ms: round(
    Math.max(0, ...successfulSamples.map((sample) => sample.longTaskMaxMs))
  ),
  pagination_virtualized_real_ops_page_surfaces_p95: summarizeProof(
    successfulSamples,
    'pageSurfaceCount'
  ).p95,
  pagination_virtualized_real_ops_render_events_p95: summarize(
    successfulSamples.map((sample) => sample.renderEventCount)
  ).p95,
  pagination_virtualized_real_ops_scroll_click_p95_ms: summarize(
    samplesFor(successfulSamples, (sample) => sample.lane === 'scroll_click')
  ).p95,
  pagination_virtualized_real_ops_type_burst_p95_ms: summarize(
    samplesFor(successfulSamples, (sample) => sample.lane === 'type_burst')
  ).p95,
  pagination_virtualized_real_ops_undo_redo_p95_ms: summarize(
    samplesFor(successfulSamples, (sample) => sample.lane === 'undo_redo')
  ).p95,
};

for (const cohort of cohorts) {
  for (const lane of lanes) {
    metrics[
      toMetricKey([
        'pagination_virtualized_real_ops',
        cohort.key,
        lane.key,
        'p95_ms',
      ])
    ] = summarize(
      samplesFor(
        successfulSamples,
        (sample) => sample.cohort === cohort.key && sample.lane === lane.key
      )
    ).p95;
  }
}

const cohortLaneP95s = cohorts.flatMap((cohort) =>
  lanes.map(
    (lane) =>
      metrics[
        toMetricKey([
          'pagination_virtualized_real_ops',
          cohort.key,
          lane.key,
          'p95_ms',
        ])
      ] ?? 0
  )
);

metrics.pagination_virtualized_real_ops_worst_p95_ms = round(
  Math.max(0, ...cohortLaneP95s)
);

await writeBenchmarkArtifact(artifactPath, {
  cohorts,
  iterations,
  lanes: lanes.map((lane) => lane.key),
  metrics,
  samples,
});

for (const [name, value] of Object.entries(metrics)) {
  console.log(`METRIC ${name}=${value}`);
}

console.log(`ARTIFACT pagination_virtualized_real_editor_ops=${artifactPath}`);

if (failures.length > 0) {
  process.exitCode = 1;
}
