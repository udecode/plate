import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus, loadavg } from 'node:os';
import path from 'node:path';

import { createBrowserEditorHarness } from '@platejs/test/playwright';
import {
  type Browser,
  type CDPSession,
  expect,
  type Page,
  test,
} from '@playwright/test';

// Markdown streaming contract in Chromium: the registry AI menu ("Continue
// writing" through useAIChat) and the streaming demo's editable and static
// previews.
//
// Default mode checks correctness on PLAYWRIGHT_BASE_URL: streamed previews and
// finals equal fresh parses, registered tags never show as literal text, and
// unchanged leading blocks keep their DOM hosts across previews.
//
// S5_BENCH=1 runs the S5 acceptance matrix against two servers,
// PLAYWRIGHT_BASE_URL (candidate) and S5_BASELINE_URL (baseline), and writes
// receipts under docs/research/probes/2026-09-28-conversion-boundary/lanes/s5/.
// Acceptance cells are `static`, `editable` and `ai` (AI chunks arrive 10 ms
// after the previous one ran, so both arms parse the same prefixes); `ai-live`
// cells (chunks due on a wall clock) record queueing and run last. Every stream
// is traced and CPU-profiled; attribute function names need an unmangled
// production build (`next build --no-mangling`).
// Optional: S5_CELLS (comma-separated `composition-fixture-size` filters),
// S5_PAIRS (default 3), S5_HEAP (comma-separated sizes that get finish/cancel
// heap probes, e.g. 10000), S5_OUT, S5_SAVE_TRACE, S5_PROFILE and S5_SAVE_TEXT
// (directories for raw traces, CPU profiles and final output text and HTML).

type Composition = 'ai' | 'ai-live' | 'editable' | 'static';
type Fixture = 'cjk' | 'rich';
type Arm = 'baseline' | 'candidate';

type Batch = {
  blocks: number;
  eligible: number;
  kept: number;
  t: number;
  text?: string;
};

type PageRecord = {
  /** `performance.memory.usedJSHeapSize` (precise only with --enable-precise-memory-info). */
  heap: { atArm: number | null; atFinalTrigger: number | null };
  ai: {
    closeAt: number | null;
    due: number[];
    enqueued: number[];
    t0: number;
  } | null;
  arrivals: number[];
  armed: boolean;
  batches: Batch[];
  captureText: boolean;
  clickAt: number | null;
  previewFires: number[];
};

type TraceEvent = {
  args?: {
    data?: { functionName?: string };
    usedHeapSizeAfter?: number;
    usedHeapSizeBefore?: number;
  };
  dur?: number;
  name: string;
  ph: string;
  pid: number;
  tid: number;
  ts: number;
};

const BENCH = process.env.S5_BENCH === '1';
const isAI = (composition: Composition) =>
  composition === 'ai' || composition === 'ai-live';
const CHUNK = 64;
const ARRIVAL_MS = 10;
const STREAM_CAP_MS = 180_000;
const MATRIX_CAP_MS = 60 * 60_000;
const OUT =
  process.env.S5_OUT ??
  path.resolve(
    process.cwd(),
    '../../docs/research/probes/2026-09-28-conversion-boundary/lanes/s5'
  );

// Fixture generators from lanes/s4/ai-flow-benchmark.test.ts (S0 transcripts),
// so source hashes match S4's receipts.
const answerUnit = (i: number) =>
  `## Step ${i}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const cjkUnit = (i: number) =>
  `## 第 ${i} 步\n\n使用 \`Map<string, number>\` 来做 {key: value} 查找，当 x<y 时依然成立。参见 <https://example.com/${i}>。\n\n- 保持**顺序**\n- 避免_抖动_ 🚀\n\n| 键 | 值 |\n| - | - |\n| a | ${i} |\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
// Blocks whose render reads other blocks: a table of contents before the
// headings it lists, ordered lists that grow, footnote references before their
// definitions and a short table row.
const REUSE_SOURCE = [
  '<toc></toc>',
  '# Reuse probe',
  '1. first\n2. second',
  'Intro with a note[^1] and another[^2].',
  '## Section A',
  '1. alpha\n2. beta\n3. gamma',
  '- bullet one\n- bullet two',
  '## Section B',
  'Some text in section B.',
  '5. five\n6. six\n7. seven',
  '> quote line',
  '| a | b |\n| - | - |\n| 1 | 2 |\n| 3 |',
  '[^1]: The first note.',
  '[^2]: The second note.',
  '## Section C',
  'Closing text. zzend',
].join('\n\n');

const makeSource = (kind: Fixture, size: number) =>
  Array.from({ length: 2000 }, (_, i) =>
    kind === 'rich' ? answerUnit(i) : cjkUnit(i)
  )
    .join('\n')
    .slice(0, size);

// The demo splits by code point; the AI transport uses the same chunks.
const toChunks = (source: string, size = CHUNK) => {
  const characters = Array.from(source);

  return Array.from({ length: Math.ceil(characters.length / size) }, (_, i) =>
    characters.slice(i * size, (i + 1) * size).join('')
  );
};

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

