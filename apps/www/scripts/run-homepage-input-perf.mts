import puppeteer from 'puppeteer';

type ProbeRow = {
  beforeinput?: number;
  key: string;
  keydown: number;
  mutation?: number;
  raf1?: number;
  raf2?: number;
  textBefore: string;
};

type ProbeWindow = Window & {
  __homepageInputProbe?: { rows: ProbeRow[] };
};

const getArg = (name: string) => {
  const index = process.argv.indexOf(`--${name}`);

  return index === -1 ? undefined : process.argv[index + 1];
};

const percentile = (samples: number[], percentile: number) => {
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)] ?? 0;
};

const summarize = (samples: number[]) => ({
  max: Math.max(...samples),
  mean: samples.reduce((sum, sample) => sum + sample, 0) / samples.length,
  p95: percentile(samples, 95),
  samples,
});

const url = getArg('url') ?? 'http://localhost:3000';
const maxP95 = Number(getArg('max-p95') ?? 150);
const warmupSamples = 5;
const measuredSamples = 20;
const browser = await puppeteer.launch({ headless: true });

try {
  const page = await browser.newPage();

  await page.goto(url, { timeout: 120_000, waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[contenteditable="true"][role="textbox"]', {
    timeout: 120_000,
  });

  const targetPath = await page.evaluate(() => {
    const root = document.querySelector(
      '[contenteditable="true"][role="textbox"]'
    );
    const target = [
      ...(root?.querySelectorAll('[data-plite-path]') ?? []),
    ].find((element) => {
      const path = element.getAttribute('data-plite-path');
      const isTopLevelPath =
        !!path &&
        [...path].every((character) => character >= '0' && character <= '9');

      return isTopLevelPath && (element.textContent?.length ?? 0) > 30;
    });

    return target?.getAttribute('data-plite-path') ?? null;
  });

  if (!targetPath) {
    throw new Error('Homepage input benchmark could not find a text block.');
  }

  await page.click(`[data-plite-path="${targetPath}"]`);
  await page.keyboard.press('End');
  await page.evaluate((targetPath) => {
    const probeWindow = window as ProbeWindow;
    const root = document.querySelector(
      '[contenteditable="true"][role="textbox"]'
    );

    if (!root) throw new Error('Homepage editor is not mounted.');
    const targetSelector = `[data-plite-path="${CSS.escape(targetPath)}"]`;

    probeWindow.__homepageInputProbe = { rows: [] };
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key.length !== 1 || !root.contains(event.target as Node)) {
          return;
        }

        const row: ProbeRow = {
          key: event.key,
          keydown: performance.now(),
          textBefore: root.querySelector(targetSelector)?.textContent ?? '',
        };

        probeWindow.__homepageInputProbe!.rows.push(row);
        requestAnimationFrame((time) => {
          row.raf1 = time;
          requestAnimationFrame((nextTime) => {
            row.raf2 = nextTime;
          });
        });
      },
      true
    );
    document.addEventListener(
      'beforeinput',
      () => {
        const row = probeWindow.__homepageInputProbe!.rows.at(-1);

        if (row && row.beforeinput === undefined) {
          row.beforeinput = performance.now();
        }
      },
      true
    );
    new MutationObserver(() => {
      const row = probeWindow.__homepageInputProbe!.rows.at(-1);

      if (
        row &&
        row.mutation === undefined &&
        root.querySelector(targetSelector)?.textContent ===
          `${row.textBefore}${row.key}`
      ) {
        row.mutation = performance.now();
      }
    }).observe(root, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  }, targetPath);

  for (
    let sampleIndex = 0;
    sampleIndex < warmupSamples + measuredSamples;
    sampleIndex++
  ) {
    const char = String.fromCharCode(97 + (sampleIndex % 26));

    await page.keyboard.type(char);
    await page.waitForFunction(
      ({ expectedRows, targetPath }) => {
        const rows = (window as ProbeWindow).__homepageInputProbe?.rows;
        const row = rows?.[expectedRows - 1];
        const target = document.querySelector(
          `[data-plite-path="${CSS.escape(targetPath)}"]`
        );

        return (
          rows?.length === expectedRows &&
          row?.mutation &&
          row.raf2 &&
          target?.textContent === `${row.textBefore}${row.key}`
        );
      },
      { timeout: 5000 },
      { expectedRows: sampleIndex + 1, targetPath }
    );
  }

  const rows = await page.evaluate(
    () => (window as ProbeWindow).__homepageInputProbe!.rows
  );
  const measuredRows = rows.slice(warmupSamples);
  const mutation = summarize(
    measuredRows.map((row) => row.mutation! - row.keydown)
  );
  const secondPaint = summarize(
    measuredRows.map((row) => row.raf2! - row.keydown)
  );
  const result = {
    budget: { maxMutationP95: maxP95 },
    measuredSamples,
    mutation,
    secondPaint,
    targetPath,
    url,
    warmupSamples,
  };

  console.log(JSON.stringify(result, null, 2));

  if (mutation.p95 > maxP95) {
    throw new Error(
      `Homepage native-input mutation p95 ${mutation.p95.toFixed(1)} ms exceeds ${maxP95} ms.`
    );
  }
} finally {
  await browser.close();
}
