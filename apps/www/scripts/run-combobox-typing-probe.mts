import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { chromium, type Page } from '@playwright/test';

const baselineURL = process.env.PROBE_BASELINE_URL ?? 'http://localhost:3000';
// Unset, the baseline pairs with itself: the A/A run.
const candidateURL = process.env.PROBE_CANDIDATE_URL ?? baselineURL;
const pairs = Number(process.env.PROBE_PAIRS ?? 10);
const keys = Number(process.env.PROBE_KEYS ?? 100);
const warmup = Number(process.env.PROBE_WARMUP ?? 10);
const chars = Number(process.env.PROBE_CHARS ?? 20_000);
const delay = Number(process.env.PROBE_DELAY ?? 100);
const aaPath = process.env.PROBE_AA;
const out = process.env.PROBE_OUT;

type ProbeWindow = Window & {
  __comboboxTypingSamples?: number[];
  __typedTextReports?: number | null;
};

type Cohort = Readonly<{
  query: string;
  run: (page: Page) => Promise<number[]>;
}>;

const EDITOR_ROOT = '[data-editor="true"][contenteditable="true"]';
const TRIGGERS = ['@', '/', ':', '[^'] as const;

const sampleCount = (page: Page) =>
  page.evaluate(
    () => (window as ProbeWindow).__comboboxTypingSamples?.length ?? 0
  );

const readSamples = (page: Page) =>
  page.evaluate(() => [
    ...((window as ProbeWindow).__comboboxTypingSamples ?? []),
  ]);

// Samples land asynchronously, so a sample is found by its key's index in
// what was typed, never by the array length when the key went down.
const typedKeys = new WeakMap<Page, number>();

const clearSamples = async (page: Page) => {
  await page.evaluate(() => {
    (window as ProbeWindow).__comboboxTypingSamples?.splice(0);
  });
  typedKeys.set(page, 0);
};

const typeText = async (page: Page, text: string) => {
  for (const key of text) {
    await page.keyboard.type(key);
    typedKeys.set(page, (typedKeys.get(page) ?? 0) + 1);
  }
};

const pace = (page: Page) =>
  delay ? page.waitForTimeout(delay) : Promise.resolve();

const typeSamplingLastKey = async (page: Page, text: string) => {
  await typeText(page, text);

  const index = (typedKeys.get(page) ?? 0) - 1;

  await page.waitForFunction(
    (last) =>
      ((window as ProbeWindow).__comboboxTypingSamples?.length ?? 0) > last,
    index
  );
  const samples = await readSamples(page);
  const sample = samples[index];

  await pace(page);

  return sample;
};

const expectPopup = async (page: Page, open: boolean, label: string) => {
  const root = page.locator(EDITOR_ROOT);

  try {
    await (open
      ? root.and(page.locator('[aria-controls]')).waitFor({ timeout: 5000 })
      : page.waitForFunction(
          (selector) =>
            !document.querySelector(selector)?.hasAttribute('aria-controls'),
          EDITOR_ROOT,
          { timeout: 5000 }
        ));
  } catch {
    throw new Error(`${label}: popup ${open ? 'did not open' : 'stayed open'}`);
  }
};

const typeKeys = async (page: Page) => {
  const root = page.locator(EDITOR_ROOT);

  await clearSamples(page);
  for (let key = 0; key < keys; key += 1) {
    await typeText(page, 'b');
    await pace(page);
  }
  await page
    .waitForFunction(
      (count) =>
        ((window as ProbeWindow).__comboboxTypingSamples?.length ?? 0) >= count,
      keys,
      { timeout: 5000 }
    )
    .catch(() => {});

  const samples = await readSamples(page);
  const text = await root.textContent();

  if (samples.length !== keys || !text?.endsWith('b'.repeat(keys))) {
    throw new Error(
      `${samples.length} samples, text ends ${JSON.stringify(text?.slice(-12))}`
    );
  }

  return samples;
};

const repeats = (samplesPerRepeat: number) =>
  Math.ceil(keys / samplesPerRepeat);

const cohorts: Record<string, Cohort> = {
  idle: { query: 'kits=on', run: typeKeys },
  plite: {
    query: 'engine=plite',
    run: async (page) => {
      if (!(await page.locator('[data-probe-engine="plite"]').count())) {
        throw new Error('the page did not render the raw Plite editor');
      }

      const samples = await typeKeys(page);
      const reports = await page.evaluate(
        () => (window as ProbeWindow).__typedTextReports ?? null
      );

      if (reports !== null && reports !== warmup + keys) {
        throw new Error(`${reports} typed-text reports for ${warmup + keys}`);
      }

      return samples;
    },
  },
  query: {
    query: 'kits=on',
    run: async (page) => {
      const samples: number[] = [];

      for (let repeat = 0; repeat < repeats(4); repeat += 1) {
        await typeSamplingLastKey(page, ' @');
        await expectPopup(page, true, 'mention');
        for (const key of 'ayla') {
          samples.push(await typeSamplingLastKey(page, key));
        }
        await expectPopup(page, true, 'mention query');
        await page.keyboard.press('Escape');
        await expectPopup(page, false, 'mention Escape');
      }

      return samples;
    },
  },
  trigger: {
    query: 'kits=on',
    run: async (page) => {
      const samples: number[] = [];

      for (let repeat = 0; repeat < repeats(TRIGGERS.length); repeat += 1) {
        for (const trigger of TRIGGERS) {
          await typeText(page, ' ');
          // The emoji popup hides until its query has text, so its first query
          // character is the key that opens it.
          samples.push(
            await typeSamplingLastKey(page, trigger === ':' ? ':s' : trigger)
          );
          await expectPopup(page, true, trigger);
          await page.keyboard.press('Escape');
          await expectPopup(page, false, `${trigger} Escape`);
        }
      }

      return samples;
    },
  },
  ...Object.fromEntries(
    [20, 200, 2000].map((defs) => [
      `footnote-${defs}`,
      {
        query: `kits=on&defs=${defs}`,
        run: async (page: Page) => {
          const samples: number[] = [];

          for (let repeat = 0; repeat < repeats(2); repeat += 1) {
            await typeSamplingLastKey(page, ' [^');
            await expectPopup(page, true, 'footnote');
            for (const key of '12') {
              samples.push(await typeSamplingLastKey(page, key));
            }
            await expectPopup(page, true, 'footnote query');
            await page.keyboard.press('Escape');
            await expectPopup(page, false, 'footnote Escape');
          }

          return samples;
        },
      },
    ])
  ),
};

