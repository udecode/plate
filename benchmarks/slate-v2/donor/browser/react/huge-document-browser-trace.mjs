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
const blocks = Number(process.env.SLATE_BROWSER_TRACE_BLOCKS || 5000);
const iterations = Number(process.env.SLATE_BROWSER_TRACE_ITERATIONS || 3);
const typeOps = Number(process.env.SLATE_BROWSER_TRACE_TYPE_OPS || 10);
const port = Number(process.env.SLATE_BROWSER_TRACE_PORT || 0);
const nativeSurfaceTimeoutMs = Number(
  process.env.SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS || 10_000
);
const materializationTimeoutMs = Number(
  process.env.SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS || 15_000
);
const headless = process.env.SLATE_BROWSER_TRACE_HEADLESS !== '0';
const skipBuild = process.env.SLATE_BROWSER_TRACE_SKIP_BUILD === '1';
const selectAllDeleteEnabled =
  process.env.SLATE_BROWSER_TRACE_SELECT_ALL_DELETE === '1';
const selectAllDeleteAllowFailure =
  process.env.SLATE_BROWSER_TRACE_SELECT_ALL_DELETE_ALLOW_FAILURE === '1';
const selectAllDeleteTypeText =
  process.env.SLATE_BROWSER_TRACE_AFTER_DELETE_TEXT || 'after 200k delete';
const selectAllDeleteInputMode =
  process.env.SLATE_BROWSER_TRACE_AFTER_DELETE_INPUT_MODE || 'type';
const selectAllDeleteInputModes = new Set(['insertText', 'type']);
const runLabel = process.env.SLATE_BROWSER_TRACE_RUN_LABEL || '';
const runStartedAt = new Date().toISOString();

if (!selectAllDeleteInputModes.has(selectAllDeleteInputMode)) {
  throw new Error(
    `Unsupported SLATE_BROWSER_TRACE_AFTER_DELETE_INPUT_MODE=${JSON.stringify(selectAllDeleteInputMode)}`
  );
}
const selectedSurfaces = new Set(
  (
    process.env.SLATE_BROWSER_TRACE_SURFACES ||
    'defaultAuto,stagedActiveDOMGroup'
  )
    .split(',')
    .map((surface) => surface.trim())
    .filter(Boolean)
);

const latestArtifactPath =
  'tmp/slate-react-huge-document-browser-trace-benchmark.json';

const hashArtifactSegment = (value) => {
  let hash = 5381;

  for (const char of value) {
    hash = (hash * 33) ^ char.charCodeAt(0);
  }

  return (hash >>> 0).toString(36);
};

const sanitizeArtifactSegment = (value, maxLength = 40) => {
  const segment =
    String(value)
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'default';

  if (segment.length <= maxLength) {
    return segment;
  }

  const suffix = hashArtifactSegment(segment);
  const prefixLength = Math.max(1, maxLength - suffix.length - 1);

  return `${segment.slice(0, prefixLength)}-${suffix}`;
};

const runArtifactPath = `${[
  'tmp/slate-react-huge-document-browser-trace-benchmark',
  `surfaces-${sanitizeArtifactSegment(Array.from(selectedSurfaces).join('-'))}`,
  `blocks-${blocks}`,
  `iters-${iterations}`,
  `ops-${typeOps}`,
  `after-delete-${sanitizeArtifactSegment(selectAllDeleteInputMode)}`,
  `after-delete-text-${sanitizeArtifactSegment(selectAllDeleteTypeText)}`,
  `run-${sanitizeArtifactSegment([runLabel, runStartedAt].filter(Boolean).join('-'))}`,
].join('-')}.json`;

const typeText = 'X'.repeat(typeOps);

const surfaces = [
  {
    key: 'defaultAuto',
    label: 'v2 auto',
    path: `/examples/huge-document?blocks=${blocks}&content_visibility=none&strict=false&strategy=auto`,
  },
  {
    key: 'stagedActiveDOMGroup',
    label: 'v2 staged active DOM group',
    path: `/examples/huge-document?blocks=${blocks}&content_visibility=none&strict=false&strategy=staged`,
  },
  {
    key: 'stagedDefault',
    label: 'v2 staged default',
    path: `/examples/huge-document?blocks=${blocks}&strict=false&strategy=staged`,
  },
  {
    key: 'stagedContentVisibility',
    label: 'v2 staged content-visibility',
    path: `/examples/huge-document?blocks=${blocks}&content_visibility=element&strict=false&strategy=staged`,
  },
  {
    key: 'virtualized',
    label: 'v2 virtualized',
    path: `/examples/huge-document?blocks=${blocks}&content_visibility=none&strict=false&strategy=virtualized&threshold=1&overscan=2&editor_height=600`,
  },
].filter((surface) => selectedSurfaces.has(surface.key));

const lanes = [
  {
    blockIndex: 0,
    key: 'startBlock',
    offset: 1,
  },
  {
    blockIndex: Math.floor(blocks / 2),
    key: 'middleBlock',
    offset: 1,
  },
];

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
        console.error('Browser trace server request failed:', error);

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
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });

  const address = server.address();
  const actualPort =
    typeof address === 'object' && address ? address.port : port;

  return {
    close: () => new Promise((resolve) => server.close(resolve)),
    url: `http://127.0.0.1:${actualPort}`,
  };
};

const buildSite = async () => {
  if (skipBuild) {
    return;
  }

  await new Promise((resolve, reject) => {
    const child = spawn('bun', ['run', 'build:next'], {
      stdio: 'inherit',
    });

    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`bun run build:next exited with code ${code}`));
    });
  });
};

