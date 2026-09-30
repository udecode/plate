// Streams REUSE_SOURCE through the demo's static preview at a chunk size, then
// renders the same source fresh, and reports page and console errors, TOC entries, list numbers and
// whether the two HTML strings match.
import { createRequire } from 'node:module';
const require = createRequire('/Users/zbeyens/git/plate-2/apps/www/package.json');
const { chromium } = require('@playwright/test');
const [base, chunkArg, fixture] = process.argv.slice(2);
const chunk = Number(chunkArg ?? 16);
const REUSE = ['<toc></toc>', '# Reuse probe', '1. first\n2. second', 'Intro with a note[^1] and another[^2].', '## Section A', '1. alpha\n2. beta\n3. gamma', '- bullet one\n- bullet two', '## Section B', 'Some text in section B.', '5. five\n6. six\n7. seven', '> quote line', '| a | b |\n| - | - |\n| 1 | 2 |\n| 3 |', '[^1]: The first note.', '[^2]: The second note.', '## Section C', 'Closing text. zzend'].join('\n\n');
const CODE = '# Code probe\n\nSome intro.\n\n```ts\nconst m = new Map<string, number>();\nfunction f(x: number) { return x + 1; }\n```\n\nAfter the code. zzend';
const answerUnit = (i) => `## Step ${i}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const cjkUnit = (i) => `## 第 ${i} 步\n\n使用 \`Map<string, number>\` 来做 {key: value} 查找，当 x<y 时依然成立。参见 <https://example.com/${i}>。\n\n- 保持**顺序**\n- 避免_抖动_ 🚀\n\n| 键 | 值 |\n| - | - |\n| a | ${i} |\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const make = (unit, size) => Array.from({ length: 2000 }, (_, i) => unit(i)).join('\n').slice(0, size) + '\n\nzzend';
const SOURCE = fixture === 'code' ? CODE : fixture === 'rich' ? make(answerUnit, 10000) : fixture === 'cjk' ? make(cjkUnit, 10000) : REUSE;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.stack ?? e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`${base}/blocks/markdown-streaming-demo`, { waitUntil: 'commit' });
await page.getByRole('heading', { name: /^Chunks/ }).waitFor({ timeout: 30000 });
await page.waitForTimeout(1500);
await page.getByLabel('Preview', { exact: true }).selectOption('static');
await page.getByLabel('Markdown source').fill(SOURCE);
await page.getByLabel('Chunk size', { exact: true }).selectOption(String(chunk));
await page.getByLabel('Chunk delay', { exact: true }).selectOption('10');
await page.getByRole('heading', { name: 'Editor Output' }).evaluate((h) => h.parentElement.setAttribute('data-s5-output', ''));
const root = '[data-s5-output] [data-editor="true"]';
const snap = () => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  const toc = el.querySelector('[data-editor-path="0"]');
  return {
    html: el.innerHTML,
    tocText: toc?.textContent ?? null,
    ols: [...el.querySelectorAll('ol')].map((ol) => `${ol.getAttribute('start') ?? '-'}:${ol.textContent}`),
    hljs: el.querySelectorAll('[class*="hljs-"]').length,
    tokens: [...el.querySelectorAll('[data-code-block-syntax]')].map((node) => node.className).join('|'),
    aiEnd: el.querySelectorAll('[data-editor-ai-end]').length,
    cellBorders: el.querySelectorAll('[class*="before:border-b"]').length,
  };
}, root);
await page.getByRole('button', { name: 'Start streaming', exact: true }).click();
await page.locator('[data-stream-status="finished"]').waitFor({ timeout: 60000 });
await page.waitForTimeout(500);
const streamed = await snap();
await page.getByRole('button', { name: 'Reset streaming', exact: true }).click();
await page.locator('button:has-text("zzend")').last().click();
await page.locator('[data-stream-status]', { hasText: 'Finished: strict parse' }).waitFor({ timeout: 30000 });
await page.waitForTimeout(500);
const fresh = await snap();
console.log(JSON.stringify({ base, chunk, equal: streamed.html === fresh.html, streamedToc: streamed.tocText, freshToc: fresh.tocText, streamedOls: streamed.ols, freshOls: fresh.ols, streamedHljs: streamed.hljs, freshHljs: fresh.hljs, tokensEqual: streamed.tokens === fresh.tokens, tokenSpans: streamed.tokens ? streamed.tokens.split('|').length : 0, streamedCellBorders: streamed.cellBorders, freshCellBorders: fresh.cellBorders, errors }, null, 1));
await browser.close();
