import { chromium } from '/Users/zbeyens/git/plate-2/node_modules/@playwright/test/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('response', (r) => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); });
await page.goto(process.argv[2], { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await browser.close();
