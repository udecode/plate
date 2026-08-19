import puppeteer from 'puppeteer';

type ProbeRow = {
  beforeinput?: number;
  domSync: string | null;
  domSyncReason: string | null;
  key: string;
  keydown: number;
  input?: number;
  inputTrusted?: boolean;
  mutation?: number;
  raf1?: number;
  raf2?: number;
  projectedDomSync: string | null;
  textBefore: string;
};

type ProbeWindow = Window & {
  __homepageInputProbe?: {
    commandBlockers: string[];
    longTasks: Array<{ duration: number; startTime: number }>;
    longTaskObserver?: PerformanceObserver;
    measurementEnd?: number | null;
    measurementStart?: number | null;
    profileDurations: Record<string, number>;
    nativeBlockers: string[];
    rows: ProbeRow[];
  };
  __PLITE_REACT_RENDER_PROFILER__?: {
    record: (event: {
      duration?: number;
      id?: string | null;
      kind: string;
    }) => void;
  };
};

const getArg = (name: string) => {
  const index = process.argv.indexOf(`--${name}`);

  return index === -1 ? undefined : process.argv[index + 1];
};

const hasArg = (name: string) => process.argv.includes(`--${name}`);

const percentile = (samples: number[], percentile: number) => {
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)] ?? 0;
};

const summarize = (samples: number[]) => ({
  max: Math.max(...samples),
  mean: samples.reduce((sum, sample) => sum + sample, 0) / samples.length,
  p95: percentile(samples, 95),
  samples,
});

const url = getArg('url') ?? 'http://localhost:3000';
const maxMutationP95 = Number(getArg('max-mutation-p95') ?? 16);
const maxSecondPaintP95 = Number(getArg('max-second-paint-p95') ?? 32);
const maxLongTasks = Number(getArg('max-long-tasks') ?? 0);
const diagnose = hasArg('diagnose');
const warmupSamples = 5;
const measuredSamples = 20;
const browser = await puppeteer.launch({ headless: true });

