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
const blocks = Number(process.env.SLATE_STAGED_COMMANDS_BLOCKS || 10_000);
const iterations = Number(process.env.SLATE_STAGED_COMMANDS_ITERATIONS || 3);
const port = Number(process.env.SLATE_STAGED_COMMANDS_PORT || 0);
const headless = process.env.SLATE_STAGED_COMMANDS_HEADLESS !== '0';
const skipBuild = process.env.SLATE_STAGED_COMMANDS_SKIP_BUILD === '1';
const baseUrl = process.env.SLATE_STAGED_COMMANDS_BASE_URL?.replace(/\/$/, '');
const commandTimeoutMs = Number(
  process.env.SLATE_STAGED_COMMANDS_TIMEOUT_MS || 20_000
);
const viewportHeight = process.env.SLATE_STAGED_COMMANDS_VIEWPORT_HEIGHT
  ? Number(process.env.SLATE_STAGED_COMMANDS_VIEWPORT_HEIGHT)
  : null;
const viewportWidth = process.env.SLATE_STAGED_COMMANDS_VIEWPORT_WIDTH
  ? Number(process.env.SLATE_STAGED_COMMANDS_VIEWPORT_WIDTH)
  : null;
const repeatedShiftDownCount = Number(
  process.env.SLATE_STAGED_COMMANDS_REPEATED_SHIFT_DOWN_COUNT || 24
);
const requireFullDOMSurface =
  process.env.SLATE_STAGED_COMMANDS_REQUIRE_FULL_DOM === '1';
const assertFullDOMShiftDownParity =
  process.env.SLATE_STAGED_COMMANDS_ASSERT_FULL_DOM_PARITY === '1';
const selectedSurfaces = new Set(
  (
    process.env.SLATE_STAGED_COMMANDS_SURFACES ||
    'stagedDefault,stagedContentVisibility'
  )
    .split(',')
    .map((surface) => surface.trim())
    .filter(Boolean)
);

const latestArtifactPath =
  'tmp/slate-react-huge-document-staged-keyboard-commands.json';

const sanitizeArtifactSegment = (value) =>
  String(value)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180) || 'default';

const runArtifactPath = `${[
  'tmp/slate-react-huge-document-staged-keyboard-commands',
  `surfaces-${sanitizeArtifactSegment(Array.from(selectedSurfaces).join('-'))}`,
  `blocks-${blocks}`,
  `iters-${iterations}`,
].join('-')}.json`;