const installTraceObserver = async (page) => {
  await page.evaluate(() => {
    const target = globalThis;

    if (target.__SLATE_BROWSER_TRACE_OBSERVER__) {
      target.__SLATE_BROWSER_TRACE__?.reset?.();
      return;
    }

    const trace = {
      longAnimationFrames: [],
      longTasks: [],
      beforeInputEvents: [],
      inputEvents: [],
      mouseDownEvents: [],
      profilerEvents: [],
      timerEvents: [],
      reset() {
        this.beforeInputEvents.length = 0;
        this.inputEvents.length = 0;
        this.longAnimationFrames.length = 0;
        this.longTasks.length = 0;
        this.mouseDownEvents.length = 0;
        this.profilerEvents.length = 0;
        this.timerEvents.length = 0;
      },
      snapshot() {
        return {
          beforeInputEvents: this.beforeInputEvents.slice(),
          inputEvents: this.inputEvents.slice(),
          longAnimationFrames: this.longAnimationFrames.slice(),
          longTasks: this.longTasks.slice(),
          mouseDownEvents: this.mouseDownEvents.slice(),
          profilerEvents: this.profilerEvents.slice(),
          timerEvents: this.timerEvents.slice(),
        };
      },
    };

    target.__SLATE_BROWSER_TRACE__ = trace;
    target.__SLATE_BROWSER_TRACE_OBSERVER__ = true;
    target.__SLATE_REACT_RENDER_PROFILER__ = {
      record(event) {
        trace.profilerEvents.push(event);
      },
    };
    const originalSetTimeout = target.setTimeout?.bind(target);
    const compactTimerStack = (stack) =>
      String(stack ?? '')
        .split('\n')
        .slice(2, 8)
        .map((line) => line.trim())
        .filter(Boolean);

    if (originalSetTimeout) {
      target.setTimeout = (callback, delay, ...args) => {
        if (typeof callback !== 'function') {
          return originalSetTimeout(callback, delay, ...args);
        }

        const scheduledAt = performance.now();
        const scheduledStack = compactTimerStack(
          new Error('Scheduled benchmark timer').stack
        );
        const timerDelay = Number(delay) || 0;

        return originalSetTimeout(
          function slateTraceTimerCallback(...timerArgs) {
            const startedAt = performance.now();

            try {
              return callback.apply(this, timerArgs);
            } finally {
              const endedAt = performance.now();

              trace.timerEvents.push({
                callbackName: callback.name || null,
                delay: timerDelay,
                duration: endedAt - startedAt,
                scheduledAt,
                scheduledStack,
                startedAt,
              });
            }
          },
          delay,
          ...args
        );
      };
    }
    const getInputEventTargetSnapshot = (event) => {
      const targetElement =
        event.target instanceof Element
          ? event.target
          : event.target instanceof Text
            ? event.target.parentElement
            : null;
      const targetTextHost =
        targetElement?.closest?.('[data-slate-node="text"]') ?? null;
      const selection = document.getSelection();
      const anchorElement =
        selection?.anchorNode instanceof Element
          ? selection.anchorNode
          : selection?.anchorNode instanceof Text
            ? selection.anchorNode.parentElement
            : null;
      const anchorTextHost =
        anchorElement?.closest?.('[data-slate-node="text"]') ?? null;
      const root = targetElement?.closest?.('[data-slate-editor="true"]');
      const handle = root?.__slateBrowserHandle ?? null;

      return {
        anchorOffset: selection?.anchorOffset ?? null,
        anchorPath: anchorTextHost?.getAttribute('data-slate-path') ?? null,
        anchorText: anchorTextHost?.textContent?.replace(/\uFEFF/g, '') ?? null,
        handleSelection: handle?.getSelection?.() ?? null,
        inputState: handle?.getInputState?.() ?? null,
        targetPath: targetTextHost?.getAttribute('data-slate-path') ?? null,
        targetSync: targetTextHost?.getAttribute('data-slate-dom-sync') ?? null,
        targetSyncReason:
          targetTextHost?.getAttribute('data-slate-dom-sync-reason') ?? null,
        targetText: targetTextHost?.textContent?.replace(/\uFEFF/g, '') ?? null,
      };
    };
    let pendingMouseDownEvent = null;
    target.document.addEventListener(
      'mousedown',
      (event) => {
        const mouseEvent = event instanceof MouseEvent ? event : null;
        const entry = {
          ...getInputEventTargetSnapshot(event),
          button: mouseEvent?.button ?? null,
          buttons: mouseEvent?.buttons ?? null,
          captureTime: performance.now(),
          clientX: mouseEvent?.clientX ?? null,
          clientY: mouseEvent?.clientY ?? null,
          defaultPreventedAtCapture: event.defaultPrevented,
          defaultPreventedAfterBubble: null,
          detail: mouseEvent?.detail ?? null,
          eventDispatchMs: null,
          bubbleTime: null,
        };

        pendingMouseDownEvent = entry;
        trace.mouseDownEvents.push(entry);
      },
      true
    );
    target.document.addEventListener(
      'mousedown',
      (event) => {
        const entry = pendingMouseDownEvent;
        const bubbleTime = performance.now();

        if (entry) {
          entry.bubbleTime = bubbleTime;
          entry.defaultPreventedAfterBubble = event.defaultPrevented;
          entry.eventDispatchMs = bubbleTime - entry.captureTime;
        } else {
          trace.mouseDownEvents.push({
            ...getInputEventTargetSnapshot(event),
            bubbleTime,
            captureTime: null,
            defaultPreventedAfterBubble: event.defaultPrevented,
            eventDispatchMs: null,
          });
        }

        pendingMouseDownEvent = null;
      },
      false
    );
    target.document.addEventListener(
      'beforeinput',
      (event) => {
        const inputEvent = event instanceof InputEvent ? event : null;

        trace.beforeInputEvents.push({
          ...getInputEventTargetSnapshot(event),
          data: inputEvent?.data ?? null,
          inputType: inputEvent?.inputType ?? null,
          time: performance.now(),
        });
      },
      true
    );
    target.document.addEventListener(
      'input',
      (event) => {
        const inputEvent = event instanceof InputEvent ? event : null;

        trace.inputEvents.push({
          ...getInputEventTargetSnapshot(event),
          data: inputEvent?.data ?? null,
          inputType: inputEvent?.inputType ?? null,
          time: performance.now(),
        });
      },
      true
    );

    const compactPerformanceAttribution = (entries) =>
      Array.from(entries ?? [])
        .slice(0, 8)
        .map((entry) => ({
          containerId: entry.containerId ?? null,
          containerName: entry.containerName ?? null,
          containerSrc: entry.containerSrc ?? null,
          containerType: entry.containerType ?? null,
          duration: entry.duration ?? null,
          entryType: entry.entryType ?? null,
          name: entry.name ?? null,
          startTime: entry.startTime ?? null,
        }));
    const compactLongAnimationFrameScripts = (entries) =>
      Array.from(entries ?? [])
        .slice(0, 8)
        .map((entry) => ({
          duration: entry.duration ?? null,
          executionStart: entry.executionStart ?? null,
          forcedStyleAndLayoutDuration:
            entry.forcedStyleAndLayoutDuration ?? null,
          invoker: entry.invoker ?? null,
          invokerType: entry.invokerType ?? null,
          pauseDuration: entry.pauseDuration ?? null,
          sourceCharPosition: entry.sourceCharPosition ?? null,
          sourceFunctionName: entry.sourceFunctionName ?? null,
          sourceURL: entry.sourceURL ?? null,
          startTime: entry.startTime ?? null,
          styleAndLayoutStart: entry.styleAndLayoutStart ?? null,
          windowAttribution: entry.windowAttribution ?? null,
        }));

    if ('PerformanceObserver' in target) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            trace.longTasks.push({
              attribution: compactPerformanceAttribution(entry.attribution),
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
              scripts: compactLongAnimationFrameScripts(entry.scripts),
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
    () => {
      const root = document.querySelector('[data-slate-editor="true"]');
      return !!root?.__slateBrowserHandle?.selectRange;
    },
    undefined,
    { timeout: 30_000 }
  );
};

const waitForNativeSurface = async (page) => {
  const start = await page.evaluate(() => performance.now());

  await page
    .waitForFunction(
      ({ expectedBlocks }) => {
        const root = document.querySelector('[data-slate-editor="true"]');

        if (!root) {
          return false;
        }

        const readNumber = (testId) => {
          const value = Number(
            document.querySelector(`[data-test-id="${testId}"]`)?.textContent ??
              0
          );

          return Number.isFinite(value) ? value : 0;
        };
        const effectiveStrategy = document.querySelector(
          '[data-test-id="huge-document-effective-strategy"]'
        )?.textContent;
        const mountedTopLevelCount = readNumber(
          'huge-document-mounted-top-level-count'
        );

        const bounded =
          effectiveStrategy === 'partial-dom' ||
          effectiveStrategy === 'virtualized' ||
          effectiveStrategy === 'staged';

        if (bounded) {
          return mountedTopLevelCount > 0;
        }

        return (
          root.querySelectorAll('[data-slate-node="text"]').length >=
          expectedBlocks
        );
      },
      { expectedBlocks: blocks },
      { timeout: nativeSurfaceTimeoutMs }
    )
    .then(() => true)
    .catch(() => false);

  const end = await nextPaint(page);
  const domTags = await getMemoryAndDomTags(page);
  const state = await page.evaluate(
    ({ expectedBlocks }) => {
      const root = document.querySelector('[data-slate-editor="true"]');
      const readText = (testId) =>
        document.querySelector(`[data-test-id="${testId}"]`)?.textContent ??
        null;
      const readNumber = (testId) => {
        const value = Number(readText(testId) ?? 0);

        return Number.isFinite(value) ? value : 0;
      };
      const effectiveStrategy = readText('huge-document-effective-strategy');
      const editorTextNodeCount =
        root?.querySelectorAll('[data-slate-node="text"]').length ?? 0;
      const bounded =
        effectiveStrategy === 'partial-dom' ||
        effectiveStrategy === 'virtualized' ||
        effectiveStrategy === 'staged';

      return {
        bounded,
        complete: !bounded && editorTextNodeCount >= expectedBlocks,
        editorTextNodeCount,
        effectiveStrategy,
        mountedTopLevelCount: readNumber(
          'huge-document-mounted-top-level-count'
        ),
        pendingTopLevelCount: readNumber(
          'huge-document-pending-top-level-count'
        ),
        requestedStrategy: readText('huge-document-requested-strategy'),
      };
    },
    { expectedBlocks: blocks }
  );

  return {
    bounded: state.bounded,
    complete: state.complete,
    durationMs: end - start,
    editorTextNodeCount: state.editorTextNodeCount,
    effectiveStrategy: state.effectiveStrategy,
    mountedTopLevelCount: state.mountedTopLevelCount,
    observedBlocks: domTags.editorElementCount,
    pendingTopLevelCount: state.pendingTopLevelCount,
    requestedStrategy: state.requestedStrategy,
  };
};

const resetTrace = async (page) => {
  await page.evaluate(() => {
    globalThis.__SLATE_BROWSER_TRACE__?.reset?.();
  });
};

const getTraceSnapshot = async (page) =>
  page.evaluate(() => globalThis.__SLATE_BROWSER_TRACE__?.snapshot?.() ?? null);

const getLaneDiagnostics = async (page, lane, beforeTypeState) =>
  page.evaluate(
    ({ beforeTypeState, index }) => {
      const root = document.querySelector('[data-slate-editor="true"]');
      const activeElement = document.activeElement;
      const domSelection = document.getSelection();
      const traceSnapshot =
        globalThis.__SLATE_BROWSER_TRACE__?.snapshot?.() ?? null;
      const truncateText = (value) =>
        typeof value === 'string' && value.length > 160
          ? `${value.slice(0, 157)}...`
          : value;
      const compactOperation = (operation) => ({
        newProperties: operation.newProperties ?? undefined,
        offset: operation.offset ?? undefined,
        path: operation.path ?? undefined,
        properties: operation.properties ?? undefined,
        root: operation.root ?? undefined,
        text: truncateText(operation.text),
        type: operation.type,
      });
      const compactKernelTraceEntry = (entry) => ({
        command: entry.command ?? null,
        eventFamily: entry.eventFamily ?? null,
        intent: entry.intent ?? null,
        lastOperations: Array.isArray(entry.operations)
          ? entry.operations.slice(-5).map(compactOperation)
          : [],
        movement: entry.movement ?? null,
        nativeAllowed: entry.nativeAllowed ?? null,
        operationsCount: Array.isArray(entry.operations)
          ? entry.operations.length
          : 0,
        ownership: entry.ownership ?? null,
        repairPolicy: entry.repairPolicy ?? null,
        selectionAfter: entry.selectionAfter ?? null,
        selectionBefore: entry.selectionBefore ?? null,
        selectionChangeOrigin: entry.selectionChangeOrigin ?? null,
        selectionPolicy: entry.selectionPolicy ?? null,
        selectionSource: entry.selectionSource ?? null,
        stateAfter: entry.stateAfter ?? null,
        stateBefore: entry.stateBefore ?? null,
        targetOwner: entry.targetOwner ?? null,
      });
      const compactDOMEvent = (event) => ({
        ...event,
        anchorText: truncateText(event.anchorText),
        targetText: truncateText(event.targetText),
      });
      const block = root
        ?.querySelector(
          `[data-slate-node="text"][data-slate-path="${index},0"]`
        )
        ?.closest('[data-slate-node="element"]');
      const selectedText =
        domSelection?.anchorNode?.parentElement?.closest(
          '[data-slate-node="element"]'
        )?.textContent ?? null;

      return {
        activeElementTag: activeElement?.tagName ?? null,
        blockText: block?.textContent?.replace(/\uFEFF/g, '') ?? null,
        domAnchorText: domSelection?.anchorNode?.textContent ?? null,
        domSelectionText: selectedText?.replace(/\uFEFF/g, '') ?? null,
        beforeInputTrace:
          root?.__slateBrowserHandle
            ?.getKernelTrace?.()
            .filter?.((entry) => entry.eventFamily === 'beforeinput')
            .slice(-8)
            .map(compactKernelTraceEntry) ?? null,
        beforeTypeState,
        handleSelection: root?.__slateBrowserHandle?.getSelection?.() ?? null,
        inputState: root?.__slateBrowserHandle?.getInputState?.() ?? null,
        beforeInputEvents:
          traceSnapshot?.beforeInputEvents?.slice(-12).map(compactDOMEvent) ??
          null,
        inputEvents:
          traceSnapshot?.inputEvents?.slice(-12).map(compactDOMEvent) ?? null,
        kernelTrace:
          root?.__slateBrowserHandle
            ?.getKernelTrace?.()
            .slice(-12)
            .map(compactKernelTraceEntry) ?? null,
        profilerEvents: traceSnapshot?.profilerEvents?.slice(-20) ?? null,
      };
    },
    { beforeTypeState, index: lane.blockIndex }
  );

const summarizeProfilerEvents = (events = []) => {
  const buckets = new Map();
  const requiredBucketKeys = new Set([
    'selector:selector-dispatch-checks',
    'selector:selector-dispatch-notifies',
    'selector:selector-dispatch-subscriptions',
  ]);
  let selectorCheckCount = 0;
  let selectorNotifyCount = 0;
  let selectorSubscriptionCount = 0;

  for (const event of events) {
    const key = event.id ? `${event.kind}:${event.id}` : event.kind;
    const current = buckets.get(key) ?? {
      count: 0,
      durationMs: 0,
    };

    if (event.kind === 'selector' && typeof event.id === 'string') {
      if (event.id.endsWith('-check')) {
        selectorCheckCount += 1;
      } else if (event.id.endsWith('-notify')) {
        selectorNotifyCount += 1;
      } else if (event.id.startsWith('selector-subscription-')) {
        selectorSubscriptionCount += 1;
      }
    }

    current.count += 1;
    current.durationMs +=
      typeof event.duration === 'number' && Number.isFinite(event.duration)
        ? event.duration
        : 0;
    buckets.set(key, current);
  }

  buckets.set('selector:selector-dispatch-checks', {
    count: selectorCheckCount,
    durationMs: 0,
  });
  buckets.set('selector:selector-dispatch-notifies', {
    count: selectorNotifyCount,
    durationMs: 0,
  });
  buckets.set('selector:selector-dispatch-subscriptions', {
    count: selectorSubscriptionCount,
    durationMs: 0,
  });

  const sortedBuckets = [...buckets.entries()].sort(
    ([leftKey, left], [rightKey, right]) =>
      right.durationMs - left.durationMs ||
      right.count - left.count ||
      leftKey.localeCompare(rightKey)
  );

  const retainedBuckets = new Map(sortedBuckets.slice(0, 20));

  for (const [key, value] of sortedBuckets) {
    if (requiredBucketKeys.has(key)) {
      retainedBuckets.set(key, value);
    }
  }

  return Object.fromEntries(retainedBuckets);
};

const summarizeTraceEvents = (events = []) => {
  const finiteTimes = events
    .map((event) => event.time)
    .filter((time) => Number.isFinite(time));
  const firstTime = finiteTimes[0] ?? 0;
  const gaps = [];

  for (let index = 1; index < finiteTimes.length; index++) {
    gaps.push(finiteTimes[index] - finiteTimes[index - 1]);
  }

  const sortedGaps = [...gaps].sort((left, right) => left - right);
  const p95Gap =
    sortedGaps.length > 0
      ? sortedGaps[
          Math.min(
            sortedGaps.length - 1,
            Math.ceil(sortedGaps.length * 0.95) - 1
          )
        ]
      : 0;
  const inputTypes = {};
  const syncReasons = {};

  for (const event of events) {
    if (event.inputType) {
      inputTypes[event.inputType] = (inputTypes[event.inputType] ?? 0) + 1;
    }
    if (event.targetSyncReason) {
      syncReasons[event.targetSyncReason] =
        (syncReasons[event.targetSyncReason] ?? 0) + 1;
    }
  }

  return {
    count: events.length,
    firstInputType: events[0]?.inputType ?? null,
    gapsMs: gaps.slice(-32).map((gap) => round(gap)),
    inputTypes,
    lastInputType: events.at(-1)?.inputType ?? null,
    maxGapMs: Math.max(0, ...gaps),
    p95GapMs: p95Gap,
    spanMs: finiteTimes.length > 1 ? finiteTimes.at(-1) - finiteTimes[0] : 0,
    syncReasons,
    timeline: events.slice(-32).map((event, index) => ({
      anchorOffset: event.anchorOffset ?? null,
      anchorPath: event.anchorPath ?? null,
      data: event.data ?? null,
      index,
      inputType: event.inputType ?? null,
      inputSelectionSource: event.inputState?.selectionSource ?? null,
      inputSelectionPreferenceReason:
        event.inputState?.modelSelectionPreference?.reason ?? null,
      modelOwnedTextInputGuard:
        event.inputState?.modelOwnedTextInputGuard ?? null,
      pendingNativeTextInputRepairOffset:
        event.inputState?.pendingNativeTextInputRepairOffset ?? null,
      pendingNativeTextInputRepairPathKey:
        event.inputState?.pendingNativeTextInputRepairPathKey ?? null,
      preferModelSelection: event.inputState?.preferModelSelection ?? null,
      targetPath: event.targetPath ?? null,
      targetSyncReason: event.targetSyncReason ?? null,
      timeFromFirstMs:
        Number.isFinite(event.time) && Number.isFinite(firstTime)
          ? round(event.time - firstTime)
          : null,
    })),
  };
};

const summarizeTimerEvents = (events = []) => {
  const buckets = new Map();

  for (const event of events) {
    const topStackFrame = event.scheduledStack?.[0] ?? null;
    const key = [
      `delay=${event.delay ?? 0}`,
      event.callbackName || 'anonymous',
      topStackFrame,
    ]
      .filter(Boolean)
      .join('|');
    const current = buckets.get(key) ?? {
      count: 0,
      durationMs: 0,
      key,
      maxDurationMs: 0,
    };
    const duration = Number.isFinite(event.duration) ? event.duration : 0;

    current.count += 1;
    current.durationMs += duration;
    current.maxDurationMs = Math.max(current.maxDurationMs, duration);
    buckets.set(key, current);
  }

  return Array.from(buckets.values())
    .sort((left, right) => right.durationMs - left.durationMs)
    .slice(0, 20)
    .map((event) => ({
      ...event,
      durationMs: round(event.durationMs),
      maxDurationMs: round(event.maxDurationMs),
    }));
};

const summarizeAttributionEntries = (entries, readParts) => {
  const buckets = new Map();

  for (const entry of entries) {
    for (const attribution of readParts(entry)) {
      const keyParts = [
        attribution.entryType,
        attribution.name,
        attribution.containerType,
        attribution.invokerType,
        attribution.invoker,
        attribution.sourceFunctionName,
        attribution.sourceURL,
      ].filter((part) => part != null && part !== '');
      const key = keyParts.length > 0 ? keyParts.join('|') : 'unknown';
      const current = buckets.get(key) ?? {
        count: 0,
        durationMs: 0,
        forcedStyleAndLayoutDurationMs: 0,
        key,
      };

      current.count += 1;
      current.durationMs += Number.isFinite(attribution.duration)
        ? attribution.duration
        : 0;
      current.forcedStyleAndLayoutDurationMs += Number.isFinite(
        attribution.forcedStyleAndLayoutDuration
      )
        ? attribution.forcedStyleAndLayoutDuration
        : 0;
      buckets.set(key, current);
    }
  }

  return Array.from(buckets.values())
    .sort((left, right) => right.durationMs - left.durationMs)
    .slice(0, 12)
    .map((bucket) => ({
      ...bucket,
      durationMs: round(bucket.durationMs),
      forcedStyleAndLayoutDurationMs: round(
        bucket.forcedStyleAndLayoutDurationMs
      ),
    }));
};

const summarizeAttributionTotals = (entries, readParts) => {
  let attributionCount = 0;
  let durationMs = 0;
  let forcedStyleAndLayoutDurationMs = 0;

  for (const entry of entries) {
    for (const attribution of readParts(entry) ?? []) {
      attributionCount += 1;
      durationMs += Number.isFinite(attribution.duration)
        ? attribution.duration
        : 0;
      forcedStyleAndLayoutDurationMs += Number.isFinite(
        attribution.forcedStyleAndLayoutDuration
      )
        ? attribution.forcedStyleAndLayoutDuration
        : 0;
    }
  }

  return {
    attributionCount,
    durationMs: round(durationMs),
    forcedStyleAndLayoutDurationMs: round(forcedStyleAndLayoutDurationMs),
  };
};

const summarizeLongTaskAttributionTotals = (entries) => {
  const totalDurationMs = entries.reduce(
    (total, entry) =>
      total + (Number.isFinite(entry.duration) ? entry.duration : 0),
    0
  );
  const attributionTotals = summarizeAttributionTotals(
    entries,
    (entry) => entry.attribution ?? []
  );
  const attributedDurationMs = Math.min(
    totalDurationMs,
    attributionTotals.durationMs
  );
  const unattributedDurationMs = Math.max(
    0,
    totalDurationMs - attributedDurationMs
  );
  let attributionClaimWidth = 'attributed';

  if (totalDurationMs === 0) {
    attributionClaimWidth = 'none';
  } else if (attributedDurationMs === 0) {
    attributionClaimWidth = 'unattributed';
  } else if (unattributedDurationMs > 0) {
    attributionClaimWidth = 'partial';
  }

  return {
    longTaskAttributionClaimWidth: attributionClaimWidth,
    longTaskAttributionEntryCount: attributionTotals.attributionCount,
    longTaskAttributedDurationMs: round(attributedDurationMs),
    longTaskUnattributedDurationMs: round(unattributedDurationMs),
  };
};

const readBlockText = async (page, blockIndex) =>
  page.evaluate((index) => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const textElement = root?.querySelector(
      `[data-slate-node="text"][data-slate-path="${index},0"]`
    );
    const block = textElement?.closest('[data-slate-node="element"]');

    return (block ?? textElement)?.textContent?.replace(/\uFEFF/g, '') ?? null;
  }, blockIndex);

const readModelBlockText = async (page, blockIndex) =>
  page.evaluate((index) => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const getBlockText = root?.__slateBrowserHandle?.getBlockText;

    return typeof getBlockText === 'function' ? getBlockText(index) : null;
  }, blockIndex);

const waitForModelBlockText = async (
  page,
  blockIndex,
  expectedText,
  context
) => {
  await page
    .waitForFunction(
      ({ expectedText, index }) => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const getBlockText = root?.__slateBrowserHandle?.getBlockText;

        return (
          typeof getBlockText === 'function' &&
          getBlockText(index) === expectedText
        );
      },
      { expectedText, index: blockIndex },
      { timeout: 10_000 }
    )
    .catch(async (error) => {
      const modelText = await readModelBlockText(page, blockIndex);

      throw new Error(
        `Model typing assertion timed out for ${context.surfaceKey}/${context.laneKey}/iteration-${context.iteration} at block ${blockIndex}: expected=${JSON.stringify(expectedText)} actual=${JSON.stringify(modelText)}; ${error.message}`
      );
    });

  return page.evaluate(() => performance.now());
};

