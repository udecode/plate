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
  drag('dragenter', first, at(first, 0.25));
  const still = [];
  const moving = [];
  for (let index = 0; index < samples; index++) {
    still.push(await time(() => drag('dragover', first, at(first, 0.75))));
  }
  for (let index = 0; index < samples; index++) {
    const target = index % 2 === 0 ? first : second;
    moving.push(await time(() => drag('dragover', target, at(target, index % 4 < 2 ? 0.25 : 0.75))));
  }
  const drop = await time(() => drag('drop', first, at(first, 0.75)));
  const teardown = await time(() => drag('dragend', handle, handlePoint));
  const order = [...document.querySelectorAll('[data-editor-node="element"]')]
    .slice(0, 8)
    .map((element) => element.textContent);
  return { drop, moving, order, preview, still, teardown };
})()`;

const getArg = (name: string) => {
  const index = process.argv.indexOf(`--${name}`);

  return index === -1 ? undefined : process.argv[index + 1];
};

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
await page.goto(`${url}/dev/dnd-perf?blocks=${blocks}`);
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
  moving: number[];
  order: string[];
  preview: number;
  still: number[];
  teardown: number;
};
const result = {
  blocks,
  listeners: { activated, rest },
  order: timings.order,
  timings: {
    drop: timings.drop,
    moving: summarize(timings.moving),
    preview: timings.preview,
    still: summarize(timings.still),
    teardown: timings.teardown,
  },
  url,
};

console.log(JSON.stringify(result));
if (out) await writeFile(out, `${JSON.stringify(result, null, 2)}\n`);
await browser.close();
