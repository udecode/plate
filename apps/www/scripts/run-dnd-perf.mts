import { writeFile } from 'node:fs/promises';
import { loadavg } from 'node:os';

import { chromium } from '@playwright/test';

// In-page code is plain JavaScript text: tsx's helpers do not exist in the page.

const DRAG_TYPES = [
  'drag',
  'dragend',
  'dragenter',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
];
const SAMPLES = 120;

const getArg = (name: string) => {
  const index = process.argv.indexOf(`--${name}`);

  return index === -1 ? undefined : process.argv[index + 1];
};

const CELLS = process.argv.includes('--cells');
const RESTING = JSON.stringify(
  getArg('rest') ?? (CELLS ? 'Cell 2' : 'Block 5')
);
const FIRST = JSON.stringify(CELLS ? 'Cell 1' : 'Block 5');
const SECOND = JSON.stringify(CELLS ? 'Cell 3' : 'Block 7');
const STRIP = process.argv.includes('--strip');
const SCROLL = process.argv.includes('--scroll');
const BLOCKS = Number(getArg('blocks') ?? 1000);
const FILES = Number(getArg('files') ?? 0);
const REFUSE = process.argv.includes('--refuse');

// Negative controls for the file lane: each breaks one fact its readback
// checks (upload claims, block count, moving line), so the run must fail.
const CONTROL_NO_UPLOAD = process.argv.includes('--control-no-upload');
const CONTROL_PAGE_BLOCKS = Number(getArg('control-page-blocks') ?? BLOCKS);
const CONTROL_STILL_MOVING = process.argv.includes('--control-still-moving');

if (FILES > 0 && (STRIP || SCROLL)) {
  console.error(
    '--files measures its own pointer path; drop --strip and --scroll'
  );
  process.exit(2);
}
if (
  FILES === 0 &&
  (CONTROL_NO_UPLOAD || CONTROL_PAGE_BLOCKS !== BLOCKS || CONTROL_STILL_MOVING)
) {
  console.error('the --control-* flags check the file lane; add --files');
  process.exit(2);
}
// A busy loop on file dragovers, planted to prove the budget lines catch a slowdown.
const PLANT = Number(getArg('plant') ?? 0);

const PLANTED_DELAY = `window.addEventListener('dragover', (event) => {
  if (!event.dataTransfer || !Array.from(event.dataTransfer.types).includes('Files')) return;
  const end = performance.now() + ${PLANT};
  while (performance.now() < end) {}
}, true);`;

const LISTENER_COUNTER = `(() => {
  const types = ${JSON.stringify(DRAG_TYPES)};
  const active = new Map();
  const seen = new WeakMap();
  const add = EventTarget.prototype.addEventListener;
  const remove = EventTarget.prototype.removeEventListener;
  const keyOf = (target, type, options) =>
    type + ':' + (typeof options === 'boolean' ? options : Boolean(options && options.capture)) +
    ':' + (target === window ? 'w' : target === document ? 'd' : 'e');
  window.__dndListeners = active;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (types.includes(type) && listener) {
      const keys = seen.get(listener) || new Set();
      const key = keyOf(this, type, options);
      if (!keys.has(key)) {
        keys.add(key);
        seen.set(listener, keys);
        active.set(type, (active.get(type) || 0) + 1);
      }
    }
    return add.call(this, type, listener, options);
  };
  EventTarget.prototype.removeEventListener = function (type, listener, options) {
    if (types.includes(type) && listener) {
      const keys = seen.get(listener);
      if (keys && keys.delete(keyOf(this, type, options))) {
        active.set(type, (active.get(type) || 1) - 1);
      }
    }
    return remove.call(this, type, listener, options);
  };
})();`;

const COUNT_LISTENERS = `Object.fromEntries(${JSON.stringify(DRAG_TYPES)}.map((type) => [type, window.__dndListeners.get(type) || 0]))`;