const getBrowserShortcut = async (page, shortcut) =>
  page.evaluate((shortcut) => {
    const isMac = navigator.userAgent.includes('Mac OS X');

    if (shortcut === 'selectAll') {
      return isMac ? 'Meta+A' : 'Control+A';
    }

    if (shortcut === 'undo') {
      return isMac ? 'Meta+Z' : 'Control+Z';
    }

    throw new Error(`Unknown shortcut: ${shortcut}`);
  }, shortcut);

const waitForSelection = async (page, expected, context, timeout = 10_000) => {
  await page
    .waitForFunction(
      ({ expected }) => {
        const pointsEqual = (left, right) =>
          !!left &&
          !!right &&
          left.offset === right.offset &&
          left.path.length === right.path.length &&
          left.path.every((part, index) => part === right.path[index]);
        const root = document.querySelector('[data-slate-editor="true"]');
        const selection = root?.__slateBrowserHandle?.getSelection?.() ?? null;

        return (
          !!selection &&
          pointsEqual(selection.anchor, expected.anchor) &&
          pointsEqual(selection.focus, expected.focus)
        );
      },
      { expected },
      { timeout }
    )
    .catch(async (error) => {
      const selection = await page.evaluate(() => {
        const root = document.querySelector('[data-slate-editor="true"]');

        return root?.__slateBrowserHandle?.getSelection?.() ?? null;
      });

      throw new Error(
        `Selection assertion timed out for ${context}: expected=${JSON.stringify(expected)} actual=${JSON.stringify(selection)}; ${error.message}`
      );
    });
};

const waitForCollapsedEmptyDocument = async (
  page,
  context,
  timeout = 10_000
) => {
  await page
    .waitForFunction(
      () => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const handle = root?.__slateBrowserHandle;
        const selection = handle?.getSelection?.() ?? null;

        return (
          handle?.getBlockText?.(0) === '' &&
          handle?.getBlockText?.(1) === null &&
          selection?.anchor.path[0] === 0 &&
          selection?.anchor.path[1] === 0 &&
          selection?.anchor.offset === 0 &&
          selection?.focus.path[0] === 0 &&
          selection?.focus.path[1] === 0 &&
          selection?.focus.offset === 0
        );
      },
      undefined,
      { timeout }
    )
    .catch(async (error) => {
      const diagnostics = await page.evaluate(() => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const handle = root?.__slateBrowserHandle;

        return {
          first: handle?.getBlockText?.(0) ?? null,
          second: handle?.getBlockText?.(1) ?? null,
          selection: handle?.getSelection?.() ?? null,
        };
      });

      throw new Error(
        `Collapsed empty document assertion timed out for ${context}: diagnostics=${JSON.stringify(diagnostics)}; ${error.message}`
      );
    });
};

const waitForDocumentBoundaryRestore = async (
  page,
  expected,
  context,
  timeout = 30_000
) => {
  await page
    .waitForFunction(
      ({ expected }) => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const handle = root?.__slateBrowserHandle;
        const selection = handle?.getSelection?.() ?? null;

        return (
          handle?.getBlockText?.(0) === expected.firstText &&
          handle?.getBlockText?.(expected.lastIndex) === expected.lastText &&
          selection?.anchor.path[0] === 0 &&
          selection?.anchor.path[1] === 0 &&
          selection?.anchor.offset === 0 &&
          selection?.focus.path[0] === expected.lastIndex &&
          selection?.focus.path[1] === 0 &&
          selection?.focus.offset === expected.lastText.length
        );
      },
      { expected },
      { timeout }
    )
    .catch(async (error) => {
      const diagnostics = await page.evaluate((lastIndex) => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const handle = root?.__slateBrowserHandle;

        return {
          first: handle?.getBlockText?.(0) ?? null,
          last: handle?.getBlockText?.(lastIndex) ?? null,
          selection: handle?.getSelection?.() ?? null,
        };
      }, expected.lastIndex);

      throw new Error(
        `Document boundary restore timed out for ${context}: diagnostics=${JSON.stringify(diagnostics)}; ${error.message}`
      );
    });
};

const readDocumentBoundaryDiagnostics = async (page, lastIndex) =>
  page.evaluate((lastIndex) => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const handle = root?.__slateBrowserHandle;
    const truncateText = (value) =>
      typeof value === 'string' && value.length > 160
        ? `${value.slice(0, 157)}...`
        : value;
    const compactOperation = (operation) => ({
      offset: operation?.offset ?? undefined,
      path: operation?.path ?? undefined,
      root: operation?.root ?? undefined,
      text: truncateText(operation?.text),
      type: operation?.type,
    });
    const compactKernelTraceEntry = (entry) => ({
      command: entry.command ?? null,
      eventFamily: entry.eventFamily ?? null,
      intent: entry.intent ?? null,
      lastOperations: Array.isArray(entry.operations)
        ? entry.operations.slice(-3).map(compactOperation)
        : [],
      operationsCount: Array.isArray(entry.operations)
        ? entry.operations.length
        : 0,
      ownership: entry.ownership ?? null,
      selectionAfter: entry.selectionAfter ?? null,
      selectionBefore: entry.selectionBefore ?? null,
      selectionChangeOrigin: entry.selectionChangeOrigin ?? null,
      selectionSource: entry.selectionSource ?? null,
      stateAfter: entry.stateAfter ?? null,
      stateBefore: entry.stateBefore ?? null,
      targetOwner: entry.targetOwner ?? null,
    });
    const compactHistoryBatch = (batch) => {
      const operations = Array.isArray(batch?.operations)
        ? batch.operations
        : [];
      const operationTypes = {};

      for (const operation of operations) {
        operationTypes[operation?.type] =
          (operationTypes[operation?.type] ?? 0) + 1;
      }

      return {
        firstOperation: operations[0] ?? null,
        lastOperation: operations.at(-1) ?? null,
        operationCount: operations.length,
        operationTypes,
        selectionBefore: batch?.selectionBefore ?? null,
        statePatchCount: batch?.statePatchCount ?? 0,
      };
    };
    const compactHistory = (history) =>
      history
        ? {
            redos: Array.isArray(history.redos)
              ? history.redos.map(compactHistoryBatch)
              : [],
            undos: Array.isArray(history.undos)
              ? history.undos.map(compactHistoryBatch)
              : [],
          }
        : null;

    return {
      activeElementId: document.activeElement?.id ?? null,
      activeElementTag: document.activeElement?.tagName ?? null,
      first: handle?.getBlockText?.(0) ?? null,
      history: compactHistory(handle?.getHistory?.() ?? null),
      inputState: handle?.getInputState?.() ?? null,
      kernelTrace:
        handle?.getKernelTrace?.().slice(-8).map(compactKernelTraceEntry) ??
        null,
      last: handle?.getBlockText?.(lastIndex) ?? null,
      second: handle?.getBlockText?.(1) ?? null,
      selection: handle?.getSelection?.() ?? null,
    };
  }, lastIndex);

const measureKeyboardPress = async (page, key) => {
  const startedAt = await page.evaluate(() => performance.now());

  await page.keyboard.press(key);

  const endedAt = await page.evaluate(() => performance.now());

  return {
    dispatchMs: endedAt - startedAt,
    endedAt,
    startedAt,
  };
};

const measureHandleUndoRestore = async (page, expected, context) => {
  const startedAt = await page.evaluate(() => performance.now());

  await page.evaluate(() => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const handle = root?.__slateBrowserHandle;

    if (!handle?.undo) {
      throw new Error('Missing Slate browser undo handle');
    }

    handle.undo();
  });

  let restored = 1;
  let diagnostics = null;

  try {
    await waitForDocumentBoundaryRestore(page, expected, context, 15_000);
  } catch (error) {
    restored = 0;
    diagnostics = {
      message: error instanceof Error ? error.message : String(error),
      state: await readDocumentBoundaryDiagnostics(page, expected.lastIndex),
    };
  }

  const readyTime = await page.evaluate(() => performance.now());
  const paintTime = await nextPaint(page);

  return {
    diagnostics,
    readyMs: readyTime - startedAt,
    restored,
    toPaintMs: paintTime - startedAt,
  };
};

const summarizeTracePhase = async (page) => {
  const trace = await getTraceSnapshot(page);
  const profilerEvents = trace?.profilerEvents ?? [];
  const longTasks = trace?.longTasks ?? [];
  const profilerDurationMs = profilerEvents.reduce(
    (total, event) =>
      total +
      (typeof event.duration === 'number' && Number.isFinite(event.duration)
        ? event.duration
        : 0),
    0
  );
  const durations = {
    longAnimationFrameDurationMs: (trace?.longAnimationFrames ?? []).reduce(
      (total, entry) => total + entry.duration,
      0
    ),
    longAnimationFrameMaxMs: Math.max(
      0,
      ...(trace?.longAnimationFrames ?? []).map((entry) => entry.duration)
    ),
    longTaskDurationMs: longTasks.reduce(
      (total, entry) => total + entry.duration,
      0
    ),
    longTaskMaxMs: Math.max(0, ...longTasks.map((entry) => entry.duration)),
  };
  const longTaskAttributionTotals =
    summarizeLongTaskAttributionTotals(longTasks);

  return {
    beforeInputCount: trace?.beforeInputEvents?.length ?? 0,
    beforeInputEvents: summarizeTraceEvents(trace?.beforeInputEvents ?? []),
    inputCount: trace?.inputEvents?.length ?? 0,
    inputEvents: summarizeTraceEvents(trace?.inputEvents ?? []),
    longAnimationFrameAttribution: summarizeAttributionEntries(
      trace?.longAnimationFrames ?? [],
      (entry) => entry.scripts ?? []
    ),
    longAnimationFrameCount: trace?.longAnimationFrames?.length ?? 0,
    longTaskAttribution: summarizeAttributionEntries(
      longTasks,
      (entry) => entry.attribution ?? []
    ),
    longTaskCount: longTasks.length,
    mouseDownCount: trace?.mouseDownEvents?.length ?? 0,
    profiler: summarizeProfilerEvents(trace?.profilerEvents),
    profilerEventCount: trace?.profilerEvents?.length ?? 0,
    profilerDurationMs,
    timerDurationMs: round(
      (trace?.timerEvents ?? []).reduce(
        (total, event) =>
          total +
          (typeof event.duration === 'number' && Number.isFinite(event.duration)
            ? event.duration
            : 0),
        0
      )
    ),
    timerEventCount: trace?.timerEvents?.length ?? 0,
    timers: summarizeTimerEvents(trace?.timerEvents ?? []),
    ...longTaskAttributionTotals,
    ...durations,
  };
};

