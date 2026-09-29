import { chromium } from '/Users/zbeyens/git/plate-2/node_modules/@playwright/test/index.mjs';
const base = process.argv[2] ?? 'http://localhost:3535';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, acceptDownloads: true });
const page = await context.newPage();
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log('console', m.type(), m.text().slice(0, 400)); });
page.on('pageerror', (e) => console.log('pageerror', (e.stack ?? e.message).slice(0, 600)));
await page.goto(`${base}/blocks/docx-demo`, { waitUntil: 'networkidle' });
const editor = page.locator('[data-editor="true"]').first();
await editor.waitFor();
await page.getByRole('button', { name: 'Import' }).waitFor({ timeout: 30000 });
for (const withSuggestion of [false, true]) {
  if (withSuggestion) {
    await page.getByRole('button', { name: 'Editing' }).click();
    await page.getByRole('menuitemradio', { name: 'Suggestion' }).click();
    await editor.evaluate((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let text = null; while (walker.nextNode()) text = walker.currentNode;
      const range = document.createRange(); range.setStart(text, text.length); range.collapse(true);
      getSelection().removeAllRanges(); getSelection().addRange(range); element.focus();
    });
    await page.keyboard.type(' ZZSUGGESTED');
    await page.waitForTimeout(300);
  }
  await page.getByRole('button', { name: 'Export' }).click();
  const item = page.getByRole('menuitem', { exact: true, name: 'Export as HTML' });
  await item.waitFor();
  const download = page.waitForEvent('download', { timeout: 8000 }).then((d) => 'download ' + d.suggestedFilename()).catch((e) => 'no download: ' + e.message.slice(0, 80));
  await item.click();
  console.log('withSuggestion', withSuggestion, '=>', await download);
  await page.keyboard.press('Escape');
}
await browser.close();
