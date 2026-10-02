import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

export const serial = process.env.SERIAL ?? 'emulator-5554';
export const adb = (...args) => execFileSync('adb', ['-s', serial, ...args], { encoding: 'utf-8' });
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const tap = (x, y) => adb('shell', 'input', 'tap', String(Math.round(x)), String(Math.round(y)));

export const serve = (dir, port) => new Promise((resolve) => {
  const server = createServer((req, res) => { res.setHeader('content-type', 'text/html'); res.end(readFileSync(`${dir}/index.html`)); });
  server.listen(port, () => resolve(server));
});

export const dumpWindows = () => {
  adb('shell', 'uiautomator', 'dump', '--windows', '/sdcard/ui.xml');
  return adb('exec-out', 'cat', '/sdcard/ui.xml');
};

export const gboardNodes = (xml) => {
  const nodes = [];
  for (const match of xml.matchAll(/<node [^>]*>/g)) {
    const tag = match[0];
    const attr = (name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? '';
    if (attr('package') !== 'com.google.android.inputmethod.latin') continue;
    const b = attr('bounds').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    if (!b) continue;
    const [x1, y1, x2, y2] = b.slice(1).map(Number);
    nodes.push({ desc: attr('content-desc'), text: attr('text'), id: attr('resource-id'), cls: attr('class'), x: (x1 + x2) / 2, y: (y1 + y2) / 2, bounds: [x1, y1, x2, y2] });
  }
  return nodes;
};

export const connect = async (port = 9333) => {
  adb('forward', `tcp:${port}`, 'localabstract:chrome_devtools_remote');
  return chromium.connectOverCDP(`http://localhost:${port}`, { noDefaults: true });
};

export const findPage = (browser, needle) => browser.contexts().flatMap((c) => c.pages()).find((p) => p.url().includes(needle));

export const visiblePage = async (browser, needle) => {
  for (const page of browser.contexts().flatMap((c) => c.pages())) {
    if (!page.url().includes(needle)) continue;
    if ((await page.evaluate(() => document.visibilityState).catch(() => 'hidden')) === 'visible') return page;
  }
  return null;
};

export const closeOthers = async (browser, keep) => {
  for (const page of browser.contexts().flatMap((c) => c.pages())) if (page !== keep) await page.close().catch(() => {});
};

export const gboardKeys = (xml) => {
  const keys = {};
  for (const m of xml.matchAll(/<node [^>]*>/g)) {
    const t = m[0];
    if (!t.includes('com.google.android.inputmethod.latin') || !t.includes('clickable="true"')) continue;
    const a = (n) => t.match(new RegExp(`${n}="([^"]*)"`))?.[1] ?? '';
    const b = a('bounds').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    if (!b) continue;
    const [x1, y1, x2, y2] = b.slice(1).map(Number);
    const raw = a('content-desc');
    const desc = /^[a-z]$/i.test(raw) ? raw.toLowerCase() : raw;
    if (desc && !keys[desc]) keys[desc] = { x: (x1 + x2) / 2, y: (y1 + y2) / 2, bounds: [x1, y1, x2, y2], id: a('resource-id') };
  }
  return keys;
};
