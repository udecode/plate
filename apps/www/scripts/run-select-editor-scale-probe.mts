import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { type CDPSession, chromium, type Page } from '@playwright/test';

const baselineURL = process.env.PROBE_BASELINE_URL ?? 'http://localhost:3000';
// Unset, the baseline pairs with itself: the A/A run.
const candidateURL = process.env.PROBE_CANDIDATE_URL ?? baselineURL;
// A control copy of the field reads its planted cost from this query.
const candidateQuery = process.env.PROBE_CANDIDATE_QUERY ?? '';
const candidateMarker = process.env.PROBE_CANDIDATE_MARKER;
const runs = Number(process.env.PROBE_RUNS ?? 3);
const typingSamples = Number(process.env.PROBE_TYPING ?? 20);
const pickSamples = Number(process.env.PROBE_PICK ?? 7);
const deadline = Number(process.env.PROBE_DEADLINE ?? 5000);
const assertLines = process.env.PROBE_ASSERT === '1';
const restatePath = process.env.PROBE_RESTATE;
const out = process.env.PROBE_OUT;

if (assertLines && !out) {
  throw new Error(
    'PROBE_ASSERT=1 needs PROBE_OUT, so the raw samples are saved before any line is asserted'
  );
}

const COHORTS = {
  large: { chips: 10, items: 200 },
  normal: { chips: 1, items: 20 },
  pathological: { chips: 100, items: 10_000 },
  stress: { chips: 50, items: 1000 },
} as const;

type CohortName = keyof typeof COHORTS;
type Operation = 'pick' | 'typing';
type Side = 'base' | 'candidate';
type Sample = {
  elapsed: number;
  layouts: number;
  styles: number;
  task: number;
};
type LineName =
  | 'elapsedP95'
  | 'layoutsMedian'
  | 'stylesMedian'
  | 'taskMedian'
  | 'taskP95';
type Line = { add: number; factor: number };

// The Scale gate's budget in docs/plans/2026-10-12-tags-review.md.
const LINES: Record<LineName, Line> = {
  elapsedP95: { add: 34, factor: 1 },
  layoutsMedian: { add: 0, factor: 1 },
  stylesMedian: { add: 0, factor: 1 },
  taskMedian: { add: 0.5, factor: 1.1 },
  taskP95: { add: 2, factor: 1.2 },
};

type ScaleWindow = Window & {
  __scaleEnd?: Promise<number>;
  __scaleStart?: number;
  __scaleTimed?: boolean;
  __selectEditorScaleControl?: string;
};

const EDITOR = '[data-editor="true"][contenteditable="true"]';

const selectedCohorts = (
  process.env.PROBE_COHORTS ?? 'normal,large,stress,pathological'
)
  .split(',')
  .filter(Boolean) as CohortName[];
const selectedOperations = (process.env.PROBE_OPS ?? 'typing,pick')
  .split(',')
  .filter(Boolean) as Operation[];

for (const name of selectedCohorts) {
  if (!COHORTS[name]) throw new Error(`Unknown cohort ${name}`);
}
for (const operation of selectedOperations) {
  if (operation !== 'pick' && operation !== 'typing') {
    throw new Error(`Unknown operation ${String(operation)}`);
  }
}

const label = (index: number) =>
  `${(index + 1) % 10 === 0 ? 'Zeta' : 'Item'} ${String(index + 1).padStart(5, '0')}`;

const unselectedZetas = (name: CohortName) => {
  const { chips, items } = COHORTS[name];

  return Array.from({ length: items }, (_, index) => label(index)).filter(
    (value, index) => index >= chips && value.startsWith('Zeta')
  );
};

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

const summarize = (samples: Sample[]): Record<LineName, number> => ({
  elapsedP95: percentile(
    samples.map((sample) => sample.elapsed),
    95
  ),
  layoutsMedian: median(samples.map((sample) => sample.layouts)),
  stylesMedian: median(samples.map((sample) => sample.styles)),
  taskMedian: median(samples.map((sample) => sample.task)),
  taskP95: percentile(
    samples.map((sample) => sample.task),
    95
  ),
});