// Runs in the page before any application script.
function installInstrumentation(config: {
  arrivalMs: number;
  chained?: boolean;
  chunks: string[] | null;
  composition: Composition;
}) {
  const readHeap = () =>
    (performance as Performance & { memory?: { usedJSHeapSize: number } })
      .memory?.usedJSHeapSize ?? null;
  const record: PageRecord = {
    ai: null,
    heap: { atArm: null, atFinalTrigger: null },
    arrivals: [],
    armed: false,
    batches: [],
    captureText: false,
    clickAt: null,
    previewFires: [],
  };
  const originalSetTimeout = window.setTimeout;

  Object.assign(window, { __s5: record });
  // Named wrappers make preview and arrival tasks visible in the trace.
  window.setTimeout = ((
    handler: TimerHandler,
    delay?: number,
    ...rest: unknown[]
  ) => {
    if (record.armed && typeof handler === 'function') {
      if (delay === 32) {
        return originalSetTimeout(
          function __s5Preview32(this: unknown, ...args: unknown[]) {
            record.previewFires.push(performance.now());
            return handler.apply(this, args);
          },
          delay,
          ...rest
        );
      }
      if (delay === config.arrivalMs && !config.composition.startsWith('ai')) {
        return originalSetTimeout(
          function __s5DemoArrival(this: unknown, ...args: unknown[]) {
            record.arrivals.push(performance.now());
            // The last arrival runs the strict final.
            record.heap.atFinalTrigger = readHeap();
            return handler.apply(this, args);
          },
          delay,
          ...rest
        );
      }
    }

    return originalSetTimeout(handler, delay, ...rest);
  }) as typeof window.setTimeout;
  document.addEventListener(
    'click',
    () => {
      if (record.armed && record.clickAt === null) {
        record.clickAt = performance.now();
      }
    },
    true
  );

  const { chunks } = config;

  if (!chunks) return;

  const originalFetch = window.fetch.bind(window);

  // Serves /api/ai/command as a UI-message SSE stream. Chunk i is due at
  // t0 + 10i ms; a late tick delivers every due chunk, as a network buffer
  // would while the main thread is busy. `chained` instead delivers one chunk
  // 10 ms after the previous one ran, as the demo's own chunk timer does, so
  // both arms see nearly the same prefixes.
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (!url.includes('/api/ai/command')) return originalFetch(input, init);

    const encoder = new TextEncoder();
    const event = (part: unknown) =>
      encoder.encode(`data: ${JSON.stringify(part)}\n\n`);
    const stream: NonNullable<PageRecord['ai']> = {
      closeAt: null,
      due: [],
      enqueued: [],
      t0: performance.now(),
    };
    let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
    const body = new ReadableStream<Uint8Array>({
      start: (value) => {
        controller = value;
      },
    });
    let next = 0;

    record.ai = stream;
    controller?.enqueue(event({ type: 'start', messageId: 's5' }));
    controller?.enqueue(event({ type: 'data-toolName', data: 'generate' }));
    controller?.enqueue(event({ type: 'text-start', id: 't' }));

    function __s5CloseTick() {
      stream.closeAt = performance.now();
      record.heap.atFinalTrigger = readHeap();
      controller?.enqueue(event({ type: 'text-end', id: 't' }));
      controller?.enqueue(event({ type: 'finish' }));
      controller?.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller?.close();
    }
    function __s5ArrivalTick() {
      const now = performance.now();

      while (
        next < chunks!.length &&
        (config.chained || stream.t0 + next * config.arrivalMs <= now)
      ) {
        controller?.enqueue(
          event({ type: 'text-delta', id: 't', delta: chunks![next] })
        );
        stream.due.push(
          config.chained ? now : stream.t0 + next * config.arrivalMs
        );
        stream.enqueued.push(performance.now());
        next += 1;
        if (config.chained) break;
      }
      if (next < chunks!.length) {
        originalSetTimeout(
          __s5ArrivalTick,
          config.chained
            ? config.arrivalMs
            : Math.max(
                0,
                stream.t0 + next * config.arrivalMs - performance.now()
              )
        );
      } else {
        originalSetTimeout(__s5CloseTick, config.arrivalMs);
      }
    }
    originalSetTimeout(__s5ArrivalTick, 0);

    return Promise.resolve(
      new Response(body, {
        headers: {
          'content-type': 'text/event-stream',
          'x-vercel-ai-ui-message-stream': 'v1',
        },
        status: 200,
      })
    );
  }) as typeof window.fetch;
}

// Records every output DOM change: its time, the top-level block count, and how
// many leading block hosts (all but the last) are the same nodes as before.
function observeOutput({
  observed,
  root: rootSelector,
}: {
  observed: string;
  root: string;
}) {
  const record = (window as unknown as { __s5: PageRecord }).__s5;
  const target = document.querySelector(observed);

  if (!target) throw new Error(`No output container: ${observed}`);

  let previous: Element[] | null = null;

  new MutationObserver((mutations) => {
    const root = document.querySelector(rootSelector);

    if (
      !root ||
      !mutations.some(
        ({ target: node }) => root.contains(node) || node.contains(root)
      )
    ) {
      return;
    }

    const blocks = Array.from(root.children);
    const shared = previous ? Math.min(previous.length, blocks.length) - 1 : 0;
    let kept = 0;

    for (let index = 0; index < shared; index += 1) {
      if (previous![index] === blocks[index]) kept += 1;
    }
    performance.mark('s5-batch');
    record.batches.push({
      blocks: blocks.length,
      eligible: Math.max(0, shared),
      kept,
      t: performance.now(),
      ...(record.captureText ? { text: root.textContent ?? '' } : {}),
    });
    previous = blocks;
  }).observe(target, { characterData: true, childList: true, subtree: true });
}

const OUTPUT = {
  ai: {
    observed: '.editor-editor[contenteditable="true"]',
    root: '[data-editor-ai-preview] [data-editor="true"]',
  },
  demo: {
    observed: '[data-s5-output]',
    root: '[data-s5-output] [data-editor="true"]',
  },
};

const outputFor = (composition: Composition) =>
  isAI(composition) ? OUTPUT.ai : OUTPUT.demo;

const openDemo = async (
  page: Page,
  mode: 'editable' | 'static',
  source: string | null,
  chunkSize = CHUNK
) => {
  await page.goto('/blocks/markdown-streaming-demo', { waitUntil: 'commit' });
  await expect(page.getByRole('heading', { name: /^Chunks/ })).toBeVisible({
    timeout: 20_000,
  });
  await createBrowserEditorHarness(
    page,
    'markdown-streaming-contract',
    page.locator('[data-editor="true"]').first()
  ).ready({ editor: 'visible' });
  await page.getByLabel('Preview', { exact: true }).selectOption(mode);
  if (source !== null) {
    await page.getByLabel('Markdown source').fill(source);
    await page
      .getByLabel('Chunk size', { exact: true })
      .selectOption(String(chunkSize));
    await expect(page.getByRole('heading', { name: /^Chunks/ })).toHaveText(
      `Chunks (0/${toChunks(source, chunkSize).length})`
    );
  }
  await page.getByLabel('Chunk delay', { exact: true }).selectOption('10');
  // The output column is the parent of its "Editor Output" heading.
  await page
    .getByRole('heading', { name: 'Editor Output' })
    .evaluate((heading) =>
      heading.parentElement?.setAttribute('data-s5-output', '')
    );
};

const openAI = async (page: Page) => {
  await page.goto('/blocks/ai-demo', { waitUntil: 'commit' });
  const root = page.locator('.editor-editor[contenteditable="true"]').first();

  await createBrowserEditorHarness(page, 'markdown-streaming-ai', root).ready({
    editor: 'visible',
    text: 'AI Menu',
  });
  // Place the caret at the end of the heading, then open the cursor menu.
  const point = await root.evaluate((element) => {
    const block = element.querySelector('[data-editor-path="0"]')!;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let last: Text | null = null;

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (node.data.trim()) last = node;
    }
    const range = document.createRange();
    range.setStart(last!, last!.length - 1);
    range.setEnd(last!, last!.length);
    const bounds = range.getBoundingClientRect();

    return { x: bounds.right - 1, y: bounds.top + bounds.height / 2 };
  });
  await page.mouse.click(point.x, point.y);
  await page.keyboard.press('ControlOrMeta+j');
  await expect(
    page.getByRole('option', { name: 'Continue writing', exact: true })
  ).toBeVisible();

  return root;
};

