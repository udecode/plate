// Counts [data-editor-ai-end] in the AI preview while it streams and after it finishes.
import { createRequire } from 'node:module';
const require = createRequire('/Users/zbeyens/git/plate-2/apps/www/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1010, height: 890 } });
await page.goto(`${base}/docs/components/ai-menu`, { waitUntil: 'commit' });
const root = page.locator('.editor-editor[contenteditable="true"]').first();
const line = root.getByText('Press space in an empty block. Try it out:', { exact: true });
await line.waitFor({ timeout: 60000 });
await line.click();
await page.keyboard.press('End');
await page.keyboard.press('Enter');
await page.keyboard.press('Space');
await page.getByRole('option', { name: 'Generate Markdown sample', exact: true }).click();
const probe = () =>
  root.evaluate((el) => {
    const draft = el.querySelector('[data-editor-ai-draft]') ?? el.ownerDocument.querySelector('[data-editor-ai-draft]');
    const ends = el.ownerDocument.querySelectorAll('[data-editor-ai-end]');
    return {
      draft: Boolean(draft),
      draftTextTail: draft?.textContent?.slice(-40) ?? null,
      ends: ends.length,
      endText: [...ends].map((e) => e.textContent?.slice(-30)),
    };
  });
const during = [];
await page.locator('[data-editor-ai-draft]').first().waitFor({ timeout: 30000 });
for (let i = 0; i < 8; i++) {
  during.push(await probe());
  await page.waitForTimeout(80);
}
await page.getByRole('option', { name: 'Accept' }).waitFor({ timeout: 30000 });
const after = await probe();
console.log(JSON.stringify({ base, during, after }, null, 1));
await browser.close();
