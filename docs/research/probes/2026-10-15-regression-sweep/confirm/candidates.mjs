import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(new URL('../../../../../apps/plite/package.json', import.meta.url));
const pw = require('@playwright/test');

const [engineName, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const mod = engineName === 'webkit' ? 'Meta' : engineName === 'firefox' ? 'Meta' : 'Meta';

const blocks = (page) =>
  page.evaluate(() =>
    [...document.querySelector('[contenteditable="true"]').children].map((el) => el.innerText.replace(/﻿/g, '').slice(0, 40))
  );

const caretOnEmptyLine = (page) =>
  page.evaluate(() => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return null;
    const r = sel.getRangeAt(0).getBoundingClientRect();
    return { height: Math.round(r.height), focusNode: sel.focusNode?.nodeName, focusOffset: sel.focusOffset };
  });

const clickEndOf = async (page, text) => {
  const target = page.locator('[contenteditable="true"]').getByText(text, { exact: false }).first();
  const box = await target.boundingBox();
  await page.mouse.click(box.x + box.width - 2, box.y + box.height / 2);
  await page.keyboard.press('End');
};

const run = async (site, url) => {
  const browser = await pw[engineName].launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const out = { site, url };
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    await page.locator('[contenteditable="true"]').first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(800);
    if (url.includes('forced-layout')) {
      await clickEndOf(page, 'Enforce Your Layout!');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      out.afterEnter = await blocks(page);
      out.caretAfterEnter = await caretOnEmptyLine(page);
      await page.keyboard.type('Z', { delay: 40 });
      await page.waitForTimeout(200);
      out.afterTypeZ = await blocks(page);
    } else {
      await clickEndOf(page, 'This example shows how you can make a hovering menu appear');
      await page.keyboard.press('Enter');
      await page.keyboard.type('Z', { delay: 40 });
      await page.waitForTimeout(200);
      out.afterZ = (await blocks(page)).slice(0, 3);
      await page.keyboard.press('Alt+Backspace');
      await page.waitForTimeout(200);
      out.afterDeleteWord = (await blocks(page)).slice(0, 3);
      await page.keyboard.press(`${mod}+z`);
      await page.waitForTimeout(300);
      out.afterUndo = (await blocks(page)).slice(0, 3);
    }
    await page.screenshot({ path: `${outDir}/${site}-${url.split('/').pop()}-${engineName}.png` });
  } catch (e) {
    out.failed = String(e.message).split('\n')[0].slice(0, 200);
  }
  await browser.close();
  return out;
};

for (const name of ['forced-layout', 'hovering-toolbar']) {
  for (const [site, url] of [
    ['slate', `https://www.slatejs.org/examples/${name}`],
    ['beta', `https://beta.platejs.org/examples/plite/${name}`],
  ]) {
    console.log(JSON.stringify({ engine: engineName, name, ...(await run(site, url)) }));
  }
}
process.exit(0);
