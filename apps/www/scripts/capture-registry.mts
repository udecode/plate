import { existsSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

import { getAllBlockIds } from '../src/lib/blocks';

const REGISTRY_PATH = path.join(process.cwd(), 'public/r');
// ----------------------------------------------------------------------------
// Capture screenshots.
// ----------------------------------------------------------------------------
async function captureScreenshots() {
  const blockIds = await getAllBlockIds();
  const blocks = blockIds.filter((block) => {
    // Check if screenshots already exist
    const lightPath = path.join(
      REGISTRY_PATH,
      `styles/new-york/${block}-light.png`
    );
    const darkPath = path.join(
      REGISTRY_PATH,
      `styles/new-york/${block}-dark.png`
    );
    return !existsSync(lightPath) || !existsSync(darkPath);
  });
  if (blocks.length === 0) {
    console.info('✨ All screenshots exist, nothing to capture');
    return;
  }
  const browser = await puppeteer.launch({
    defaultViewport: {
      deviceScaleFactor: 2,
      height: 900,
      width: 1440,
    },
  });
  for (const block of blocks) {
    const pageUrl = `http://localhost:3333/view/styles/new-york/${block}`;
    const page = await browser.newPage();
    await page.goto(pageUrl, {
      waitUntil: 'networkidle2',
    });
    console.info(`- Capturing ${block}...`);
    for (const theme of ['light', 'dark']) {
      const screenshotPath = path.join(
        REGISTRY_PATH,
        `styles/new-york/${block}${theme === 'dark' ? '-dark' : '-light'}.png`
      );
      if (existsSync(screenshotPath)) {
        continue;
      }
      // Set theme and reload page
      await page.evaluate((currentTheme) => {
        localStorage.setItem('theme', currentTheme);
      }, theme);
      await page.reload({ waitUntil: 'networkidle2' });
      // Wait for animations to complete
      if (block.startsWith('chart')) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      // Hide Tailwind indicator
      await page.evaluate(() => {
        const indicator = document.querySelector('[data-tailwind-indicator]');
        if (indicator) {
          indicator.remove();
        }
      });
      await page.screenshot({
        path: screenshotPath,
      });
    }
    await page.close();
  }
  await browser.close();
}
try {
  console.info('🔍 Capturing screenshots...');
  await captureScreenshots();
  console.info('✅ Done!');
} catch (error) {
  console.error(error);
  process.exit(1);
}