const readMetrics = async (cdp: CDPSession) => {
  const { metrics } = await cdp.send('Performance.getMetrics');
  const read = (name: string) =>
    metrics.find((metric) => metric.name === name)?.value ?? Number.NaN;

  return {
    layouts: read('LayoutCount'),
    styles: read('RecalcStyleCount'),
    task: read('TaskDuration') * 1000,
  };
};

const settle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(resolve, 50))
        );
      })
  );

const optionCount = (page: Page, count: number, what: string) =>
  page
    .waitForFunction(
      (expected) =>
        document.querySelectorAll('[role="option"]').length === expected,
      count,
      { timeout: 120_000 }
    )
    .catch(() => {
      throw new Error(`setup: ${what} did not show ${count} options`);
    });

const remount = async (page: Page, name: CohortName) => {
  const { chips, items } = COHORTS[name];
  const mount = Number(
    await page.locator('main').getAttribute('data-scale-mount')
  );

  await page.locator('[data-scale-remount]').click();
  await page.waitForFunction(
    (next) =>
      document.querySelector('main')?.getAttribute('data-scale-mount') ===
      String(next),
    mount + 1
  );
  await page.locator(EDITOR).focus();
  await page.keyboard.press('End');
  await optionCount(page, items + 1 - chips, 'the open menu');
};

const timedKey = async (
  page: Page,
  cdp: CDPSession,
  key: string,
  install: () => Promise<void>,
  what: string
): Promise<Sample> => {
  await settle(page);
  await install();

  const before = await readMetrics(cdp);

  await page.keyboard.press(key);

  const timing = await page
    .evaluate(async () => {
      const scale = window as ScaleWindow;
      const end = await scale.__scaleEnd;

      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
      scale.__scaleTimed = false;

      return {
        end: end ?? Number.NaN,
        start: scale.__scaleStart ?? Number.NaN,
      };
    })
    .catch(() => {
      throw new Error(
        `deadline: ${what} did not reach its end condition within ${deadline} ms`
      );
    });
  const after = await readMetrics(cdp);

  return {
    elapsed: timing.end - timing.start,
    layouts: after.layouts - before.layouts,
    styles: after.styles - before.styles,
    task: after.task - before.task,
  };
};

const installEnd = (page: Page, target: 'chips' | 'list', count: number) =>
  page.evaluate(
    ({ expected, kind, limit }) => {
      const scale = window as ScaleWindow;
      const main = document.querySelector('main') as HTMLElement;
      const list = document.querySelector('[role="option"]')
        ?.parentElement as HTMLElement;
      const reached = () =>
        kind === 'list'
          ? list.childElementCount === expected
          : main.getAttribute('data-scale-chips') === String(expected);

      scale.__scaleStart = undefined;
      scale.__scaleTimed = true;
      window.addEventListener(
        'keydown',
        () => {
          scale.__scaleStart = performance.now();
        },
        { capture: true, once: true }
      );
      scale.__scaleEnd = new Promise((resolve, reject) => {
        const observer = new MutationObserver(() => {
          if (!reached()) return;
          observer.disconnect();
          resolve(performance.now());
        });

        observer.observe(
          kind === 'list' ? list : main,
          kind === 'list'
            ? { childList: true }
            : { attributeFilter: ['data-scale-chips'] }
        );
        setTimeout(() => {
          observer.disconnect();
          reject(new Error('deadline'));
        }, limit);
      });
      scale.__scaleEnd.catch(() => {});
    },
    { expected: count, kind: target, limit: deadline }
  );

const editorText = (page: Page) =>
  page.evaluate(
    (selector) =>
      [
        ...(document
          .querySelector(selector)
          ?.querySelectorAll('[data-editor-string]') ?? []),
      ]
        .map((node) => node.textContent ?? '')
        .join('')
        .replaceAll('﻿', ''),
    EDITOR
  );

