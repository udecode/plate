import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  measureTrustedTyping,
  openExample,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

import type { RecordTree } from '../../../../packages/plitejs/src/authored/record-tree';
import type { PliteBrowserHandle } from '../../../../packages/plitejs/src/react/editable/browser-handle';

const contractPath =
  '../../docs/plans/artifacts/native-authored-changes/browser-typing-contract.json';
const contractSource = readFileSync(contractPath, 'utf-8');
const contract = JSON.parse(contractSource) as {
  budget: {
    keydownToPaintBoundaryP95Ms: number;
    keydownToPaintBoundaryP99Ms: number;
  };
  cohorts: Array<{
    blocks: number;
    id: string;
    mountedSharedViews: number;
    pendingDeletions: number;
  }>;
  sampling: {
    passes: number;
    samplesPerPass: number;
    warmupsPerPass: number;
  };
};
const cohortId = process.env.PLITE_AUTHORED_PERFORMANCE_COHORT ?? 'normal';
const cohort = contract.cohorts.find((item) => item.id === cohortId);
if (!cohort) throw new Error(`Unknown authored typing cohort: ${cohortId}`);

const percentile = (samples: number[], quantile: number) =>
  [...samples].sort((left, right) => left - right)[
    Math.ceil(samples.length * quantile) - 1
  ];

type SavedAuthoredOperation = {
  changeId: string;
  kind: string;
  proposal?: boolean;
};

const recordValues = <T>(tree: RecordTree<T>): T[] =>
  tree.kind === 'leaf'
    ? tree.entries.map(([, value]) => value)
    : tree.children.flatMap(recordValues);

