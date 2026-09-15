import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  measureTrustedTyping,
  openExample,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test, type Browser, type Page } from '@playwright/test';

import type { RecordTree } from '../../../../packages/plitejs/src/authored/record-tree';
import type { PliteBrowserHandle } from '../../../../packages/plitejs/src/react/editable/browser-handle';

const contractPath =
  '../../docs/plans/artifacts/native-authored-changes/browser-mounted-contract.json';
const contractSource = readFileSync(contractPath, 'utf-8');
const contract = JSON.parse(contractSource) as {
  budget: {
    keydownToPaintBoundaryP95Ms: number;
    keydownToPaintBoundaryP99Ms: number;
    retainedHeapToControlMaximum: number;
    retainedP95ExtraMs: number;
    retainedP95RelativeTolerance: number;
  };
  cohorts: Array<{
    blocks: number;
    id: string;
    mountedSharedViews: 1 | 2 | 8;
    pendingDeletions: number;
  }>;
  sampling: {
    passes: number;
    samplesPerPass: number;
    warmupsPerPass: number;
  };
};
const contractSha256 = createHash('sha256')
  .update(contractSource)
  .digest('hex');
const cohortId =
  process.env.PLITE_AUTHORED_MOUNTED_PERFORMANCE_COHORT ?? 'views-1';
const cohort = contract.cohorts.find((item) => item.id === cohortId);
if (!cohort) throw new Error(`Unknown authored mounted cohort: ${cohortId}`);

type Arm = 'matched' | 'retained' | 'zero';

const percentile = (samples: readonly number[], quantile: number) =>
  [...samples].sort((left, right) => left - right)[
    Math.ceil(samples.length * quantile) - 1
  ];

const summarize = (samples: number[]) => ({
  p50: percentile(samples, 0.5),
  p95: percentile(samples, 0.95),
  p99: percentile(samples, 0.99),
});

const recordValues = <T>(tree: RecordTree<T>): T[] =>
  tree.kind === 'leaf'
    ? tree.entries.map(([, value]) => value)
    : tree.children.flatMap(recordValues);

const nodeText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return '';
  if ('text' in node && typeof node.text === 'string') return node.text;
  if (!('children' in node) || !Array.isArray(node.children)) return '';

  return node.children.map(nodeText).join('');
};

const readHeapMetrics = async (page: Page) => {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
  const client = await page.context().newCDPSession(page);
  try {
    await client.send('HeapProfiler.enable');
    await client.send('Performance.enable');
    await client.send('HeapProfiler.collectGarbage');
    await client.send('HeapProfiler.collectGarbage');
    const { metrics } = await client.send('Performance.getMetrics');
    const value = (name: string) =>
      metrics.find((metric) => metric.name === name)?.value ?? null;

    return {
      documents: value('Documents'),
      eventListeners: value('JSEventListeners'),
      jsHeapUsedSize: value('JSHeapUsedSize'),
      nodes: value('Nodes'),
    };
  } finally {
    await client.detach();
  }
};

const readMountedDOM = (page: Page) =>
  page.locator('[data-authored-shared-view]').evaluateAll((sections) => {
    const views = sections.map((section) => {
      const root = section.querySelector<HTMLElement>('[data-editor="true"]');
      if (!root) {
        return {
          blocks: 0,
          label: null,
          placeholders: 0,
          retained: 0,
          retainedText: [],
        };
      }
      const blocks = [...root.querySelectorAll('[data-editor-path]')].filter(
        (element) =>
          element.getAttribute('data-editor-node') === 'element' &&
          /^\d+$/.test(element.getAttribute('data-editor-path') ?? '') &&
          !element.closest('[data-editor-retained]')
      );
      const retained = [...root.querySelectorAll('[data-editor-retained]')];

      return {
        blocks: blocks.length,
        label: root.getAttribute('aria-label'),
        placeholders: root.querySelectorAll('[data-editor-viewport-boundary]')
          .length,
        retained: retained.length,
        retainedText: retained.map((element) => element.textContent),
      };
    });

    return {
      blocks: views.reduce((sum, view) => sum + view.blocks, 0),
      placeholders: views.reduce((sum, view) => sum + view.placeholders, 0),
      retained: views.reduce((sum, view) => sum + view.retained, 0),
      views,
    };
  });