const typingSample = async (
  page: Page,
  cdp: CDPSession,
  name: CohortName,
  what: string
) => {
  const expected = unselectedZetas(name);

  await remount(page, name);

  const sample = await timedKey(
    page,
    cdp,
    'z',
    () => installEnd(page, 'list', expected.length),
    what
  );
  const text = await editorText(page);
  const labels = await page.evaluate(() =>
    [
      ...(document.querySelector('[role="option"]')?.parentElement?.children ??
        []),
    ].map((node) => node.textContent?.trim() ?? '')
  );

  if (text !== 'z') {
    throw new Error(
      `end condition: ${what} editor text is ${JSON.stringify(text)}, expected "z"`
    );
  }
  if (JSON.stringify(labels) !== JSON.stringify(expected)) {
    throw new Error(
      `end condition: ${what} shows ${labels.length} options, expected the ${expected.length} unselected Zeta items`
    );
  }

  return sample;
};

const pickSample = async (
  page: Page,
  cdp: CDPSession,
  name: CohortName,
  what: string
) => {
  const { chips } = COHORTS[name];

  await remount(page, name);
  await page.keyboard.type('Target');
  await optionCount(page, 1, 'the Target search');

  const sample = await timedKey(
    page,
    cdp,
    'Enter',
    () => installEnd(page, 'chips', chips + 1),
    what
  );
  const state = await page.evaluate(
    (selector) => ({
      emitted: document.querySelector('main')?.getAttribute('data-scale-last'),
      lastChip: [
        ...(document
          .querySelector(selector)
          ?.querySelectorAll('[data-editor-void]') ?? []),
      ]
        .at(-1)
        ?.textContent?.replaceAll('﻿', '')
        .trim(),
    }),
    EDITOR
  );

  if (state.emitted !== 'Target' || state.lastChip !== 'Target') {
    throw new Error(
      `end condition: ${what} last chip is ${JSON.stringify(state.lastChip)} and last emitted item is ${JSON.stringify(state.emitted)}, expected "Target"`
    );
  }

  return sample;
};

const measure = async (
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  side: Side,
  name: CohortName,
  what: string
) => {
  const { chips, items } = COHORTS[name];
  const page = await browser.newPage({
    viewport: { height: 900, width: 1280 },
  });
  const url = `${side === 'base' ? baselineURL : candidateURL}/dev/select-editor-scale?items=${items}&chips=${chips}${side === 'candidate' ? candidateQuery : ''}`;

  try {
    const cdp = await page.context().newCDPSession(page);

    await cdp.send('Performance.enable');
    await page.goto(url);
    await page.locator(EDITOR).waitFor({ timeout: 120_000 });

    const readback = await page.evaluate((selector) => {
      const main = document.querySelector('main');

      return {
        catalog: Number(main?.getAttribute('data-scale-catalog')),
        chips: Number(main?.getAttribute('data-scale-chips')),
        control: (window as ScaleWindow).__selectEditorScaleControl ?? null,
        role: document.querySelector(selector)?.getAttribute('role') ?? null,
      };
    }, EDITOR);

    if (readback.catalog !== items + 1 || readback.chips !== chips) {
      throw new Error(
        `readback: ${what} serves ${readback.catalog} items and ${readback.chips} chips, expected ${items + 1} and ${chips}`
      );
    }
    if (
      side === 'candidate' &&
      candidateMarker &&
      readback.control !== candidateMarker
    ) {
      throw new Error(
        `readback: ${what} serves control ${JSON.stringify(readback.control)}, expected ${candidateMarker}`
      );
    }

    const load = os.loadavg();
    const result: Record<Operation, Sample[]> = { pick: [], typing: [] };

    if (selectedOperations.includes('typing')) {
      await typingSample(page, cdp, name, `${what} warm typing`);
    }
    if (selectedOperations.includes('pick')) {
      await pickSample(page, cdp, name, `${what} warm pick`);
    }

    if (selectedOperations.includes('typing')) {
      for (let index = 0; index < typingSamples; index += 1) {
        result.typing.push(
          await typingSample(page, cdp, name, `${what} typing ${index}`)
        );
      }
    }
    if (selectedOperations.includes('pick')) {
      for (let index = 0; index < pickSamples; index += 1) {
        result.pick.push(
          await pickSample(page, cdp, name, `${what} pick ${index}`)
        );
      }
    }

    return { load, readback, result, url };
  } catch (error) {
    throw new Error(`${what}: ${(error as Error).message}`, { cause: error });
  } finally {
    await page.close();
  }
};