test.describe('native authored typing performance', () => {
  test.skip(
    process.env.PLITE_AUTHORED_PERFORMANCE !== '1',
    'Run the frozen production typing contract explicitly.'
  );
  for (let pass = 0; pass < contract.sampling.passes; pass++) {
    test(`${cohort.id} pass ${pass + 1}`, async ({ page, browser }, info) => {
      test.setTimeout(180_000);
      const { errors } = recordBrowserRuntimeErrors(page, {
        strict: true,
      });
      const proposed = await openExample(page, 'plite/authored-changes', {
        ready: { editor: 'visible' },
        surface: { scope: '#authored-proposed-surface' },
      });
      const accepted = proposed.rootAt('[aria-label="Accepted document"]');
      const independent = proposed.rootAt(
        '[aria-label="Independent document"]'
      );
      await accepted.scenario.run('seed authored typing cohort', [
        {
          kind: 'applyValueChange',
          value: {
            children: Array.from({ length: cohort.blocks }, () => ({
              type: 'paragraph',
              children: [{ text: 'Seed.' }],
            })),
          },
        },
      ]);
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
      await page
        .getByLabel('Proposed document controls')
        .getByRole('button', { name: 'Show changes', exact: true })
        .click({ timeout: 10_000 });
      const mountedMarkup = () =>
        proposed.root.evaluate((root) => {
          const blocks = [
            ...root.querySelectorAll(
              '[data-editor-node="element"][data-editor-path]'
            ),
          ].filter(
            (element) =>
              /^\d+$/.test(element.getAttribute('data-editor-path') ?? '') &&
              !element.closest('[data-editor-retained]')
          );
          return {
            paths: blocks.map((element) =>
              element.getAttribute('data-editor-path')
            ),
            retained: root.querySelectorAll('[data-editor-retained]').length,
            placeholders: root.querySelectorAll(
              '[data-editor-viewport-boundary]'
            ).length,
            invalid: blocks.filter((element) => {
              const fragments = [
                ...element.querySelectorAll('[data-editor-retained]'),
              ];
              return fragments.length !== 1 || fragments[0].textContent !== 'e';
            }).length,
          };
        });
      await expect
        .poll(async () => {
          const mounted = await mountedMarkup();
          return (
            mounted.paths.length > 0 &&
            mounted.invalid === 0 &&
            mounted.retained === mounted.paths.length
          );
        })
        .toBe(true);
      const initialMarkup = await mountedMarkup();
      if (cohort.id === 'normal') {
        expect(initialMarkup.paths).toHaveLength(cohort.blocks);
      } else {
        expect(initialMarkup.placeholders).toBeGreaterThan(0);
      }
      const initialValue = await accepted.get.modelValue();
      expect((initialValue as { children: unknown[] }).children).toHaveLength(
        cohort.blocks
      );
      expect(initialValue).toMatchObject({
        meta: {
          authored: {
            value: { operations: { count: cohort.pendingDeletions + 1 } },
          },
        },
      });
      const operations = recordValues(
        (
          initialValue as {
            meta: {
              authored: {
                value: { operations: RecordTree<SavedAuthoredOperation> };
              };
            };
          }
        ).meta.authored.value.operations
      );
      const originalProposalIds = new Set(
        operations
          .filter(
            (operation) =>
              operation.kind === 'edit' && operation.proposal === true
          )
          .map((operation) => operation.changeId)
      );
      expect(originalProposalIds.size).toBe(cohort.pendingDeletions);
      expect(
        operations.filter(
          (operation) =>
            operation.kind === 'edit' && operation.proposal === false
        )
      ).toHaveLength(1);
      const acceptedText = await accepted.get.modelText();
      const proposedText = await proposed.get.modelText();
      expect(acceptedText).toBe('Seed.'.repeat(cohort.blocks));
      expect(proposedText).toBe('Sed.'.repeat(cohort.blocks));
      await proposed.selection.collapse({ path: [0, 0], offset: 0 });
      const warmup = 'w'.repeat(contract.sampling.warmupsPerPass);
      await proposed.type(warmup);
      await proposed.assert.domCaret({
        text: `${warmup}S`,
        offset: warmup.length,
      });
      const measured = 'q'.repeat(contract.sampling.samplesPerPass);
      const result = await measureTrustedTyping({
        page,
        root: proposed.root,
        text: measured,
      });
      const finalMarkup = await mountedMarkup();
      const keyToPaint = result.rows.flatMap((row) =>
        row.paint === undefined ? [] : [row.paint - row.keydown]
      );
      const keyToDOM = result.rows.flatMap((row) =>
        row.domReady === undefined ? [] : [row.domReady - row.keydown]
      );
      const summary = {
        dom: {
          p50: percentile(keyToDOM, 0.5),
          p95: percentile(keyToDOM, 0.95),
          p99: percentile(keyToDOM, 0.99),
        },
        paintBoundary: {
          p50: percentile(keyToPaint, 0.5),
          p95: percentile(keyToPaint, 0.95),
          p99: percentile(keyToPaint, 0.99),
        },
      };
      const receipt = JSON.stringify(
        {
          cohort,
          pass,
          contractSha256: createHash('sha256')
            .update(contractSource)
            .digest('hex'),
          build: JSON.parse(
            readFileSync('out/.editor-proof-build.json', 'utf-8')
          ),
          browser: browser.version(),
          environment: {
            arch: os.arch(),
            platform: os.platform(),
            release: os.release(),
            node: process.version,
          },
          url: page.url(),
          targetFingerprint: process.env.PLITE_BROWSER_TARGET_FINGERPRINT,
          summary,
          initialMarkup,
          finalMarkup,
          result,
        },
        null,
        2
      );
      const outputDirectory = process.env.PLITE_AUTHORED_PERFORMANCE_OUTPUT;
      if (outputDirectory) {
        writeFileSync(
          path.join(outputDirectory, `${cohort.id}-${pass}.json`),
          receipt
        );
      }
      await info.attach('authored-typing-performance.json', {
        body: receipt,
        contentType: 'application/json',
      });
      expect(result.rows).toHaveLength(contract.sampling.samplesPerPass);
      expect(keyToPaint).toHaveLength(contract.sampling.samplesPerPass);
      expect(
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
        )
      ).toBe(true);
      expect(await accepted.get.modelText()).toBe(acceptedText);
      expect(await proposed.get.modelText()).toBe(
        warmup + measured + proposedText
      );
      expect(await independent.get.modelText()).toBe('A separate document.');
      expect(finalMarkup.invalid).toBe(0);
      expect(finalMarkup.paths.length).toBeGreaterThan(0);
      expect(finalMarkup.retained).toBe(finalMarkup.paths.length);
      const finalValue = await accepted.get.modelValue();
      expect((finalValue as { children: unknown[] }).children).toHaveLength(
        cohort.blocks
      );
      const finalOperations = recordValues(
        (
          finalValue as {
            meta: {
              authored: {
                value: { operations: RecordTree<SavedAuthoredOperation> };
              };
            };
          }
        ).meta.authored.value.operations
      );
      const finalProposalIds = new Set(
        finalOperations
          .filter(
            (operation) =>
              operation.kind === 'edit' && operation.proposal === true
          )
          .map((operation) => operation.changeId)
      );
      expect(
        [...originalProposalIds].every((id) => finalProposalIds.has(id))
      ).toBe(true);
      await info.attach('authored-typing-mounted-coverage.json', {
        body: JSON.stringify({ initialMarkup, finalMarkup }),
        contentType: 'application/json',
      });
      expect(errors).toEqual([]);
      expect
        .soft(summary.paintBoundary.p95)
        .toBeLessThanOrEqual(contract.budget.keydownToPaintBoundaryP95Ms);
      expect
        .soft(summary.paintBoundary.p99)
        .toBeLessThanOrEqual(contract.budget.keydownToPaintBoundaryP99Ms);
    });
  }
});
