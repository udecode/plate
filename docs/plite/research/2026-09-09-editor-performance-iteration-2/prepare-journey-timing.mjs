import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const isWww = process.argv.includes('--www');
const label = isWww ? 'www-journey' : 'journey';
const app = isWww ? 'www' : 'plite';
const sourceRoot = resolve(
  isWww ? 'apps/www/tests/browser' : 'apps/plite/tests/plite-browser'
);
const output = resolve(`tmp/perf-iteration-2/${label}-timing`);
const artifact = resolve(
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const files = execFileSync('rg', ['--files', sourceRoot], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .sort();
const hash = (source) => createHash('sha256').update(source).digest('hex');
const records = [];
mkdirSync(output, { recursive: true });
for (const file of files) {
  const relative = file.slice(sourceRoot.length + 1);
  const destination = resolve(output, 'tests', relative);
  const source = readFileSync(file, 'utf8');
  const isTest = /\.(spec|test)\.[cm]?[jt]sx?$/.test(relative);
  const externalImports = [];
  const relocated = source.replace(
    /(from\s+)(['"])(\.[^'"]+)\2/g,
    (whole, lead, quote, specifier) => {
      const target = resolve(dirname(file), specifier);
      if (target.startsWith(`${sourceRoot}/`)) return whole;
      externalImports.push({ specifier, target });
      return `${lead}${quote}${target}${quote}`;
    }
  );
  const prefix = isTest
    ? `import { test as researchJourneyTest } from '@playwright/test';\nimport { installJourneyTimingHooks } from ${JSON.stringify(resolve(output, 'timing-hooks.ts'))};\ninstallJourneyTimingHooks(researchJourneyTest);\n`
    : '';
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, prefix + relocated);
  records.push({
    file: file.slice(root.length + 1),
    relative,
    sourceSha256: hash(source),
    overlaySha256: hash(prefix + relocated),
    test: isTest,
    externalImports,
    modification: isTest
      ? 'Two imports and root timing hooks; external import paths rebound to the same owners. Canonical test body unchanged.'
      : externalImports.length
        ? 'External import path rebound to the same owner.'
        : 'Byte-identical support file.',
  });
}
writeFileSync(
  resolve(output, 'timing-hooks.ts'),
  `import type { TestType } from '@playwright/test';

export function installJourneyTimingHooks(test: TestType<any, any>) {
  const packets = new WeakMap<object, { events: unknown[]; documents: unknown[]; errors: string[] }>();
  test.beforeEach(async ({ page }) => {
    const packet = { events: [], documents: [], errors: [] };
    packets.set(page, packet);
    await page.exposeBinding('__receiveResearchEventTiming', (_source, value) => {
      if (value.kind === 'events') packet.events.push(...value.entries);
      else packet.documents.push(value);
    });
    await page.addInitScript(() => {
      const documentId = String(performance.timeOrigin) + ':' + Math.random();
      const supported = PerformanceObserver.supportedEntryTypes.includes('event');
      const entries = [];
      const send = (value) => window.__receiveResearchEventTiming(value).catch(() => {});
      const publish = (events) => {
        const rows = events.map((entry) => ({
          name: entry.name, startTime: entry.startTime, duration: entry.duration,
          processingStart: entry.processingStart, processingEnd: entry.processingEnd,
          interactionId: entry.interactionId, cancelable: entry.cancelable,
          targetTag: entry.target?.tagName ?? null,
          editorRoot: entry.target?.closest?.('[data-plite-editor]')?.getAttribute('data-plite-root') ?? null,
          documentId, url: location.href,
        }));
        entries.push(...rows);
        if (rows.length) send({ kind: 'events', entries: rows });
      };
      const observer = supported ? new PerformanceObserver((list) => publish(list.getEntries())) : null;
      observer?.observe({ type: 'event', durationThreshold: 16, buffered: false });
      const snapshot = () => {
        const eventCounts = performance.eventCounts;
        const countsIterable = typeof eventCounts?.[Symbol.iterator] === 'function';
        return { kind: 'document', documentId, url: location.href, supported, durationThreshold: 16, granularityMs: 8, counts: countsIterable ? Object.fromEntries(eventCounts) : null, countsAvailability: countsIterable ? 'native-iterable' : 'unavailable-or-test-controlled' };
      };
      window.__researchJourneyTiming = { entries, snapshot, flush: () => { if (observer) publish(observer.takeRecords()); return snapshot(); } };
      window.addEventListener('pagehide', () => { if (observer) publish(observer.takeRecords()); send(snapshot()); });
      send(snapshot());
    });
  });
  test.afterEach(async ({ page }, testInfo) => {
    const packet = packets.get(page);
    if (!packet) return;
    if (!page.isClosed()) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const final = await page.evaluate(() => {
          return window.__researchJourneyTiming?.flush() ?? { kind: 'document', supported: false, reason: 'No timing script in this document.' };
        });
        packet.documents.push(final);
      } catch (error) { packet.errors.push(String(error)); }
    } else packet.errors.push('Page closed before the final timing flush. Earlier observer batches remain available.');
    await testInfo.attach('native-event-timing', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ schemaVersion: 2, capturePolicy: 'Wait 50 ms on the runner clock, then synchronously flush queued observer records. Never advance or wait on a test-controlled browser clock. Entries still awaiting browser delivery may remain unobserved.', title: testInfo.titlePath, sourceFile: testInfo.file, line: testInfo.line, project: testInfo.project.name, repeatEachIndex: testInfo.repeatEachIndex, retry: testInfo.retry, statusAtCapture: testInfo.status, metric: 'Browser Event Timing input-to-next-render duration; 16 ms threshold and 8 ms granularity. Missing entries are censored or unsupported, never zero. Continuous pointermove, wheel and programmatic actions are outside this metric. Test assertions remain the correctness oracle; event duration does not prove completion of asynchronous feature work.', ...packet })) });
  });
}
`
);
writeFileSync(
  resolve(output, 'tests/tsconfig.json'),
  JSON.stringify({ extends: resolve(`apps/${app}/tsconfig.json`) }) + '\n'
);
writeFileSync(
  resolve(output, 'playwright.config.ts'),
  `import base from ${JSON.stringify(resolve(`apps/${app}/playwright.config.ts`))};\nexport default { ...base, testDir: ${JSON.stringify(resolve(output, 'tests'))}, workers: 1, fullyParallel: false, retries: 0, reporter: [['line'], ['json', { outputFile: ${JSON.stringify(resolve(artifact, `${label}-event-timing-report.json`))} }]], outputDir: ${JSON.stringify(resolve(artifact, `${label}-event-timing-output`))} };\n`
);
const receipt = {
  capturedAt: new Date().toISOString(),
  canonicalConfig: `apps/${app}/playwright.config.ts`,
  output,
  files: records.length,
  tests: records.filter((record) => record.test).length,
  policy:
    'Disposable instrumentation of existing repository-owned Playwright journeys. Canonical assertions and interaction recipes are unchanged. Run serially as a breadth diagnostic, separately from uninstrumented comparison distributions. No standalone browser driver or product code is introduced.',
  filesFingerprint: hash(
    records.map((record) => record.sourceSha256).join('\n')
  ),
  records,
};
writeFileSync(
  resolve(artifact, `${label}-timing-overlay.json`),
  JSON.stringify(receipt, null, 2) + '\n'
);
console.log(
  JSON.stringify({
    output,
    files: receipt.files,
    testFiles: receipt.tests,
    sourceFingerprint: receipt.filesFingerprint,
  })
);