const restated = restatePath
  ? (JSON.parse(await readFile(restatePath, 'utf-8')) as Record<
      string,
      Line & { reason: string }
    >)
  : {};

const browser = await chromium.launch();
const pages: Array<
  Awaited<ReturnType<typeof measure>> & {
    cohort: CohortName;
    run: number;
    side: Side;
  }
> = [];
const failures: string[] = [];

try {
  for (let run = 0; run < runs; run += 1) {
    for (const name of selectedCohorts) {
      const order: Side[] =
        run % 2 ? ['candidate', 'base'] : ['base', 'candidate'];

      for (const side of order) {
        pages.push({
          ...(await measure(browser, side, name, `${name} run ${run} ${side}`)),
          cohort: name,
          run,
          side,
        });
      }
    }
  }
} catch (error) {
  failures.push((error as Error).message);
} finally {
  await browser.close();
}

const cohorts = Object.fromEntries(
  selectedCohorts.map((name) => [
    name,
    Object.fromEntries(
      selectedOperations.map((operation) => {
        const samples = (side: Side) =>
          pages
            .filter((page) => page.cohort === name && page.side === side)
            .flatMap((page) => page.result[operation]);
        const perRun = (side: Side) =>
          pages
            .filter((page) => page.cohort === name && page.side === side)
            .map((page) => summarize(page.result[operation]));

        return [
          operation,
          {
            base: summarize(samples('base')),
            baseRuns: perRun('base'),
            candidate: summarize(samples('candidate')),
            candidateRuns: perRun('candidate'),
            counts: {
              base: samples('base').length,
              candidate: samples('candidate').length,
            },
          },
        ];
      })
    ),
  ])
);

const report = {
  config: {
    baselineURL,
    candidateMarker: candidateMarker ?? null,
    candidateQuery,
    candidateURL,
    cores: os.cpus().length,
    deadline,
    pickSamples,
    restated,
    runs,
    typingSamples,
  },
  cohorts,
  failures,
  pages: pages.map(({ cohort, load, readback, run, side, url }) => ({
    cohort,
    load,
    readback,
    run,
    side,
    url,
  })),
};

const writeReport = async () => {
  if (!out) return;

  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(
    out,
    `${JSON.stringify({ ...report, samples: pages }, null, 2)}\n`
  );
};

await writeReport();
console.info(JSON.stringify(report, null, 2));

if (assertLines && failures.length === 0) {
  for (const name of selectedCohorts) {
    for (const operation of selectedOperations) {
      const { base, candidate, counts } = cohorts[name][operation];

      if (counts.base === 0 || counts.candidate === 0) {
        failures.push(`budget: ${name} ${operation} has no samples`);
        continue;
      }

      for (const [line, planned] of Object.entries(LINES) as Array<
        [LineName, Line]
      >) {
        const { add, factor } =
          restated[`${name}/${operation}/${line}`] ?? planned;
        const limit = base[line] * factor + add;

        if (!Number.isFinite(candidate[line]) || !Number.isFinite(limit)) {
          failures.push(`budget: ${name} ${operation} ${line} is missing`);
        } else if (candidate[line] > limit) {
          failures.push(
            `budget: ${name} ${operation} ${line} ${candidate[line].toFixed(2)} exceeds ${limit.toFixed(2)} (base ${base[line].toFixed(2)})`
          );
        }
      }
    }
  }
}

await writeReport();

for (const failure of failures) console.error(failure);
if (failures.length > 0) process.exit(1);