const surfaces = [
  {
    key: 'stagedDefault',
    label: 'v2 staged default',
    fullPath: `/examples/huge-document?blocks=${blocks}&strict=false&strategy=full`,
    path: `/examples/huge-document?blocks=${blocks}&strict=false&strategy=staged`,
  },
  {
    key: 'stagedActiveDOMGroup',
    label: 'v2 staged active DOM group',
    fullPath: `/examples/huge-document?blocks=${blocks}&content_visibility=none&strict=false&strategy=full`,
    path: `/examples/huge-document?blocks=${blocks}&content_visibility=none&strict=false&strategy=staged`,
  },
  {
    key: 'stagedContentVisibility',
    label: 'v2 staged content-visibility',
    fullPath: `/examples/huge-document?blocks=${blocks}&content_visibility=element&strict=false&strategy=full`,
    path: `/examples/huge-document?blocks=${blocks}&content_visibility=element&strict=false&strategy=staged`,
  },
].filter((surface) => selectedSurfaces.has(surface.key));

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
        console.error('Staged commands server request failed:', error);

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
  if (skipBuild || baseUrl) {
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

    if (target.__SLATE_STAGED_COMMANDS_OBSERVER__) {
      target.__SLATE_STAGED_COMMANDS_TRACE__?.reset?.();
      return;
    }

    const trace = {
      kernelTraceStart: 0,
      longAnimationFrames: [],
      longTasks: [],
      profilerEvents: [],
      reset() {
        this.kernelTraceStart =
          document
            .querySelector('[data-slate-editor="true"]')
            ?.__slateBrowserHandle?.getKernelTrace?.().length ?? 0;
        this.longAnimationFrames.length = 0;
        this.longTasks.length = 0;
        this.profilerEvents.length = 0;
      },
      snapshot() {
        const kernelTrace =
          document
            .querySelector('[data-slate-editor="true"]')
            ?.__slateBrowserHandle?.getKernelTrace?.() ?? [];

        return {
          kernelTrace: kernelTrace.slice(this.kernelTraceStart),
          longAnimationFrames: this.longAnimationFrames.slice(),
          longTasks: this.longTasks.slice(),
          profilerEvents: this.profilerEvents.slice(),
        };
      },
    };

    target.__SLATE_STAGED_COMMANDS_TRACE__ = trace;
    target.__SLATE_STAGED_COMMANDS_OBSERVER__ = true;
    target.__SLATE_REACT_RENDER_PROFILER__ = {
      record(event) {
        trace.profilerEvents.push(event);
      },
    };

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

const resetTrace = async (page) => {
  await page.evaluate(() => {
    globalThis.__SLATE_STAGED_COMMANDS_TRACE__?.reset?.();
  });
};

const traceSnapshot = async (page) =>
  page.evaluate(
    () => globalThis.__SLATE_STAGED_COMMANDS_TRACE__?.snapshot?.() ?? null
  );

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

const waitForHugeDocumentSurface = async (
  page,
  { expectedStrategy, requireCompleteDOM }
) => {
  await page.waitForFunction(
    ({ expectedBlocks, expectedStrategy, requireCompleteDOM }) => {
      const root = document.querySelector('[data-slate-editor="true"]');
      const effectiveStrategy = document.querySelector(
        '[data-test-id="huge-document-effective-strategy"]'
      )?.textContent;
      const blockCount = root?.__slateBrowserHandle?.getBlockTexts?.().length;
      const mountedTopLevelCount = Number(
        document.querySelector(
          '[data-test-id="huge-document-mounted-top-level-count"]'
        )?.textContent ?? 0
      );

      if (effectiveStrategy !== expectedStrategy) {
        return false;
      }

      if (blockCount !== expectedBlocks) {
        return false;
      }

      if (!requireCompleteDOM) {
        return mountedTopLevelCount > 0;
      }

      return (
        (root?.querySelectorAll('[data-slate-node="text"]').length ?? 0) >=
        expectedBlocks
      );
    },
    { expectedBlocks: blocks, expectedStrategy, requireCompleteDOM },
    { timeout: 30_000 }
  );
};

const waitForStagedSurface = async (page) =>
  waitForHugeDocumentSurface(page, {
    expectedStrategy: 'staged',
    requireCompleteDOM: requireFullDOMSurface,
  });

const readNativeAndModelSelection = async (page) =>
  page.evaluate(() => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const selection = document.getSelection();
    const viewSelectionMarkers = root
      ? Array.from(root.querySelectorAll('[data-slate-view-selection="true"]'))
      : [];
    const anchorElement =
      selection?.anchorNode instanceof Element
        ? selection.anchorNode
        : selection?.anchorNode instanceof Text
          ? selection.anchorNode.parentElement
          : null;
    const focusElement =
      selection?.focusNode instanceof Element
        ? selection.focusNode
        : selection?.focusNode instanceof Text
          ? selection.focusNode.parentElement
          : null;

    return {
      activeElementIsEditor: document.activeElement === root,
      model: root?.__slateBrowserHandle?.getSelection?.() ?? null,
      native: {
        anchorOffset: selection?.anchorOffset ?? null,
        anchorPath:
          anchorElement
            ?.closest?.('[data-slate-node="text"]')
            ?.getAttribute('data-slate-path') ?? null,
        collapsed: selection?.isCollapsed ?? null,
        focusOffset: selection?.focusOffset ?? null,
        focusPath:
          focusElement
            ?.closest?.('[data-slate-node="text"]')
            ?.getAttribute('data-slate-path') ?? null,
        textLength: selection?.toString().replace(/\uFEFF/g, '').length ?? 0,
      },
      viewSelection: {
        active: !!root?.__slateBrowserHandle?.getViewSelection?.(),
        markerCount: viewSelectionMarkers.length,
        markerPaths: viewSelectionMarkers.map(
          (marker) =>
            marker
              .closest('[data-slate-node="text"]')
              ?.getAttribute('data-slate-path') ?? null
        ),
        selection: root?.__slateBrowserHandle?.getViewSelection?.() ?? null,
        textLength: viewSelectionMarkers.reduce(
          (length, marker) =>
            length + (marker.textContent ?? '').replace(/\uFEFF/g, '').length,
          0
        ),
      },
    };
  });

const readCounts = async (page) =>
  page.evaluate(() => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const readNumber = (testId) =>
      Number(
        document
          .querySelector(`[data-test-id="${testId}"]`)
          ?.textContent?.replace(/,/g, '') ?? Number.NaN
      );

    return {
      blockCount: root?.__slateBrowserHandle?.getBlockTexts?.().length ?? null,
      domNodeCount: readNumber('huge-document-dom-node-count'),
      firstText: root?.__slateBrowserHandle?.getBlockText?.(0) ?? null,
      lastText:
        root?.__slateBrowserHandle?.getBlockText?.(
          Math.max(
            0,
            (root?.__slateBrowserHandle?.getBlockTexts?.().length ?? 1) - 1
          )
        ) ?? null,
      mountedTopLevelCount: readNumber('huge-document-mounted-top-level-count'),
      pendingTopLevelCount: readNumber('huge-document-pending-top-level-count'),
    };
  });

const readScrollState = async (page) =>
  page.evaluate(() => {
    const root = document.querySelector('[data-slate-editor="true"]');
    const scrollable = [];

    for (
      let parent = root?.parentElement ?? null;
      parent;
      parent = parent.parentElement
    ) {
      if (parent.scrollHeight > parent.clientHeight) {
        scrollable.push({
          clientHeight: parent.clientHeight,
          scrollHeight: parent.scrollHeight,
          scrollTop: parent.scrollTop,
          tagName: parent.tagName,
        });
      }
    }

    return {
      scrollable,
      windowScrollY: window.scrollY,
    };
  });