const measureSelectAllDeleteFlow = async (page, surfaceKey) => {
  await resetTrace(page);

  const firstText = await readModelBlockText(page, 0);
  const lastIndex = blocks - 1;
  const lastText = await readModelBlockText(page, lastIndex);

  if (typeof firstText !== 'string' || typeof lastText !== 'string') {
    throw new Error(
      `Select-all/delete setup failed for ${surfaceKey}: first=${JSON.stringify(firstText)} last=${JSON.stringify(lastText)}`
    );
  }

  const selectAllKey = await getBrowserShortcut(page, 'selectAll');
  const undoKey = await getBrowserShortcut(page, 'undo');
  const phaseDiagnostics = {};
  const phaseTraces = {};
  const capturePhase = async (phase) => {
    phaseDiagnostics[phase] = await readDocumentBoundaryDiagnostics(
      page,
      lastIndex
    );
  };
  const captureTracePhase = async (phase) => {
    phaseTraces[phase] = await summarizeTracePhase(page);
  };
  await resetTrace(page);
  const selectAll = await measureKeyboardPress(page, selectAllKey);
  const expectedSelection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [lastIndex, 0], offset: lastText.length },
  };

  await waitForSelection(
    page,
    expectedSelection,
    `${surfaceKey}/select-all`,
    15_000
  );
  const selectAllReadyTime = await page.evaluate(() => performance.now());
  const selectAllPaintTime = await nextPaint(page);
  const afterSelectAllMemory = await getMemoryAndDomTags(page);
  await capturePhase('afterSelectAll');
  await captureTracePhase('selectAll');
  await resetTrace(page);
  const deletePress = await measureKeyboardPress(page, 'Delete');

  await waitForCollapsedEmptyDocument(page, `${surfaceKey}/delete`, 20_000);
  const deleteReadyTime = await page.evaluate(() => performance.now());
  const deletePaintTime = await nextPaint(page);
  const afterDeleteMemory = await getMemoryAndDomTags(page);
  await capturePhase('afterDelete');
  await captureTracePhase('delete');
  const typeText = selectAllDeleteTypeText;
  await resetTrace(page);
  const typeStart = await page.evaluate(() => performance.now());

  if (selectAllDeleteInputMode === 'insertText') {
    await page.keyboard.insertText(typeText);
  } else {
    await page.keyboard.type(typeText, { delay: 0 });
  }

  const typeDispatchTime = await page.evaluate(() => performance.now());
  await waitForModelBlockText(page, 0, typeText, {
    iteration: 'select-all-delete',
    laneKey: 'type-after-delete',
    surfaceKey,
  });
  const typeReadyTime = await page.evaluate(() => performance.now());
  const typePaintTime = await nextPaint(page);
  await capturePhase('afterTypeAfterDelete');
  await captureTracePhase('typeAfterDelete');
  await resetTrace(page);
  const undoType = await measureKeyboardPress(page, undoKey);

  await waitForCollapsedEmptyDocument(page, `${surfaceKey}/undo-type`, 20_000);
  const undoTypeReadyTime = await page.evaluate(() => performance.now());
  const undoTypePaintTime = await nextPaint(page);
  await capturePhase('afterUndoType');
  await captureTracePhase('undoType');
  await resetTrace(page);
  const undoDelete = await measureKeyboardPress(page, undoKey);
  let undoDeleteRestored = 1;
  let undoDeleteDiagnostics = null;
  let handleUndoAfterKeyboardFailure = null;

  try {
    await waitForDocumentBoundaryRestore(
      page,
      { firstText, lastIndex, lastText },
      `${surfaceKey}/undo-delete`,
      45_000
    );
  } catch (error) {
    if (!selectAllDeleteAllowFailure) {
      throw error;
    }

    undoDeleteRestored = 0;
    undoDeleteDiagnostics = {
      message: error instanceof Error ? error.message : String(error),
      state: await readDocumentBoundaryDiagnostics(page, lastIndex),
    };
    handleUndoAfterKeyboardFailure = await measureHandleUndoRestore(
      page,
      { firstText, lastIndex, lastText },
      `${surfaceKey}/handle-undo-after-keyboard-failure`
    );
  }
  const undoDeleteReadyTime = await page.evaluate(() => performance.now());
  const undoDeletePaintTime = await nextPaint(page);
  const afterUndoDeleteMemory = await getMemoryAndDomTags(page);
  await capturePhase('afterUndoDelete');
  await captureTracePhase('undoDelete');

  return {
    afterDeleteDomNodes: afterDeleteMemory.domNodeCount,
    afterDeleteHeapMB: afterDeleteMemory.jsHeapUsedMB,
    afterSelectAllDomNodes: afterSelectAllMemory.domNodeCount,
    afterSelectAllHeapMB: afterSelectAllMemory.jsHeapUsedMB,
    afterUndoDeleteDomNodes: afterUndoDeleteMemory.domNodeCount,
    afterUndoDeleteHeapMB: afterUndoDeleteMemory.jsHeapUsedMB,
    deleteDispatchMs: deletePress.dispatchMs,
    deleteReadyMs: deleteReadyTime - deletePress.startedAt,
    deleteToPaintMs: deletePaintTime - deletePress.startedAt,
    selectAllDispatchMs: selectAll.dispatchMs,
    selectAllReadyMs: selectAllReadyTime - selectAll.startedAt,
    selectAllToPaintMs: selectAllPaintTime - selectAll.startedAt,
    phaseDiagnostics,
    phaseTraces,
    typeAfterDeleteDispatchMs: typeDispatchTime - typeStart,
    typeAfterDeleteInputMode: selectAllDeleteInputMode,
    typeAfterDeleteReadyMs: typeReadyTime - typeStart,
    typeAfterDeleteToPaintMs: typePaintTime - typeStart,
    typeAfterDeleteWaitForModelMs: typeReadyTime - typeDispatchTime,
    undoDeleteDispatchMs: undoDelete.dispatchMs,
    undoDeleteRestored,
    undoDeleteDiagnostics,
    undoDeleteReadyMs: undoDeleteReadyTime - undoDelete.startedAt,
    undoDeleteToPaintMs: undoDeletePaintTime - undoDelete.startedAt,
    handleUndoAfterKeyboardFailure,
    undoTypeDispatchMs: undoType.dispatchMs,
    undoTypeReadyMs: undoTypeReadyTime - undoType.startedAt,
    undoTypeToPaintMs: undoTypePaintTime - undoType.startedAt,
  };
};

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

const getScrollParentSnapshot = async (page) =>
  page.evaluate(() => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const scrollParent = root
      ? Array.from(document.querySelectorAll('*')).find(
          (element) =>
            element instanceof HTMLElement &&
            element.contains(root) &&
            element.scrollHeight > element.clientHeight
        )
      : null;

    return scrollParent instanceof HTMLElement
      ? {
          clientHeight: scrollParent.clientHeight,
          scrollHeight: scrollParent.scrollHeight,
          scrollTop: scrollParent.scrollTop,
          tagName: scrollParent.tagName,
        }
      : null;
  });

const requestCollapsedSelection = async (page, blockIndex, offset) =>
  page.evaluate(
    ({ index, offset }) => {
      const root = document.querySelector('[data-slate-editor="true"]');

      if (!(root instanceof HTMLElement)) {
        throw new Error('Missing Slate editor root');
      }

      const handle = root.__slateBrowserHandle;
      const selection = {
        anchor: { path: [index, 0], offset },
        focus: { path: [index, 0], offset },
      };

      if (!handle?.selectRange) {
        throw new Error('Missing Slate browser selectRange handle');
      }

      handle.selectRange(selection);
      root.focus();
    },
    { index: blockIndex, offset }
  );

const getMaterializationDiagnostics = async (page, blockIndex) =>
  page.evaluate((index) => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const virtualizer = root?.querySelector(
      '[data-slate-dom-strategy-virtualizer="true"]'
    );
    const scrollParent = root
      ? Array.from(document.querySelectorAll('*')).find(
          (element) =>
            element instanceof HTMLElement &&
            element.contains(root) &&
            element.scrollHeight > element.clientHeight
        )
      : null;
    const textElements = Array.from(
      root?.querySelectorAll('[data-slate-node="text"]') ?? []
    );

    return {
      exactPathExists: !!root?.querySelector(
        `[data-slate-node="text"][data-slate-path="${index},0"]`
      ),
      handleInputState: root?.__slateBrowserHandle?.getInputState?.() ?? null,
      handleSelection: root?.__slateBrowserHandle?.getSelection?.() ?? null,
      hasHandle: !!root?.__slateBrowserHandle,
      hasScrollPathIntoView:
        typeof root?.__slateBrowserHandle?.scrollPathIntoView === 'function',
      mountedTextPaths: textElements
        .slice(0, 20)
        .map((element) => element.getAttribute('data-slate-path')),
      requestedIndex: index,
      rootTextCount: textElements.length,
      scrollParent:
        scrollParent instanceof HTMLElement
          ? {
              clientHeight: scrollParent.clientHeight,
              scrollHeight: scrollParent.scrollHeight,
              scrollTop: scrollParent.scrollTop,
              tagName: scrollParent.tagName,
            }
          : null,
      virtualizerHeight:
        virtualizer instanceof HTMLElement ? virtualizer.offsetHeight : null,
    };
  }, blockIndex);

const waitForMaterializedText = async (page, blockIndex, context) => {
  const start = Date.now();
  const startTime = await page.evaluate(() => performance.now());
  const scrollBefore = await getScrollParentSnapshot(page);
  let frameCount = 0;

  while (Date.now() - start <= materializationTimeoutMs) {
    const materialized = await page.evaluate((index) => {
      const root = document.querySelector('[data-slate-editor="true"]');
      const isMaterialized = !!root?.querySelector(
        `[data-slate-node="text"][data-slate-path="${index},0"]`
      );

      if (!isMaterialized) {
        root?.__slateBrowserHandle?.scrollPathIntoView?.([index, 0], 'center');
      }

      return isMaterialized;
    }, blockIndex);

    if (materialized) {
      const endTime = await page.evaluate(() => performance.now());
      const scrollAfter = await getScrollParentSnapshot(page);
      const scrollTopDelta =
        scrollBefore && scrollAfter
          ? Math.abs(scrollAfter.scrollTop - scrollBefore.scrollTop)
          : null;

      return {
        durationMs: endTime - startTime,
        frameCount,
        scrollAfter,
        scrollBefore,
        scrollTopDelta,
      };
    }

    await nextPaint(page);
    frameCount += 1;
  }

  const diagnostics = await getMaterializationDiagnostics(page, blockIndex);

  throw new Error(
    `Text materialization timed out for ${context.surfaceKey}/${context.laneKey}/iteration-${context.iteration} at block ${blockIndex}; diagnostics=${JSON.stringify(diagnostics)}`
  );
};

const syncDOMSelection = async (page, blockIndex, offset) =>
  page.evaluate(
    ({ index, offset }) => {
      const root = document.querySelector('[data-slate-editor="true"]');

      if (!(root instanceof HTMLElement)) {
        throw new Error('Missing Slate editor root');
      }

      const textElement = root.querySelector(
        `[data-slate-node="text"][data-slate-path="${index},0"]`
      );

      if (!textElement) {
        throw new Error(`Missing DOM text node for block ${index}`);
      }

      const walker = document.createTreeWalker(
        textElement,
        NodeFilter.SHOW_TEXT
      );
      const textNode = walker.nextNode();

      if (!textNode) {
        throw new Error(`Missing DOM text leaf for block ${index}`);
      }

      const range = document.createRange();
      const domSelection = document.getSelection();

      root.focus();
      range.setStart(textNode, offset);
      range.collapse(true);
      domSelection?.removeAllRanges();
      domSelection?.addRange(range);
      document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
      root.__slateBrowserHandle?.importDOMSelection?.();
    },
    { index: blockIndex, offset }
  );

const getDOMSelectionPathDiagnostics = async (page, blockIndex, offset) =>
  page.evaluate(
    ({ index, offset }) => {
      const root = document.querySelector('[data-slate-editor="true"]');
      const selection = document.getSelection();
      const textElements = Array.from(
        root?.querySelectorAll('[data-slate-node="text"]') ?? []
      );
      const getClosestTextElement = (node) =>
        node instanceof Element
          ? node.closest('[data-slate-node="text"]')
          : node?.parentElement?.closest('[data-slate-node="text"]');
      const anchorTextElement = getClosestTextElement(selection?.anchorNode);
      const focusTextElement = getClosestTextElement(selection?.focusNode);
      const activeElement = document.activeElement;
      const scrollParent = root
        ? Array.from(document.querySelectorAll('*')).find(
            (element) =>
              element instanceof HTMLElement &&
              element.contains(root) &&
              element.scrollHeight > element.clientHeight
          )
        : null;
      const targetElement = root?.querySelector(
        `[data-slate-node="text"][data-slate-path="${index},0"]`
      );

      return {
        activeElement:
          activeElement instanceof HTMLElement
            ? {
                ariaLabel: activeElement.getAttribute('aria-label'),
                contentEditable: activeElement.contentEditable,
                dataSlateEditor:
                  activeElement.getAttribute('data-slate-editor'),
                tagName: activeElement.tagName,
              }
            : null,
        anchorOffset: selection?.anchorOffset ?? null,
        anchorTextPath:
          anchorTextElement?.getAttribute('data-slate-path') ?? null,
        exactPathExists: !!targetElement,
        focusOffset: selection?.focusOffset ?? null,
        focusTextPath:
          focusTextElement?.getAttribute('data-slate-path') ?? null,
        handleInputState: root?.__slateBrowserHandle?.getInputState?.() ?? null,
        handleSelection: root?.__slateBrowserHandle?.getSelection?.() ?? null,
        mountedTextPaths: textElements
          .slice(0, 30)
          .map((element) => element.getAttribute('data-slate-path')),
        nativeText: selection?.toString() ?? null,
        requestedOffset: offset,
        requestedPath: `${index},0`,
        rootTextCount: textElements.length,
        scrollParent:
          scrollParent instanceof HTMLElement
            ? {
                clientHeight: scrollParent.clientHeight,
                scrollHeight: scrollParent.scrollHeight,
                scrollTop: scrollParent.scrollTop,
                tagName: scrollParent.tagName,
              }
            : null,
        selectionRangeCount: selection?.rangeCount ?? 0,
        targetRect:
          targetElement instanceof HTMLElement
            ? {
                bottom: targetElement.getBoundingClientRect().bottom,
                top: targetElement.getBoundingClientRect().top,
              }
            : null,
      };
    },
    { index: blockIndex, offset }
  );