const arm = (page: Page, captureText = false) =>
  page.evaluate((capture) => {
    const record = (window as unknown as { __s5: PageRecord }).__s5;
    record.captureText = capture;
    record.armed = true;
    record.heap.atArm =
      (performance as Performance & { memory?: { usedJSHeapSize: number } })
        .memory?.usedJSHeapSize ?? null;
    performance.mark('s5-start');
  }, captureText);

const readRecord = (page: Page) =>
  page.evaluate(() => (window as unknown as { __s5: PageRecord }).__s5);

const outputText = (page: Page, composition: Composition) =>
  page.evaluate(
    (selector) => document.querySelector(selector)?.textContent ?? null,
    outputFor(composition).root
  );

// Next writes the build id into the page's flight payload as a `b` field.
// The inline scripts keep that payload after hydration drains `__next_f`.
const readBuildId = (page: Page) =>
  page.evaluate(() => {
    const ids = new Set(
      [...document.querySelectorAll('script:not([src])')].flatMap((script) =>
        [
          ...(script.textContent ?? '').matchAll(/\\"b\\":\\"([\w-]{8,})\\"/g),
        ].map((match) => match[1])
      )
    );

    return ids.size === 1 ? [...ids][0] : null;
  });

const outputHTML = (page: Page, composition: Composition) =>
  page.evaluate(
    (selector) => document.querySelector(selector)?.innerHTML ?? null,
    outputFor(composition).root
  );

// Resolves once the output has been quiet for `quietMs`.
const settle = async (page: Page, quietMs = 250) => {
  let last = -1;

  for (;;) {
    const count = await page.evaluate(
      () => (window as unknown as { __s5: PageRecord }).__s5.batches.length
    );
    if (count === last) return;
    last = count;
    await page.waitForTimeout(quietMs);
  }
};

const startStream = async (page: Page, composition: Composition) => {
  if (isAI(composition)) {
    await page
      .getByRole('option', { name: 'Continue writing', exact: true })
      .click();
  } else {
    await page
      .getByRole('button', { name: 'Start streaming', exact: true })
      .click();
  }
};

const waitForFinish = async (
  page: Page,
  composition: Composition,
  timeout: number
) => {
  await (
    isAI(composition)
      ? page.getByRole('option', { name: 'Accept', exact: true })
      : page.locator('[data-stream-status="finished"]')
  ).waitFor({ timeout });
  await settle(page);
};

const percentile = (values: readonly number[], q: number) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);

  return sorted[Math.max(0, Math.ceil(sorted.length * q) - 1)];
};

const round = (value: number | null) =>
  value === null ? null : Math.round(value * 100) / 100;

// Per-chunk arrival to the first later output change: the preview that first
// includes the chunk. AI arrivals count from their due time (t0 + 10i, or the
// delivery itself when chained).
const summarizeRecord = (record: PageRecord, composition: Composition) => {
  const { batches } = record;
  const final = batches.at(-1) ?? null;
  const firstBatchAfter = (time: number) =>
    batches.find((batch) => batch.t >= time)?.t ?? null;
  const arrivals = isAI(composition)
    ? (record.ai?.enqueued ?? []).map((enqueued, index) => ({
        due: record.ai!.due[index],
        received: enqueued,
      }))
    : [record.clickAt ?? 0, ...record.arrivals].map((time) => ({
        due: time,
        received: time,
      }));
  const latencies = arrivals
    .map(({ due, received }) => {
      const shown = firstBatchAfter(received);
      return shown === null ? null : shown - due;
    })
    .filter((value): value is number => value !== null);
  const previews = batches.slice(0, -1);
  const kept = previews.reduce((sum, batch) => sum + batch.kept, 0);
  const eligible = previews.reduce((sum, batch) => sum + batch.eligible, 0);
  const started = isAI(composition) ? (record.ai?.t0 ?? null) : record.clickAt;
  const lastArrival = isAI(composition)
    ? (record.ai?.closeAt ?? null)
    : (record.arrivals.at(-1) ?? null);
  const mb = (bytes: number | null) =>
    bytes === null ? null : round(bytes / 1_048_576);

  return {
    arrivals: arrivals.length,
    finalBlocks: final?.blocks ?? 0,
    // Last arrival (AI: stream close) to the final output change. A strict
    // final that renders exactly like the last preview changes nothing.
    finalMs:
      final && lastArrival !== null && final.t >= lastArrival
        ? round(final.t - lastArrival)
        : null,
    latencyP50Ms: round(percentile(latencies, 0.5)),
    latencyP95Ms: round(percentile(latencies, 0.95)),
    outputBatches: batches.length,
    // First preview plus one per 32 ms timer before the final output change.
    previews:
      1 +
      record.previewFires.filter((time) => !final || time <= final.t).length,
    survival: {
      eligible,
      kept,
      ratio: eligible ? round(kept / eligible) : null,
    },
    heapAtArmMB: mb(record.heap.atArm),
    // Sampled when the last chunk arrives (AI: when the stream closes), just
    // before the strict final; Chrome refreshes it at most every 50 ms.
    heapBeforeFinalMB: mb(record.heap.atFinalTrigger),
    previewTimers: record.previewFires.length,
    wallMs: final && started !== null ? round(final.t - started) : null,
  };
};

const collectTrace = async (cdp: CDPSession) => {
  const complete = new Promise<{ stream?: string }>((resolve) => {
    cdp.once('Tracing.tracingComplete', resolve);
  });
  await cdp.send('Tracing.end');
  const { stream } = await complete;
  let json = '';

  for (;;) {
    const chunk = await cdp.send('IO.read', { handle: stream! });
    json += chunk.base64Encoded
      ? Buffer.from(chunk.data, 'base64').toString('utf-8')
      : chunk.data;
    if (chunk.eof) break;
  }
  await cdp.send('IO.close', { handle: stream! });
  const parsed = JSON.parse(json) as
    | TraceEvent[]
    | { traceEvents: TraceEvent[] };

  return Array.isArray(parsed) ? parsed : parsed.traceEvents;
};

type TraceWindows = {
  end: number;
  final: [number, number] | null;
  publish: Array<[number, number]>;
  start: number;
};