const runArm = async ({ arm, browser }: { arm: Arm; browser: Browser }) => {
  const context = await browser.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL,
    viewport: { height: 720, width: 1280 },
  });
  const page = await context.newPage();
  try {
    const { errors } = recordBrowserRuntimeErrors(page, { strict: true });
    const proposed = await openExample(page, 'plite/authored-changes', {
      ready: { editor: 'visible' },
      surface: { scope: '#authored-proposed-surface' },
    });
    const accepted = proposed.rootAt('[aria-label="Accepted document"]');
    const independent = proposed.rootAt('[aria-label="Independent document"]');
    const seedText =
      arm === 'matched' ? 'Sd.' : arm === 'retained' ? 'Seed.' : 'Sed.';
    await accepted.scenario.run('seed authored mounted cohort', [
      {
        kind: 'applyValueChange',
        value: {
          children: Array.from({ length: cohort.blocks }, () => ({
            type: 'paragraph',
            children: [{ text: seedText }],
          })),
        },
      },
    ]);
    if (arm === 'retained') {
      await proposed.root.evaluate((element, count) => {
        const handle = (
          element as HTMLElement & { __pliteBrowserHandle: PliteBrowserHandle }
        ).__pliteBrowserHandle;
        for (let index = 0; index < count; index++) {
          handle.deleteTextAt({
            anchor: { path: [index, 0], offset: 1 },
            focus: { path: [index, 0], offset: 2 },
          });
        }
      }, cohort.pendingDeletions);
    } else if (arm === 'matched') {
      await proposed.root.evaluate((element, count) => {
        const handle = (
          element as HTMLElement & { __pliteBrowserHandle: PliteBrowserHandle }
        ).__pliteBrowserHandle;
        for (let index = 0; index < count; index++) {
          handle.insertTextAt('e', { path: [index, 0], offset: 1 });
        }
      }, cohort.pendingDeletions);
    }
    const initialValue = (await accepted.get.modelValue()) as {
      children: unknown[];
      meta?: {
        authored?: {
          value?: {
            operations?: RecordTree<{
              changeId: string;
              kind: string;
              proposal?: boolean;
            }>;
          };
        };
      };
    };
    const initialOperations = initialValue.meta?.authored?.value?.operations
      ? recordValues(initialValue.meta.authored.value.operations)
      : [];
    const initialPendingIds = [
      ...new Set(
        initialOperations
          .filter(
            (operation) =>
              operation.kind === 'edit' && operation.proposal === true
          )
          .map((operation) => operation.changeId)
      ),
    ];
    await page
      .getByLabel('Shared document views', { exact: true })
      .selectOption(String(cohort.mountedSharedViews));
    if (arm !== 'zero') {
      await page
        .getByLabel('Proposed document controls')
        .getByRole('button', { name: 'Show changes', exact: true })
        .click();
    }
    const markupViews =
      cohort.mountedSharedViews === 1 ? 1 : cohort.mountedSharedViews - 1;
    const expectedRetained =
      arm === 'retained' ? cohort.pendingDeletions * markupViews : 0;
    await expect
      .poll(async () => {
        const mounted = await readMountedDOM(page);
        return {
          blocks: mounted.blocks,
          placeholders: mounted.placeholders,
          retained: mounted.retained,
          views: mounted.views.length,
        };
      })
      .toEqual({
        blocks: cohort.blocks * cohort.mountedSharedViews,
        placeholders: 0,
        retained: expectedRetained,
        views: cohort.mountedSharedViews,
      });
    const initialDOM = await readMountedDOM(page);
    const acceptedText = seedText.repeat(cohort.blocks);
    const proposedText = 'Sed.'.repeat(cohort.blocks);
    await proposed.selection.collapse({ path: [0, 0], offset: 0 });
    const warmup = 'w'.repeat(contract.sampling.warmupsPerPass);
    await proposed.type(warmup);
    await proposed.assert.domCaret({
      offset: warmup.length,
      text: `${warmup}${arm === 'retained' ? 'S' : 'Sed.'}`,
    });
    const measured = 'q'.repeat(contract.sampling.samplesPerPass);
    const result = await measureTrustedTyping({
      page,
      root: proposed.root,
      text: measured,
    });
    const finalDOM = await readMountedDOM(page);
    const keyToPaint = result.rows.flatMap((row) =>
      row.paint === undefined ? [] : [row.paint - row.keydown]
    );
    const keyToDOM = result.rows.flatMap((row) =>
      row.domReady === undefined ? [] : [row.domReady - row.keydown]
    );
    const finalProposedText = warmup + measured + proposedText;
    const projectedLabels = [
      'Proposed document',
      ...Array.from(
        { length: cohort.mountedSharedViews === 8 ? 6 : 0 },
        (_, index) => `Markup observer ${index + 1}`
      ),
    ];
    const projectedTexts = await Promise.all(
      projectedLabels.map((label) =>
        proposed.rootAt(`[aria-label="${label}"]`).get.modelText()
      )
    );
    const heap = await readHeapMetrics(page);
    if (cohort.mountedSharedViews === 1) {
      await page
        .getByLabel('Shared document views', { exact: true })
        .selectOption('2');
      await expect(accepted.root).toBeVisible();
    }
    const finalValue = (await accepted.get.modelValue()) as typeof initialValue;
    const finalOperations = finalValue.meta?.authored?.value?.operations
      ? recordValues(finalValue.meta.authored.value.operations)
      : [];
    const finalPendingIds = new Set(
      finalOperations
        .filter(
          (operation) =>
            operation.kind === 'edit' && operation.proposal === true
        )
        .map((operation) => operation.changeId)
    );
    return {
      arm,
      heap,
      initialDOM,
      finalDOM,
      initialPendingIds,
      result,
      runtimeErrors: [...errors],
      summary: {
        dom: summarize(keyToDOM),
        paintBoundary: summarize(keyToPaint),
      },
      checks: {
        acceptedValue:
          initialValue.children.map(nodeText).join('') === acceptedText &&
          finalValue.children.map(nodeText).join('') === acceptedText,
        finalDOM:
          finalDOM.blocks === cohort.blocks * cohort.mountedSharedViews &&
          finalDOM.placeholders === 0 &&
          finalDOM.retained === expectedRetained &&
          finalDOM.views.every((view) =>
            view.retainedText.every((text) => text === 'e')
          ),
        independent:
          (await independent.get.modelText()) === 'A separate document.',
        originalPendingPreserved:
          initialPendingIds.length ===
            (arm === 'zero' ? 0 : cohort.pendingDeletions) &&
          initialPendingIds.every((id) => finalPendingIds.has(id)),
        projectedTexts: projectedTexts.every(
          (text) => text === finalProposedText
        ),
        runtimeErrors: errors.length === 0,
        trustedRows:
          result.rows.length === contract.sampling.samplesPerPass &&
          keyToPaint.length === contract.sampling.samplesPerPass &&
          result.rows.every(
            (row) =>
              row.trustedKey &&
              row.trustedBeforeInput &&
              row.beforeInputDataMatched &&
              row.modelSelectionMatched &&
              row.runtimeTargetMatched &&
              row.nativeTargetRangeMatched &&
              row.domTextInsertionMatched &&
              row.domSelectionInsertionMatched &&
              row.modelTextInsertionMatched &&
              row.paint !== undefined &&
              row.domReady !== undefined &&
              row.paint >= row.domReady
          ),
      },
    };
  } finally {
    await context.close();
  }
};

