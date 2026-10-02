import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from '@playwright/test';

const baseURL = process.env.PROBE_BASE_URL ?? 'http://localhost:3000';
const runs = Number(process.env.PROBE_RUNS ?? 5);
const keys = Number(process.env.PROBE_KEYS ?? 100);
const warmup = Number(process.env.PROBE_WARMUP ?? 10);
const chars = Number(process.env.PROBE_CHARS ?? 2000);
const out = process.env.PROBE_OUT;
const delay = Number(process.env.PROBE_DELAY ?? 0);
const cohortNames = ['off', 'on', 'popups-off'] as const;

type Cohort = (typeof cohortNames)[number];

const query: Record<Cohort, string> = {
  off: 'kits=off',
  on: 'kits=on',
  'popups-off': 'kits=on&popups=off',
};

const percentile = (values: number[], p: number) => {
  const sorted = [...values].sort((a, b) => a - b);

  return sorted[
    Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  ];
};

const summarize = (values: number[]) => ({
  max: Math.max(...values),
  n: values.length,
  p50: percentile(values, 50),
  p95: percentile(values, 95),
});

const browser = await chromium.launch();
const cohorts: Record<Cohort, number[][]> = {
  off: [],
  on: [],
  'popups-off': [],
};

try {
  for (let run = 0; run < runs; run += 1) {
    const order = [
      ...cohortNames.slice(run % 3),
      ...cohortNames.slice(0, run % 3),
    ];

    for (const kits of order) {
      const page = await browser.newPage({
        viewport: { height: 900, width: 1280 },
      });

      await page.goto(
        `${baseURL}/dev/combobox-typing?${query[kits]}&chars=${chars}`
      );
      const root = page.locator('[data-editor="true"][contenteditable="true"]');

      await root.waitFor();
      await root.click();
      await page.keyboard.press(
        process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End'
      );
      await page.keyboard.press('End');
      await page.keyboard.type('a'.repeat(warmup));
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        (
          window as Window & { __comboboxTypingSamples?: number[] }
        ).__comboboxTypingSamples?.splice(0);
      });

      for (let key = 0; key < keys; key += 1) {
        await page.keyboard.type('b');
        if (delay) await page.waitForTimeout(delay);
      }

      await page.waitForTimeout(300);
      const samples = await page.evaluate(() => [
        ...((window as Window & { __comboboxTypingSamples?: number[] })
          .__comboboxTypingSamples ?? []),
      ]);
      const text = await root.textContent();

      if (samples.length !== keys || !text?.endsWith('b'.repeat(keys))) {
        throw new Error(
          `kits=${kits} run=${run}: ${samples.length} samples, text ends ${JSON.stringify(text?.slice(-12))}`
        );
      }

      cohorts[kits].push(samples);
      await page.close();
    }
  }
} finally {
  await browser.close();
}

const perRun = (kits: Cohort) => cohorts[kits].map(summarize);
const pooled = (kits: Cohort) => summarize(cohorts[kits].flat());
const spread = (kits: Cohort) => {
  const p95s = perRun(kits).map((run) => run.p95);

  return Math.max(...p95s) - Math.min(...p95s);
};
const result = {
  chars,
  config: { baseURL, delay, keys, runs, warmup },
  delta: {
    ownerP95: pooled('on').p95 - pooled('popups-off').p95,
    p95: pooled('on').p95 - pooled('off').p95,
    relativeP95: pooled('on').p95 / pooled('off').p95 - 1,
  },
  ...Object.fromEntries(
    cohortNames.map((name) => [
      name,
      { perRun: perRun(name), pooled: pooled(name), p95Spread: spread(name) },
    ])
  ),
};

console.info(JSON.stringify(result, null, 2));

if (out) {
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(
    out,
    `${JSON.stringify({ ...result, samples: cohorts }, null, 2)}\n`
  );
}
