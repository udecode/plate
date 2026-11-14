import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { chromium } from '@playwright/test';

const MIN_SIDE = 320;

function optionProblems({ height, out, steps, theme, url, width }) {
  const problems = [];
  if (
    !URL.canParse(url) ||
    !['http:', 'https:'].includes(new URL(url).protocol)
  ) {
    problems.push(`url ${url} is not an http or https address`);
  }
  if (typeof out !== 'string' || path.extname(out) !== '.webm') {
    problems.push(`out ${out} is not a .webm path`);
  }
  if (!['dark', 'light'].includes(theme)) {
    problems.push(`theme ${theme} is not light or dark`);
  }
  for (const [name, value] of Object.entries({ height, width })) {
    if (!Number.isInteger(value) || value < MIN_SIDE) {
      problems.push(
        `${name} ${value} is not a whole number of at least ${MIN_SIDE}`
      );
    }
  }
  if (
    !Array.isArray(steps) ||
    steps.length === 0 ||
    !steps.every(
      (step) =>
        Array.isArray(step) &&
        step.length === 2 &&
        typeof step[0] === 'string' &&
        step[0].trim() !== '' &&
        typeof step[1] === 'function'
    )
  ) {
    problems.push(
      'steps must be one or more [caption, async (page) => {}] pairs'
    );
  }
  return problems;
}

function showCaption(page, text) {
  return page.evaluate(
    ({ id, line }) => {
      let box = document.getElementById(id);
      if (!box) {
        box = document.createElement('div');
        box.id = id;
        box.style.cssText =
          'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;max-width:90%;padding:8px 14px;border-radius:6px;background:rgba(0,0,0,.78);color:#fff;font:600 18px/1.4 system-ui,sans-serif;pointer-events:none;';
        document.documentElement.append(box);
      }
      box.textContent = line;
    },
    { id: 'sweep-clip-caption', line: text }
  );
}

async function playSteps(page, steps) {
  for (const [text, run] of steps) {
    await showCaption(page, text);
    await page.waitForTimeout(700);
    try {
      await run(page);
    } catch (error) {
      return `${text}: ${error.message}`;
    }
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(1500);
  return null;
}

export async function record({
  height = 800,
  out,
  steps,
  theme = 'light',
  url,
  width = 1280,
}) {
  const problems = optionProblems({ height, out, steps, theme, url, width });
  if (problems.length > 0) {
    throw new Error(`sweep-clip: ${problems.join('; ')}`);
  }

  const file = path.resolve(out);
  await mkdir(path.dirname(file), { recursive: true });
  const videoDir = await mkdtemp(path.join(os.tmpdir(), 'sweep-clip-'));
  const browser = await chromium.launch();
  const pageErrors = [];
  const consoleErrors = [];
  let shownTheme;
  let failed;
  try {
    const context = await browser.newContext({
      colorScheme: theme,
      recordVideo: { dir: videoDir, size: { height, width } },
      viewport: { height, width },
    });
    await context.addInitScript((value) => {
      if (location.protocol.startsWith('http')) {
        localStorage.setItem('theme', value);
      }
    }, theme);
    const page = await context.newPage();
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    try {
      await page.goto(url, { waitUntil: 'load' });
      shownTheme = await page.evaluate(() =>
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      );
      failed = await playSteps(page, steps);
    } finally {
      const video = page.video();
      await context.close();
      await video.saveAs(file);
    }
  } finally {
    await browser.close();
    await rm(videoDir, { force: true, recursive: true });
  }
  if (failed) {
    throw new Error(
      `sweep-clip: step "${failed}" failed; the clip up to that step is at ${file}`
    );
  }
  return { consoleErrors, out: file, pageErrors, shownTheme };
}