const MEASURE = `(async () => {
  const samples = ${SAMPLES};
  const flush = () => new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      const second = new MessageChannel();
      second.port1.onmessage = () => resolve();
      second.port2.postMessage(null);
    };
    channel.port2.postMessage(null);
  });
  const time = async (dispatch) => {
    const start = performance.now();
    dispatch();
    await flush();
    return performance.now() - start;
  };
  const blockElement = (text) =>
    [...document.querySelectorAll('[data-editor-node="element"]')].find(
      (element) => element.textContent === text
    );
  const sourceBlock = blockElement('Block 2');
  const handle = sourceBlock.closest('.relative').querySelector('[aria-label^="Drag"]');
  const data = new DataTransfer();
  const at = (element, fraction) => {
    const rect = element.getBoundingClientRect();
    return { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height * fraction };
  };
  const drag = (type, target, point) =>
    target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data, ...point }));
  const handlePoint = at(handle, 0.5);
  const preview = await time(() => {
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, ...handlePoint }));
    drag('dragstart', handle, handlePoint);
  });
  const first = blockElement(${FIRST});
  const second = blockElement(${SECOND});
  const resting = blockElement(${RESTING});
  const restingRect = resting.getBoundingClientRect();
  const restAt = ${STRIP}
    ? { clientX: restingRect.right - 8, clientY: restingRect.top + restingRect.height / 2 }
    : at(resting, 0.75);
  drag('dragenter', resting, restAt);
  const still = [];
  const moving = [];
  for (let index = 0; index < samples; index++) {
    still.push(await time(() => drag('dragover', resting, restAt)));
  }
  await new Promise((resolve) => requestAnimationFrame(resolve));
  let scroll = null;
  if (${SCROLL}) {
    // Each frame scrolls the container once and dispatches five more scroll
    // events, as nested scrollports can; frame coalescing keeps maxHitsPerFrame
    // at one resolve's hit tests.
    const scroller = document.querySelector('[data-dnd-perf]');
    const hitTest = document.elementFromPoint.bind(document);
    let hits = 0;
    document.elementFromPoint = (x, y) => {
      hits++;
      return hitTest(x, y);
    };
    drag('dragover', resting, restAt);
    const perDragover = hits;
    const frames = [];
    const perFrame = [];
    for (let frame = 0; frame < 60; frame++) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      hits = 0;
      const start = performance.now();
      scroller.scrollTop += 30;
      for (let extra = 0; extra < 5; extra++) scroller.dispatchEvent(new Event('scroll'));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await flush();
      frames.push(performance.now() - start);
      perFrame.push(hits);
    }
    document.elementFromPoint = hitTest;
    scroll = { frames, perDragover, perFrame };
  }
  const indicator =
    document.querySelector('[data-drop-indicator]')?.getAttribute('data-drop-indicator') ?? null;
  for (let index = 0; index < samples; index++) {
    const target = index % 2 === 0 ? first : second;
    moving.push(await time(() => drag('dragover', target, at(target, index % 4 < 2 ? 0.25 : 0.75))));
  }
  const drop = await time(() => drag('drop', first, at(first, 0.75)));
  const teardown = await time(() => drag('dragend', handle, handlePoint));
  const order = [...document.querySelectorAll('[data-editor-node="element"]')]
    .slice(0, 8)
    .map((element) => element.textContent);
  return { drop, indicator, moving, order, preview, scroll, still, teardown };
})()`;

// The file lane hovers without dropping, so no upload starts.
const MEASURE_FILES = `(async () => {
  const samples = ${SAMPLES};
  const flush = () => new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      const second = new MessageChannel();
      second.port1.onmessage = () => resolve();
      second.port2.postMessage(null);
    };
    channel.port2.postMessage(null);
  });
  const time = async (dispatch) => {
    const start = performance.now();
    dispatch();
    await flush();
    return performance.now() - start;
  };
  const blockElement = (text) =>
    [...document.querySelectorAll('[data-editor-node="element"]')].find(
      (element) => element.textContent === text
    );
  const data = new DataTransfer();
  for (let index = 0; index < ${FILES}; index++) {
    data.items.add(new File([new Uint8Array([137, 80, 78, 71])], 'drop-' + index + '.png', { type: 'image/png' }));
  }
  const at = (element, fraction) => {
    const rect = element.getBoundingClientRect();
    return { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height * fraction };
  };
  let dragovers = 0;
  let claimed = 0;
  const drag = (type, target, point) => {
    const proceeded = target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data, ...point }));
    if (type === 'dragover') {
      dragovers++;
      if (!proceeded) claimed++;
    }
  };
  const first = blockElement(${FIRST});
  const second = blockElement(${SECOND});
  const resting = blockElement(${RESTING});
  const blockCount = [...document.querySelectorAll('[data-editor-node="element"]')].filter(
    (element) => /^Block \\d+$/.test(element.textContent)
  ).length;
  const inColumn = [first, second, resting].map((element) => !!element && !!element.closest('.editor-column'));
  const restAt = at(resting, 0.75);
  const pointAt = (target, fraction) =>
    ${CONTROL_STILL_MOVING} ? [resting, restAt] : [target, at(target, fraction)];
  const settle = async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await flush();
  };
  drag('dragenter', resting, restAt);
  const still = [];
  for (let index = 0; index < samples; index++) {
    still.push(await time(() => drag('dragover', resting, restAt)));
  }
  await settle();
  const indicator =
    document.querySelector('[data-drop-indicator]')?.getAttribute('data-drop-indicator') ?? null;
  const moving = [];
  for (let index = 0; index < samples; index++) {
    const [target, point] = pointAt(index % 2 === 0 ? first : second, index % 4 < 2 ? 0.25 : 0.75);
    moving.push(await time(() => drag('dragover', target, point)));
  }
  // Untimed proof that the moving lane moves the line: its four positions must
  // each draw a distinct line, or none under --refuse.
  const landings = [];
  for (const [element, fraction] of [[first, 0.25], [first, 0.75], [second, 0.25], [second, 0.75]]) {
    const [target, point] = pointAt(element, fraction);
    drag('dragover', target, point);
    await settle();
    const line = document.querySelector('[data-drop-indicator]');
    landings.push(line ? line.getAttribute('data-drop-indicator') + ' ' + line.style.transform : null);
  }
  drag('dragleave', resting, restAt);
  return { blockCount, claimed, dragovers, inColumn, indicator, landings, moving, still };
})()`;

