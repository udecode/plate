// Streams an S5 AI fixture into the inline AI preview on /blocks/ai-demo (chunks
// chained 10 ms apart, as the harness does) and samples the draft on every
// animation frame: how many [data-editor-ai-end] it holds, whether the
// decoration marker holds the last text's last code point, whether the
// fallback span shows exactly when the last text is empty, and whether the
// fallback span stays the same node and the draft's last child.
// Usage: node end-marker-probe.mjs <baseURL> <rich|cjk> <size>
import { createRequire } from 'node:module';

const require = createRequire('/Users/zbeyens/git/plate-2/apps/www/package.json');
const { chromium } = require('@playwright/test');
const [base, fixture, sizeArg] = process.argv.slice(2);
const size = Number(sizeArg);
const answerUnit = (i) =>
  `## Step ${i}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const cjkUnit = (i) =>
  `## 第 ${i} 步\n\n使用 \`Map<string, number>\` 来做 {key: value} 查找，当 x<y 时依然成立。参见 <https://example.com/${i}>。\n\n- 保持**顺序**\n- 避免_抖动_ 🚀\n\n| 键 | 值 |\n| - | - |\n| a | ${i} |\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const source = Array.from({ length: 2000 }, (_, i) => (fixture === 'rich' ? answerUnit(i) : cjkUnit(i)))
  .join('\n')
  .slice(0, size);
const characters = Array.from(source);
const chunks = Array.from({ length: Math.ceil(characters.length / 64) }, (_, i) =>
  characters.slice(i * 64, (i + 1) * 64).join('')
);