// Main-thread work between the start mark and the last output change, from
// top-level RunTask durations (nonoverlapping). A publish task is one in which
// the output changed or a 32 ms preview timer ran. The final task is the one
// that delivers the last chunk (demo) or closes the stream (AI).
const summarizeTrace = (events: TraceEvent[]) => {
  const start = events.find((event) => event.name === 's5-start');

  if (!start) return null;

  const onMain = events.filter(
    (event) => event.pid === start.pid && event.tid === start.tid
  );
  const marks = onMain
    .filter((event) => event.name === 's5-batch')
    .map((event) => event.ts)
    .sort((a, b) => a - b);
  const taskName = onMain.some((event) => event.name === 'RunTask')
    ? 'RunTask'
    : 'ThreadControllerImpl::RunTask';
  const calls = (name: string) =>
    onMain
      .filter(
        (event) =>
          event.name === 'FunctionCall' &&
          event.args?.data?.functionName === name
      )
      .map((event) => event.ts);
  const previewCalls = calls('__s5Preview32');
  const within = (times: readonly number[], task: TraceEvent) =>
    times.some((time) => time >= task.ts && time <= task.ts + (task.dur ?? 0));
  const taskEnd = (task: TraceEvent) => task.ts + (task.dur ?? 0);
  const runTasks = onMain.filter(
    (event) => event.name === taskName && event.ph === 'X'
  );
  // The strict final runs in the task that delivers the last chunk (demo) or
  // closes the stream (AI), even when it renders nothing new. A preview held in
  // React state commits it in a later scheduler task, so the final spans from
  // its task through the task of the last output change after it, and the
  // window ends with that span or the last output change, whichever is later.
  const finalCall = [...calls('__s5CloseTick'), ...calls('__s5DemoArrival')]
    .sort((a, b) => a - b)
    .at(-1);
  const lastMark = marks.at(-1);
  const finalTask =
    finalCall === undefined
      ? undefined
      : runTasks.find((event) => within([finalCall], event));
  const lastMarkTask =
    lastMark === undefined
      ? undefined
      : runTasks.find((event) => within([lastMark], event));
  const finalEnd = finalTask
    ? Math.max(
        taskEnd(finalTask),
        lastMarkTask && lastMarkTask.ts >= finalTask.ts
          ? taskEnd(lastMarkTask)
          : 0
      )
    : null;
  const end = Math.max(lastMark ?? start.ts, finalEnd ?? start.ts);
  const tasks = runTasks
    .filter((event) => taskEnd(event) >= start.ts && event.ts <= end)
    .sort((a, b) => a.ts - b.ts);
  const windows: TraceWindows = {
    end,
    final: null,
    publish: [],
    start: start.ts,
  };
  let totalUs = 0;
  let publishUs = 0;
  let publishTasks = 0;
  let previewTasks = 0;
  let previewTasksWithOutput = 0;
  let finalTaskUs = 0;
  let lastArrivalTaskUs = 0;
  let longestUs = 0;
  let finalWorkUs = 0;

  for (const task of tasks) {
    const dur =
      Math.min(task.ts + (task.dur ?? 0), end) - Math.max(task.ts, start.ts);
    const output = within(marks, task);
    const preview = within(previewCalls, task);

    totalUs += Math.max(0, dur);
    longestUs = Math.max(longestUs, task.dur ?? 0);
    if (preview) previewTasks += 1;
    if (preview && output) previewTasksWithOutput += 1;
    if (output || preview) {
      publishTasks += 1;
      publishUs += task.dur ?? 0;
      windows.publish.push([task.ts, task.ts + (task.dur ?? 0)]);
    }
    if (within([lastMark ?? start.ts], task)) finalTaskUs = task.dur ?? 0;
    if (
      finalTask &&
      finalEnd !== null &&
      task.ts >= finalTask.ts &&
      taskEnd(task) <= finalEnd
    ) {
      finalWorkUs += task.dur ?? 0;
    }
  }
  if (finalTask && finalEnd !== null) {
    lastArrivalTaskUs = finalTask.dur ?? 0;
    windows.final = [finalTask.ts, finalEnd];
  }
  const gcs = onMain.filter(
    (event) =>
      (event.name === 'MinorGC' || event.name === 'MajorGC') && event.ph === 'X'
  );
  const gcIn = (from: number, to: number) => {
    const inside = gcs.filter((event) => event.ts >= from && event.ts <= to);
    const sum = (name: string) =>
      round(
        inside
          .filter((event) => event.name === name)
          .reduce((total, event) => total + (event.dur ?? 0), 0) / 1000
      );

    return {
      majorCount: inside.filter((event) => event.name === 'MajorGC').length,
      majorMs: sum('MajorGC'),
      minorCount: inside.filter((event) => event.name === 'MinorGC').length,
      minorMs: sum('MinorGC'),
    };
  };
  const finalWindow = windows.final;
  const lastMajorBefore = finalWindow
    ? gcs.findLast(
        (event) => event.name === 'MajorGC' && event.ts < finalWindow[0]
      )
    : undefined;
  const heapMB = (bytes: number | undefined) =>
    bytes === undefined ? null : round(bytes / 1_048_576);

  const summary = {
    finalGc: finalWindow ? gcIn(finalWindow[0], finalWindow[1]) : null,
    finalTaskMs: round(finalTaskUs / 1000),
    // Main-thread task time from the strict final's task through its render.
    finalWorkMs: round(finalWorkUs / 1000),
    finalSpanMs:
      finalTask && finalEnd !== null
        ? round((finalEnd - finalTask.ts) / 1000)
        : null,
    // Live heap after the last full collection before the final.
    heapAfterLastMajorGcMB: heapMB(lastMajorBefore?.args?.usedHeapSizeAfter),
    lastArrivalTaskMs: round(lastArrivalTaskUs / 1000),
    streamGc: gcIn(start.ts, end),
    longestTaskMs: round(longestUs / 1000),
    previewTasks,
    previewTasksWithOutput,
    publishMs: round(publishUs / 1000),
    publishTasks,
    taskName,
    tasks: tasks.length,
    totalMs: round(totalUs / 1000),
    windowMs: round((end - start.ts) / 1000),
  };

  return { summary, windows };
};

type CpuProfile = {
  nodes: Array<{
    callFrame: { functionName: string; url: string };
    children?: number[];
    id: number;
  }>;
  samples: number[];
  startTime: number;
  timeDeltas: number[];
};

type Share = Record<
  'gc' | 'other' | 'parse' | 'program' | 'react' | 'transaction',
  number
>;

