import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../../../..', import.meta.url));
const allCohorts = Object.freeze([
  Object.freeze({ budgetMs: 25, maxPeakRssDeltaBytes: 96e6, maxRetainedBytes: 24e6, name: 'normal', paragraphs: 120, samples: 20 }),
  Object.freeze({ budgetMs: 400, maxPeakRssDeltaBytes: 256e6, maxRetainedBytes: 128e6, name: 'large', paragraphs: 4_000, samples: 10 }),
  Object.freeze({ budgetMs: 1_500, maxPeakRssDeltaBytes: 640e6, maxRetainedBytes: 256e6, name: 'stress', paragraphs: 16_000, samples: 5 }),
  Object.freeze({ budgetMs: 3_000, maxPeakRssDeltaBytes: 1_200e6, maxRetainedBytes: 512e6, name: 'pathological', paragraphs: 32_000, samples: 3 }),
]);
const selectedCohort = process.env.PLATE_HTML_PROBE_COHORT;

if (!selectedCohort) {
  for (const { name } of allCohorts) {
    execFileSync(process.execPath, ['--expose-gc', import.meta.filename], {
      env: { ...process.env, PLATE_HTML_PROBE_COHORT: name },
      stdio: 'inherit',
    });
  }

  const reports = allCohorts.map(({ name }) =>
    JSON.parse(
      readFileSync(
        join(
          dirname(import.meta.dirname),
          `html-server-parse5-linkedom-benchmark-${name}.json`
        ),
        'utf8'
      )
    )
  );
  const [first] = reports;
  const output = {
    ...first,
    result: reports.every(({ result }) => result === 'pass') ? 'pass' : 'fail',
    results: reports.flatMap(({ results }) => results),
  };
  const outputPath = join(
    dirname(import.meta.dirname),
    'html-server-parse5-linkedom-benchmark.json'
  );

  writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify({ output: outputPath, result: output.result }));
  process.exit(0);
}

if (!globalThis.gc) {
  throw new Error('Run this probe with node --expose-gc.');
}

const linkedomRoot = join(root, '..', 'linkedom');
const linkedomPackage = JSON.parse(
  readFileSync(join(linkedomRoot, 'package.json'), 'utf8')
);
const { DOMParser } = await import(
  pathToFileURL(join(linkedomRoot, linkedomPackage.module)).href
);
const require = createRequire(import.meta.url);
const probeNodeModules =
  process.env.PLATE_HTML_PROBE_NODE_MODULES ??
  join(root, 'node_modules/.pnpm/node_modules');
const parse5Path = realpathSync(
  require.resolve('parse5', {
    paths: [probeNodeModules],
  })
);
let parse5Root = dirname(parse5Path);
let parse5Package;

while (true) {
  try {
    const candidate = JSON.parse(
      readFileSync(join(parse5Root, 'package.json'), 'utf8')
    );

    if (candidate.name === 'parse5' && candidate.version) {
      parse5Package = candidate;
      break;
    }
  } catch {}
  const parent = dirname(parse5Root);

  if (parent === parse5Root) throw new Error('Cannot locate parse5 package.');
  parse5Root = parent;
}

if (parse5Package.version !== '8.0.1') {
  throw new Error(
    `Expected parse5 8.0.1, received ${parse5Package.version}. Set PLATE_HTML_PROBE_NODE_MODULES to an exact research install.`
  );
}
const { parse, serialize } = await import(pathToFileURL(parse5Path).href);
const cohorts = allCohorts.filter(({ name }) => name === selectedCohort);

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

const parseServerHtml = (html) => {
  const parserDiagnostics = [];
  const syntaxTree = parse(html, {
    onParseError: (diagnostic) => parserDiagnostics.push(diagnostic),
  });
  const canonical = serialize(syntaxTree);
  const document = new DOMParser().parseFromString(canonical, 'text/html');

  if (!document) throw new Error('DOM parser returned no document.');

  return { canonical, document, parserDiagnostics };
};