try {
  const page = await browser.newPage();
  const runtimeErrors: string[] = [];

  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });

  await page.goto(url, { timeout: 120_000, waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[contenteditable="true"][role="textbox"]', {
    timeout: 120_000,
  });

  const targetPath = await page.evaluate(() => {
    const root = document.querySelector(
      '[contenteditable="true"][role="textbox"]'
    );
    const target = [
      ...(root?.querySelectorAll('[data-plite-path]') ?? []),
    ].find((element) => {
      const path = element.getAttribute('data-plite-path');
      const isTopLevelPath =
        !!path &&
        [...path].every((character) => character >= '0' && character <= '9');

      return isTopLevelPath && (element.textContent?.length ?? 0) > 30;
    });

    return target?.getAttribute('data-plite-path') ?? null;
  });

  if (!targetPath) {
    throw new Error('Homepage input benchmark could not find a text block.');
  }

  await page.click(`[data-plite-path="${targetPath}"]`);
  await page.keyboard.press('End');
  await page.evaluate(
    ({ diagnose, targetPath }) => {
      const probeWindow = window as ProbeWindow;
      const root = document.querySelector(
        '[contenteditable="true"][role="textbox"]'
      );

      if (!root) throw new Error('Homepage editor is not mounted.');
      const targetSelector = `[data-plite-path="${CSS.escape(targetPath)}"]`;

      probeWindow.__homepageInputProbe = {
        commandBlockers: [],
        longTasks: [],
        nativeBlockers: [],
        profileDurations: {},
        rows: [],
      };
      if (diagnose) {
        probeWindow.__PLITE_REACT_RENDER_PROFILER__ = {
          record(event) {
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
          if (event.key.length !== 1 || !root.contains(event.target as Node)) {
            return;
          }

          const target = root.querySelector(targetSelector);
          const textHost = target?.querySelector('[data-plite-node="text"]');
          const row: ProbeRow = {
            domSync: textHost?.getAttribute('data-plite-dom-sync') ?? null,
            domSyncReason:
              textHost?.getAttribute('data-plite-dom-sync-reason') ?? null,
            key: event.key,
            keydown: performance.now(),
            projectedDomSync:
              textHost?.getAttribute('data-plite-projected-dom-sync') ?? null,
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
        () => {
          const row = probeWindow.__homepageInputProbe!.rows.at(-1);

          if (row && row.beforeinput === undefined) {
            row.beforeinput = performance.now();
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

        if (
          row &&
          row.mutation === undefined &&
          root.querySelector(targetSelector)?.textContent ===
            `${row.textBefore}${row.key}`
        ) {
          row.mutation = performance.now();
        }
      }).observe(root, {
        characterData: true,
        childList: true,
        subtree: true,
      });
    },
    { diagnose, targetPath }
  );

  let measuredInput = '';
  let measuredStartState: {
    commitVersion: number | null;
    modelSelection: unknown;
    modelText: string | null;
  } | null = null;

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
        const targetIndex = Number.parseInt(targetPath, 10);

        return {
          commitVersion: handle?.getLastCommit()?.version ?? null,
          modelSelection: handle?.getSelection() ?? null,
          modelText: Number.isFinite(targetIndex)
            ? (handle?.getBlockText(targetIndex) ?? null)
            : null,
        };
      }, targetPath);
      await page.evaluate(() => {
        const probe = (window as ProbeWindow).__homepageInputProbe!;

        probe.longTaskObserver?.takeRecords();
        probe.longTasks = [];
        probe.measurementEnd = null;
        probe.measurementStart = performance.now();
      });
    }
    const char = String.fromCharCode(97 + (sampleIndex % 26));

    if (sampleIndex >= warmupSamples) measuredInput += char;

    await page.keyboard.type(char);
    await page.waitForFunction(
      ({ expectedRows, targetPath }) => {
        const rows = (window as ProbeWindow).__homepageInputProbe?.rows;
        const row = rows?.[expectedRows - 1];
        const target = document.querySelector(
          `[data-plite-path="${CSS.escape(targetPath)}"]`
        );

        return (
          row !== undefined &&
          rows?.length === expectedRows &&
          Number.isFinite(row?.mutation) &&
          Number.isFinite(row?.raf2) &&
          target?.textContent === `${row.textBefore}${row.key}`
        );
      },
      { timeout: 5000 },
      { expectedRows: sampleIndex + 1, targetPath }
    );
  }

  const probe = await page.evaluate((targetPath) => {
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
    const targetIndex = Number.parseInt(targetPath, 10);
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
      finalText: document.querySelector(
        `[data-plite-path="${CSS.escape(targetPath)}"]`
      )?.textContent,
      inputState: handle?.getInputState() ?? null,
      longTasks: measuredLongTasks,
      modelSelection: handle?.getSelection() ?? null,
      modelText: Number.isFinite(targetIndex)
        ? (handle?.getBlockText(targetIndex) ?? null)
        : null,
      nativeSelectedText: window.getSelection()?.toString() ?? '',
    };
  }, targetPath);
  const rows = probe.rows;
  const measuredRows = rows.slice(warmupSamples);

  if (measuredRows.length !== measuredSamples) {
    throw new Error(
      `Homepage native-input gate expected ${measuredSamples} measured rows, received ${measuredRows.length}.`
    );
  }
  for (const [index, row] of measuredRows.entries()) {
    for (const field of [
      'keydown',
      'beforeinput',
      'input',
      'mutation',
      'raf1',
      'raf2',
    ] as const) {
      if (!Number.isFinite(row[field])) {
        throw new Error(
          `Homepage native-input gate row ${index + 1} is missing finite ${field} timing.`
        );
      }
    }
  }
  const beforeInput = summarize(
    measuredRows.map((row) => row.beforeinput! - row.keydown)
  );
  const inputMutation = summarize(
    measuredRows.map((row) => row.mutation! - row.beforeinput!)
  );
  const firstPaint = summarize(
    measuredRows.map((row) => row.raf1! - row.keydown)
  );
  const mutation = summarize(
    measuredRows.map((row) => row.mutation! - row.keydown)
  );
  const secondPaint = summarize(
    measuredRows.map((row) => row.raf2! - row.keydown)
  );
  const result = {
    budget: { maxLongTasks, maxMutationP95, maxSecondPaintP95 },
    commandBlockers: [...new Set(probe.commandBlockers)],
    commitDelta:
      measuredStartState?.commitVersion == null ||
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
    longTasks: {
      count: probe.longTasks.length,
      max: Math.max(0, ...probe.longTasks.map((entry) => entry.duration)),
      samples: probe.longTasks,
    },
    nativeBlockers: [...new Set(probe.nativeBlockers)],
    profileDurations: Object.fromEntries(
      Object.entries(probe.profileDurations)
        .sort(([, left], [, right]) => right - left)
        .slice(0, 30)
    ),
    syncStates: measuredRows.map((row) => ({
      domSync: row.domSync,
      projected: row.projectedDomSync,
      reason: row.domSyncReason,
    })),
    measuredSamples,
    measuredInput,
    measuredStartState,
    mutation,
    nativeInputSamples: measuredRows.filter(
      (row) => row.input !== undefined && row.inputTrusted
    ).length,
    modelSelection: probe.modelSelection,
    modelText: probe.modelText,
    nativeSelectedText: probe.nativeSelectedText,
    runtimeErrors,
    secondPaint,
    targetPath,
    url,
    warmupSamples,
  };

  console.log(JSON.stringify(result, null, 2));

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
    probe.longTasks.length > maxLongTasks
      ? `${probe.longTasks.length} long tasks exceeds ${maxLongTasks}`
      : null,
    !probe.focusPreserved ? 'editor focus was not preserved' : null,
    result.commitDelta !== measuredSamples
      ? `expected ${measuredSamples} measured commits, received ${String(result.commitDelta)}`
      : null,
    result.nativeInputSamples !== measuredSamples
      ? `expected ${measuredSamples} trusted native input events, received ${result.nativeInputSamples}`
      : null,
    result.syncStates.some(
      ({ domSync, projected, reason }) =>
        domSync !== 'true' || projected !== null || reason !== null
    )
      ? 'measured input used an unsynchronized or projected text host'
      : null,
    probe.modelText !== probe.finalText
      ? 'model text does not match rendered text'
      : null,
    JSON.stringify(comparableSelection(probe.modelSelection)) !==
    JSON.stringify(comparableSelection(probe.domSelection))
      ? 'model and DOM selections differ'
      : null,
    probe.nativeSelectedText !== ''
      ? `native selection is unexpectedly expanded: ${JSON.stringify(probe.nativeSelectedText)}`
      : null,
    runtimeErrors.length > 0
      ? `${runtimeErrors.length} runtime errors were recorded`
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
  const exactFailures = [
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
  ].filter(Boolean);

  failures.push(...exactFailures);

  if (failures.length > 0) {
    throw new Error(
      `Homepage native-input gate failed: ${failures.join('; ')}.`
    );
  }
} finally {
  await browser.close();
}