const PARSE_FRAMES = new Set(['parseSlice', 'setPreview']);
// A read-only preview rendered from a `document` projects it instead of
// updating an editor; the projection is its publication.
const PROJECTION_FRAMES = new Set([
  'createProjectedEditorView',
  'getStaticDocumentView',
]);
// Inclusive stream time of these functions is recorded per stream, so hot
// validation or projection shows up without saving raw profiles.
// `staticBlockDecorations` is EditorStatic's per-block decoration read: the
// minifier inlines readBlockDecorations, leaving only its inner `visit` under
// the static `Children` component.
const TALLY_FRAMES = [
  'assertDocument',
  'getStaticDocumentView',
  'isEditorJsonValue',
  'parseSlice',
  'staticBlockDecorations',
  'updateEditor',
  'withDocumentViewRead',
  'withEditorDocumentProjection',
] as const;
const REACT_FRAMES = new Set([
  'commitRoot',
  'flushPassiveEffects',
  'flushSyncWorkAcrossRoots_impl',
  'performSyncWorkOnRoot',
  'performWorkOnRoot',
  'performWorkUntilDeadline',
  'processRootScheduleInMicrotask',
  'renderRootConcurrent',
  'renderRootSync',
]);

// Splits sampled CPU time by call stack: (a) `parse` is parseSlice/setPreview
// with its store write; (b) `transaction` is the preview publication: the
// preview editor update (updateEditor, inside the AI preview's layout effect)
// or the projection of a rendered document; (c) `react` is other
// React render, commit and effect work, including reads under render; `gc`,
// `program` (native, outside JS) and `other` make up the rest. Samples are
// bucketed by the trace windows, which share the profile's clock.
const attributeProfile = (
  profile: CpuProfile,
  composition: Composition,
  windows: TraceWindows | null
) => {
  const byId = new Map(profile.nodes.map((node) => [node.id, node]));
  const parent = new Map<number, number>();

  for (const node of profile.nodes) {
    for (const child of node.children ?? []) parent.set(child, node.id);
  }
  const categories = new Map<number, keyof Share | 'idle'>();
  const tallies = new Map<number, Set<string>>();
  const tallied = (id: number) => {
    let names = tallies.get(id);
    if (names) return names;
    names = new Set();
    let visit = false;
    for (
      let at: number | undefined = id;
      at !== undefined;
      at = parent.get(at)
    ) {
      const name = byId.get(at)!.callFrame.functionName;
      if ((TALLY_FRAMES as readonly string[]).includes(name)) names.add(name);
      if (name === 'visit') visit = true;
      else if (name === 'Children' && visit) {
        names.add('staticBlockDecorations');
      }
    }
    tallies.set(id, names);
    return names;
  };
  const categorize = (id: number) => {
    const cached = categories.get(id);
    if (cached) return cached;
    const own = byId.get(id)!.callFrame.functionName;
    let parse = false;
    let projection = false;
    let update = false;
    let effect = false;
    let react = false;

    for (
      let at: number | undefined = id;
      at !== undefined;
      at = parent.get(at)
    ) {
      const name = byId.get(at)!.callFrame.functionName;
      if (PARSE_FRAMES.has(name)) parse = true;
      else if (PROJECTION_FRAMES.has(name)) projection = true;
      else if (name === 'updateEditor') update = true;
      else if (name === 'commitHookEffectListMount') effect = true;
      if (REACT_FRAMES.has(name)) react = true;
    }
    const category: keyof Share | 'idle' =
      own === '(idle)'
        ? 'idle'
        : own === '(garbage collector)'
          ? 'gc'
          : own === '(program)'
            ? 'program'
            : parse
              ? 'parse'
              : projection || (update && (!isAI(composition) || effect))
                ? 'transaction'
                : react
                  ? 'react'
                  : 'other';

    categories.set(id, category);
    return category;
  };
  const empty = (): Share => ({
    gc: 0,
    other: 0,
    parse: 0,
    program: 0,
    react: 0,
    transaction: 0,
  });
  const buckets = { final: empty(), publish: empty(), stream: empty() };
  const functions: Record<string, number> = Object.fromEntries(
    TALLY_FRAMES.map((name) => [name, 0])
  );
  const inside = (time: number, [from, to]: [number, number]) =>
    time >= from && time <= to;
  let time = profile.startTime;
  let aligned = false;

  for (const [index, id] of profile.samples.entries()) {
    time += profile.timeDeltas[index] ?? 0;
    // A sample stands for the interval up to the next one (V8 can report
    // small negative deltas when samples arrive out of order).
    const weight = Math.max(0, profile.timeDeltas[index + 1] ?? 0);
    const category = categorize(id);
    if (category === 'idle' || !windows) continue;
    if (!inside(time, [windows.start, windows.end])) continue;
    aligned = true;
    buckets.stream[category] += weight;
    for (const name of tallied(id)) functions[name] += weight;
    if (windows.publish.some((window) => inside(time, window))) {
      buckets.publish[category] += weight;
    }
    if (windows.final && inside(time, windows.final)) {
      buckets.final[category] += weight;
    }
  }
  const toMs = (share: Share) =>
    Object.fromEntries(
      Object.entries(share).map(([key, us]) => [key, round(us / 1000)])
    ) as Share;

  return {
    // False when no sample fell inside the trace window (clock mismatch).
    aligned,
    final: toMs(buckets.final),
    // Inclusive stream-window ms per TALLY_FRAMES function.
    functions: Object.fromEntries(
      Object.entries(functions).map(([name, us]) => [name, round(us / 1000)])
    ),
    publish: toMs(buckets.publish),
    stream: toMs(buckets.stream),
  };
};

const TRACE_CATEGORIES = [
  'blink.user_timing',
  'devtools.timeline',
  'disabled-by-default-devtools.timeline',
  'toplevel',
];

type StreamResult = {
  arm: Arm;
  buildId: string | null;
  // Uncaught page errors and console errors, with stacks.
  errors: string[];
  finalTextSha256: string | null;
  loadavg: number[];
  page: ReturnType<typeof summarizeRecord>;
  profile: ReturnType<typeof attributeProfile> | null;
  timedOut: boolean;
  trace: NonNullable<ReturnType<typeof summarizeTrace>>['summary'] | null;
};

const PROFILE_INTERVAL_US = Number(process.env.S5_PROFILE_INTERVAL_US ?? 1000);