const measure = (html) => {
  const start = performance.now();
  const parsed = parseServerHtml(html);
  const duration = performance.now() - start;

  return {
    canonicalBytes: Buffer.byteLength(parsed.canonical),
    duration,
    elements: parsed.document.body.querySelectorAll('*').length,
    firstText: parsed.document.body.querySelector('strong')?.textContent ?? null,
    parserDiagnostics: parsed.parserDiagnostics.length,
  };
};

const results = [];

for (const cohort of cohorts) {
  const html = makeHtml(cohort.paragraphs, cohort.name);
  const expectedElements = cohort.paragraphs * 3 + 2;

  for (let index = 0; index < 3; index++) measure(html);
  globalThis.gc();
  const heapBefore = process.memoryUsage().heapUsed;
  const rssBefore = process.memoryUsage().rss;
  let peakRss = rssBefore;
  const samples = [];
  let canonicalBytes = 0;

  for (let index = 0; index < cohort.samples; index++) {
    const result = measure(html);

    if (result.elements !== expectedElements) {
      throw new Error(
        `${cohort.name}: expected ${expectedElements} elements, received ${result.elements}.`
      );
    }
    if (result.firstText !== `${cohort.name}-0`) {
      throw new Error(`${cohort.name}: parsed text did not match the source.`);
    }
    if (result.parserDiagnostics !== 0) {
      throw new Error(`${cohort.name}: valid fixture produced parser diagnostics.`);
    }
    canonicalBytes = result.canonicalBytes;
    samples.push(result.duration);
    peakRss = Math.max(peakRss, process.memoryUsage().rss);
  }

  globalThis.gc();
  const retainedBytes = process.memoryUsage().heapUsed - heapBefore;
  const summary = summarize(samples);

  results.push({
    budget: {
      maxPeakRssDeltaBytes: cohort.maxPeakRssDeltaBytes,
      maxRetainedBytes: cohort.maxRetainedBytes,
      p95Ms: cohort.budgetMs,
    },
    canonicalBytes,
    elements: expectedElements,
    inputBytes: Buffer.byteLength(html),
    pass:
      summary.p95 <= cohort.budgetMs &&
      peakRss - rssBefore <= cohort.maxPeakRssDeltaBytes &&
      retainedBytes <= cohort.maxRetainedBytes,
    peakRssDeltaBytes: peakRss - rssBefore,
    retainedBytes,
    samples: cohort.samples,
    timing: summary,
    name: cohort.name,
  });
}

if (globalThis.__plateHtmlProbeExecuted !== undefined) {
  throw new Error('Server DOM evaluated source JavaScript.');
}

const lockfile = readFileSync(join(root, 'pnpm-lock.yaml'));
const output = {
  contract: {
    action:
      'Parse through parse5, serialize its repaired tree, and materialize the canonical HTML in LinkeDOM.',
    baseline:
      'The rejected happy-dom adapter uses one isolated Window and DOMParser per operation.',
    correctness:
      'Element count and sentinel text survive, valid input has no parse5 errors, and source scripts do not execute.',
    independentVariables: ['source bytes', 'element count', 'operations'],
    noiseRule:
      'Fresh process per cohort; pass every frozen p95, peak-RSS-delta, and retained-heap budget.',
    proposed: 'platejs/html/server owns parse5 repair plus a LinkeDOM DOM facade.',
    repeatedUnit: 'One parse5 node and one LinkeDOM node per source element.',
    userOperation: 'Detached HTML document or ContentSlice parsing in Node.',
  },
  environment: {
    architecture: process.arch,
    linkedom: {
      commit: 'fcd88e02b6dd3e616f5de512b15713b663d16ab7',
      version: linkedomPackage.version,
    },
    lockfileSha256: createHash('sha256').update(lockfile).digest('hex'),
    node: process.version,
    parse5: parse5Package.version,
    platform: process.platform,
  },
  result: results.every(({ pass }) => pass) ? 'pass' : 'fail',
  results,
};
const outputPath = join(
  dirname(import.meta.dirname),
  `html-server-parse5-linkedom-benchmark${selectedCohort ? `-${selectedCohort}` : ''}.json`
);

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ output: outputPath, result: output.result }));