const percentile = (samples: readonly number[], value: number) => {
  const sorted = [...samples].sort((left, right) => left - right);

  return sorted[Math.ceil(sorted.length * value) - 1] ?? 0;
};

const summarize = (samples: readonly number[]) => ({
  max: Math.max(...samples),
  p50: percentile(samples, 0.5),
  p75: percentile(samples, 0.75),
  p95: percentile(samples, 0.95),
  samples: samples.length,
});

const url = getArg('url') ?? 'http://localhost:3297';
const out = getArg('out');
const query = [
  `blocks=${CONTROL_PAGE_BLOCKS}`,
  ...(process.argv.includes('--columns') ? ['columns'] : []),
  ...(FILES > 0 && !CONTROL_NO_UPLOAD ? ['upload'] : []),
  ...(REFUSE ? ['refuse'] : []),
].join('&');
const loadBefore = loadavg();
const browser = await chromium.launch();
// Each lane runs in its own page, so one lane's drag cannot shape the next.
const openPage = async () => {
  const opened = await browser.newPage({
    viewport: { height: 900, width: 1280 },
  });

  await opened.addInitScript(LISTENER_COUNTER);
  if (PLANT > 0) await opened.addInitScript(PLANTED_DELAY);
  await opened.goto(`${url}/dev/dnd-perf?${query}`);
  await opened.getByText('Block 3', { exact: true }).waitFor();
  await opened.waitForTimeout(500);

  return opened;
};
const page = await openPage();

const rest = await page.evaluate(COUNT_LISTENERS);

const source = page.getByText('Block 2', { exact: true });

await source.hover();
await page
  .locator('.relative', { has: source })
  .last()
  .locator('[aria-label^="Drag"]')
  .hover();
await page.waitForTimeout(200);

const activated = await page.evaluate(COUNT_LISTENERS);
const timings = (await page.evaluate(MEASURE)) as {
  drop: number;
  indicator: string | null;
  moving: number[];
  order: string[];
  preview: number;
  scroll: {
    frames: number[];
    perDragover: number;
    perFrame: number[];
  } | null;
  still: number[];
  teardown: number;
};

await page.close();

const measureFiles = async () => {
  const filePage = await openPage();
  const measured = (await filePage.evaluate(MEASURE_FILES)) as {
    blockCount: number;
    claimed: number;
    dragovers: number;
    inColumn: boolean[];
    indicator: string | null;
    landings: Array<string | null>;
    moving: number[];
    still: number[];
  };

  await filePage.close();

  return {
    ...measured,
    count: FILES,
    moving: summarize(measured.moving),
    plant: PLANT,
    refuse: REFUSE,
    still: summarize(measured.still),
  };
};
const files = FILES > 0 ? await measureFiles() : null;

await browser.close();

// Timings from a page that does not match the flags measure another cohort,
// so the run exits before it reports them.
if (files) {
  const expectedIndicator = REFUSE ? null : 'y';
  const drawn = files.landings.filter(Boolean);
  const landingsMatch = REFUSE
    ? drawn.length === 0
    : drawn.length === files.landings.length &&
      new Set(drawn).size === files.landings.length;
  const mismatches = [
    files.blockCount !== BLOCKS &&
      `the page rendered ${files.blockCount} blocks, not ${BLOCKS}`,
    files.claimed !== files.dragovers &&
      `the upload handler claimed ${files.claimed} of ${files.dragovers} file dragovers`,
    files.indicator !== expectedIndicator &&
      `still indicator ${files.indicator} is not ${expectedIndicator}`,
    !landingsMatch &&
      `landings ${files.landings.join(' | ')} are not ${REFUSE ? 'empty' : 'four distinct lines'}`,
    !files.inColumn.every((inColumn) => inColumn === CELLS) &&
      `column membership ${files.inColumn.join(',')} is not ${CELLS}`,
  ].filter(Boolean);

  if (mismatches.length > 0) {
    console.error(`cohort readback failed: ${mismatches.join('; ')}`);
    process.exit(1);
  }
}

const result = {
  blocks: BLOCKS,
  cells: CELLS,
  columns: process.argv.includes('--columns'),
  files,
  indicator: timings.indicator,
  load: { after: loadavg(), before: loadBefore },
  rest: JSON.parse(RESTING),
  strip: STRIP,
  listeners: { activated, rest },
  order: timings.order,
  timings: {
    drop: timings.drop,
    moving: summarize(timings.moving),
    preview: timings.preview,
    still: summarize(timings.still),
    teardown: timings.teardown,
  },
  scroll: timings.scroll && {
    frames: summarize(timings.scroll.frames),
    hitsPerDragover: timings.scroll.perDragover,
    maxHitsPerFrame: Math.max(...timings.scroll.perFrame),
  },
  url,
};

console.log(JSON.stringify(result));
if (out) await writeFile(out, `${JSON.stringify(result, null, 2)}\n`);