const runStream = async ({
  arm: armName,
  baseURL,
  browser,
  chunks,
  composition,
  source,
}: {
  arm: Arm;
  baseURL: string;
  browser: Browser;
  chunks: string[];
  composition: Composition;
  source: string;
}): Promise<StreamResult> => {
  const context = await browser.newContext({
    baseURL,
    viewport: { height: 720, width: 1280 },
  });

  try {
    const page = await context.newPage();
    const errors: string[] = [];

    page.on('pageerror', (error) => errors.push(error.stack ?? error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.addInitScript(installInstrumentation, {
      arrivalMs: ARRIVAL_MS,
      chained: composition === 'ai',
      chunks: isAI(composition) ? chunks : null,
      composition,
    });
    if (isAI(composition)) await openAI(page);
    else await openDemo(page, composition, source);
    await page.evaluate(observeOutput, outputFor(composition));
    const buildId = await readBuildId(page);

    const cdp = await context.newCDPSession(page);
    await cdp.send('Tracing.start', {
      streamFormat: 'json',
      traceConfig: {
        includedCategories: TRACE_CATEGORIES,
        recordMode: 'recordAsMuchAsPossible',
      },
      transferMode: 'ReturnAsStream',
    });
    const profileDir = process.env.S5_PROFILE;

    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.setSamplingInterval', {
      interval: PROFILE_INTERVAL_US,
    });
    await cdp.send('Profiler.start');
    await arm(page);
    await startStream(page, composition);
    let timedOut = false;

    try {
      await waitForFinish(page, composition, STREAM_CAP_MS);
    } catch {
      timedOut = true;
    }
    const { profile } = await cdp.send('Profiler.stop');

    if (profileDir) {
      mkdirSync(profileDir, { recursive: true });
      writeFileSync(
        path.join(
          profileDir,
          `${composition}-${armName}-${Date.now()}.cpuprofile`
        ),
        JSON.stringify(profile)
      );
    }
    const events = await collectTrace(cdp);
    const trace = summarizeTrace(events);

    if (process.env.S5_SAVE_TRACE) {
      mkdirSync(process.env.S5_SAVE_TRACE, { recursive: true });
      writeFileSync(
        path.join(
          process.env.S5_SAVE_TRACE,
          `${composition}-${armName}-${Date.now()}.json`
        ),
        JSON.stringify(events)
      );
    }
    const record = await readRecord(page);
    const text = await outputText(page, composition);

    if (process.env.S5_SAVE_TEXT && text !== null) {
      const file = path.join(
        process.env.S5_SAVE_TEXT,
        `${composition}-${armName}-${Date.now()}`
      );

      mkdirSync(process.env.S5_SAVE_TEXT, { recursive: true });
      writeFileSync(`${file}.txt`, text);
      writeFileSync(`${file}.html`, (await outputHTML(page, composition))!);
    }

    return {
      arm: armName,
      buildId,
      errors,
      finalTextSha256: text === null ? null : sha256(text),
      loadavg: loadavg(),
      page: summarizeRecord(record, composition),
      profile: attributeProfile(
        profile as CpuProfile,
        composition,
        trace?.windows ?? null
      ),
      timedOut,
      trace: trace?.summary ?? null,
    };
  } finally {
    await context.close();
  }
};

const openAIMenuAgain = async (page: Page) => {
  await page
    .locator('.editor-editor[contenteditable="true"]')
    .first()
    .press('ControlOrMeta+j');
  await expect(
    page.getByRole('option', { name: 'Continue writing', exact: true })
  ).toBeVisible();
};

// Heap after three cycles: finish, cancel at a quarter, finish. The demo
// cancels with Reset. The AI menu offers no cancel while an insert streams, so
// that cycle stops with Escape (one strict final) and discards.
const runHeapProbe = async ({
  baseURL,
  browser,
  chunks,
  composition,
  source,
}: {
  baseURL: string;
  browser: Browser;
  chunks: string[];
  composition: Composition;
  source: string;
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { height: 720, width: 1280 },
  });

  try {
    const page = await context.newPage();
    await page.addInitScript(installInstrumentation, {
      arrivalMs: ARRIVAL_MS,
      chunks: isAI(composition) ? chunks : null,
      composition,
    });
    if (isAI(composition)) await openAI(page);
    else await openDemo(page, composition, source);
    const cdp = await context.newCDPSession(page);
    const heap = async () => {
      await cdp.send('HeapProfiler.collectGarbage');
      await cdp.send('HeapProfiler.collectGarbage');
      const { usedSize } = await cdp.send('Runtime.getHeapUsage');
      return usedSize;
    };
    const before = await heap();
    const quarter = ARRIVAL_MS * chunks.length * 0.25;

    for (const [index, cycle] of (
      ['finish', 'cancel', 'finish'] as const
    ).entries()) {
      if (isAI(composition) && index > 0) await openAIMenuAgain(page);
      await startStream(page, composition);
      if (cycle === 'finish') {
        await waitForFinish(page, composition, STREAM_CAP_MS);
      } else {
        await page.waitForTimeout(quarter);
        if (isAI(composition)) {
          await page.keyboard.press('Escape');
          await waitForFinish(page, composition, STREAM_CAP_MS);
        }
      }
      await (
        isAI(composition)
          ? page.getByRole('option', { name: 'Discard', exact: true })
          : page.getByRole('button', { name: 'Reset streaming', exact: true })
      ).click();
    }

    return { afterBytes: await heap(), beforeBytes: before };
  } finally {
    await context.close();
  }
};

const runAICorrectness = async (
  browser: Browser,
  baseURL: string,
  chunks: string[]
) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { height: 720, width: 1280 },
  });

  try {
    const page = await context.newPage();
    await page.addInitScript(installInstrumentation, {
      arrivalMs: ARRIVAL_MS,
      chunks,
      composition: 'ai' as const,
    });
    await openAI(page);
    await page.evaluate(observeOutput, OUTPUT.ai);
    const buildId = await readBuildId(page);
    await arm(page, true);
    await startStream(page, 'ai');
    await waitForFinish(page, 'ai', STREAM_CAP_MS);
    const { batches } = await readRecord(page);
    const previews = batches.slice(0, -1);

    return {
      buildId,
      eligible: previews.reduce((sum, batch) => sum + batch.eligible, 0),
      html: await outputHTML(page, 'ai'),
      kept: previews.reduce((sum, batch) => sum + batch.kept, 0),
      text: await outputText(page, 'ai'),
      texts: batches.map((batch) => batch.text ?? ''),
    };
  } finally {
    await context.close();
  }
};

const runDemoCorrectness = async (
  browser: Browser,
  baseURL: string,
  mode: 'editable' | 'static',
  source: string,
  chunkSize = CHUNK
) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { height: 720, width: 1280 },
  });

  try {
    const page = await context.newPage();
    await page.addInitScript(installInstrumentation, {
      arrivalMs: ARRIVAL_MS,
      chunks: null,
      composition: mode,
    });
    await openDemo(page, mode, source, chunkSize);
    await page.evaluate(observeOutput, OUTPUT.demo);
    const buildId = await readBuildId(page);
    await arm(page);
    await startStream(page, mode);
    await waitForFinish(page, mode, STREAM_CAP_MS);
    const streamed = {
      html: await outputHTML(page, mode),
      text: await outputText(page, mode),
    };

    await page
      .getByRole('button', { name: 'Reset streaming', exact: true })
      .click();
    await expect(page.locator('[data-stream-status]')).toHaveText('Ready');
    await page
      .getByRole('heading', { name: /^Chunks/ })
      .locator('xpath=..')
      .getByRole('button')
      .last()
      .click();
    await expect(page.locator('[data-stream-status]')).toHaveText(
      'Finished: strict parse'
    );
    await settle(page);

    return {
      buildId,
      fresh: {
        html: await outputHTML(page, mode),
        text: await outputText(page, mode),
      },
      streamed,
    };
  } finally {
    await context.close();
  }
};