const waitForDOMSelectionPath = async (
  page,
  blockIndex,
  offset,
  context,
  phase
) => {
  await page
    .waitForFunction(
      ({ index, offset }) => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const selection = document.getSelection();
        const textElement = selection?.anchorNode?.parentElement?.closest(
          '[data-slate-node="text"]'
        );
        const handleSelection =
          root?.__slateBrowserHandle?.getSelection?.() ?? null;
        const inputState =
          root?.__slateBrowserHandle?.getInputState?.() ?? null;
        const anchorPath = handleSelection?.anchor?.path ?? null;
        const focusPath = handleSelection?.focus?.path ?? null;
        const pathMatches = (path) =>
          Array.isArray(path) &&
          path.length === 2 &&
          path[0] === index &&
          path[1] === 0;
        const acceptsNativeSelection =
          inputState?.preferModelSelection === false &&
          inputState?.selectionSource === 'dom-current';
        const acceptsRepairBackedModelSelection =
          inputState?.preferModelSelection === true &&
          inputState?.selectionSource === 'model-owned' &&
          inputState?.modelSelectionPreference?.reason === 'repair-induced';

        return (
          textElement?.getAttribute('data-slate-path') === `${index},0` &&
          selection?.anchorOffset === offset &&
          selection?.focusOffset === offset &&
          pathMatches(anchorPath) &&
          pathMatches(focusPath) &&
          handleSelection?.anchor?.offset === offset &&
          handleSelection?.focus?.offset === offset &&
          (acceptsNativeSelection || acceptsRepairBackedModelSelection)
        );
      },
      { index: blockIndex, offset },
      { timeout: nativeSurfaceTimeoutMs }
    )
    .catch(async (error) => {
      const diagnostics = await getDOMSelectionPathDiagnostics(
        page,
        blockIndex,
        offset
      );

      throw new Error(
        `DOM selection sync timed out for ${context.surfaceKey}/${context.laneKey}/iteration-${context.iteration}/${phase} at block ${blockIndex} offset ${offset}: ${error.message}; diagnostics=${JSON.stringify(diagnostics)}`
      );
    });
};

const selectCollapsed = async (page, blockIndex, offset, context) => {
  await requestCollapsedSelection(page, blockIndex, offset);
  const beforePaintMaterialization = await waitForMaterializedText(
    page,
    blockIndex,
    context
  );
  await nextPaint(page);
  const afterPaintMaterialization = await waitForMaterializedText(
    page,
    blockIndex,
    context
  );
  await syncDOMSelection(page, blockIndex, offset);
  await waitForDOMSelectionPath(
    page,
    blockIndex,
    offset,
    context,
    'before-paint'
  );
  const readyTime = await page.evaluate(() => performance.now());
  await nextPaint(page);
  await waitForDOMSelectionPath(
    page,
    blockIndex,
    offset,
    context,
    'after-paint'
  );

  return {
    materializationDurationMs: Math.max(
      beforePaintMaterialization.durationMs,
      afterPaintMaterialization.durationMs
    ),
    materializationFrameCount: Math.max(
      beforePaintMaterialization.frameCount,
      afterPaintMaterialization.frameCount
    ),
    materializationScrollTopDelta: Math.max(
      beforePaintMaterialization.scrollTopDelta ?? 0,
      afterPaintMaterialization.scrollTopDelta ?? 0
    ),
    readyTime,
  };
};

const clickMaterializedBlock = async (page, blockIndex, context) => {
  await waitForMaterializedText(page, blockIndex, context);
  const point = await page.evaluate((index) => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const textElement = root?.querySelector(
      `[data-slate-node="text"][data-slate-path="${index},0"]`
    );

    if (!(textElement instanceof HTMLElement)) {
      throw new Error(`Missing click target for block ${index}`);
    }

    const rect = textElement.getBoundingClientRect();

    return {
      x: rect.left + Math.min(Math.max(rect.width * 0.5, 4), rect.width - 2),
      y: rect.top + rect.height / 2,
    };
  }, blockIndex);
  const beforeSelection = await page.evaluate(() => {
    const root = document.querySelector('[data-slate-editor="true"]');

    return root?.__slateBrowserHandle?.getSelection?.() ?? null;
  });
  const clickStart = await page.evaluate(() => performance.now());

  await page.mouse.move(point.x, point.y);
  const clickMoveTime = await page.evaluate(() => performance.now());
  const clickDownStartTime = await page.evaluate(() => performance.now());
  await page.mouse.down();
  const clickDownTime = await page.evaluate(() => performance.now());
  const mouseDownEvent = await page.evaluate(() => {
    const events = globalThis.__SLATE_BROWSER_TRACE__?.mouseDownEvents ?? [];
    const event = events.at(-1) ?? null;

    return event
      ? {
          bubbleTime: event.bubbleTime,
          captureTime: event.captureTime,
          defaultPreventedAfterBubble: event.defaultPreventedAfterBubble,
          eventDispatchMs: event.eventDispatchMs,
          targetPath: event.targetPath,
          targetSync: event.targetSync,
        }
      : null;
  });
  await page.mouse.up();
  const clickDispatchTime = await page.evaluate(() => performance.now());
  await page
    .waitForFunction(
      ({ beforeSelection, index }) => {
        const pointsEqual = (left, right) =>
          !!left &&
          !!right &&
          left.offset === right.offset &&
          left.path.length === right.path.length &&
          left.path.every((part, pathIndex) => part === right.path[pathIndex]);
        const selectionsEqual = (left, right) =>
          !!left &&
          !!right &&
          pointsEqual(left.anchor, right.anchor) &&
          pointsEqual(left.focus, right.focus);
        const root = document.querySelector('[data-slate-editor="true"]');
        const selection = root?.__slateBrowserHandle?.getSelection?.() ?? null;

        return (
          selection?.anchor.path[0] === index &&
          selection?.focus.path[0] === index &&
          !selectionsEqual(selection, beforeSelection)
        );
      },
      { beforeSelection, index: blockIndex },
      { timeout: 5000 }
    )
    .catch(async (error) => {
      const diagnostics = await getMaterializationDiagnostics(page, blockIndex);

      throw new Error(
        `Click selection timed out for ${context.surfaceKey}/${context.laneKey}/iteration-${context.iteration} at block ${blockIndex}: ${error.message}; diagnostics=${JSON.stringify(diagnostics)}`
      );
    });

  const clickReadyTime = await page.evaluate(() => performance.now());
  const clickPaintTime = await nextPaint(page);

  return {
    clickDispatchMs: clickDispatchTime - clickStart,
    clickMouseDownMs: clickDownTime - clickMoveTime,
    clickMouseDownEventMs: Number.isFinite(mouseDownEvent?.eventDispatchMs)
      ? Math.max(0, mouseDownEvent.eventDispatchMs)
      : 0,
    clickMouseDownEventMissing: mouseDownEvent ? 0 : 1,
    clickMouseMoveMs: clickMoveTime - clickStart,
    clickMouseDownPostEventMs: Number.isFinite(mouseDownEvent?.bubbleTime)
      ? Math.max(0, clickDownTime - mouseDownEvent.bubbleTime)
      : 0,
    clickMouseDownPreEventMs: Number.isFinite(mouseDownEvent?.captureTime)
      ? Math.max(0, mouseDownEvent.captureTime - clickDownStartTime)
      : clickDownTime - clickMoveTime,
    clickMouseUpMs: clickDispatchTime - clickDownTime,
    clickPaintWaitMs: clickPaintTime - clickReadyTime,
    clickSelectionWaitMs: clickReadyTime - clickDispatchTime,
    clickToPaintMs: clickPaintTime - clickStart,
    clickToSelectionReadyMs: clickReadyTime - clickStart,
  };
};

const measureInteraction = async (page, lane, context) => {
  await resetTrace(page);

  const combinedStart = await page.evaluate(() => performance.now());
  const selectTiming = await selectCollapsed(
    page,
    lane.blockIndex,
    lane.offset,
    {
      ...context,
      laneKey: lane.key,
    }
  );
  const selectPaint = await nextPaint(page);
  const materializedOffset = lane.offset + 1;
  const materializedSelectStart = await page.evaluate(() => performance.now());
  const materializedSelectTiming = await selectCollapsed(
    page,
    lane.blockIndex,
    materializedOffset,
    {
      ...context,
      laneKey: lane.key,
    }
  );
  const materializedSelectPaint = await nextPaint(page);
  const preClickBlockIndex =
    lane.blockIndex === 0 ? lane.blockIndex + 1 : lane.blockIndex - 1;
  await selectCollapsed(page, preClickBlockIndex, 0, {
    ...context,
    laneKey: lane.key,
  });
  const clickTiming = await clickMaterializedBlock(page, lane.blockIndex, {
    ...context,
    laneKey: lane.key,
  });
  await selectCollapsed(page, lane.blockIndex, materializedOffset, {
    ...context,
    laneKey: lane.key,
  });
  const beforeText = await readBlockText(page, lane.blockIndex);
  const beforeTypeState = await page.evaluate((index) => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const textHost = root?.querySelector(
      `[data-slate-node="text"][data-slate-path="${index},0"]`
    );
    const selection = document.getSelection();
    const anchorElement =
      selection?.anchorNode instanceof Element
        ? selection.anchorNode
        : selection?.anchorNode instanceof Text
          ? selection.anchorNode.parentElement
          : null;
    const anchorTextHost = anchorElement?.closest?.('[data-slate-node="text"]');

    return {
      anchorOffset: selection?.anchorOffset ?? null,
      anchorPath: anchorTextHost?.getAttribute('data-slate-path') ?? null,
      handleSelection: root?.__slateBrowserHandle?.getSelection?.() ?? null,
      inputState: root?.__slateBrowserHandle?.getInputState?.() ?? null,
      textHostPath: textHost?.getAttribute('data-slate-path') ?? null,
      textHostSync: textHost?.getAttribute('data-slate-dom-sync') ?? null,
      textHostSyncReason:
        textHost?.getAttribute('data-slate-dom-sync-reason') ?? null,
      textHostText: textHost?.textContent?.replace(/\uFEFF/g, '') ?? null,
    };
  }, lane.blockIndex);

  if (beforeText == null) {
    throw new Error(`Missing initial block text for ${lane.key}`);
  }

  const expectedText =
    beforeText.slice(0, materializedOffset) +
    typeText +
    beforeText.slice(materializedOffset);
  const typeStart = await page.evaluate(() => performance.now());
  await page.keyboard.type(typeText);
  const modelTextPromise = waitForModelBlockText(
    page,
    lane.blockIndex,
    expectedText,
    context
  );

  await page
    .waitForFunction(
      ({ expectedText, index }) => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const textElement = root?.querySelector(
          `[data-slate-node="text"][data-slate-path="${index},0"]`
        );
        const block = textElement?.closest('[data-slate-node="element"]');
        const text =
          (block ?? textElement)?.textContent?.replace(/\uFEFF/g, '') ?? '';

        return text === expectedText;
      },
      { expectedText, index: lane.blockIndex },
      { timeout: 10_000 }
    )
    .catch(async (error) => {
      const diagnostics = await getLaneDiagnostics(page, lane, beforeTypeState);

      throw new Error(
        `Typing assertion timed out for ${context.surfaceKey}/${lane.key}/iteration-${context.iteration} at block ${lane.blockIndex}: ${error.message}; diagnostics=${JSON.stringify(diagnostics)}`
      );
    });

  const updateTime = await page.evaluate(() => performance.now());
  const modelReadyTime = await modelTextPromise;
  const paintTime = await nextPaint(page);
  const afterText = await readBlockText(page, lane.blockIndex);
  const modelPaintTime = paintTime;
  const trace = await getTraceSnapshot(page);
  const longTasks = trace?.longTasks ?? [];
  const longTaskDurationMs = longTasks.reduce(
    (total, entry) =>
      total + (Number.isFinite(entry.duration) ? entry.duration : 0),
    0
  );
  const longTaskAttributionTotals =
    summarizeLongTaskAttributionTotals(longTasks);
  const memory = await getMemoryAndDomTags(page);
  const lastInputAt = Math.max(
    0,
    ...(trace?.inputEvents ?? [])
      .filter((event) => event.inputType === 'insertText')
      .map((event) => event.time)
      .filter(Number.isFinite)
  );
  const typeToPaintMs =
    lastInputAt > 0 ? paintTime - lastInputAt : paintTime - typeStart;

  if (afterText !== expectedText || afterText === beforeText) {
    const diagnostics = await getLaneDiagnostics(page, lane, beforeTypeState);

    throw new Error(
      `Native typing did not update ${context.surfaceKey}/${lane.key}/iteration-${context.iteration}: expected=${JSON.stringify(expectedText)} actual=${JSON.stringify(afterText)} before=${JSON.stringify(beforeText)}; diagnostics=${JSON.stringify(diagnostics)}`
    );
  }

  return {
    clickDispatchMs: clickTiming.clickDispatchMs,
    clickMouseDownMs: clickTiming.clickMouseDownMs,
    clickMouseDownEventMs: clickTiming.clickMouseDownEventMs,
    clickMouseDownEventMissing: clickTiming.clickMouseDownEventMissing,
    clickMouseMoveMs: clickTiming.clickMouseMoveMs,
    clickMouseDownPostEventMs: clickTiming.clickMouseDownPostEventMs,
    clickMouseDownPreEventMs: clickTiming.clickMouseDownPreEventMs,
    clickMouseUpMs: clickTiming.clickMouseUpMs,
    clickPaintWaitMs: clickTiming.clickPaintWaitMs,
    clickSelectionWaitMs: clickTiming.clickSelectionWaitMs,
    clickToPaintMs: clickTiming.clickToPaintMs,
    clickToSelectionReadyMs: clickTiming.clickToSelectionReadyMs,
    domTags: memory,
    burstToPaintPerOpMs: (paintTime - typeStart) / typeText.length,
    longAnimationFrameCount: trace?.longAnimationFrames?.length ?? 0,
    longAnimationFrameMaxMs: Math.max(
      0,
      ...(trace?.longAnimationFrames ?? []).map((entry) => entry.duration)
    ),
    longTaskCount: longTasks.length,
    longTaskDurationMs,
    longTaskMaxMs: Math.max(0, ...longTasks.map((entry) => entry.duration)),
    ...longTaskAttributionTotals,
    materializedSelectReadyMs:
      materializedSelectTiming.readyTime - materializedSelectStart,
    materializedSelectMs: materializedSelectPaint - materializedSelectStart,
    materializedSelectMaterializationFrames:
      materializedSelectTiming.materializationFrameCount,
    materializedSelectMaterializationMs:
      materializedSelectTiming.materializationDurationMs,
    materializedSelectMaterializationScrollDelta:
      materializedSelectTiming.materializationScrollTopDelta,
    modelBurstToPaintPerOpMs: (modelPaintTime - typeStart) / typeText.length,
    modelTypeToPaintMs: modelPaintTime - typeStart,
    modelTypeToReadyMs: modelReadyTime - typeStart,
    selectMaterializationFrames: selectTiming.materializationFrameCount,
    selectMaterializationMs: selectTiming.materializationDurationMs,
    selectMaterializationScrollDelta:
      selectTiming.materializationScrollTopDelta,
    selectReadyMs: selectTiming.readyTime - combinedStart,
    selectMs: selectPaint - combinedStart,
    interactionSequenceToPaintMs: paintTime - combinedStart,
    burstToPaintMs: paintTime - typeStart,
    profiler: summarizeProfilerEvents(trace?.profilerEvents),
    typeToPaintMs,
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

const summarizeProfilerBuckets = (samples) => {
  const bucketNames = new Set();

  for (const sample of samples) {
    for (const bucketName of Object.keys(sample.profiler ?? {})) {
      bucketNames.add(bucketName);
    }
  }

  return Object.fromEntries(
    [...bucketNames].map((bucketName) => [
      bucketName,
      {
        count: summarize(
          samples.map((sample) => sample.profiler?.[bucketName]?.count ?? 0)
        ),
        durationMs: summarize(
          samples.map(
            (sample) => sample.profiler?.[bucketName]?.durationMs ?? 0
          )
        ),
      },
    ])
  );
};

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
  longTaskDurationMs: summarizeMetric(samples, 'longTaskDurationMs'),
  longTaskMaxMs: summarizeMetric(samples, 'longTaskMaxMs'),
  longTaskAttributedDurationMs: summarizeMetric(
    samples,
    'longTaskAttributedDurationMs'
  ),
  longTaskAttributionEntryCount: summarizeMetric(
    samples,
    'longTaskAttributionEntryCount'
  ),
  longTaskUnattributedDurationMs: summarizeMetric(
    samples,
    'longTaskUnattributedDurationMs'
  ),
  profiler: summarizeProfilerBuckets(samples),
  burstToPaintMs: summarizeMetric(samples, 'burstToPaintMs'),
  burstToPaintPerOpMs: summarizeMetric(samples, 'burstToPaintPerOpMs'),
  clickDispatchMs: summarizeMetric(samples, 'clickDispatchMs'),
  clickMouseDownMs: summarizeMetric(samples, 'clickMouseDownMs'),
  clickMouseDownEventMs: summarizeMetric(samples, 'clickMouseDownEventMs'),
  clickMouseDownEventMissing: summarizeMetric(
    samples,
    'clickMouseDownEventMissing'
  ),
  clickMouseMoveMs: summarizeMetric(samples, 'clickMouseMoveMs'),
  clickMouseDownPostEventMs: summarizeMetric(
    samples,
    'clickMouseDownPostEventMs'
  ),
  clickMouseDownPreEventMs: summarizeMetric(
    samples,
    'clickMouseDownPreEventMs'
  ),
  clickMouseUpMs: summarizeMetric(samples, 'clickMouseUpMs'),
  clickPaintWaitMs: summarizeMetric(samples, 'clickPaintWaitMs'),
  clickSelectionWaitMs: summarizeMetric(samples, 'clickSelectionWaitMs'),
  clickToPaintMs: summarizeMetric(samples, 'clickToPaintMs'),
  clickToSelectionReadyMs: summarizeMetric(samples, 'clickToSelectionReadyMs'),
  materializedSelectReadyMs: summarizeMetric(
    samples,
    'materializedSelectReadyMs'
  ),
  materializedSelectMs: summarizeMetric(samples, 'materializedSelectMs'),
  materializedSelectMaterializationFrames: summarizeMetric(
    samples,
    'materializedSelectMaterializationFrames'
  ),
  materializedSelectMaterializationMs: summarizeMetric(
    samples,
    'materializedSelectMaterializationMs'
  ),
  materializedSelectMaterializationScrollDelta: summarizeMetric(
    samples,
    'materializedSelectMaterializationScrollDelta'
  ),
  modelBurstToPaintPerOpMs: summarizeMetric(
    samples,
    'modelBurstToPaintPerOpMs'
  ),
  modelTypeToPaintMs: summarizeMetric(samples, 'modelTypeToPaintMs'),
  modelTypeToReadyMs: summarizeMetric(samples, 'modelTypeToReadyMs'),
  selectMaterializationFrames: summarizeMetric(
    samples,
    'selectMaterializationFrames'
  ),
  selectMaterializationMs: summarizeMetric(samples, 'selectMaterializationMs'),
  selectMaterializationScrollDelta: summarizeMetric(
    samples,
    'selectMaterializationScrollDelta'
  ),
  selectReadyMs: summarizeMetric(samples, 'selectReadyMs'),
  selectMs: summarizeMetric(samples, 'selectMs'),
  interactionSequenceToPaintMs: summarizeMetric(
    samples,
    'interactionSequenceToPaintMs'
  ),
  typeToPaintMs: summarizeMetric(samples, 'typeToPaintMs'),
  typeToUpdateMs: summarizeMetric(samples, 'typeToUpdateMs'),
});

