import { recordBrowserRuntimeErrors } from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

import {
  SUGGESTION_PERFORMANCE_CASES,
  type SuggestionPerformanceCohort,
} from '../../src/app/dev/suggestion-performance/contract';

const DOM_P95_BUDGET_MS = 50;
const DOM_P99_BUDGET_MS = 100;
const enabled = process.env.PLATE_SUGGESTION_PERFORMANCE === '1';

test.describe('suggestion activation performance', () => {
  test.describe.configure({ mode: 'serial', retries: 0 });
  test.skip(!enabled, 'Set PLATE_SUGGESTION_PERFORMANCE=1 to run the matrix');

  for (const [cohort, config] of Object.entries(
    SUGGESTION_PERFORMANCE_CASES
  ) as Array<
    [
      SuggestionPerformanceCohort,
      (typeof SUGGESTION_PERFORMANCE_CASES)[SuggestionPerformanceCohort],
    ]
  >) {
    test(`${cohort}: activation stays local and bounded`, async ({ page }) => {
      test.setTimeout(config.timeoutMs);
      const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

      try {
        await page.goto(`/dev/suggestion-performance?cohort=${cohort}`, {
          waitUntil: 'commit',
        });
        await expect
          .poll(
            () =>
              page.evaluate(
                () =>
                  document.documentElement?.dataset
                    .suggestionPerformanceReady ?? null
              ),
            { timeout: config.timeoutMs - 10_000 }
          )
          .toBe(cohort);

        const result = await page.evaluate(() => {
          if (!window.__suggestionPerformanceHarness) {
            throw new Error('Suggestion performance harness is not ready');
          }

          return window.__suggestionPerformanceHarness.run();
        });

        expect(result.cohort).toBe(cohort);
        expect(result.nodeCount).toBe(config.nodeCount);
        expect(result.changeCount).toBe(config.changeCount);
        expect(result.mountedViewCount).toBe(2);
        expect(result.distinctViewManagers).toBe(true);
        expect(result.sourceObserverCounts).toEqual([1, 1]);
        expect(result.stabilityPasses).toBe(5);
        expect(result.authoredStateUnchanged).toBe(true);
        expect(result.modelUnchanged).toBe(true);
        expect(result.selectionUnchanged).toBe(true);
        expect(result.passes).toHaveLength(3);

        for (const pass of result.passes) {
          expect(pass.clickCount).toBe(50);
          expect(pass.maxActiveDelta.changedBucketCount).toBeLessThanOrEqual(2);
          expect(pass.maxActiveDelta.sourceReadCount).toBeLessThanOrEqual(2);
          expect(pass.maxActiveDelta.wakeCount).toBeLessThanOrEqual(2);
          expect(pass.maxSiblingDelta).toEqual({
            changedBucketCount: 0,
            sourceReadCount: 0,
            wakeCount: 0,
          });
          expect(pass.semantic.p95).toBeLessThanOrEqual(config.semanticP95Ms);
          expect(pass.dom.p95).toBeLessThanOrEqual(DOM_P95_BUDGET_MS);
          expect(pass.dom.p99).toBeLessThanOrEqual(DOM_P99_BUDGET_MS);
        }

        console.info(
          JSON.stringify({
            activeMax: result.passes.map((pass) => pass.maxActiveDelta),
            cohort,
            domP95: result.passes.map((pass) => pass.dom.p95),
            domP99: result.passes.map((pass) => pass.dom.p99),
            semanticP95: result.passes.map((pass) => pass.semantic.p95),
            siblingMax: result.passes.map((pass) => pass.maxSiblingDelta),
            sourceObserverCounts: result.sourceObserverCounts,
          })
        );
        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });
  }
});