const selectTextBlockOffsetDOM = async (page, blockIndex, offset) => {
  await page.evaluate(
    ({ index, offset }) => {
      const root = document.querySelector('[data-slate-editor="true"]');

      if (!(root instanceof HTMLElement)) {
        throw new Error('Missing Slate editor root');
      }

      const handle = root.__slateBrowserHandle;

      if (!handle?.selectRange) {
        throw new Error('Missing Slate browser selectRange handle');
      }

      handle.scrollPathIntoView?.([index, 0], 'center');
      handle.selectRange({
        anchor: { path: [index, 0], offset },
        focus: { path: [index, 0], offset },
      });
    },
    { index: blockIndex, offset }
  );

  await page.waitForFunction(
    (index) =>
      !!document
        .querySelector('[data-slate-editor="true"]')
        ?.querySelector(
          `[data-slate-node="text"][data-slate-path="${index},0"]`
        ),
    blockIndex,
    { timeout: 10_000 }
  );

  await page.evaluate(
    ({ index, offset }) => {
      const root = document.querySelector('[data-slate-editor="true"]');

      if (!(root instanceof HTMLElement)) {
        throw new Error('Missing Slate editor root');
      }

      const textElement = root.querySelector(
        `[data-slate-node="text"][data-slate-path="${index},0"]`
      );

      if (!textElement) {
        throw new Error(`Missing text element for block ${index}`);
      }

      const walker = document.createTreeWalker(
        textElement,
        NodeFilter.SHOW_TEXT
      );
      const textNode = walker.nextNode();

      if (!textNode) {
        throw new Error(`Missing text node for block ${index}`);
      }

      const range = document.createRange();
      const selection = document.getSelection();

      root.focus();
      range.setStart(textNode, offset);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
      root.__slateBrowserHandle?.importDOMSelection?.();
    },
    { index: blockIndex, offset }
  );

  await page.waitForFunction(
    ({ index, offset }) => {
      const root = document.querySelector('[data-slate-editor="true"]');
      const modelSelection = root?.__slateBrowserHandle?.getSelection?.();

      return (
        modelSelection?.anchor.path[0] === index &&
        modelSelection?.anchor.offset === offset &&
        modelSelection?.focus.path[0] === index &&
        modelSelection?.focus.offset === offset
      );
    },
    { index: blockIndex, offset },
    { timeout: 5000 }
  );
  await nextPaint(page);
};