const profilerDurationP95 = (lane, key) =>
  lane.profiler?.[key]?.durationMs?.p95 ?? 0;

const profilerCountP95 = (lane, key) => lane.profiler?.[key]?.count?.p95 ?? 0;

const measureSurface = async ({ browser, baseUrl, surface }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const laneSamples = Object.fromEntries(lanes.map((lane) => [lane.key, []]));
  const nativeSurfaceSamples = [];
  let selectAllDeleteSample = null;
  let selectAllDeleteSurfaceState = null;

  try {
    for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
      const url = `${baseUrl}${surface.path}`;

      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForEditorReady(page);
      await installTraceObserver(page);
      nativeSurfaceSamples.push(await waitForNativeSurface(page));

      for (const lane of lanes) {
        const sample = await measureInteraction(page, lane, {
          iteration,
          surfaceKey: surface.key,
        });

        if (iteration > 0) {
          laneSamples[lane.key].push(sample);
        }
      }
    }

    if (selectAllDeleteEnabled) {
      const selectAllPage = await context.newPage();
      const url = `${baseUrl}${surface.path}`;

      await selectAllPage.goto(url, { waitUntil: 'networkidle' });
      await waitForEditorReady(selectAllPage);
      await installTraceObserver(selectAllPage);
      selectAllDeleteSurfaceState = await waitForNativeSurface(selectAllPage);
      selectAllDeleteSample = await measureSelectAllDeleteFlow(
        selectAllPage,
        surface.key
      );
      await selectAllPage.close();
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
      boundedCount: nativeSurfaceSamples
        .slice(1)
        .filter((sample) => sample.bounded).length,
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
      samples: nativeSurfaceSamples.slice(1).map((sample) => ({
        bounded: sample.bounded,
        complete: sample.complete,
        editorTextNodeCount: sample.editorTextNodeCount,
        effectiveStrategy: sample.effectiveStrategy,
        mountedTopLevelCount: sample.mountedTopLevelCount,
        observedBlocks: sample.observedBlocks,
        pendingTopLevelCount: sample.pendingTopLevelCount,
        requestedStrategy: sample.requestedStrategy,
      })),
      timeoutCount: nativeSurfaceSamples
        .slice(1)
        .filter((sample) => !sample.complete && !sample.bounded).length,
      timeoutMs: nativeSurfaceTimeoutMs,
    },
    path: surface.path,
    selectAllDelete: selectAllDeleteSample
      ? {
          ...selectAllDeleteSample,
          surfaceState: selectAllDeleteSurfaceState,
        }
      : null,
  };
};