const runPreflight = async ({
  baseURL,
  browser,
  chunks,
  composition,
  source,
}: {
  baseURL: string;
  browser: Browser;
  chunks: string[];
  composition: Composition;
  source: string;
}) => {
  const verdict = (
    buildId: string | null,
    reference: string | null,
    streamed: string | null
  ) => ({
    buildId,
    pass: reference !== null && buildId !== null && streamed === reference,
    referenceTextSha256: reference === null ? null : sha256(reference),
    streamedTextSha256: streamed === null ? null : sha256(streamed),
  });

  if (isAI(composition)) {
    const stream = await runAICorrectness(browser, baseURL, chunks);
    const whole = await runAICorrectness(browser, baseURL, [source]);

    return verdict(
      stream.buildId === whole.buildId ? stream.buildId : null,
      whole.text,
      stream.text
    );
  }

  const { buildId, fresh, streamed } = await runDemoCorrectness(
    browser,
    baseURL,
    composition,
    source
  );

  return verdict(buildId, fresh.text, streamed.text);
};

test.describe('markdown streaming contract', () => {
  test.skip(BENCH, 'S5_BENCH runs the benchmark matrix instead.');

  for (const mode of ['editable', 'static'] as const) {
    test(`${mode} preview equals a fresh parse and keeps registered tags hidden`, async ({
      page,
    }) => {
      await page.addInitScript(installInstrumentation, {
        arrivalMs: ARRIVAL_MS,
        chunks: null,
        composition: mode,
      });
      await openDemo(page, mode, null);
      await page.evaluate(observeOutput, OUTPUT.demo);
      await page
        .getByLabel('Scenario', { exact: true })
        .selectOption('columns');
      await arm(page, true);
      await startStream(page, mode);
      await waitForFinish(page, mode, 30_000);

      const { batches } = await readRecord(page);
      expect(batches.length).toBeGreaterThan(2);
      for (const batch of batches) {
        expect(batch.text).not.toMatch(/<\/?column/);
      }
      const streamed = batches.at(-1)!.text;

      // The last chunk takes the strict parse without any stream history.
      // The status renders with the output, so Ready shows the reset output.
      await page
        .getByRole('button', { name: 'Reset streaming', exact: true })
        .click();
      await expect(page.locator('[data-stream-status]')).toHaveText('Ready');
      await page.locator('button:has-text("paragraph")').last().click();
      await expect(page.locator('[data-stream-status]')).toHaveText(
        'Finished: strict parse'
      );
      expect(await outputText(page, mode)).toBe(streamed);
    });

    test(`${mode} paused preview equals a fresh partial parse of its prefix`, async ({
      page,
    }) => {
      const source = makeSource('rich', 6000);

      await page.addInitScript(installInstrumentation, {
        arrivalMs: ARRIVAL_MS,
        chunks: null,
        composition: mode,
      });
      await openDemo(page, mode, source);
      await page.evaluate(observeOutput, OUTPUT.demo);
      await arm(page);
      await startStream(page, mode);
      const heading = page.getByRole('heading', { name: /^Chunks/ });
      await expect(heading).toContainText(/\((2\d|[3-9]\d)\//);
      await page
        .getByRole('button', { name: 'Pause streaming', exact: true })
        .click();
      await expect(page.locator('[data-stream-status]')).toHaveText(
        'Paused: partial preview'
      );
      await settle(page, 300);
      const position = Number(
        /\((\d+)\//.exec((await heading.textContent())!)![1]
      );
      const streamed = await outputText(page, mode);
      const { batches } = await readRecord(page);

      // Navigating to the same prefix cancels the stream and parses it fresh.
      await page
        .getByRole('button', { name: 'Previous chunk', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Next chunk', exact: true })
        .click();
      await expect(heading).toHaveText(
        `Chunks (${position}/${toChunks(source).length})`
      );
      // The chunk heading updates before a static render catches up.
      await settle(page);
      expect(await outputText(page, mode)).toBe(streamed);

      if (mode === 'static') {
        const previews = batches.slice(1);
        const kept = previews.reduce((sum, batch) => sum + batch.kept, 0);
        const eligible = previews.reduce(
          (sum, batch) => sum + batch.eligible,
          0
        );
        expect(eligible).toBeGreaterThan(0);
        expect(kept / eligible).toBeGreaterThan(0.9);
      }
    });
  }

  test('AI insert preview matches a one-chunk response and keeps block hosts', async ({
    browser,
    baseURL,
  }) => {
    const source = makeSource('rich', 6000);
    const streamed = await runAICorrectness(
      browser,
      baseURL!,
      toChunks(source)
    );
    const whole = await runAICorrectness(browser, baseURL!, [source]);

    expect(streamed.text).toBe(whole.text);
    // Reused blocks must render like fresh ones, decorations included.
    expect(streamed.html).toBe(whole.html);
    expect(streamed.text).toContain('Step 28');
    expect(streamed.eligible).toBeGreaterThan(0);
    expect(streamed.kept / streamed.eligible).toBeGreaterThan(0.9);
  });

  // Streamed previews reuse unchanged leading blocks. Renders that read other
  // blocks (list numbers, the table of contents, footnotes) must still match
  // a render of the whole document at once.
  test('static preview renders the final document like a fresh render', async ({
    browser,
    baseURL,
  }) => {
    const { fresh, streamed } = await runDemoCorrectness(
      browser,
      baseURL!,
      'static',
      REUSE_SOURCE,
      16
    );

    expect(fresh.text).toContain('Section C');
    expect(streamed.html).toBe(fresh.html);
  });

  test('AI preview renders the final document like a one-chunk response', async ({
    browser,
    baseURL,
  }) => {
    const streamed = await runAICorrectness(
      browser,
      baseURL!,
      toChunks(REUSE_SOURCE, 16)
    );
    const whole = await runAICorrectness(browser, baseURL!, [REUSE_SOURCE]);

    expect(streamed.text).toBe(whole.text);
    expect(streamed.html).toBe(whole.html);
  });

  test('AI insert preview keeps registered tags hidden', async ({
    browser,
    baseURL,
  }) => {
    const source =
      'paragraph\n\n<columnGroup>\n  <column width="50%">\n    1\n  </column>\n  <column width="50%">\n    2\n  </column>\n</columnGroup>\n\nparagraph';
    const result = await runAICorrectness(
      browser,
      baseURL!,
      toChunks(source, 7)
    );

    for (const text of result.texts) expect(text).not.toMatch(/<\/?column/);
    expect(result.text).toContain('1');
  });
});

// Acceptance cells first (10 KB, then 50 KB with the rich cells ahead of the
// CJK ones), so the cost cap can only cut the most expensive cells; the live AI
// queue record runs last under its own cap.
const ACCEPTANCE_CELLS = [
  ...(['static', 'editable', 'ai'] as const).flatMap((composition) =>
    (['rich', 'cjk'] as const).map(
      (fixture) => [composition, fixture, 10_000] as const
    )
  ),
  ...(['rich', 'cjk'] as const).flatMap((fixture) =>
    (['static', 'ai', 'editable'] as const).map(
      (composition) => [composition, fixture, 50_000] as const
    )
  ),
];
const LIVE_CELLS = [10_000, 50_000].flatMap((size) =>
  (['rich', 'cjk'] as const).map(
    (fixture) => ['ai-live', fixture, size] as const
  )
);
const LIVE_CAP_MS = 15 * 60_000;

test.describe('S5 acceptance matrix', () => {
  test.skip(!BENCH, 'Set S5_BENCH=1 to run the benchmark matrix.');
  const baselineURL = process.env.S5_BASELINE_URL;
  const pairs = Number(process.env.S5_PAIRS ?? 3);
  const filters = (process.env.S5_CELLS ?? '').split(',').filter(Boolean);
  const heapSizes = new Set(
    (process.env.S5_HEAP ?? '').split(',').filter(Boolean)
  );
  // The cost caps span worker restarts, so they live in files.
  const budget = (name: string) => {
    const file = path.join(OUT, 'matrix', name);
    const read = (): number =>
      existsSync(file)
        ? (JSON.parse(readFileSync(file, 'utf-8')) as { spentMs: number })
            .spentMs
        : 0;

    return {
      add: (ms: number) => {
        mkdirSync(path.dirname(file), { recursive: true });
        writeFileSync(file, `${JSON.stringify({ spentMs: read() + ms })}\n`);
      },
      read,
    };
  };
  // Precise memory info makes `performance.memory` report the live heap.
  let benchBrowser: Browser | undefined;

  test.beforeAll(async ({ playwright }) => {
    benchBrowser = await playwright.chromium.launch({
      args: ['--enable-precise-memory-info'],
      ignoreDefaultArgs: ['--hide-scrollbars'],
    });
  });
  test.afterAll(async () => {
    await benchBrowser?.close();
  });

  for (const [composition, fixture, size] of [
    ...ACCEPTANCE_CELLS,
    ...LIVE_CELLS,
  ]) {
    const cell = `${composition}-${fixture}-${size}`;
    const live = composition === 'ai-live';

    if (filters.length && !filters.some((f) => cell.includes(f))) continue;

    test(cell, async ({ baseURL }) => {
      test.setTimeout(0);
      expect(baselineURL, 'S5_BASELINE_URL').toBeTruthy();
      const browser = benchBrowser!;
      const spend = budget(live ? 'budget-live.json' : 'budget.json');
      const cap = live ? LIVE_CAP_MS : MATRIX_CAP_MS;
      const source = makeSource(fixture, size);
      const sourceHash = sha256(source);
      const chunks = toChunks(source);
      const urls = { baseline: baselineURL!, candidate: baseURL! };
      const receipt = {
        aiArrival: isAI(composition)
          ? composition === 'ai'
            ? 'chained'
            : 'wall-clock'
          : null,
        cell,
        chunkCharacters: CHUNK,
        chunks: chunks.length,
        composition,
        environment: {
          browser: browser.version(),
          cpu: cpus()[0]?.model,
          cpus: cpus().length,
          profileIntervalUs: PROFILE_INTERVAL_US,
        },
        fixture,
        packet: live ? 'live AI queue record' : 'acceptance',
        size,
        sourceHash,
        sourceUtf8Bytes: Buffer.byteLength(source),
        pairs,
        preflight: {
          cell,
          sourceHash,
        } as {
          baseline?: Awaited<ReturnType<typeof runPreflight>>;
          candidate?: Awaited<ReturnType<typeof runPreflight>>;
          cell: string;
          sourceHash: string;
        },
        startedAt: new Date().toISOString(),
        status: 'running' as string,
        streams: [] as Array<StreamResult & { order: number; role: string }>,
        urls,
      };
      const file = path.join(OUT, 'matrix', `${cell}.json`);
      const save = () => {
        mkdirSync(path.dirname(file), { recursive: true });
        writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);
      };
      for (const armName of ['baseline', 'candidate'] as const) {
        if (spend.read() > cap) break;
        const began = Date.now();
        receipt.preflight[armName] = await runPreflight({
          baseURL: urls[armName],
          browser,
          chunks,
          composition,
          source,
        });
        spend.add(Date.now() - began);
        save();
      }
      const plan: Array<[Arm, string]> = [
        ['baseline', 'warmup'],
        ['candidate', 'warmup'],
      ];

      for (let pair = 0; pair < pairs; pair += 1) {
        const order: Arm[] =
          pair % 2 === 0
            ? ['baseline', 'candidate']
            : ['candidate', 'baseline'];
        for (const armName of order) plan.push([armName, `pair-${pair}`]);
      }
      for (const [order, [armName, role]] of plan.entries()) {
        if (spend.read() > cap) {
          receipt.status = `inconclusive: ${cap / 60_000}-minute cap reached`;
          break;
        }
        const began = Date.now();
        const result = await runStream({
          arm: armName,
          baseURL: urls[armName],
          browser,
          chunks,
          composition,
          source,
        });
        spend.add(Date.now() - began);
        receipt.streams.push({ ...result, order, role });
        save();
        if (result.timedOut) {
          receipt.status = `inconclusive: ${armName} ${role} exceeded ${STREAM_CAP_MS / 1000} s`;
          break;
        }
      }
      if (receipt.status === 'running') receipt.status = 'complete';

      if (heapSizes.has(String(size)) && receipt.status === 'complete') {
        const heap: Record<string, unknown> = {};
        for (const armName of ['baseline', 'candidate'] as const) {
          const began = Date.now();
          heap[armName] = await runHeapProbe({
            baseURL: urls[armName],
            browser,
            chunks,
            composition,
            source,
          });
          spend.add(Date.now() - began);
        }
        Object.assign(receipt, { heap });
      }
      Object.assign(receipt, {
        finishedAt: new Date().toISOString(),
        spentMs: spend.read(),
      });
      save();
    });
  }
});
