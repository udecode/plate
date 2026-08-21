import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import puppeteer from 'puppeteer';

type ProbeRow = {
  beforeinput?: number;
  blockCountAfter?: number;
  blockCountBefore?: number;
  commitAfter?: number | null;
  commitBefore?: number | null;
  domSync: string | null;
  domSyncReason: string | null;
  domSelectionAfter?: unknown;
  focusPreservedAfter?: boolean;
  headingTextAfter?: string | null;
  key: string;
  keydown: number;
  input?: number;
  inputType?: string;
  inputTrusted?: boolean;
  keydownTrusted?: boolean;
  modelSelectionAfter?: unknown;
  mutation?: number;
  nativeSelectedTextAfter?: string;
  raf1?: number;
  raf2?: number;
  projectedDomSync: string | null;
  tableCountAfter?: number;
  tableCountBefore?: number;
  textBefore: string;
};

type ProbeAction = 'enter' | 'type';

type ProbeWindow = Window & {
  __homepageInputProbe?: {
    commandBlockers: string[];
    longTasks: Array<{ duration: number; startTime: number }>;
    longTaskObserver?: PerformanceObserver;
    measurementEnd?: number | null;
    measurementStart?: number | null;
    profileDurations: Record<string, number>;
    renderCounts: Record<string, number>;
    selectorCounts: Record<string, number>;
    nativeBlockers: string[];
    rows: ProbeRow[];
  };
  __PLITE_REACT_RENDER_PROFILER__?: {
    record: (event: {
      duration?: number;
      id?: string | null;
      kind: string;
      nodeKey?: string;
    }) => void;
  };
};

const getArg = (name: string) => {
  const index = process.argv.indexOf(`--${name}`);

  return index === -1 ? undefined : process.argv[index + 1];
};

const hasArg = (name: string) => process.argv.includes(`--${name}`);

const action = (getArg('action') ?? 'type') as ProbeAction;

if (action !== 'enter' && action !== 'type') {
  throw new Error(`Unknown homepage input action: ${action}`);
}

const percentile = (samples: number[], percentile: number) => {
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)] ?? 0;
};

const summarize = (samples: number[]) => ({
  max: Math.max(...samples),
  mean: samples.reduce((sum, sample) => sum + sample, 0) / samples.length,
  p50: percentile(samples, 50),
  p75: percentile(samples, 75),
  p95: percentile(samples, 95),
  ...(samples.length >= 100 ? { p99: percentile(samples, 99) } : {}),
  samples,
});

const url = getArg('url') ?? 'http://localhost:3000/blocks/playground';
const maxMutationP95 = Number(getArg('max-mutation-p95') ?? 16);
const maxSecondPaintP95 = Number(getArg('max-second-paint-p95') ?? 32);
const maxLongTasks = Number(getArg('max-long-tasks') ?? 0);
const settleMs = Number(getArg('settle-ms') ?? 2500);
const diagnose = hasArg('diagnose');
const enterTargetSelector = getArg('target-selector') ?? 'h1';
const enterTargetText =
  getArg('target-text') ?? 'Welcome to the Plate Playground!';