const pressWithTiming = async (page, key) => {
  await resetTrace(page);
  const start = await page.evaluate(() => performance.now());

  await Promise.race([
    page.keyboard.press(key),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${key} exceeded ${commandTimeoutMs}ms`));
      }, commandTimeoutMs);
    }),
  ]);

  const commandReady = await page.evaluate(() => performance.now());
  const paint = await nextPaint(page);
  const trace = await traceSnapshot(page);

  return {
    commandMs: commandReady - start,
    commandReadyTime: commandReady,
    longAnimationFrameMaxMs: Math.max(
      0,
      ...(trace?.longAnimationFrames ?? []).map((entry) => entry.duration)
    ),
    longTaskMaxMs: Math.max(
      0,
      ...(trace?.longTasks ?? []).map((entry) => entry.duration)
    ),
    paintMs: paint - start,
    paintTime: paint,
    startTime: start,
    trace,
  };
};

const pressHeldShiftArrowWithStepTiming = async (page, key, count) => {
  const steps = [];

  await page.keyboard.down('Shift');
  try {
    for (let step = 0; step < count; step += 1) {
      const scrollBefore = await readScrollState(page);

      await resetTrace(page);
      const start = await page.evaluate(() => performance.now());

      await Promise.race([
        page.keyboard.press(key),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                `Shift+${key} step ${step} exceeded ${commandTimeoutMs}ms`
              )
            );
          }, commandTimeoutMs);
        }),
      ]);

      const commandReady = await page.evaluate(() => performance.now());
      const paint = await nextPaint(page);
      const trace = await traceSnapshot(page);
      const scrollAfter = await readScrollState(page);

      steps.push({
        commandMs: commandReady - start,
        commandReadyTime: commandReady,
        index: step,
        longAnimationFrameMaxMs: Math.max(
          0,
          ...(trace?.longAnimationFrames ?? []).map((entry) => entry.duration)
        ),
        longTaskMaxMs: Math.max(
          0,
          ...(trace?.longTasks ?? []).map((entry) => entry.duration)
        ),
        paintMs: paint - start,
        paintTime: paint,
        scrollAfter,
        scrollBefore,
        selection: await readNativeAndModelSelection(page),
        profilerSummary: summarizeProfilerEvents(trace?.profilerEvents),
        startTime: start,
        trace: {
          ...trace,
          kernelTrace: summarizeKernelTrace(trace),
        },
      });
    }
  } finally {
    await page.keyboard.up('Shift').catch(() => {});
  }

  return steps;
};

const summarizeKernelTrace = (trace) =>
  (trace?.kernelTrace ?? []).slice(-8).map((entry) => ({
    command: entry.command ?? null,
    eventFamily: entry.eventFamily ?? null,
    intent: entry.intent ?? null,
    movement: entry.movement ?? null,
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
  }));

const summarizeProfilerEvents = (events = []) => {
  const buckets = new Map();
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

  return Object.fromEntries(
    [...buckets.entries()]
      .sort(
        ([leftKey, left], [rightKey, right]) =>
          right.durationMs - left.durationMs ||
          right.count - left.count ||
          leftKey.localeCompare(rightKey)
      )
      .slice(0, 12)
  );
};

const summarizeProfilerEventSequence = (events = []) =>
  events
    .filter(
      (event) => event.kind === 'core-time' || event.kind === 'runtime-time'
    )
    .map((event) => ({
      durationMs:
        typeof event.duration === 'number' && Number.isFinite(event.duration)
          ? Math.round(event.duration * 10) / 10
          : 0,
      id: event.id ?? null,
      kind: event.kind,
    }))
    .filter((event) => event.durationMs > 0 || event.id);

const assertSelectionPoint = (selection, path, offset, context) => {
  const samePoint = (point) =>
    point &&
    point.offset === offset &&
    point.path.length === path.length &&
    point.path.every((part, index) => part === path[index]);

  if (!samePoint(selection?.anchor) || !samePoint(selection?.focus)) {
    throw new Error(
      `${context} selection mismatch: ${JSON.stringify(selection)}`
    );
  }
};

const comparePaths = (left, right) => {
  const minLength = Math.min(left.length, right.length);

  for (let index = 0; index < minLength; index += 1) {
    if (left[index] < right[index]) {
      return -1;
    }

    if (left[index] > right[index]) {
      return 1;
    }
  }

  return left.length === right.length ? 0 : left.length < right.length ? -1 : 1;
};

const comparePoints = (left, right) => {
  const pathOrder = comparePaths(left.path, right.path);

  return pathOrder === 0 ? Math.sign(left.offset - right.offset) : pathOrder;
};

const isExpandedSelection = (selection) =>
  !!selection && comparePoints(selection.anchor, selection.focus) !== 0;

const hasRenderedSelectionProof = (selection) =>
  (selection?.native?.textLength ?? 0) > 0 ||
  (selection?.viewSelection?.markerCount ?? 0) > 0 ||
  (selection?.viewSelection?.textLength ?? 0) > 0;

const getTopLevelFocusIndex = (selection) => {
  const index = selection?.model?.focus?.path?.[0];

  return typeof index === 'number' ? index : null;
};

const assertNonDecreasingFocusIndexes = ({ context, steps }) => {
  let previousIndex = null;

  for (const step of steps) {
    const index = getTopLevelFocusIndex(step.selection);

    if (index == null) {
      continue;
    }

    if (previousIndex != null && index < previousIndex) {
      throw new Error(
        `${context} moved focus backward during held Shift+ArrowDown: ${JSON.stringify(
          {
            current: { index, step: step.index },
            previousIndex,
            steps: steps.map((entry) => ({
              focus: entry.selection?.model?.focus ?? null,
              index: entry.index,
              markerCount: entry.selection?.viewSelection?.markerCount ?? null,
            })),
          }
        )}`
      );
    }

    previousIndex = index;
  }
};

const assertRenderedSelectionForExpandedSteps = ({ context, steps }) => {
  for (const step of steps) {
    if (
      isExpandedSelection(step.selection?.model) &&
      !hasRenderedSelectionProof(step.selection)
    ) {
      throw new Error(
        `${context} had an expanded model selection without visual proof during held Shift+ArrowDown: ${JSON.stringify(
          {
            focus: step.selection?.model?.focus ?? null,
            index: step.index,
            selection: step.selection,
          }
        )}`
      );
    }
  }
};

const assertProjectedSelectionContainsModelFocus = ({ context, selection }) => {
  const focusPath = selection?.model?.focus?.path;

  if (!Array.isArray(focusPath)) {
    return;
  }

  const focusPathKey = focusPath.join(',');
  const markerPaths = selection?.viewSelection?.markerPaths ?? [];

  if (
    markerPaths.length > 0 &&
    !markerPaths.some((path) => path === focusPathKey)
  ) {
    throw new Error(
      `${context} projected selection did not render the model focus path: ${JSON.stringify(
        {
          focusPath,
          markerPaths,
          selection,
        }
      )}`
    );
  }
};

const assertRepeatedShiftSelection = ({
  afterDown,
  afterPartialUp,
  before,
  context,
  downSteps,
}) => {
  if (!isExpandedSelection(afterDown.model)) {
    throw new Error(
      `${context} did not expand model selection: ${JSON.stringify(afterDown)}`
    );
  }

  if (
    typeof afterDown.model.focus.path[0] !== 'number' ||
    typeof before.model?.focus?.path?.[0] !== 'number' ||
    afterDown.model.focus.path[0] <= before.model.focus.path[0]
  ) {
    throw new Error(
      `${context} did not leave the starting block: ${JSON.stringify({
        afterDown,
        before,
      })}`
    );
  }

  if (!hasRenderedSelectionProof(afterDown)) {
    throw new Error(
      `${context} expanded only in the model, with no native or projected visual proof: ${JSON.stringify(
        afterDown
      )}`
    );
  }

  assertNonDecreasingFocusIndexes({ context, steps: downSteps });
  assertRenderedSelectionForExpandedSteps({ context, steps: downSteps });
  assertProjectedSelectionContainsModelFocus({ context, selection: afterDown });

  if (
    !afterPartialUp.model?.focus ||
    comparePoints(afterPartialUp.model.focus, afterDown.model.focus) >= 0
  ) {
    throw new Error(
      `${context} Shift+ArrowUp did not move focus back toward the anchor: ${JSON.stringify(
        {
          afterDown,
          afterPartialUp,
        }
      )}`
    );
  }
};

const selectionKey = (selection) =>
  selection
    ? `${selection.anchor.path.join(',')}:${selection.anchor.offset}>${selection.focus.path.join(',')}:${selection.focus.offset}`
    : 'null';

const nativeSelectionKey = (selection) =>
  selection?.native
    ? `${selection.native.anchorPath}:${selection.native.anchorOffset}>${selection.native.focusPath}:${selection.native.focusOffset}`
    : 'null';

const viewSelectionKey = (selection) => {
  const viewSelection = selection?.viewSelection?.selection;

  return viewSelection
    ? `${viewSelection.anchor.point.path.join(',')}:${viewSelection.anchor.point.offset}>${viewSelection.focus.point.path.join(',')}:${viewSelection.focus.point.offset}`
    : 'null';
};

const displayedSelectionKey = (selection) =>
  selection?.native?.textLength > 0
    ? nativeSelectionKey(selection)
    : viewSelectionKey(selection);

const assertRepeatedShiftDownMatchesFullDOM = ({
  context,
  fullDOMSteps,
  stagedSteps,
}) => {
  if (stagedSteps.length !== fullDOMSteps.length) {
    throw new Error(
      `${context} repeated Shift+ArrowDown parity step count mismatch: ${JSON.stringify(
        {
          fullDOMSteps: fullDOMSteps.length,
          stagedSteps: stagedSteps.length,
        }
      )}`
    );
  }

  stagedSteps.forEach((stagedStep, index) => {
    const fullDOMModelKey = selectionKey(fullDOMSteps[index]?.selection?.model);
    const stagedModelKey = selectionKey(stagedStep.selection?.model);
    const stagedDisplayKey = displayedSelectionKey(stagedStep.selection);
    const stagedNativeKey = nativeSelectionKey(stagedStep.selection);
    const stagedViewKey = viewSelectionKey(stagedStep.selection);

    if (
      (stagedStep.selection?.native?.textLength ?? 0) > 0 &&
      (stagedStep.selection?.viewSelection?.markerCount ?? 0) > 0
    ) {
      throw new Error(
        `${context} repeated Shift+ArrowDown rendered both native and projected selection at step ${index}: ${JSON.stringify(
          {
            native: stagedNativeKey,
            selection: stagedStep.selection,
            view: stagedViewKey,
          }
        )}`
      );
    }

    if (stagedModelKey !== fullDOMModelKey) {
      throw new Error(
        `${context} repeated Shift+ArrowDown target mismatch at step ${index}: ${JSON.stringify(
          {
            expected: fullDOMModelKey,
            received: stagedModelKey,
            stagedDisplay: stagedDisplayKey,
            stagedNative: stagedNativeKey,
            stagedView: stagedViewKey,
          }
        )}`
      );
    }

    if (stagedDisplayKey !== stagedModelKey) {
      throw new Error(
        `${context} repeated Shift+ArrowDown displayed/model mismatch at step ${index}: ${JSON.stringify(
          {
            displayed: stagedDisplayKey,
            model: stagedModelKey,
            native: stagedNativeKey,
            view: stagedViewKey,
          }
        )}`
      );
    }

    if (
      isExpandedSelection(stagedStep.selection?.model) &&
      stagedStep.selection?.native?.collapsed &&
      stagedDisplayKey === 'null'
    ) {
      throw new Error(
        `${context} repeated Shift+ArrowDown had no displayed selection at expanded step ${index}: ${JSON.stringify(
          stagedStep.selection
        )}`
      );
    }
  });
};

const measureRepeatedShiftDownFullDOMReference = async (page, surface) => {
  await page.goto(surface.fullPath, { waitUntil: 'networkidle' });
  await waitForEditorReady(page);
  await installTraceObserver(page);
  await waitForHugeDocumentSurface(page, {
    expectedStrategy: 'full',
    requireCompleteDOM: true,
  });
  await selectTextBlockOffsetDOM(page, 0, 3);

  return pressHeldShiftArrowWithStepTiming(
    page,
    'ArrowDown',
    repeatedShiftDownCount
  );
};

const measureVerticalSelection = async (page, surface) => {
  const blockIndex = Math.floor(blocks / 2);
  const offset = 3;
  const samples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    await page.goto(surface.path, { waitUntil: 'networkidle' });
    await waitForEditorReady(page);
    await installTraceObserver(page);
    await waitForStagedSurface(page);
    await selectTextBlockOffsetDOM(page, blockIndex, offset);

    const before = await readNativeAndModelSelection(page);
    const down = await pressWithTiming(page, 'Shift+ArrowDown');
    const afterDown = await readNativeAndModelSelection(page);
    const up = await pressWithTiming(page, 'Shift+ArrowUp');
    const afterUp = await readNativeAndModelSelection(page);

    assertSelectionPoint(
      afterUp.model,
      [blockIndex, 0],
      offset,
      `${surface.key} Shift+ArrowUp iteration ${iteration}`
    );

    if (iteration > 0) {
      samples.push({
        afterDown,
        afterUp,
        before,
        downCommandMs: down.commandMs,
        downKernelTrace: summarizeKernelTrace(down.trace),
        downLongAnimationFrameMaxMs: down.longAnimationFrameMaxMs,
        downLongTaskMaxMs: down.longTaskMaxMs,
        downPaintMs: down.paintMs,
        downProfilerSummary: summarizeProfilerEvents(
          down.trace?.profilerEvents
        ),
        upCommandMs: up.commandMs,
        upKernelTrace: summarizeKernelTrace(up.trace),
        upLongAnimationFrameMaxMs: up.longAnimationFrameMaxMs,
        upLongTaskMaxMs: up.longTaskMaxMs,
        upPaintMs: up.paintMs,
        upProfilerSummary: summarizeProfilerEvents(up.trace?.profilerEvents),
      });
    }
  }

  return samples;
};

const measureRepeatedShiftDownSelection = async (page, surface) => {
  const blockIndex = 0;
  const offset = 3;
  const samples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    await page.goto(surface.path, { waitUntil: 'networkidle' });
    await waitForEditorReady(page);
    await installTraceObserver(page);
    await waitForStagedSurface(page);
    await selectTextBlockOffsetDOM(page, blockIndex, offset);

    const before = await readNativeAndModelSelection(page);
    const downSteps = await pressHeldShiftArrowWithStepTiming(
      page,
      'ArrowDown',
      repeatedShiftDownCount
    );
    const afterDown = await readNativeAndModelSelection(page);
    const upSteps = await pressHeldShiftArrowWithStepTiming(
      page,
      'ArrowUp',
      Math.min(repeatedShiftDownCount, 8)
    );
    const afterPartialUp = await readNativeAndModelSelection(page);
    assertRepeatedShiftSelection({
      afterDown,
      afterPartialUp,
      before,
      context: `${surface.key} repeated Shift+ArrowDown iteration ${iteration}`,
      downSteps,
    });

    if (iteration > 0) {
      const downPaintMs = downSteps.map((step) => step.paintMs);
      const downCommandMs = downSteps.map((step) => step.commandMs);
      const downLongAnimationFrameMaxMs = downSteps.map(
        (step) => step.longAnimationFrameMaxMs
      );
      const downLongTaskMaxMs = downSteps.map((step) => step.longTaskMaxMs);
      const upPaintMs = upSteps.map((step) => step.paintMs);

      samples.push({
        afterDown,
        afterPartialUp,
        before,
        downCommandMs: summarize(downCommandMs),
        downLongAnimationFrameMaxMs: summarize(downLongAnimationFrameMaxMs),
        downLongTaskMaxMs: summarize(downLongTaskMaxMs),
        downPaintMs: summarize(downPaintMs),
        downSteps,
        upPaintMs: summarize(upPaintMs),
        upSteps,
      });
    }
  }

  return samples;
};

const getSelectAllHotkey = async (page) =>
  page.evaluate(() =>
    navigator.userAgent.includes('Mac OS X') ? 'Meta+A' : 'Control+A'
  );

const getUndoHotkey = async (page) =>
  page.evaluate(() =>
    navigator.userAgent.includes('Mac OS X') ? 'Meta+Z' : 'Control+Z'
  );

const waitForModelBlockTexts = async (page, predicate, context) => {
  await page
    .waitForFunction(predicate, blocks, { timeout: commandTimeoutMs })
    .catch(async (error) => {
      const counts = await readCounts(page);
      const selection = await readNativeAndModelSelection(page);

      throw new Error(
        `${context}: ${error.message}; counts=${JSON.stringify(
          counts
        )}; selection=${JSON.stringify(selection)}`
      );
    });
};

const measureSelectAllDelete = async (page, surface) => {
  const samples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    await page.goto(surface.path, { waitUntil: 'networkidle' });
    await waitForEditorReady(page);
    await installTraceObserver(page);
    await waitForStagedSurface(page);

    const selectAllHotkey = await getSelectAllHotkey(page);
    const undoHotkey = await getUndoHotkey(page);
    const beforeCounts = await readCounts(page);
    const beforeScroll = await readScrollState(page);
    const selectAll = await pressWithTiming(page, selectAllHotkey);

    await waitForModelBlockTexts(
      page,
      (expectedBlocks) => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const selection = root?.__slateBrowserHandle?.getSelection?.();
        const texts = root?.__slateBrowserHandle?.getBlockTexts?.() ?? [];
        const lastText = texts.at(-1) ?? '';

        return (
          texts.length === expectedBlocks &&
          selection?.anchor.path[0] === 0 &&
          selection.anchor.offset === 0 &&
          selection?.focus.path[0] === expectedBlocks - 1 &&
          selection.focus.offset === lastText.length
        );
      },
      `${surface.key} select-all iteration ${iteration}`
    );

    const afterSelectAll = await readNativeAndModelSelection(page);
    const deleteTiming = await pressWithTiming(page, 'Delete');

    await waitForModelBlockTexts(
      page,
      () => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const texts = root?.__slateBrowserHandle?.getBlockTexts?.() ?? [];
        const selection = root?.__slateBrowserHandle?.getSelection?.();

        return (
          texts.length === 1 &&
          texts[0] === '' &&
          selection?.anchor.path[0] === 0 &&
          selection.anchor.offset === 0 &&
          selection?.focus.path[0] === 0 &&
          selection.focus.offset === 0
        );
      },
      `${surface.key} delete iteration ${iteration}`
    );

    const deleteReady = await page.evaluate(() => performance.now());
    await page.keyboard.type('after delete', { delay: 0 });

    await waitForModelBlockTexts(
      page,
      () => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const texts = root?.__slateBrowserHandle?.getBlockTexts?.() ?? [];
        const selection = root?.__slateBrowserHandle?.getSelection?.();

        return (
          texts.length === 1 &&
          texts[0] === 'after delete' &&
          selection?.anchor.offset === 'after delete'.length &&
          selection?.focus.offset === 'after delete'.length
        );
      },
      `${surface.key} follow-up typing iteration ${iteration}`
    );

    const afterType = await readNativeAndModelSelection(page);
    const undoType = await pressWithTiming(page, undoHotkey);

    await waitForModelBlockTexts(
      page,
      () => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const texts = root?.__slateBrowserHandle?.getBlockTexts?.() ?? [];

        return texts.length === 1 && texts[0] === '';
      },
      `${surface.key} undo typing iteration ${iteration}`
    );

    const undoDelete = await pressWithTiming(page, undoHotkey);

    await waitForModelBlockTexts(
      page,
      (expectedBlocks) => {
        const root = document.querySelector('[data-slate-editor="true"]');
        const texts = root?.__slateBrowserHandle?.getBlockTexts?.() ?? [];
        const selection = root?.__slateBrowserHandle?.getSelection?.();
        const lastText = texts.at(-1) ?? '';

        return (
          texts.length === expectedBlocks &&
          selection?.anchor.path[0] === 0 &&
          selection.anchor.offset === 0 &&
          selection?.focus.path[0] === expectedBlocks - 1 &&
          selection.focus.offset === lastText.length
        );
      },
      `${surface.key} undo delete iteration ${iteration}`
    );

    const afterUndoDeleteCounts = await readCounts(page);
    const afterUndoDeleteSelection = await readNativeAndModelSelection(page);
    const afterScroll = await readScrollState(page);

    if (iteration > 0) {
      samples.push({
        afterSelectAll,
        afterScroll,
        afterType,
        afterUndoDeleteCounts,
        afterUndoDeleteSelection,
        beforeCounts,
        beforeScroll,
        deleteCommandMs: deleteTiming.commandMs,
        deleteKernelTrace: summarizeKernelTrace(deleteTiming.trace),
        deleteLongAnimationFrameMaxMs: deleteTiming.longAnimationFrameMaxMs,
        deleteLongTaskMaxMs: deleteTiming.longTaskMaxMs,
        deleteModelReadyMs: deleteReady - deleteTiming.startTime,
        deletePaintMs: deleteTiming.paintMs,
        deleteProfilerSummary: summarizeProfilerEvents(
          deleteTiming.trace?.profilerEvents
        ),
        selectAllCommandMs: selectAll.commandMs,
        selectAllKernelTrace: summarizeKernelTrace(selectAll.trace),
        selectAllLongAnimationFrameMaxMs: selectAll.longAnimationFrameMaxMs,
        selectAllLongTaskMaxMs: selectAll.longTaskMaxMs,
        selectAllPaintMs: selectAll.paintMs,
        selectAllProfilerSummary: summarizeProfilerEvents(
          selectAll.trace?.profilerEvents
        ),
        undoDeleteCommandMs: undoDelete.commandMs,
        undoDeleteKernelTrace: summarizeKernelTrace(undoDelete.trace),
        undoDeleteLongAnimationFrameMaxMs: undoDelete.longAnimationFrameMaxMs,
        undoDeleteLongTaskMaxMs: undoDelete.longTaskMaxMs,
        undoDeletePaintMs: undoDelete.paintMs,
        undoDeleteProfilerEvents: summarizeProfilerEventSequence(
          undoDelete.trace?.profilerEvents
        ),
        undoDeleteProfilerSummary: summarizeProfilerEvents(
          undoDelete.trace?.profilerEvents
        ),
        undoTypeCommandMs: undoType.commandMs,
        undoTypeKernelTrace: summarizeKernelTrace(undoType.trace),
        undoTypePaintMs: undoType.paintMs,
        undoTypeProfilerSummary: summarizeProfilerEvents(
          undoType.trace?.profilerEvents
        ),
      });
    }
  }

  return samples;
};

const summarizeMetric = (samples, key) =>
  summarize(samples.map((sample) => sample[key]).filter(Number.isFinite));

const summarizeOperationSamples = (samples, keys) =>
  Object.fromEntries(keys.map((key) => [key, summarizeMetric(samples, key)]));

const summarizeRepeatedShiftDown = (samples) => {
  const flattenMetric = (key, nestedKey) =>
    samples
      .flatMap((sample) => sample[key]?.[nestedKey] ?? [])
      .filter(Number.isFinite);

  return {
    downCommandMs: summarize(flattenMetric('downCommandMs', 'samples')),
    downLongAnimationFrameMaxMs: summarize(
      flattenMetric('downLongAnimationFrameMaxMs', 'samples')
    ),
    downLongTaskMaxMs: summarize(flattenMetric('downLongTaskMaxMs', 'samples')),
    downPaintMs: summarize(flattenMetric('downPaintMs', 'samples')),
    upPaintMs: summarize(flattenMetric('upPaintMs', 'samples')),
  };
};

const summarizeSurface = ({
  repeatedShiftDownSamples,
  selectAllDeleteSamples,
  verticalSamples,
}) => ({
  repeatedShiftDown: summarizeRepeatedShiftDown(repeatedShiftDownSamples),
  selectAllDelete: summarizeOperationSamples(selectAllDeleteSamples, [
    'deleteCommandMs',
    'deleteLongAnimationFrameMaxMs',
    'deleteLongTaskMaxMs',
    'deletePaintMs',
    'selectAllCommandMs',
    'selectAllLongAnimationFrameMaxMs',
    'selectAllLongTaskMaxMs',
    'selectAllPaintMs',
    'undoDeleteCommandMs',
    'undoDeleteLongAnimationFrameMaxMs',
    'undoDeleteLongTaskMaxMs',
    'undoDeletePaintMs',
    'undoTypeCommandMs',
    'undoTypePaintMs',
  ]),
  verticalSelection: summarizeOperationSamples(verticalSamples, [
    'downCommandMs',
    'downLongAnimationFrameMaxMs',
    'downLongTaskMaxMs',
    'downPaintMs',
    'upCommandMs',
    'upLongAnimationFrameMaxMs',
    'upLongTaskMaxMs',
    'upPaintMs',
  ]),
});

const printSurface = (surfaceKey, surfaceSummary) => {
  console.log(`\n${surfaceKey}`);

  const vertical = surfaceSummary.verticalSelection;
  const repeatedShiftDown = surfaceSummary.repeatedShiftDown;
  const selectAllDelete = surfaceSummary.selectAllDelete;

  console.log(
    `vertical: shiftDownPaint p95=${round(
      vertical.downPaintMs.p95
    )}, shiftDownCommand p95=${round(
      vertical.downCommandMs.p95
    )}, shiftUpPaint p95=${round(vertical.upPaintMs.p95)}, shiftUpCommand p95=${round(
      vertical.upCommandMs.p95
    )}, shiftDownLongTask p95=${round(
      vertical.downLongTaskMaxMs.p95
    )}, shiftUpLongTask p95=${round(vertical.upLongTaskMaxMs.p95)}`
  );
  console.log(
    `repeated-shift-down: paint p95=${round(
      repeatedShiftDown.downPaintMs.p95
    )}, command p95=${round(
      repeatedShiftDown.downCommandMs.p95
    )}, longFrame p95=${round(
      repeatedShiftDown.downLongAnimationFrameMaxMs.p95
    )}, longTask p95=${round(repeatedShiftDown.downLongTaskMaxMs.p95)}`
  );
  console.log(
    `select-all-delete: selectAllPaint p95=${round(
      selectAllDelete.selectAllPaintMs.p95
    )}, deletePaint p95=${round(
      selectAllDelete.deletePaintMs.p95
    )}, undoDeletePaint p95=${round(
      selectAllDelete.undoDeletePaintMs.p95
    )}, deleteLongTask p95=${round(
      selectAllDelete.deleteLongTaskMaxMs.p95
    )}, undoDeleteLongTask p95=${round(
      selectAllDelete.undoDeleteLongTaskMaxMs.p95
    )}`
  );

  console.log(
    `METRIC react_huge_doc_${surfaceKey}_shift_down_paint_p95_ms=${round(
      vertical.downPaintMs.p95
    )}`
  );
  console.log(
    `METRIC react_huge_doc_${surfaceKey}_shift_up_paint_p95_ms=${round(
      vertical.upPaintMs.p95
    )}`
  );
  console.log(
    `METRIC react_huge_doc_${surfaceKey}_repeated_shift_down_paint_p95_ms=${round(
      repeatedShiftDown.downPaintMs.p95
    )}`
  );
  console.log(
    `METRIC react_huge_doc_${surfaceKey}_repeated_shift_down_long_frame_p95_ms=${round(
      repeatedShiftDown.downLongAnimationFrameMaxMs.p95
    )}`
  );
  console.log(
    `METRIC react_huge_doc_${surfaceKey}_select_all_paint_p95_ms=${round(
      selectAllDelete.selectAllPaintMs.p95
    )}`
  );
  console.log(
    `METRIC react_huge_doc_${surfaceKey}_delete_paint_p95_ms=${round(
      selectAllDelete.deletePaintMs.p95
    )}`
  );
  console.log(
    `METRIC react_huge_doc_${surfaceKey}_undo_delete_paint_p95_ms=${round(
      selectAllDelete.undoDeletePaintMs.p95
    )}`
  );
  console.log(
    `METRIC react_huge_doc_${surfaceKey}_delete_long_task_p95_ms=${round(
      selectAllDelete.deleteLongTaskMaxMs.p95
    )}`
  );
};

const run = async () => {
  if (surfaces.length === 0) {
    throw new Error(
      'SLATE_STAGED_COMMANDS_SURFACES selected no known surfaces'
    );
  }

  await buildSite();

  const server = baseUrl ? null : await startStaticServer();
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
        commandTimeoutMs,
        assertFullDOMShiftDownParity,
        baseUrl: baseUrl ?? null,
        headless,
        iterations,
        requireFullDOMSurface,
        repeatedShiftDownCount,
        viewport:
          viewportHeight && viewportWidth
            ? { height: viewportHeight, width: viewportWidth }
            : null,
      },
      surfaces: {},
    };

    for (const surface of surfaces) {
      const context = await browser.newContext(
        viewportHeight && viewportWidth
          ? {
              viewport: {
                height: viewportHeight,
                width: viewportWidth,
              },
            }
          : undefined
      );
      const page = await context.newPage();

      try {
        const surfaceWithUrl = {
          ...surface,
          fullPath: `${baseUrl ?? server.url}${surface.fullPath}`,
          path: `${baseUrl ?? server.url}${surface.path}`,
        };
        const repeatedShiftDownFullDOMReference = assertFullDOMShiftDownParity
          ? await measureRepeatedShiftDownFullDOMReference(page, surfaceWithUrl)
          : null;
        const repeatedShiftDownSamples =
          await measureRepeatedShiftDownSelection(page, surfaceWithUrl);

        if (repeatedShiftDownFullDOMReference) {
          repeatedShiftDownSamples.forEach((sample, index) => {
            assertRepeatedShiftDownMatchesFullDOM({
              context: `${surface.key} iteration ${index + 1}`,
              fullDOMSteps: repeatedShiftDownFullDOMReference,
              stagedSteps: sample.downSteps,
            });
          });
        }

        const verticalSamples = await measureVerticalSelection(
          page,
          surfaceWithUrl
        );
        const selectAllDeleteSamples = await measureSelectAllDelete(
          page,
          surfaceWithUrl
        );

        summary.surfaces[surface.key] = {
          label: surface.label,
          path: surface.path,
          raw: {
            repeatedShiftDownFullDOMReference:
              repeatedShiftDownFullDOMReference ?? undefined,
            repeatedShiftDownSamples,
            selectAllDeleteSamples,
            verticalSamples,
          },
          summary: summarizeSurface({
            repeatedShiftDownSamples,
            selectAllDeleteSamples,
            verticalSamples,
          }),
        };
        printSurface(surface.key, summary.surfaces[surface.key].summary);
      } finally {
        await context.close();
      }
    }

    await writeBenchmarkArtifact(latestArtifactPath, summary);
    await writeBenchmarkArtifact(runArtifactPath, summary);

    console.log(`\nWrote ${runArtifactPath}`);
  } finally {
    await browser.close();
    await server?.close();
  }
};

await run();
