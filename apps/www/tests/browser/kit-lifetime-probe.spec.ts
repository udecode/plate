import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { gzipSync } from 'node:zlib';

import { expect, test } from '@playwright/test';

import type {
  Cohort,
  Variant,
} from '../../src/__tests__/package-integration/kit-lifetime-probe/lifetime-browser-probe';

test('kit lifetime comparison', async ({
  browser,
  channel,
  headless,
  launchOptions,
}, testInfo) => {
  test.setTimeout(86_400_000);
  const cohort: Cohort = JSON.parse(
    process.env.KIT_COHORT ??
      '{"blocks":100,"views":1,"editors":1,"cycles":1,"features":true}'
  );
  const variants = (process.env.KIT_VARIANTS ?? 'current,production').split(
    ','
  ) as Variant[];
  const samples = Number(process.env.KIT_SAMPLES ?? 100);
  const warmups = Number(process.env.KIT_WARMUPS ?? 20);
  const output =
    process.env.KIT_OUTPUT ?? testInfo.outputPath('kit-browser-probe.jsonl');
  mkdirSync(dirname(output), { recursive: true });
  const profile = process.env.KIT_PROFILE === '1';
  const requireCommits = process.env.KIT_REQUIRE_COMMITS === '1';
  const isolatedProcesses = process.env.KIT_PROCESS_PER_VARIANT === '1';
  const targets = [];
  for (const [realm, variant] of variants.entries()) {
    const targetBrowser =
      isolatedProcesses && realm > 0
        ? await browser
            .browserType()
            .launch({ ...launchOptions, channel, headless })
        : browser;
    const context = await targetBrowser.newContext({
      baseURL: testInfo.project.use.baseURL,
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
      console.error(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') console.error(message.text());
    });
    await page.goto('/dev/kit-lifetime-probe');
    await page.waitForFunction(
      () => typeof window.kitLifetimeProbe === 'function',
      undefined,
      { timeout: 30_000 }
    );
    const cdp =
      process.env.KIT_HEAP === '1' || profile
        ? await context.newCDPSession(page)
        : null;
    let navigationStart = 0;
    if (profile) {
      await cdp!.send('Profiler.enable');
      await cdp!.send('Performance.enable');
      const { metrics } = await cdp!.send('Performance.getMetrics');
      navigationStart = metrics.find(
        (metric) => metric.name === 'NavigationStart'
      )!.value;
    }
    const scripts = await page
      .locator('script[src]')
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('src'))
      );
    targets.push({
      variant,
      realm,
      page,
      context,
      cdp,
      errors,
      scripts,
      navigationStart,
      targetBrowser,
    });
  }
  writeFileSync(
    `${output}.inputs.json`,
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        cohort,
        variants,
        samples,
        warmups,
        browser: browser.browserType().name(),
        browserVersion: browser.version(),
        project: testInfo.project.name,
        headless,
        viewport: { width: 1280, height: 720 },
        isolatedProcesses,
        requireCommits,
        order: 'alternating pages; reverse order for the second half',
        realms: targets.map(({ variant, realm, scripts, page }) => ({
          variant,
          realm,
          scripts,
          url: page.url(),
        })),
      },
      null,
      2
    )}\n`
  );
  try {
    for (let sample = -warmups; sample < samples; sample++) {
      for (const {
        variant,
        realm,
        page,
        cdp,
        errors,
        navigationStart,
      } of sample < Math.ceil(samples / 2) ? targets : targets.toReversed()) {
        await page.requestGC();
        const beforeHeap = cdp ? await cdp.send('Runtime.getHeapUsage') : null;
        if (profile) await cdp!.send('Profiler.start');
        const result = await page.evaluate(
          async ({ variant: activeVariant, cohort: activeCohort }) =>
            window.kitLifetimeProbe(activeVariant, activeCohort),
          { variant, cohort }
        );
        if (profile) {
          const cpu = await cdp!.send('Profiler.stop');
          if (sample >= 0) {
            writeFileSync(
              `${output}.${sample}.${variant}.realm-${realm}.cpu.json.gz`,
              gzipSync(JSON.stringify({ ...cpu, navigationStart }))
            );
          }
        }
        expect(errors).toEqual([]);
        if (requireCommits) {
          expect(
            result.commits?.mount,
            'React commit counters require a profiling build'
          ).toBeGreaterThan(0);
        }
        if (cdp) await cdp.send('HeapProfiler.collectGarbage');
        const afterHeap = cdp ? await cdp.send('Runtime.getHeapUsage') : null;
        if (sample >= 0) {
          appendFileSync(
            output,
            `${JSON.stringify({
              sample,
              realm,
              isolatedRealms: true,
              isolatedProcesses,
              ...result,
              heap: { before: beforeHeap, after: afterHeap },
            })}\n`
          );
        }
        if (sample % 10 === 0) {
          console.info(
            JSON.stringify({
              sample,
              variant,
              cohort,
              mount: Math.round(result.mount),
              chunks: Math.round(result.chunks),
              cleanup: Math.round(result.cleanup),
            })
          );
        }
      }
    }
  } finally {
    for (const { context, targetBrowser } of targets) {
      await context.close();
      if (targetBrowser !== browser) await targetBrowser.close();
    }
  }
});