test.describe('native authored mounted performance', () => {
  test.skip(
    process.env.PLITE_AUTHORED_MOUNTED_PERFORMANCE !== '1',
    'Run the frozen production mounted contract explicitly.'
  );
  for (let pass = 0; pass < contract.sampling.passes; pass++) {
    test(`${cohort.id} pass ${pass + 1}`, async ({ browser }, info) => {
      test.setTimeout(300_000);
      const arms: Arm[] =
        pass % 2 === 0
          ? ['zero', 'matched', 'retained']
          : ['retained', 'matched', 'zero'];
      const rows = {} as Record<Arm, Awaited<ReturnType<typeof runArm>>>;
      for (const arm of arms) rows[arm] = await runArm({ arm, browser });
      const retainedP95Limit =
        rows.matched.summary.paintBoundary.p95 +
        Math.max(
          contract.budget.retainedP95ExtraMs,
          rows.matched.summary.paintBoundary.p95 *
            contract.budget.retainedP95RelativeTolerance
        );
      const heapRatio =
        (rows.retained.heap.jsHeapUsedSize ?? Number.POSITIVE_INFINITY) /
        (rows.matched.heap.jsHeapUsedSize ?? 0);
      const checks = {
        armCorrectness: Object.values(rows).every((row) =>
          Object.values(row.checks).every(Boolean)
        ),
        absoluteLatency: Object.values(rows).every(
          (row) =>
            row.summary.paintBoundary.p95 <=
              contract.budget.keydownToPaintBoundaryP95Ms &&
            row.summary.paintBoundary.p99 <=
              contract.budget.keydownToPaintBoundaryP99Ms
        ),
        retainedLatency:
          rows.retained.summary.paintBoundary.p95 <= retainedP95Limit,
        retainedHeap:
          Number.isFinite(heapRatio) &&
          heapRatio <= contract.budget.retainedHeapToControlMaximum,
      };
      const receipt = JSON.stringify(
        {
          cohort,
          pass,
          contractSha256,
          build: JSON.parse(
            readFileSync('out/.editor-proof-build.json', 'utf-8')
          ),
          browser: browser.version(),
          environment: {
            arch: os.arch(),
            node: process.version,
            platform: os.platform(),
            release: os.release(),
          },
          targetFingerprint: process.env.PLITE_BROWSER_TARGET_FINGERPRINT,
          arms: rows,
          comparisons: { heapRatio, retainedP95Limit },
          checks,
        },
        null,
        2
      );
      const outputDirectory =
        process.env.PLITE_AUTHORED_MOUNTED_PERFORMANCE_OUTPUT;
      if (outputDirectory) {
        writeFileSync(
          path.join(outputDirectory, `${cohort.id}-${pass}.json`),
          receipt
        );
      }
      await info.attach('authored-mounted-performance.json', {
        body: receipt,
        contentType: 'application/json',
      });
      expect.soft(checks).toEqual({
        absoluteLatency: true,
        armCorrectness: true,
        retainedHeap: true,
        retainedLatency: true,
      });
    });
  }
});