const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const context = await browser.newContext({ baseURL: base, viewport: { height: 720, width: 1280 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.stack ?? e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.addInitScript((chunks) => {
  const originalFetch = window.fetch.bind(window);
  const originalSetTimeout = window.setTimeout;
  window.__probe = { closedAt: null, samples: [] };
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!url.includes('/api/ai/command')) return originalFetch(input, init);
    const encoder = new TextEncoder();
    const event = (part) => encoder.encode(`data: ${JSON.stringify(part)}\n\n`);
    let controller;
    const body = new ReadableStream({ start: (value) => { controller = value; } });
    let next = 0;
    controller?.enqueue(event({ type: 'start', messageId: 'probe' }));
    controller?.enqueue(event({ type: 'data-toolName', data: 'generate' }));
    controller?.enqueue(event({ type: 'text-start', id: 't' }));
    const tick = () => {
      controller?.enqueue(event({ type: 'text-delta', id: 't', delta: chunks[next] }));
      next += 1;
      if (next < chunks.length) originalSetTimeout(tick, 10);
      else
        originalSetTimeout(() => {
          window.__probe.closedAt = performance.now();
          controller?.enqueue(event({ type: 'text-end', id: 't' }));
          controller?.enqueue(event({ type: 'finish' }));
          controller?.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller?.close();
        }, 10);
    };
    originalSetTimeout(tick, 0);
    return Promise.resolve(new Response(body, { headers: { 'content-type': 'text/event-stream', 'x-vercel-ai-ui-message-stream': 'v1' }, status: 200 }));
  };
}, chunks);
await page.goto('/blocks/ai-demo', { waitUntil: 'commit' });
const root = page.locator('.editor-editor[contenteditable="true"]').first();
await root.getByText('AI Menu').first().waitFor({ timeout: 60000 });
await page.waitForTimeout(1500);
const point = await root.evaluate((element) => {
  const block = element.querySelector('[data-editor-path="0"]');
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let last = null;
  while (walker.nextNode()) if (walker.currentNode.data.trim()) last = walker.currentNode;
  const range = document.createRange();
  range.setStart(last, last.length - 1);
  range.setEnd(last, last.length);
  const bounds = range.getBoundingClientRect();
  return { x: bounds.right - 1, y: bounds.top + bounds.height / 2 };
});
await page.mouse.click(point.x, point.y);
await page.keyboard.press('ControlOrMeta+j');
await page.getByRole('option', { name: 'Continue writing', exact: true }).waitFor({ timeout: 10000 });
await page.evaluate(() => {
  const probe = window.__probe;
  const strip = (text) => (text ?? '').replace(/[​﻿]/g, '');
  let firstSpan = null;
  const sample = () => {
    const draft = document.querySelector('[data-editor-ai-draft]');
    if (draft) {
      const previewRoot = draft.firstElementChild;
      const span = draft.lastElementChild;
      if (span && span.tagName === 'SPAN' && firstSpan === null) firstSpan = span;
      const texts = previewRoot ? previewRoot.querySelectorAll('[data-editor-node="text"]') : [];
      const lastText = texts.length ? strip(texts[texts.length - 1].textContent) : null;
      const markers = [...draft.querySelectorAll('[data-editor-ai-end]')];
      const decoration = markers.filter((m) => m !== span);
      probe.samples.push({
        t: performance.now(),
        children: draft.children.length,
        spanIsLastChild: span?.tagName === 'SPAN',
        sameSpan: span === firstSpan,
        markers: markers.length,
        fallbackMarked: span?.hasAttribute('data-editor-ai-end') ?? false,
        fallbackVisible: span ? getComputedStyle(span).display !== 'none' : false,
        lastTextEmpty: lastText === '',
        lastCodePoint: lastText ? Array.from(lastText).at(-1) : null,
        decorationText: decoration.map((m) => strip(m.textContent)),
      });
    }
    probe.raf = requestAnimationFrame(sample);
  };
  probe.raf = requestAnimationFrame(sample);
});
await page.getByRole('option', { name: 'Continue writing', exact: true }).click();
await page.getByRole('option', { name: 'Accept', exact: true }).waitFor({ timeout: 180000 });
await page.waitForTimeout(600);
const probe = await page.evaluate(() => {
  cancelAnimationFrame(window.__probe.raf);
  return window.__probe;
});
await browser.close();

const samples = probe.samples;
const during = samples.filter((s) => probe.closedAt === null || s.t < probe.closedAt);
const after = samples.at(-1);
const check = (list) => ({
  samples: list.length,
  exactlyOneMarker: list.filter((s) => s.markers === 1).length,
  zeroMarkers: list.filter((s) => s.markers === 0).length,
  moreThanOne: list.filter((s) => s.markers > 1).length,
  decorationOnLastCodePoint: list.filter((s) => s.decorationText.length === 1 && s.decorationText[0] === s.lastCodePoint).length,
  decorationSamples: list.filter((s) => s.decorationText.length > 0).length,
  lastTextEmpty: list.filter((s) => s.lastTextEmpty).length,
  fallbackShownWhenLastTextEmpty: list.filter((s) => s.lastTextEmpty && s.fallbackMarked && s.fallbackVisible).length,
  fallbackShownWhenLastTextNotEmpty: list.filter((s) => !s.lastTextEmpty && (s.fallbackMarked || s.fallbackVisible)).length,
  twoChildrenAlways: list.every((s) => s.children === 2),
  spanAlwaysLastChild: list.every((s) => s.spanIsLastChild),
  sameSpanNode: list.every((s) => s.sameSpan),
});
console.log(
  JSON.stringify(
    {
      base,
      fixture,
      size,
      chunks: chunks.length,
      errors,
      duringStream: check(during),
      afterAccept: {
        markers: after?.markers,
        fallbackMarked: after?.fallbackMarked,
        fallbackVisible: after?.fallbackVisible,
        lastTextEmpty: after?.lastTextEmpty,
        decorationText: after?.decorationText,
        lastCodePoint: after?.lastCodePoint,
        children: after?.children,
        sameSpan: after?.sameSpan,
      },
      emptyExamples: during.filter((s) => s.lastTextEmpty).slice(0, 2),
      mismatches: during.filter((s) => s.markers !== 1 || (s.decorationText.length === 1 && s.decorationText[0] !== s.lastCodePoint)).slice(0, 5),
    },
    null,
    1
  )
);
