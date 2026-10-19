import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../../../..', import.meta.url));
const require = createRequire(import.meta.url);
const happyDomRequire = createRequire(
  require.resolve('@happy-dom/global-registrator/package.json')
);
const happyDomPackagePath = happyDomRequire.resolve('happy-dom/package.json');
const happyDomPackage = JSON.parse(readFileSync(happyDomPackagePath, 'utf8'));
const { Window } = await import(
  pathToFileURL(join(dirname(happyDomPackagePath), happyDomPackage.main)).href
);

const settings = Object.freeze({
  disableCSSFileLoading: true,
  disableComputedStyleRendering: true,
  disableIframePageLoading: true,
  disableJavaScriptEvaluation: true,
  disableJavaScriptFileLoading: true,
});

const allCohorts = Object.freeze([
  Object.freeze({ budgetMs: 25, name: 'normal', paragraphs: 120, samples: 20 }),
  Object.freeze({ budgetMs: 400, name: 'large', paragraphs: 4_000, samples: 10 }),
  Object.freeze({ budgetMs: 1_500, name: 'stress', paragraphs: 16_000, samples: 5 }),
  Object.freeze({ budgetMs: 3_000, name: 'pathological', paragraphs: 32_000, samples: 3 }),
]);
const selectedCohort = process.env.PLATE_HTML_PROBE_COHORT;
const cohorts = selectedCohort
  ? allCohorts.filter(({ name }) => name === selectedCohort)
  : allCohorts;

if (cohorts.length === 0) {
  throw new Error(`Unknown HTML probe cohort: ${selectedCohort}`);
}

const percentile = (values, fraction) => {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1);

  return sorted[index];
};

const summarize = (values) => ({
  max: Math.max(...values),
  p50: percentile(values, 0.5),
  p95: percentile(values, 0.95),
});

const makeHtml = (paragraphs, cohort) => {
  const body = Array.from(
    { length: paragraphs },
    (_, index) =>
      `<p data-row="${index}"><strong>${cohort}-${index}</strong> &amp; text <a href="/row/${index}">link</a></p>`
  ).join('');

  return `<!doctype html><html><body>${body}<script>globalThis.__plateHtmlProbeExecuted = true</script><iframe src="https://invalid.example.test/"></iframe></body></html>`;
};

const parse = (window, html) => {
  const document = new window.DOMParser().parseFromString(html, 'text/html');

  if (!document) throw new Error('DOM parser returned no document.');

  return document;
};

const sharedWindow = new Window({ settings });

const runShared = (html) => parse(sharedWindow, html);
const runIsolated = (html) => {
  const window = new Window({ settings });

  try {
    return parse(window, html);
  } finally {
    window.happyDOM.abort();
    window.happyDOM.close();
  }
};

const measure = (operation, html) => {
  const start = performance.now();
  const document = operation(html);
  const duration = performance.now() - start;

  return {
    duration,
    elements: document.body.getElementsByTagName('*').length,
    firstText: document.body.querySelector('strong')?.textContent ?? null,
  };
};

const results = [];

try {
  for (const cohort of cohorts) {
    const html = makeHtml(cohort.paragraphs, cohort.name);
    const expectedElements = cohort.paragraphs * 3 + 2;

    for (let index = 0; index < 3; index++) {
      runShared(html);
      runIsolated(html);
    }

    const shared = [];
    const isolated = [];
    for (let index = 0; index < cohort.samples; index++) {
      const first = index % 2 === 0 ? runShared : runIsolated;
      const second = index % 2 === 0 ? runIsolated : runShared;
      const firstResult = measure(first, html);
      const secondResult = measure(second, html);

      const sharedResult = first === runShared ? firstResult : secondResult;
      const isolatedResult = first === runIsolated ? firstResult : secondResult;

      for (const result of [sharedResult, isolatedResult]) {
        if (result.elements !== expectedElements) {
          throw new Error(
            `${cohort.name}: expected ${expectedElements} elements, received ${result.elements}.`
          );
        }
        if (result.firstText !== `${cohort.name}-0`) {
          throw new Error(`${cohort.name}: parsed text did not match the source.`);
        }
      }

      shared.push(sharedResult.duration);
      isolated.push(isolatedResult.duration);
    }

    const sharedSummary = summarize(shared);
    const isolatedSummary = summarize(isolated);
    const overheadMs = isolatedSummary.p95 - sharedSummary.p95;
    const relativeOverhead = overheadMs / sharedSummary.p95;
    const overheadBudgetMs = cohort.name === 'normal' ? 15 : cohort.budgetMs * 0.25;
    const relativeBudget = cohort.name === 'normal' ? 2 : 0.5;

    results.push({
      budget: {
        isolatedP95Ms: cohort.budgetMs,
        overheadP95Ms: overheadBudgetMs,
        relativeOverhead: relativeBudget,
      },
      bytes: Buffer.byteLength(html),
      elements: expectedElements,
      isolated: isolatedSummary,
      name: cohort.name,
      overhead: { absoluteMs: overheadMs, relative: relativeOverhead },
      pass:
        isolatedSummary.p95 <= cohort.budgetMs &&
        overheadMs <= overheadBudgetMs &&
        relativeOverhead <= relativeBudget,
      samples: cohort.samples,
      shared: sharedSummary,
    });
  }
} finally {
  sharedWindow.happyDOM.abort();
  sharedWindow.happyDOM.close();
}

if (globalThis.__plateHtmlProbeExecuted !== undefined) {
  throw new Error('Server DOM evaluated source JavaScript.');
}

const lockfile = readFileSync(join(root, 'pnpm-lock.yaml'));
const output = {
  contract: {
    action: 'Construct a DOM adapter, parse one HTML document, and dispose it.',
    baseline: 'One shared happy-dom Window with identical disabled capabilities.',
    correctness:
      'Both paths preserve element count and sentinel text; source scripts do not execute.',
    independentVariables: ['source bytes', 'element count', 'window constructions'],
    noiseRule: 'Interleaved samples; pass every absolute and overhead p95 budget.',
    proposed:
      'One isolated happy-dom Window per platejs/html/server parse, always aborted and closed.',
    repeatedUnit: 'One source element plus one server DOM Window per operation.',
    userOperation: 'Detached HTML document or ContentSlice parsing in Node.',
  },
  environment: {
    architecture: process.arch,
    happyDom: happyDomPackage.version,
    lockfileSha256: createHash('sha256').update(lockfile).digest('hex'),
    node: process.version,
    platform: process.platform,
  },
  result: results.every(({ pass }) => pass) ? 'pass' : 'fail',
  results,
};
const outputPath = join(
  dirname(import.meta.dirname),
  `html-server-dom-benchmark${selectedCohort ? `-${selectedCohort}` : ''}.json`
);

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ output: outputPath, result: output.result }));