const run = async () => {
  if (surfaces.length === 0) {
    throw new Error('SLATE_BROWSER_TRACE_SURFACES selected no known surfaces');
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
      meta: {
        blocks,
        browser: 'chromium',
        headless,
        iterations,
        runLabel: runLabel || null,
        runStartedAt,
        selectAllDelete: selectAllDeleteEnabled,
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
        `nativeSurface durationMs p95=${surface.nativeSurface.durationMs.p95}, complete=${surface.nativeSurface.completeCount}, bounded=${surface.nativeSurface.boundedCount}, timedOut=${surface.nativeSurface.timeoutCount}, observedBlocks p95=${surface.nativeSurface.observedBlocks.p95}`
      );

      for (const [laneKey, lane] of Object.entries(surface.lanes)) {
        console.log(
          `${laneKey}: selectionReadyMs p95=${lane.selectReadyMs.p95}, selectToPaintMs p95=${lane.selectMs.p95}, selectMaterializationFrames p95=${lane.selectMaterializationFrames.p95}, selectMaterializationScrollDelta p95=${lane.selectMaterializationScrollDelta.p95}, materializedSelectionReadyMs p95=${lane.materializedSelectReadyMs.p95}, materializedSelectToPaintMs p95=${lane.materializedSelectMs.p95}, materializedSelectMaterializationFrames p95=${lane.materializedSelectMaterializationFrames.p95}, materializedSelectMaterializationScrollDelta p95=${lane.materializedSelectMaterializationScrollDelta.p95}, clickDispatchMs p95=${lane.clickDispatchMs.p95}, clickMouseMoveMs p95=${lane.clickMouseMoveMs.p95}, clickMouseDownMs p95=${lane.clickMouseDownMs.p95}, clickMouseDownPreEventMs p95=${lane.clickMouseDownPreEventMs.p95}, clickMouseDownEventMs p95=${lane.clickMouseDownEventMs.p95}, clickMouseDownPostEventMs p95=${lane.clickMouseDownPostEventMs.p95}, clickMouseUpMs p95=${lane.clickMouseUpMs.p95}, clickSelectionWaitMs p95=${lane.clickSelectionWaitMs.p95}, clickPaintWaitMs p95=${lane.clickPaintWaitMs.p95}, clickToSelectionReadyMs p95=${lane.clickToSelectionReadyMs.p95}, clickToPaintMs p95=${lane.clickToPaintMs.p95}, interactionSequenceToPaintMs p95=${lane.interactionSequenceToPaintMs.p95}, typeToPaintMs p95=${lane.typeToPaintMs.p95}, modelTypeToReadyMs p95=${lane.modelTypeToReadyMs.p95}, modelTypeToPaintMs p95=${lane.modelTypeToPaintMs.p95}, burstToPaintMs p95=${lane.burstToPaintMs.p95}, burstToPaintPerOpMs p95=${lane.burstToPaintPerOpMs.p95}, modelBurstToPaintPerOpMs p95=${lane.modelBurstToPaintPerOpMs.p95}, longTaskMaxMs p95=${lane.longTaskMaxMs.p95}, longTaskTotalMs p95=${lane.longTaskDurationMs.p95}, longTaskAttributedMs p95=${lane.longTaskAttributedDurationMs.p95}, longTaskUnattributedMs p95=${lane.longTaskUnattributedDurationMs.p95}, domNodes p95=${lane.domTags.domNodeCount.p95}, heapMB p95=${round(lane.domTags.jsHeapUsedMB.p95)}`
        );
      }

      if (surface.selectAllDelete) {
        const proof = surface.selectAllDelete;
        const typeAfterDeleteTrace = proof.phaseTraces?.typeAfterDelete ?? null;
        const typeAfterDeleteBeforeInputEvents =
          typeAfterDeleteTrace?.beforeInputEvents ?? {};
        const typeAfterDeleteInputEvents =
          typeAfterDeleteTrace?.inputEvents ?? {};

        console.log(
          `selectAllDelete: selectAllReadyMs=${round(proof.selectAllReadyMs)}, selectAllToPaintMs=${round(proof.selectAllToPaintMs)}, deleteReadyMs=${round(proof.deleteReadyMs)}, deleteToPaintMs=${round(proof.deleteToPaintMs)}, typeAfterDeleteInputMode=${proof.typeAfterDeleteInputMode}, typeAfterDeleteToPaintMs=${round(proof.typeAfterDeleteToPaintMs)}, typeAfterDeleteDispatchMs=${round(proof.typeAfterDeleteDispatchMs)}, typeAfterDeleteWaitForModelMs=${round(proof.typeAfterDeleteWaitForModelMs)}, typeAfterDeleteBeforeInputSpanMs=${round(typeAfterDeleteBeforeInputEvents.spanMs ?? 0)}, typeAfterDeleteBeforeInputMaxGapMs=${round(typeAfterDeleteBeforeInputEvents.maxGapMs ?? 0)}, typeAfterDeleteInputSpanMs=${round(typeAfterDeleteInputEvents.spanMs ?? 0)}, typeAfterDeleteInputMaxGapMs=${round(typeAfterDeleteInputEvents.maxGapMs ?? 0)}, typeAfterDeleteLongTaskMaxMs=${round(typeAfterDeleteTrace?.longTaskMaxMs ?? 0)}, typeAfterDeleteLongTaskAttributedMs=${round(typeAfterDeleteTrace?.longTaskAttributedDurationMs ?? 0)}, typeAfterDeleteLongTaskUnattributedMs=${round(typeAfterDeleteTrace?.longTaskUnattributedDurationMs ?? 0)}, typeAfterDeleteLongTaskClaim=${typeAfterDeleteTrace?.longTaskAttributionClaimWidth ?? 'none'}, typeAfterDeleteProfilerDurationMs=${round(typeAfterDeleteTrace?.profilerDurationMs ?? 0)}, undoTypeToPaintMs=${round(proof.undoTypeToPaintMs)}, undoDeleteReadyMs=${round(proof.undoDeleteReadyMs)}, undoDeleteToPaintMs=${round(proof.undoDeleteToPaintMs)}, undoDeleteRestored=${proof.undoDeleteRestored}, afterSelectAllDomNodes=${proof.afterSelectAllDomNodes}, afterDeleteDomNodes=${proof.afterDeleteDomNodes}, afterUndoDeleteDomNodes=${proof.afterUndoDeleteDomNodes}`
        );
      }
    }

    const laneSummaries = Object.values(summary.surfaces).flatMap((surface) =>
      Object.values(surface.lanes)
    );
    const maxTypeToPaintP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.typeToPaintMs.p95)
    );
    const maxSelectToPaintP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.selectMs.p95)
    );
    const maxSelectionReadyP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.selectReadyMs.p95)
    );
    const maxMaterializedSelectToPaintP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.materializedSelectMs.p95)
    );
    const maxMaterializedSelectionReadyP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.materializedSelectReadyMs.p95)
    );
    const maxSelectMaterializationFramesP95 = Math.max(
      ...laneSummaries.map((lane) => lane.selectMaterializationFrames.p95)
    );
    const maxSelectMaterializationScrollDeltaP95 = Math.max(
      ...laneSummaries.map((lane) => lane.selectMaterializationScrollDelta.p95)
    );
    const maxMaterializedSelectMaterializationFramesP95 = Math.max(
      ...laneSummaries.map(
        (lane) => lane.materializedSelectMaterializationFrames.p95
      )
    );
    const maxMaterializedSelectMaterializationScrollDeltaP95 = Math.max(
      ...laneSummaries.map(
        (lane) => lane.materializedSelectMaterializationScrollDelta.p95
      )
    );
    const maxClickToPaintP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.clickToPaintMs.p95)
    );
    const maxInteractionSequenceToPaintP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.interactionSequenceToPaintMs.p95)
    );
    const maxClickToSelectionReadyP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.clickToSelectionReadyMs.p95)
    );
    const maxClickDispatchP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.clickDispatchMs.p95)
    );
    const maxClickMouseMoveP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.clickMouseMoveMs.p95)
    );
    const maxClickMouseDownP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.clickMouseDownMs.p95)
    );
    const maxClickMouseDownEventP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.clickMouseDownEventMs.p95)
    );
    const maxClickMouseDownEventMissingP95 = Math.max(
      ...laneSummaries.map((lane) => lane.clickMouseDownEventMissing.p95)
    );
    const maxClickMouseDownPostEventP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.clickMouseDownPostEventMs.p95)
    );
    const maxClickMouseDownPreEventP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.clickMouseDownPreEventMs.p95)
    );
    const maxClickMouseUpP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.clickMouseUpMs.p95)
    );
    const maxClickSelectionWaitP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.clickSelectionWaitMs.p95)
    );
    const maxClickPaintWaitP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.clickPaintWaitMs.p95)
    );
    const maxBurstToPaintPerOpP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.burstToPaintPerOpMs.p95)
    );
    const maxModelTypeToPaintP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.modelTypeToPaintMs.p95)
    );
    const maxModelTypeToReadyP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.modelTypeToReadyMs.p95)
    );
    const maxModelBurstToPaintPerOpP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.modelBurstToPaintPerOpMs.p95)
    );
    const maxDomNodesP95 = Math.max(
      ...laneSummaries.map((lane) => lane.domTags.domNodeCount.p95)
    );
    const maxHeapMBP95 = Math.max(
      ...laneSummaries.map((lane) => lane.domTags.jsHeapUsedMB.p95)
    );
    const maxLongTaskP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.longTaskMaxMs.p95)
    );
    const maxLongTaskTotalP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.longTaskDurationMs.p95)
    );
    const maxLongTaskAttributedP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.longTaskAttributedDurationMs.p95)
    );
    const maxLongTaskUnattributedP95Ms = Math.max(
      ...laneSummaries.map((lane) => lane.longTaskUnattributedDurationMs.p95)
    );
    const maxRootMouseDownCaptureP95Ms = Math.max(
      ...laneSummaries.map((lane) =>
        profilerDurationP95(lane, 'runtime-time:root-mousedown.capture')
      )
    );
    const maxRootMouseDownCoordinateP95Ms = Math.max(
      ...laneSummaries.map((lane) =>
        profilerDurationP95(
          lane,
          'runtime-time:root-mousedown.resolve-coordinate-placement'
        )
      )
    );
    const maxRootMouseDownStartRangeP95Ms = Math.max(
      ...laneSummaries.map((lane) =>
        profilerDurationP95(
          lane,
          'runtime-time:root-mousedown.resolve-start-range'
        )
      )
    );
    const maxRootMouseDownProjectedEndpointP95Ms = Math.max(
      ...laneSummaries.map((lane) =>
        profilerDurationP95(
          lane,
          'runtime-time:root-mousedown.resolve-projected-drag-endpoint'
        )
      )
    );
    const maxRootMouseDownApplySelectionP95Ms = Math.max(
      ...laneSummaries.map((lane) =>
        profilerDurationP95(
          lane,
          'runtime-time:root-mousedown.apply-place-native-selection'
        )
      )
    );
    const printSurfaceMetrics = (surfaceKey, prefix) => {
      const surface = summary.surfaces[surfaceKey];

      if (!surface) {
        return;
      }

      const surfaceLaneSummaries = Object.values(surface.lanes);
      const maxSurfaceTypeToPaintP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.typeToPaintMs.p95)
      );
      const maxSurfaceSelectToPaintP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.selectMs.p95)
      );
      const maxSurfaceSelectionReadyP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.selectReadyMs.p95)
      );
      const maxSurfaceMaterializedSelectToPaintP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.materializedSelectMs.p95)
      );
      const maxSurfaceMaterializedSelectionReadyP95Ms = Math.max(
        ...surfaceLaneSummaries.map(
          (lane) => lane.materializedSelectReadyMs.p95
        )
      );
      const maxSurfaceSelectMaterializationFramesP95 = Math.max(
        ...surfaceLaneSummaries.map(
          (lane) => lane.selectMaterializationFrames.p95
        )
      );
      const maxSurfaceSelectMaterializationScrollDeltaP95 = Math.max(
        ...surfaceLaneSummaries.map(
          (lane) => lane.selectMaterializationScrollDelta.p95
        )
      );
      const maxSurfaceMaterializedSelectMaterializationFramesP95 = Math.max(
        ...surfaceLaneSummaries.map(
          (lane) => lane.materializedSelectMaterializationFrames.p95
        )
      );
      const maxSurfaceMaterializedSelectMaterializationScrollDeltaP95 =
        Math.max(
          ...surfaceLaneSummaries.map(
            (lane) => lane.materializedSelectMaterializationScrollDelta.p95
          )
        );
      const maxSurfaceClickToPaintP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.clickToPaintMs.p95)
      );
      const maxSurfaceInteractionSequenceToPaintP95Ms = Math.max(
        ...surfaceLaneSummaries.map(
          (lane) => lane.interactionSequenceToPaintMs.p95
        )
      );
      const maxSurfaceClickToSelectionReadyP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.clickToSelectionReadyMs.p95)
      );
      const maxSurfaceClickDispatchP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.clickDispatchMs.p95)
      );
      const maxSurfaceClickMouseMoveP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.clickMouseMoveMs.p95)
      );
      const maxSurfaceClickMouseDownP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.clickMouseDownMs.p95)
      );
      const maxSurfaceClickMouseDownEventP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.clickMouseDownEventMs.p95)
      );
      const maxSurfaceClickMouseDownEventMissingP95 = Math.max(
        ...surfaceLaneSummaries.map(
          (lane) => lane.clickMouseDownEventMissing.p95
        )
      );
      const maxSurfaceClickMouseDownPostEventP95Ms = Math.max(
        ...surfaceLaneSummaries.map(
          (lane) => lane.clickMouseDownPostEventMs.p95
        )
      );
      const maxSurfaceClickMouseDownPreEventP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.clickMouseDownPreEventMs.p95)
      );
      const maxSurfaceClickMouseUpP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.clickMouseUpMs.p95)
      );
      const maxSurfaceClickSelectionWaitP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.clickSelectionWaitMs.p95)
      );
      const maxSurfaceClickPaintWaitP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.clickPaintWaitMs.p95)
      );
      const maxSurfaceBurstToPaintPerOpP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.burstToPaintPerOpMs.p95)
      );
      const maxSurfaceModelTypeToPaintP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.modelTypeToPaintMs.p95)
      );
      const maxSurfaceModelTypeToReadyP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.modelTypeToReadyMs.p95)
      );
      const maxSurfaceModelBurstToPaintPerOpP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.modelBurstToPaintPerOpMs.p95)
      );
      const maxSurfaceDomNodesP95 = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.domTags.domNodeCount.p95)
      );
      const maxSurfaceHeapMBP95 = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.domTags.jsHeapUsedMB.p95)
      );
      const maxSurfaceLongTaskP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.longTaskMaxMs.p95)
      );
      const maxSurfaceLongTaskTotalP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) => lane.longTaskDurationMs.p95)
      );
      const maxSurfaceLongTaskAttributedP95Ms = Math.max(
        ...surfaceLaneSummaries.map(
          (lane) => lane.longTaskAttributedDurationMs.p95
        )
      );
      const maxSurfaceLongTaskUnattributedP95Ms = Math.max(
        ...surfaceLaneSummaries.map(
          (lane) => lane.longTaskUnattributedDurationMs.p95
        )
      );
      const maxSurfaceCoreNotifyListenersP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(lane, 'core-time:notify-listeners')
        )
      );
      const maxSurfaceCoreNotifyListenersCountP95 = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerCountP95(lane, 'core-time:notify-listeners')
        )
      );
      const maxSurfaceCoreNotifyCommitListenersP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(lane, 'core-time:notify-commit-listeners')
        )
      );
      const maxSurfaceCoreNotifyExtensionCommitListenersP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(
            lane,
            'core-time:notify-extension-commit-listeners'
          )
        )
      );
      const maxSurfaceCoreNotifySnapshotListenersP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(lane, 'core-time:notify-snapshot-listeners')
        )
      );
      const maxSurfaceCoreNotifySourceListenersP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(lane, 'core-time:notify-source-listeners')
        )
      );
      const maxSurfaceCoreListenerSnapshotP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(lane, 'core-time:listener-snapshot')
        )
      );
      const maxSurfaceSelectorDispatchP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(lane, 'runtime-time:selector-dispatch')
        )
      );
      const maxSurfaceSelectorDispatchCountP95 = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerCountP95(lane, 'runtime-time:selector-dispatch')
        )
      );
      const maxSurfaceSelectorCheckCountP95 = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerCountP95(lane, 'selector:selector-dispatch-checks')
        )
      );
      const maxSurfaceSelectorNotifyCountP95 = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerCountP95(lane, 'selector:selector-dispatch-notifies')
        )
      );
      const maxSurfaceSelectorSubscriptionCountP95 = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerCountP95(lane, 'selector:selector-dispatch-subscriptions')
        )
      );
      const maxSurfaceRootMouseDownCaptureP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(lane, 'runtime-time:root-mousedown.capture')
        )
      );
      const maxSurfaceRootMouseDownCoordinateP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(
            lane,
            'runtime-time:root-mousedown.resolve-coordinate-placement'
          )
        )
      );
      const maxSurfaceRootMouseDownStartRangeP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(
            lane,
            'runtime-time:root-mousedown.resolve-start-range'
          )
        )
      );
      const maxSurfaceRootMouseDownProjectedEndpointP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(
            lane,
            'runtime-time:root-mousedown.resolve-projected-drag-endpoint'
          )
        )
      );
      const maxSurfaceRootMouseDownApplySelectionP95Ms = Math.max(
        ...surfaceLaneSummaries.map((lane) =>
          profilerDurationP95(
            lane,
            'runtime-time:root-mousedown.apply-place-native-selection'
          )
        )
      );

      console.log(
        `METRIC ${prefix}_type_to_paint_p95_ms=${round(
          maxSurfaceTypeToPaintP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_select_to_paint_p95_ms=${round(
          maxSurfaceSelectToPaintP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_selection_ready_p95_ms=${round(
          maxSurfaceSelectionReadyP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_materialized_select_to_paint_p95_ms=${round(
          maxSurfaceMaterializedSelectToPaintP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_materialized_selection_ready_p95_ms=${round(
          maxSurfaceMaterializedSelectionReadyP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_select_materialization_frames_p95=${round(
          maxSurfaceSelectMaterializationFramesP95
        )}`
      );
      console.log(
        `METRIC ${prefix}_select_materialization_scroll_delta_p95_px=${round(
          maxSurfaceSelectMaterializationScrollDeltaP95
        )}`
      );
      console.log(
        `METRIC ${prefix}_materialized_select_materialization_frames_p95=${round(
          maxSurfaceMaterializedSelectMaterializationFramesP95
        )}`
      );
      console.log(
        `METRIC ${prefix}_materialized_select_materialization_scroll_delta_p95_px=${round(
          maxSurfaceMaterializedSelectMaterializationScrollDeltaP95
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_to_paint_p95_ms=${round(
          maxSurfaceClickToPaintP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_interaction_sequence_to_paint_p95_ms=${round(
          maxSurfaceInteractionSequenceToPaintP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_to_selection_ready_p95_ms=${round(
          maxSurfaceClickToSelectionReadyP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_dispatch_p95_ms=${round(
          maxSurfaceClickDispatchP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_mouse_move_p95_ms=${round(
          maxSurfaceClickMouseMoveP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_mouse_down_p95_ms=${round(
          maxSurfaceClickMouseDownP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_mouse_down_pre_event_p95_ms=${round(
          maxSurfaceClickMouseDownPreEventP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_mouse_down_event_p95_ms=${round(
          maxSurfaceClickMouseDownEventP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_mouse_down_post_event_p95_ms=${round(
          maxSurfaceClickMouseDownPostEventP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_mouse_down_event_missing_p95=${round(
          maxSurfaceClickMouseDownEventMissingP95
        )}`
      );
      console.log(
        `METRIC ${prefix}_root_mousedown_capture_p95_ms=${round(
          maxSurfaceRootMouseDownCaptureP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_root_mousedown_coordinate_p95_ms=${round(
          maxSurfaceRootMouseDownCoordinateP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_root_mousedown_start_range_p95_ms=${round(
          maxSurfaceRootMouseDownStartRangeP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_root_mousedown_projected_endpoint_p95_ms=${round(
          maxSurfaceRootMouseDownProjectedEndpointP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_root_mousedown_apply_selection_p95_ms=${round(
          maxSurfaceRootMouseDownApplySelectionP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_mouse_up_p95_ms=${round(
          maxSurfaceClickMouseUpP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_selection_wait_p95_ms=${round(
          maxSurfaceClickSelectionWaitP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_click_paint_wait_p95_ms=${round(
          maxSurfaceClickPaintWaitP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_burst_to_paint_per_op_p95_ms=${round(
          maxSurfaceBurstToPaintPerOpP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_model_type_to_paint_p95_ms=${round(
          maxSurfaceModelTypeToPaintP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_model_type_to_ready_p95_ms=${round(
          maxSurfaceModelTypeToReadyP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_model_burst_to_paint_per_op_p95_ms=${round(
          maxSurfaceModelBurstToPaintPerOpP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_dom_nodes_p95=${round(maxSurfaceDomNodesP95)}`
      );
      console.log(`METRIC ${prefix}_heap_mb_p95=${round(maxSurfaceHeapMBP95)}`);
      console.log(
        `METRIC ${prefix}_long_task_max_p95_ms=${round(
          maxSurfaceLongTaskP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_long_task_total_p95_ms=${round(
          maxSurfaceLongTaskTotalP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_long_task_attributed_p95_ms=${round(
          maxSurfaceLongTaskAttributedP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_long_task_unattributed_p95_ms=${round(
          maxSurfaceLongTaskUnattributedP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_core_notify_listeners_p95_ms=${round(
          maxSurfaceCoreNotifyListenersP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_core_notify_listeners_count_p95=${round(
          maxSurfaceCoreNotifyListenersCountP95
        )}`
      );
      console.log(
        `METRIC ${prefix}_core_notify_commit_listeners_p95_ms=${round(
          maxSurfaceCoreNotifyCommitListenersP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_core_notify_extension_commit_listeners_p95_ms=${round(
          maxSurfaceCoreNotifyExtensionCommitListenersP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_core_notify_snapshot_listeners_p95_ms=${round(
          maxSurfaceCoreNotifySnapshotListenersP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_core_notify_source_listeners_p95_ms=${round(
          maxSurfaceCoreNotifySourceListenersP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_core_listener_snapshot_p95_ms=${round(
          maxSurfaceCoreListenerSnapshotP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_selector_dispatch_p95_ms=${round(
          maxSurfaceSelectorDispatchP95Ms
        )}`
      );
      console.log(
        `METRIC ${prefix}_selector_dispatch_count_p95=${round(
          maxSurfaceSelectorDispatchCountP95
        )}`
      );
      console.log(
        `METRIC ${prefix}_selector_check_count_p95=${round(
          maxSurfaceSelectorCheckCountP95
        )}`
      );
      console.log(
        `METRIC ${prefix}_selector_notify_count_p95=${round(
          maxSurfaceSelectorNotifyCountP95
        )}`
      );
      console.log(
        `METRIC ${prefix}_selector_subscription_count_p95=${round(
          maxSurfaceSelectorSubscriptionCountP95
        )}`
      );

      if (surface.selectAllDelete) {
        const proof = surface.selectAllDelete;
        const typeAfterDeleteTrace = proof.phaseTraces?.typeAfterDelete ?? null;
        const typeAfterDeleteBeforeInputEvents =
          typeAfterDeleteTrace?.beforeInputEvents ?? {};
        const typeAfterDeleteInputEvents =
          typeAfterDeleteTrace?.inputEvents ?? {};

        console.log(
          `METRIC ${prefix}_select_all_ready_ms=${round(proof.selectAllReadyMs)}`
        );
        console.log(
          `METRIC ${prefix}_select_all_to_paint_ms=${round(proof.selectAllToPaintMs)}`
        );
        console.log(
          `METRIC ${prefix}_delete_ready_ms=${round(proof.deleteReadyMs)}`
        );
        console.log(
          `METRIC ${prefix}_delete_to_paint_ms=${round(proof.deleteToPaintMs)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_to_paint_ms=${round(proof.typeAfterDeleteToPaintMs)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_dispatch_ms=${round(proof.typeAfterDeleteDispatchMs)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_wait_for_model_ms=${round(proof.typeAfterDeleteWaitForModelMs)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_beforeinput_count=${round(typeAfterDeleteBeforeInputEvents.count ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_beforeinput_span_ms=${round(typeAfterDeleteBeforeInputEvents.spanMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_beforeinput_max_gap_ms=${round(typeAfterDeleteBeforeInputEvents.maxGapMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_beforeinput_p95_gap_ms=${round(typeAfterDeleteBeforeInputEvents.p95GapMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_input_count=${round(typeAfterDeleteInputEvents.count ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_input_span_ms=${round(typeAfterDeleteInputEvents.spanMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_input_max_gap_ms=${round(typeAfterDeleteInputEvents.maxGapMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_input_p95_gap_ms=${round(typeAfterDeleteInputEvents.p95GapMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_long_task_count=${round(typeAfterDeleteTrace?.longTaskCount ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_long_task_total_ms=${round(typeAfterDeleteTrace?.longTaskDurationMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_long_task_max_ms=${round(typeAfterDeleteTrace?.longTaskMaxMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_long_task_attributed_ms=${round(typeAfterDeleteTrace?.longTaskAttributedDurationMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_long_task_unattributed_ms=${round(typeAfterDeleteTrace?.longTaskUnattributedDurationMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_long_animation_frame_count=${round(typeAfterDeleteTrace?.longAnimationFrameCount ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_long_animation_frame_total_ms=${round(typeAfterDeleteTrace?.longAnimationFrameDurationMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_long_animation_frame_max_ms=${round(typeAfterDeleteTrace?.longAnimationFrameMaxMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_type_after_delete_profiler_duration_ms=${round(typeAfterDeleteTrace?.profilerDurationMs ?? 0)}`
        );
        console.log(
          `METRIC ${prefix}_undo_type_to_paint_ms=${round(proof.undoTypeToPaintMs)}`
        );
        console.log(
          `METRIC ${prefix}_undo_delete_ready_ms=${round(proof.undoDeleteReadyMs)}`
        );
        console.log(
          `METRIC ${prefix}_undo_delete_to_paint_ms=${round(proof.undoDeleteToPaintMs)}`
        );
        console.log(
          `METRIC ${prefix}_undo_delete_restored=${round(proof.undoDeleteRestored)}`
        );
        console.log(
          `METRIC ${prefix}_select_all_delete_after_select_all_dom_nodes=${round(proof.afterSelectAllDomNodes)}`
        );
        console.log(
          `METRIC ${prefix}_select_all_delete_after_delete_dom_nodes=${round(proof.afterDeleteDomNodes)}`
        );
        console.log(
          `METRIC ${prefix}_select_all_delete_after_undo_delete_dom_nodes=${round(proof.afterUndoDeleteDomNodes)}`
        );
      }
    };

    console.log(
      `METRIC react_huge_doc_type_to_paint_p95_ms=${round(maxTypeToPaintP95Ms)}`
    );
    console.log(
      `METRIC react_huge_doc_select_to_paint_p95_ms=${round(
        maxSelectToPaintP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_selection_ready_p95_ms=${round(
        maxSelectionReadyP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_materialized_select_to_paint_p95_ms=${round(
        maxMaterializedSelectToPaintP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_materialized_selection_ready_p95_ms=${round(
        maxMaterializedSelectionReadyP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_select_materialization_frames_p95=${round(
        maxSelectMaterializationFramesP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_select_materialization_scroll_delta_p95_px=${round(
        maxSelectMaterializationScrollDeltaP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_materialized_select_materialization_frames_p95=${round(
        maxMaterializedSelectMaterializationFramesP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_materialized_select_materialization_scroll_delta_p95_px=${round(
        maxMaterializedSelectMaterializationScrollDeltaP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_to_paint_p95_ms=${round(
        maxClickToPaintP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_interaction_sequence_to_paint_p95_ms=${round(
        maxInteractionSequenceToPaintP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_to_selection_ready_p95_ms=${round(
        maxClickToSelectionReadyP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_dispatch_p95_ms=${round(
        maxClickDispatchP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_mouse_move_p95_ms=${round(
        maxClickMouseMoveP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_mouse_down_p95_ms=${round(
        maxClickMouseDownP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_mouse_down_pre_event_p95_ms=${round(
        maxClickMouseDownPreEventP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_mouse_down_event_p95_ms=${round(
        maxClickMouseDownEventP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_mouse_down_post_event_p95_ms=${round(
        maxClickMouseDownPostEventP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_mouse_down_event_missing_p95=${round(
        maxClickMouseDownEventMissingP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_root_mousedown_capture_p95_ms=${round(
        maxRootMouseDownCaptureP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_root_mousedown_coordinate_p95_ms=${round(
        maxRootMouseDownCoordinateP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_root_mousedown_start_range_p95_ms=${round(
        maxRootMouseDownStartRangeP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_root_mousedown_projected_endpoint_p95_ms=${round(
        maxRootMouseDownProjectedEndpointP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_root_mousedown_apply_selection_p95_ms=${round(
        maxRootMouseDownApplySelectionP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_mouse_up_p95_ms=${round(
        maxClickMouseUpP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_selection_wait_p95_ms=${round(
        maxClickSelectionWaitP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_click_paint_wait_p95_ms=${round(
        maxClickPaintWaitP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_burst_to_paint_per_op_p95_ms=${round(
        maxBurstToPaintPerOpP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_model_type_to_paint_p95_ms=${round(
        maxModelTypeToPaintP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_model_type_to_ready_p95_ms=${round(
        maxModelTypeToReadyP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_model_burst_to_paint_per_op_p95_ms=${round(
        maxModelBurstToPaintPerOpP95Ms
      )}`
    );
    console.log(`METRIC react_huge_doc_dom_nodes_p95=${round(maxDomNodesP95)}`);
    console.log(`METRIC react_huge_doc_heap_mb_p95=${round(maxHeapMBP95)}`);
    console.log(
      `METRIC react_huge_doc_long_task_max_p95_ms=${round(maxLongTaskP95Ms)}`
    );
    console.log(
      `METRIC react_huge_doc_long_task_total_p95_ms=${round(
        maxLongTaskTotalP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_long_task_attributed_p95_ms=${round(
        maxLongTaskAttributedP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_long_task_unattributed_p95_ms=${round(
        maxLongTaskUnattributedP95Ms
      )}`
    );
    console.log(
      `METRIC react_huge_doc_core_notify_listeners_p95_ms=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerDurationP95(lane, 'core-time:notify-listeners')
          )
        )
      )}`
    );
    console.log(
      `METRIC react_huge_doc_core_notify_listeners_count_p95=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerCountP95(lane, 'core-time:notify-listeners')
          )
        )
      )}`
    );
    console.log(
      `METRIC react_huge_doc_core_notify_commit_listeners_p95_ms=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerDurationP95(lane, 'core-time:notify-commit-listeners')
          )
        )
      )}`
    );
    console.log(
      `METRIC react_huge_doc_core_notify_extension_commit_listeners_p95_ms=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerDurationP95(
              lane,
              'core-time:notify-extension-commit-listeners'
            )
          )
        )
      )}`
    );
    console.log(
      `METRIC react_huge_doc_core_notify_snapshot_listeners_p95_ms=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerDurationP95(lane, 'core-time:notify-snapshot-listeners')
          )
        )
      )}`
    );
    console.log(
      `METRIC react_huge_doc_core_notify_source_listeners_p95_ms=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerDurationP95(lane, 'core-time:notify-source-listeners')
          )
        )
      )}`
    );
    console.log(
      `METRIC react_huge_doc_core_listener_snapshot_p95_ms=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerDurationP95(lane, 'core-time:listener-snapshot')
          )
        )
      )}`
    );
    console.log(
      `METRIC react_huge_doc_selector_dispatch_p95_ms=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerDurationP95(lane, 'runtime-time:selector-dispatch')
          )
        )
      )}`
    );
    console.log(
      `METRIC react_huge_doc_selector_dispatch_count_p95=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerCountP95(lane, 'runtime-time:selector-dispatch')
          )
        )
      )}`
    );
    console.log(
      `METRIC react_huge_doc_selector_check_count_p95=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerCountP95(lane, 'selector:selector-dispatch-checks')
          )
        )
      )}`
    );
    console.log(
      `METRIC react_huge_doc_selector_notify_count_p95=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerCountP95(lane, 'selector:selector-dispatch-notifies')
          )
        )
      )}`
    );
    console.log(
      `METRIC react_huge_doc_selector_subscription_count_p95=${round(
        Math.max(
          ...laneSummaries.map((lane) =>
            profilerCountP95(lane, 'selector:selector-dispatch-subscriptions')
          )
        )
      )}`
    );
    printSurfaceMetrics('defaultAuto', 'react_huge_doc_auto');
    printSurfaceMetrics('stagedActiveDOMGroup', 'react_huge_doc_staged');
    printSurfaceMetrics('stagedDefault', 'react_huge_doc_staged_default');
    printSurfaceMetrics(
      'stagedContentVisibility',
      'react_huge_doc_staged_content_visibility'
    );
    printSurfaceMetrics('virtualized', 'react_huge_doc_virtualized');

    console.log(`\nWrote ${runArtifactPath}`);
  } finally {
    await browser.close();
    await server.close();
  }
};

await run();