const requireBrowserHandle = hasArg('require-browser-handle');
const out = getArg('out');
const warmupSamples = 5;
const measuredSamples = 20;
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
  await page.waitForSelector('[contenteditable="true"][role="textbox"]', {
    timeout: 120_000,
  });
  await new Promise((resolve) => {
    setTimeout(resolve, settleMs);
  });

  const targetIdentity = await page.evaluate(
    ({ action, enterTargetSelector, enterTargetText }) => {
      const root = document.querySelector(
        '[contenteditable="true"][role="textbox"]'
      );
      const target =
        action === 'enter'
          ? [...(root?.querySelectorAll(enterTargetSelector) ?? [])].find(
              (element) => element.textContent?.includes(enterTargetText)
            )
          : [...(root?.querySelectorAll('[data-plite-path]') ?? [])].find(
              (element) => {
                const path = element.getAttribute('data-plite-path');
                const isTopLevelPath =
                  !!path &&
                  Array.from(path).every(
                    (character) => character >= '0' && character <= '9'
                  );

                return (
                  isTopLevelPath && (element.textContent?.length ?? 0) > 30
                );
              }
            );

      return target
        ? {
            path: target.getAttribute('data-plite-path'),
            selector: action === 'enter' ? enterTargetSelector : null,
            text: target.textContent ?? '',
          }
        : null;
    },
    { action, enterTargetSelector, enterTargetText }
  );

  if (!targetIdentity || (action === 'type' && !targetIdentity.path)) {
    throw new Error(`Homepage ${action} benchmark could not find its target.`);
  }

  await page.evaluate(
    ({ targetIdentity }) => {
      const root = document.querySelector(
        '[contenteditable="true"][role="textbox"]'
      );
      const target = targetIdentity.path
        ? root?.querySelector(
            `[data-plite-path="${CSS.escape(targetIdentity.path)}"]`
          )
        : [
            ...(root?.querySelectorAll(targetIdentity.selector ?? '*') ?? []),
          ].find((element) => element.textContent === targetIdentity.text);

      if (!(root instanceof HTMLElement) || !(target instanceof HTMLElement)) {
        throw new Error(
          'Homepage editor target disappeared before caret setup.'
        );
      }
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      let current: Node | null = null;
      let lastText: Text | null = null;

      while ((current = walker.nextNode())) {
        if (current instanceof Text) lastText = current;
      }
      if (!lastText) {
        throw new Error('Homepage editor target has no text node.');
      }

      root.focus();
      const range = document.createRange();
      const selection = window.getSelection();

      range.setStart(lastText, lastText.data.length);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));
    },
    { targetIdentity }
  );
  await page.evaluate(
    ({ action, diagnose, targetIdentity }) => {
      const probeWindow = window as ProbeWindow;
      const root = document.querySelector(
        '[contenteditable="true"][role="textbox"]'
      );

      if (!root) throw new Error('Homepage editor is not mounted.');
      const targetSelector = targetIdentity.path
        ? `[data-plite-path="${CSS.escape(targetIdentity.path)}"]`
        : (targetIdentity.selector ?? '*');

      probeWindow.__homepageInputProbe = {
        commandBlockers: [],
        longTasks: [],
        nativeBlockers: [],
        profileDurations: {},
        renderCounts: {},
        selectorCounts: {},
        rows: [],
      };
      if (diagnose) {
        probeWindow.__PLITE_REACT_RENDER_PROFILER__ = {
          record(event) {
            if (
              ![
                'core-time',
                'dom-text-sync',
                'runtime-time',
                'selector',
              ].includes(event.kind)
            ) {
              const renderKey = `${event.kind}:${event.nodeKey ?? event.id ?? 'anonymous'}`;

              probeWindow.__homepageInputProbe!.renderCounts[renderKey] =
                (probeWindow.__homepageInputProbe!.renderCounts[renderKey] ??
                  0) + 1;
            }
            if (event.kind === 'selector') {
              const selectorKey = `${event.id ?? 'anonymous'}:${event.nodeKey ?? 'global'}`;

              probeWindow.__homepageInputProbe!.selectorCounts[selectorKey] =
                (probeWindow.__homepageInputProbe!.selectorCounts[
                  selectorKey
                ] ?? 0) + 1;
            }
            if (event.duration !== undefined) {
              const key = `${event.kind}:${event.id ?? 'anonymous'}`;

              probeWindow.__homepageInputProbe!.profileDurations[key] =
                (probeWindow.__homepageInputProbe!.profileDurations[key] ?? 0) +
                event.duration;
            }
            if (
              event.kind === 'runtime-time' &&
              event.id?.startsWith('beforeinput-command-material:')
            ) {
              probeWindow.__homepageInputProbe!.commandBlockers.push(event.id);
            }
            if (
              event.kind === 'runtime-time' &&
              (event.id?.startsWith('beforeinput-native-demoted:') ||
                event.id?.startsWith('beforeinput-native-blocked:'))
            ) {
              probeWindow.__homepageInputProbe!.nativeBlockers.push(event.id);
            }
          },
        };
      }
      if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            probeWindow.__homepageInputProbe!.longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
            });
          });
        });

        probeWindow.__homepageInputProbe.longTaskObserver = longTaskObserver;
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      }
      document.addEventListener(
        'keydown',
        (event) => {
          const matchesAction =
            action === 'enter' ? event.key === 'Enter' : event.key.length === 1;

          if (!matchesAction || !root.contains(event.target as Node)) {
            return;
          }

          const target = root.querySelector(targetSelector);
          const textHost = target?.querySelector('[data-plite-node="text"]');
          const handle = (
            root as HTMLElement & {
              __pliteBrowserHandle?: {
                getLastCommit: () => { version?: number } | null;
              };
            }
          ).__pliteBrowserHandle;
          const row: ProbeRow = {
            blockCountBefore: root.childElementCount,
            commitBefore: handle?.getLastCommit()?.version ?? null,
            domSync: textHost?.getAttribute('data-plite-dom-sync') ?? null,
            domSyncReason:
              textHost?.getAttribute('data-plite-dom-sync-reason') ?? null,
            key: event.key,
            keydown: performance.now(),
            keydownTrusted: event.isTrusted,
            projectedDomSync:
              textHost?.getAttribute('data-plite-projected-dom-sync') ?? null,
            tableCountBefore: root.querySelectorAll('table').length,
            textBefore: target?.textContent ?? '',
          };

          probeWindow.__homepageInputProbe!.rows.push(row);
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
        (event) => {
          const row = probeWindow.__homepageInputProbe!.rows.at(-1);

          if (row && row.beforeinput === undefined) {
            row.beforeinput = performance.now();
            row.inputType = (event as InputEvent).inputType;
          }
        },
        true
      );
      document.addEventListener(
        'input',
        (event) => {
          const row = probeWindow.__homepageInputProbe!.rows.at(-1);

          if (row && row.input === undefined) {
            row.input = performance.now();
            row.inputTrusted = event.isTrusted;
          }
        },
        true
      );
      new MutationObserver(() => {
        const row = probeWindow.__homepageInputProbe!.rows.at(-1);
        const target = root.querySelector(targetSelector);
        const actionCompleted =
          action === 'enter'
            ? root.childElementCount > (row?.blockCountBefore ?? 0)
            : target?.textContent === `${row?.textBefore}${row?.key}`;

        if (row && row.mutation === undefined && actionCompleted) {
          row.mutation = performance.now();
        }
      }).observe(root, {
        characterData: true,
        childList: true,
        subtree: true,
      });
    },
    { action, diagnose, targetIdentity }
  );

  let measuredInput = '';
  let measuredStartState: {
    commitVersion: number | null;
    modelSelection: unknown;
    modelText: string | null;
  } | null = null;

  const browserHandleAvailable = await page.evaluate(() => {
    const root = document.querySelector(
      '[contenteditable="true"][role="textbox"]'
    ) as (HTMLElement & { __pliteBrowserHandle?: unknown }) | null;

    return !!root?.__pliteBrowserHandle;
  });

  if (requireBrowserHandle && !browserHandleAvailable) {
    throw new Error(
      'Homepage input benchmark requires a Plite browser handle.'
    );
  }

  for (
    let sampleIndex = 0;
    sampleIndex < warmupSamples + measuredSamples;
    sampleIndex++
  ) {
    if (sampleIndex === warmupSamples) {
      measuredStartState = await page.evaluate((targetPath) => {
        const root = document.querySelector(
          '[contenteditable="true"][role="textbox"]'
        ) as
          | (HTMLElement & {
              __pliteBrowserHandle?: {
                getBlockText: (index: number) => string | null;
                getLastCommit: () => { version?: number } | null;
                getSelection: () => unknown;
              };
            })
          | null;

        const handle = root?.__pliteBrowserHandle;
        const targetIndex = Number.parseInt(targetPath ?? '', 10);

        return {
          commitVersion: handle?.getLastCommit()?.version ?? null,
          modelSelection: handle?.getSelection() ?? null,
          modelText: Number.isFinite(targetIndex)
            ? (handle?.getBlockText(targetIndex) ?? null)
            : null,
        };
      }, targetIdentity.path);
      await page.evaluate(() => {
        const probe = (window as ProbeWindow).__homepageInputProbe!;

        probe.longTaskObserver?.takeRecords();
        probe.longTasks = [];
        probe.measurementEnd = null;
        probe.measurementStart = performance.now();
      });
    }
    const char =
      action === 'enter'
        ? 'Enter'
        : String.fromCharCode(97 + (sampleIndex % 26));

    if (sampleIndex >= warmupSamples && action === 'type') {
      measuredInput += char;
    }

    if (action === 'enter') {
      await page.keyboard.press('Enter');
    } else {
      await page.keyboard.type(char);
    }
    try {
      await page.waitForFunction(
        ({ action, expectedRows, targetIdentity }) => {
          const rows = (window as ProbeWindow).__homepageInputProbe?.rows;
          const row = rows?.[expectedRows - 1];
          const root = document.querySelector(
            '[contenteditable="true"][role="textbox"]'
          );
          const target = targetIdentity.path
            ? root?.querySelector(
                `[data-plite-path="${CSS.escape(targetIdentity.path)}"]`
              )
            : [
                ...(root?.querySelectorAll(targetIdentity.selector ?? '*') ??
                  []),
              ].find((element) => element.textContent === targetIdentity.text);
          const actionCompleted =
            action === 'enter'
              ? (root?.childElementCount ?? 0) > (row?.blockCountBefore ?? 0)
              : target?.textContent === `${row?.textBefore}${row?.key}`;

          return (
            row !== undefined &&
            rows?.length === expectedRows &&
            Number.isFinite(row?.mutation) &&
            Number.isFinite(row?.raf2) &&
            actionCompleted
          );
        },
        { timeout: 5000 },
        { action, expectedRows: sampleIndex + 1, targetIdentity }
      );
    } catch (error) {
      const diagnostic = await page.evaluate(() => {
        const root = document.querySelector(
          '[contenteditable="true"][role="textbox"]'
        );
        const rows = (window as ProbeWindow).__homepageInputProbe?.rows;

        return {
          activeElement: document.activeElement?.className,
          blockCount: root?.childElementCount ?? null,
          lastRow: rows?.at(-1) ?? null,
          rowCount: rows?.length ?? 0,
        };
      });

      throw new Error(
        `Homepage ${action} action did not reach its DOM/paint oracle: ${JSON.stringify(diagnostic)}`,
        { cause: error }
      );
    }

    if (action === 'enter') {
      await page.evaluate((targetSelector) => {
        const root = document.querySelector(
          '[contenteditable="true"][role="textbox"]'
        ) as
          | (HTMLElement & {
              __pliteBrowserHandle?: {
                getDOMSelection: () => unknown;
                getLastCommit: () => { version?: number } | null;
                getSelection: () => unknown;
              };
            })
          | null;
        const row = (window as ProbeWindow).__homepageInputProbe?.rows.at(-1);
        const handle = root?.__pliteBrowserHandle;

        if (!root || !row) return;

        row.blockCountAfter = root.childElementCount;
        row.commitAfter = handle?.getLastCommit()?.version ?? null;
        row.domSelectionAfter = handle?.getDOMSelection() ?? null;
        row.focusPreservedAfter = root.contains(document.activeElement);
        row.headingTextAfter =
          root.querySelector(targetSelector)?.textContent ?? null;
        row.modelSelectionAfter = handle?.getSelection() ?? null;
        row.nativeSelectedTextAfter = window.getSelection()?.toString() ?? '';
        row.tableCountAfter = root.querySelectorAll('table').length;
      }, targetIdentity.selector ?? 'h1');

      await page.keyboard.down('Meta');
      await page.keyboard.press('z');
      await page.keyboard.up('Meta');
      await page.waitForFunction(
        ({ expectedRows, targetSelector, targetText }) => {
          const root = document.querySelector(
            '[contenteditable="true"][role="textbox"]'
          );
          const row = (window as ProbeWindow).__homepageInputProbe?.rows[
            expectedRows - 1
          ];

          return (
            row?.blockCountAfter !== undefined &&
            (root?.childElementCount ?? row.blockCountAfter) <
              row.blockCountAfter &&
            [...(root?.querySelectorAll(targetSelector) ?? [])].some(
              (element) => element.textContent === targetText
            )
          );
        },
        { timeout: 5000 },
        {
          expectedRows: sampleIndex + 1,
          targetSelector: targetIdentity.selector ?? 'h1',
          targetText: targetIdentity.text,
        }
      );
      await page.evaluate(
        ({ targetSelector, targetText }) => {
          const root = document.querySelector(
            '[contenteditable="true"][role="textbox"]'
          );
          const target = [
            ...(root?.querySelectorAll(targetSelector) ?? []),
          ].find((element) => element.textContent === targetText);

          if (
            !(root instanceof HTMLElement) ||
            !(target instanceof HTMLElement)
          ) {
            throw new Error('Homepage heading disappeared during Enter reset.');
          }
          const walker = document.createTreeWalker(
            target,
            NodeFilter.SHOW_TEXT
          );
          let current: Node | null = null;
          let lastText: Text | null = null;

          while ((current = walker.nextNode())) {
            if (current instanceof Text) lastText = current;
          }
          if (!lastText) {
            throw new Error('Homepage heading has no reset text node.');
          }

          root.focus();
          const range = document.createRange();
          const selection = window.getSelection();

          range.setStart(lastText, lastText.data.length);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
          document.dispatchEvent(new Event('selectionchange'));
        },
        {
          targetSelector: targetIdentity.selector ?? 'h1',
          targetText: targetIdentity.text,
        }
      );
    }
  }

  const probe = await page.evaluate(
    ({ targetIdentity }) => {
      const probeWindow = window as ProbeWindow;
      const root = document.querySelector(
        '[contenteditable="true"][role="textbox"]'
      ) as
        | (HTMLElement & {
            __pliteBrowserHandle?: {
              getBlockText: (index: number) => string | null;
              getDOMSelection: () => unknown;
              getInputState: () => unknown;
              getLastCommit: () => { version?: number } | null;
              getSelection: () => unknown;
            };
          })
        | null;
      const handle = root?.__pliteBrowserHandle;
      const targetIndex = Number.parseInt(targetIdentity.path ?? '', 10);
      const liveProbe = probeWindow.__homepageInputProbe!;

      liveProbe.longTaskObserver?.takeRecords().forEach((entry) => {
        liveProbe.longTasks.push({
          duration: entry.duration,
          startTime: entry.startTime,
        });
      });
      liveProbe.measurementEnd = performance.now();
      const measuredLongTasks = liveProbe.longTasks.filter(
        (entry) =>
          liveProbe.measurementStart != null &&
          liveProbe.measurementEnd != null &&
          entry.startTime >= liveProbe.measurementStart &&
          entry.startTime < liveProbe.measurementEnd
      );
      const { longTaskObserver: _longTaskObserver, ...serializableProbe } =
        liveProbe;

      return {
        ...serializableProbe,
        domSelection: handle?.getDOMSelection() ?? null,
        focusPreserved: root?.contains(document.activeElement) ?? false,
        finalCommitVersion: handle?.getLastCommit()?.version ?? null,
        finalText: targetIdentity.path
          ? document.querySelector(
              `[data-plite-path="${CSS.escape(targetIdentity.path)}"]`
            )?.textContent
          : [
              ...(root?.querySelectorAll(targetIdentity.selector ?? '*') ?? []),
            ].find((element) => element.textContent === targetIdentity.text)
              ?.textContent,
        inputState: handle?.getInputState() ?? null,
        longTasks: measuredLongTasks,
        modelSelection: handle?.getSelection() ?? null,
        modelText: Number.isFinite(targetIndex)
          ? (handle?.getBlockText(targetIndex) ?? null)
          : null,
        nativeSelectedText: window.getSelection()?.toString() ?? '',
      };
    },
    { targetIdentity }
  );
  const rows = probe.rows;
  const measuredRows = rows.slice(warmupSamples);

  if (measuredRows.length !== measuredSamples) {
    throw new Error(
      `Homepage native-input gate expected ${measuredSamples} measured rows, received ${measuredRows.length}.`
    );
  }
  for (const [index, row] of measuredRows.entries()) {
    const requiredFields =
      action === 'enter'
        ? (['keydown', 'mutation', 'raf1', 'raf2'] as const)
        : ([
            'keydown',
            'beforeinput',
            'input',
            'mutation',
            'raf1',
            'raf2',
          ] as const);

    for (const field of requiredFields) {
      if (!Number.isFinite(row[field])) {
        throw new Error(
          `Homepage native-input gate row ${index + 1} is missing finite ${field} timing.`
        );
      }
    }
  }
  const beforeInput =
    action === 'type'
      ? summarize(measuredRows.map((row) => row.beforeinput! - row.keydown))
      : null;
  const inputMutation =
    action === 'type'
      ? summarize(measuredRows.map((row) => row.mutation! - row.beforeinput!))
      : null;
  const firstPaint = summarize(
    measuredRows.map((row) => row.raf1! - row.keydown)
  );
  const mutation = summarize(
    measuredRows.map((row) => row.mutation! - row.keydown)
  );
  const secondPaint = summarize(
    measuredRows.map((row) => row.raf2! - row.keydown)
  );
  const measuredLongTasks =
    action === 'enter'
      ? probe.longTasks.filter((entry) =>
          measuredRows.some(
            (row) =>
              Number.isFinite(row.raf2) &&
              entry.startTime >= row.keydown &&
              entry.startTime < row.raf2!
          )
        )
      : probe.longTasks;
  const ignoredHostErrors = runtimeErrors.filter(
    (error) =>
      error.url === 'http://localhost:3000/site.webmanifest' &&
      new URL(url).port !== '3000'
  );
  const actionableRuntimeErrors = runtimeErrors.filter(
    (error) => !ignoredHostErrors.includes(error)
  );
  const result = {
    action,
    browserHandleAvailable,
    budget: { maxLongTasks, maxMutationP95, maxSecondPaintP95 },
    commandBlockers: [...new Set(probe.commandBlockers)],
    commitDelta:
      action === 'enter'
        ? measuredRows.reduce(
            (total, row) =>
              total +
              (row.commitBefore == null || row.commitAfter == null
                ? 0
                : row.commitAfter - row.commitBefore),
            0
          )
        : measuredStartState?.commitVersion == null ||
            probe.finalCommitVersion == null
          ? null
          : probe.finalCommitVersion - measuredStartState.commitVersion,
    diagnose,
    domSelection: probe.domSelection,
    beforeInput,
    finalText: probe.finalText,
    focusPreserved: probe.focusPreserved,
    firstPaint,
    inputMutation,
    inputState: probe.inputState,
    ignoredHostErrors,
    longTasks: {
      count: measuredLongTasks.length,
      max: Math.max(0, ...measuredLongTasks.map((entry) => entry.duration)),
      samples: measuredLongTasks,
    },
    nativeBlockers: [...new Set(probe.nativeBlockers)],
    profileDurations: Object.fromEntries(
      Object.entries(probe.profileDurations)
        .sort(([, left], [, right]) => right - left)
        .slice(0, 30)
    ),
    renderCounts: Object.fromEntries(
      Object.entries(probe.renderCounts)
        .sort(([, left], [, right]) => right - left)
        .slice(0, 50)
    ),
    selectorCounts: Object.fromEntries(
      Object.entries(probe.selectorCounts)
        .sort(([, left], [, right]) => right - left)
        .slice(0, 100)
    ),
    syncStates: measuredRows.map((row) => ({
      domSync: row.domSync,
      projected: row.projectedDomSync,
      reason: row.domSyncReason,
    })),
    measuredSamples,
    measuredInput,
    measuredStartState,
    ...(action === 'enter'
      ? {
          enterSamples: measuredRows.map((row) => ({
            beforeinput: row.beforeinput,
            blockCountAfter: row.blockCountAfter,
            blockCountBefore: row.blockCountBefore,
            commitAfter: row.commitAfter,
            commitBefore: row.commitBefore,
            domSelectionAfter: row.domSelectionAfter,
            focusPreservedAfter: row.focusPreservedAfter,
            headingTextAfter: row.headingTextAfter,
            inputType: row.inputType,
            input: row.input,
            keydownTrusted: row.keydownTrusted,
            modelSelectionAfter: row.modelSelectionAfter,
            nativeSelectedTextAfter: row.nativeSelectedTextAfter,
            tableCountAfter: row.tableCountAfter,
            tableCountBefore: row.tableCountBefore,
          })),
        }
      : {}),
    mutation,
    nativeInputSamples: measuredRows.filter(
      (row) => row.input !== undefined && row.inputTrusted
    ).length,
    trustedActionSamples: measuredRows.filter((row) => row.keydownTrusted)
      .length,
    modelSelection: probe.modelSelection,
    modelText: probe.modelText,
    nativeSelectedText: probe.nativeSelectedText,
    runtimeErrors: actionableRuntimeErrors,
    secondPaint,
    targetPath: targetIdentity.path,
    targetText: targetIdentity.text,
    url,
    warmupSamples,
  };

  const serializedResult = `${JSON.stringify(result, null, 2)}\n`;

  console.log(serializedResult.trimEnd());

  const comparableSelection = (selection: unknown) => {
    if (typeof selection !== 'object' || selection === null) return selection;
    const record = selection as Record<string, unknown>;
    const comparablePoint = (point: unknown) => {
      if (typeof point !== 'object' || point === null) return point;
      const pointRecord = point as Record<string, unknown>;

      return {
        offset: pointRecord.offset,
        path: pointRecord.path,
      };
    };

    return {
      anchor: comparablePoint(record.anchor),
      focus: comparablePoint(record.focus),
    };
  };
  const failures = [
    mutation.p95 > maxMutationP95
      ? `mutation p95 ${mutation.p95.toFixed(1)} ms exceeds ${maxMutationP95} ms`
      : null,
    secondPaint.p95 > maxSecondPaintP95
      ? `second-paint p95 ${secondPaint.p95.toFixed(1)} ms exceeds ${maxSecondPaintP95} ms`
      : null,
    result.longTasks.count > maxLongTasks
      ? `${result.longTasks.count} long tasks exceeds ${maxLongTasks}`
      : null,
    !probe.focusPreserved ? 'editor focus was not preserved' : null,
    browserHandleAvailable && result.commitDelta !== measuredSamples
      ? `expected ${measuredSamples} measured commits, received ${String(result.commitDelta)}`
      : null,
    action === 'type' && result.nativeInputSamples !== measuredSamples
      ? `expected ${measuredSamples} trusted native input events, received ${result.nativeInputSamples}`
      : null,
    result.trustedActionSamples !== measuredSamples
      ? `expected ${measuredSamples} trusted keydown actions, received ${result.trustedActionSamples}`
      : null,
    action === 'type' &&
    browserHandleAvailable &&
    result.syncStates.some(
      ({ domSync, projected, reason }) =>
        domSync !== 'true' || projected !== null || reason !== null
    )
      ? 'measured input used an unsynchronized or projected text host'
      : null,
    browserHandleAvailable && probe.modelText !== probe.finalText
      ? 'model text does not match rendered text'
      : null,
    browserHandleAvailable &&
    JSON.stringify(comparableSelection(probe.modelSelection)) !==
      JSON.stringify(comparableSelection(probe.domSelection))
      ? 'model and DOM selections differ'
      : null,
    probe.nativeSelectedText !== ''
      ? `native selection is unexpectedly expanded: ${JSON.stringify(probe.nativeSelectedText)}`
      : null,
    actionableRuntimeErrors.length > 0
      ? `${actionableRuntimeErrors.length} runtime errors were recorded`
      : null,
  ].filter(Boolean);

  const measuredStartSelection = comparableSelection(
    measuredStartState?.modelSelection
  ) as {
    anchor?: { offset?: number; path?: unknown };
    focus?: { offset?: number; path?: unknown };
  } | null;
  const measuredStartAnchor = measuredStartSelection?.anchor;
  const measuredStartFocus = measuredStartSelection?.focus;
  const measuredStartText = measuredStartState?.modelText;
  const measuredStartIsCollapsed =
    JSON.stringify(measuredStartAnchor) === JSON.stringify(measuredStartFocus);
  const measuredStartOffset = measuredStartAnchor?.offset;
  const expectedFinalText =
    typeof measuredStartText === 'string' &&
    typeof measuredStartOffset === 'number'
      ? `${measuredStartText.slice(0, measuredStartOffset)}${measuredInput}${measuredStartText.slice(measuredStartOffset)}`
      : null;
  const expectedFinalSelection =
    measuredStartAnchor && typeof measuredStartOffset === 'number'
      ? {
          anchor: {
            offset: measuredStartOffset + measuredInput.length,
            path: measuredStartAnchor.path,
          },
          focus: {
            offset: measuredStartOffset + measuredInput.length,
            path: measuredStartAnchor.path,
          },
        }
      : null;
  const exactFailures =
    action === 'enter'
      ? measuredRows.flatMap((row, index) => {
          const modelSelection = comparableSelection(
            row.modelSelectionAfter
          ) as { anchor?: unknown; focus?: unknown } | null;
          const domSelection = comparableSelection(row.domSelectionAfter) as {
            anchor?: unknown;
            focus?: unknown;
          } | null;
          const modelIsCollapsed =
            JSON.stringify(modelSelection?.anchor) ===
            JSON.stringify(modelSelection?.focus);

          return [
            (row.blockCountAfter ?? 0) <= (row.blockCountBefore ?? 0)
              ? `Enter row ${index + 1} did not insert a block`
              : null,
            row.tableCountAfter !== row.tableCountBefore
              ? `Enter row ${index + 1} changed the rendered table count`
              : null,
            row.headingTextAfter !== targetIdentity.text
              ? `Enter row ${index + 1} changed the source heading text`
              : null,
            !row.keydownTrusted
              ? `Enter row ${index + 1} did not use a trusted keydown`
              : null,
            browserHandleAvailable &&
            (row.beforeinput !== undefined || row.input !== undefined)
              ? `Enter row ${index + 1} leaked into native beforeinput/input after the model-owned command`
              : null,
            !row.focusPreservedAfter
              ? `Enter row ${index + 1} lost editor focus`
              : null,
            row.nativeSelectedTextAfter !== ''
              ? `Enter row ${index + 1} left expanded native text`
              : null,
            browserHandleAvailable &&
            (row.commitBefore == null ||
              row.commitAfter == null ||
              row.commitAfter - row.commitBefore !== 1)
              ? `Enter row ${index + 1} did not produce exactly one commit`
              : null,
            browserHandleAvailable && !modelIsCollapsed
              ? `Enter row ${index + 1} left an expanded model selection`
              : null,
            browserHandleAvailable &&
            JSON.stringify(modelSelection) !== JSON.stringify(domSelection)
              ? `Enter row ${index + 1} left model and DOM selections unequal`
              : null,
          ];
        })
      : [
          !measuredStartIsCollapsed
            ? 'measured input did not start from a collapsed model selection'
            : null,
          expectedFinalText === null
            ? 'measured input start state could not produce an exact text oracle'
            : null,
          expectedFinalText !== null && probe.modelText !== expectedFinalText
            ? 'model text does not match the exact emitted-character oracle'
            : null,
          expectedFinalText !== null && probe.finalText !== expectedFinalText
            ? 'rendered text does not match the exact emitted-character oracle'
            : null,
          expectedFinalSelection !== null &&
          JSON.stringify(comparableSelection(probe.modelSelection)) !==
            JSON.stringify(expectedFinalSelection)
            ? 'model selection does not match the exact final caret oracle'
            : null,
          expectedFinalSelection !== null &&
          JSON.stringify(comparableSelection(probe.domSelection)) !==
            JSON.stringify(expectedFinalSelection)
            ? 'DOM selection does not match the exact final caret oracle'
            : null,
        ];

  failures.push(...exactFailures.filter(Boolean));

  if (out) {
    const outputPath = path.resolve(process.cwd(), out);

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, serializedResult);
  }

  if (failures.length > 0) {
    throw new Error(
      `Homepage native-input gate failed: ${failures.join('; ')}.`
    );
  }
} finally {
  await browser.close();
}
