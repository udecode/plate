import { writeFile } from 'node:fs/promises';

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

const RESTING = JSON.stringify(getArg('rest') ?? 'Block 5');
const STRIP = process.argv.includes('--strip');
const SCROLL = process.argv.includes('--scroll');

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
  const first = blockElement('Block 5');
  const second = blockElement('Block 7');
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
const blocks = Number(getArg('blocks') ?? 1000);
const out = getArg('out');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { height: 900, width: 1280 } });

await page.addInitScript(LISTENER_COUNTER);
await page.goto(
  `${url}/dev/dnd-perf?blocks=${blocks}${process.argv.includes('--columns') ? '&columns' : ''}`
);
await page.getByText('Block 3', { exact: true }).waitFor();
await page.waitForTimeout(500);

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
const result = {
  blocks,
  columns: process.argv.includes('--columns'),
  indicator: timings.indicator,
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
await browser.close();
