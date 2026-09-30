// Streams one S5 AI cell (Continue writing on /blocks/ai-demo, chunks chained
// 10 ms apart, as the harness does) and records a trace with style
// invalidation tracking and JS stacks, written straight to disk.
// Optional fifth argument: a substring; CSS rules whose selector contains it
// are deleted before streaming (to test a rule's part in the invalidation).
// Usage: node si-invalidation.mjs <baseURL> <rich|cjk> <size> <out.json> [drop-rule-substring]
import { createWriteStream } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire('/Users/zbeyens/git/plate-2/apps/www/package.json');
const { chromium } = require('@playwright/test');
const [base, fixture, sizeArg, out, dropRules] = process.argv.slice(2);
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

const browser = await chromium.launch({ args: ['--enable-precise-memory-info'], ignoreDefaultArgs: ['--hide-scrollbars'] });
const context = await browser.newContext({ baseURL: base, viewport: { height: 720, width: 1280 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.stack ?? e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.addInitScript((chunks) => {
  const originalFetch = window.fetch.bind(window);
  const originalSetTimeout = window.setTimeout;
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!url.includes('/api/ai/command')) return originalFetch(input, init);
    const encoder = new TextEncoder();
    const event = (part) => encoder.encode(`data: ${JSON.stringify(part)}\n\n`);
    let controller;
    const body = new ReadableStream({ start: (value) => { controller = value; } });
    let next = 0;
    controller?.enqueue(event({ type: 'start', messageId: 'si' }));
    controller?.enqueue(event({ type: 'data-toolName', data: 'generate' }));
    controller?.enqueue(event({ type: 'text-start', id: 't' }));
    const tick = () => {
      controller?.enqueue(event({ type: 'text-delta', id: 't', delta: chunks[next] }));
      next += 1;
      if (next < chunks.length) originalSetTimeout(tick, 10);
      else
        originalSetTimeout(() => {
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
let dropped = [];
if (dropRules) {
  dropped = await page.evaluate((needle) => {
    const removed = [];
    const walk = (rules, owner) => {
      for (let i = rules.length - 1; i >= 0; i -= 1) {
        const rule = rules[i];
        if (rule.cssRules && !rule.selectorText) walk(rule.cssRules, rule);
        else if (rule.selectorText?.includes(needle)) {
          removed.push(rule.selectorText);
          owner.deleteRule(i);
        }
      }
    };
    for (const sheet of document.styleSheets) {
      try {
        walk(sheet.cssRules, sheet);
      } catch {}
    }
    return removed;
  }, dropRules);
}
const cdp = await context.newCDPSession(page);
await cdp.send('Tracing.start', {
  streamFormat: 'json',
  traceConfig: {
    includedCategories: [
      'blink.user_timing',
      'devtools.timeline',
      'disabled-by-default-devtools.timeline',
      'disabled-by-default-devtools.timeline.invalidationTracking',
      'disabled-by-default-devtools.timeline.stack',
    ],
    recordMode: 'recordAsMuchAsPossible',
  },
  transferMode: 'ReturnAsStream',
});
await page.evaluate(() => performance.mark('si-start'));
await page.getByRole('option', { name: 'Continue writing', exact: true }).click();
await page.getByRole('option', { name: 'Accept', exact: true }).waitFor({ timeout: 180000 });
await page.waitForTimeout(500);
const complete = new Promise((resolve) => cdp.once('Tracing.tracingComplete', resolve));
await cdp.send('Tracing.end');
const { stream } = await complete;
const file = createWriteStream(out);
for (;;) {
  const chunk = await cdp.send('IO.read', { handle: stream });
  file.write(chunk.base64Encoded ? Buffer.from(chunk.data, 'base64') : chunk.data);
  if (chunk.eof) break;
}
await new Promise((resolve) => file.end(resolve));
await cdp.send('IO.close', { handle: stream });
console.log(JSON.stringify({ base, chunks: chunks.length, dropped, errors }));
await browser.close();