const selected = (process.env.PROBE_COHORTS ?? Object.keys(cohorts).join(','))
  .split(',')
  .filter(Boolean);

for (const name of selected) {
  if (!cohorts[name]) throw new Error(`Unknown cohort ${name}`);
}

const percentile = (values: number[], p: number) => {
  const sorted = [...values].sort((a, b) => a - b);

  return sorted[
    Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  ];
};

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

const quartile = (values: number[], q: number) => {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * q;
  const low = Math.floor(index);

  return sorted[low] + (sorted[low + 1] - sorted[low] || 0) * (index - low);
};

const measure = async (
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  baseURL: string,
  cohort: Cohort,
  label: string
) => {
  const page = await browser.newPage({
    viewport: { height: 900, width: 1280 },
  });

  try {
    await page.goto(
      `${baseURL}/dev/combobox-typing?${cohort.query}&chars=${chars}`
    );
    const root = page.locator(EDITOR_ROOT);

    await root.waitFor();
    await root.click();
    await page.keyboard.press(
      process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End'
    );
    await page.keyboard.press('End');
    typedKeys.set(page, 0);
    await typeText(page, 'a'.repeat(warmup));
    await page.waitForFunction(
      (count) =>
        ((window as ProbeWindow).__comboboxTypingSamples?.length ?? 0) >= count,
      warmup
    );
    await clearSamples(page);

    const samples = await cohort.run(page);

    await page.waitForTimeout(300);
    if ((await sampleCount(page)) !== typedKeys.get(page)) {
      throw new Error(
        `${await sampleCount(page)} samples for ${typedKeys.get(page)} typed keys`
      );
    }

    return samples;
  } catch (error) {
    throw new Error(`${label}: ${(error as Error).message}`, { cause: error });
  } finally {
    await page.close();
  }
};

const browser = await chromium.launch();
const results: Record<
  string,
  { a: number[]; b: number[]; samples: { a: number[][]; b: number[][] } }
> = {};

try {
  for (const name of selected) {
    const result = {
      a: [] as number[],
      b: [] as number[],
      samples: { a: [] as number[][], b: [] as number[][] },
    };

    for (let pair = 0; pair < pairs; pair += 1) {
      const order = pair % 2 ? (['b', 'a'] as const) : (['a', 'b'] as const);

      for (const side of order) {
        const samples = await measure(
          browser,
          side === 'a' ? baselineURL : candidateURL,
          cohorts[name],
          `${name} pair ${pair} side ${side}`
        );

        result.samples[side].push(samples);
        result[side].push(percentile(samples, 95));
      }
    }

    results[name] = result;
  }
} finally {
  await browser.close();
}

const aa = aaPath
  ? (JSON.parse(await readFile(aaPath, 'utf-8')) as {
      cohorts: Record<string, { iqr: number }>;
    })
  : null;

// The benchmark rule in docs/plans/2026-10-03-autocomplete-occurrence-host.md.
const summary = Object.fromEntries(
  Object.entries(results).map(([name, { a, b }]) => {
    const diffs = b.map((value, index) => value - a[index]);
    const baselineP95 = median(a);
    const medianDiff = median(diffs);
    const iqr = quartile(diffs, 0.75) - quartile(diffs, 0.25);
    const aaIqr = aa?.cohorts[name]?.iqr;
    const withinBudget = medianDiff <= 1 && medianDiff <= baselineP95 * 0.1;

    return [
      name,
      {
        aaIqr: aaIqr ?? null,
        baselineP95,
        candidateP95: median(b),
        diffs,
        iqr,
        medianDiff,
        relativeDiff: medianDiff / baselineP95,
        verdict: !withinBudget
          ? 'fail'
          : aaIqr === undefined
            ? 'no-aa'
            : iqr <= aaIqr
              ? 'pass'
              : 'wider-than-aa',
      },
    ];
  })
);

const report = {
  config: { baselineURL, candidateURL, chars, delay, keys, pairs, warmup },
  cohorts: summary,
};

console.info(JSON.stringify(report, null, 2));

if (out) {
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(
    out,
    `${JSON.stringify({ ...report, samples: results }, null, 2)}\n`
  );
}
