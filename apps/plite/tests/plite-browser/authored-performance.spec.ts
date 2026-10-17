import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  BROWSER_HANDLE_KEY,
  measureTrustedTyping,
  openExample,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

import type { PliteBrowserHandle } from '../../../../packages/plitejs/src/react/editable/browser-handle';

const contractPath =
  '../../benchmarks/editor/benchmarks/data/native-authored-changes/browser-typing-contract.json';
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

type ReviewNode = {
  authored?: ReadonlyArray<{ change: string; kind: string }>;
  children?: ReviewNode[];
  text?: string;
};

/** Pending deletion ids and each block's leaves, read from the review marks. */
const readStruck = (value: unknown) => {
  const ids = new Set<string>();
  const blocks = ((value as ReviewNode).children ?? []).map((block) =>
    (block.children ?? []).map((leaf) => {
      const kinds = (leaf.authored ?? []).map((mark) => {
        if (mark.kind === 'delete') ids.add(mark.change);
        return mark.kind;
      });
      return kinds.length ? `${leaf.text}[${kinds.join(',')}]` : leaf.text;
    })
  );
  return { blocks, ids };
};

test.describe('native authored typing performance', () => {
  test.describe.configure({ mode: 'serial', retries: 0 });
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
      const controls = page.getByLabel('Proposed document controls');
      await controls.getByRole('button', { name: 'Edit', exact: true }).click();
      await proposed.scenario.run('seed authored typing cohort', [
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
      await controls
        .getByRole('button', { name: 'Suggest', exact: true })
        .click();
      await proposed.root.evaluate(
        (element, [count, key]) => {
          const handle = (
            element as HTMLElement & Record<string, PliteBrowserHandle>
          )[key];
          for (let index = 0; index < count; index++) {
            handle.deleteTextAt({
              anchor: { path: [index, 0], offset: 1 },
              focus: { path: [index, 0], offset: 2 },
            });
          }
        },
        [cohort.pendingDeletions, BROWSER_HANDLE_KEY] as const
      );
      const mountedMarkup = async () => {
        const struck = readStruck(await proposed.get.modelValue());
        return proposed.root.evaluate((root, blocks) => {
          const paths = [
            ...root.querySelectorAll(
              '[data-editor-node="element"][data-editor-path]'
            ),
          ]
            .map((element) => element.getAttribute('data-editor-path'))
            .filter((value) => /^\d+$/.test(value ?? ''));
          return {
            paths,
            struck: blocks.filter((leaves) => leaves.includes('e[delete]'))
              .length,
            placeholders: root.querySelectorAll(
              '[data-editor-viewport-boundary]'
            ).length,
            invalid: blocks.filter(
              (leaves) =>
                leaves.filter((leaf) => leaf?.endsWith('[delete]')).length !==
                  1 || !leaves.includes('e[delete]')
            ).length,
          };
        }, struck.blocks);
      };
      await expect
        .poll(async () => {
          const mounted = await mountedMarkup();
          return (
            mounted.paths.length > 0 &&
            mounted.invalid === 0 &&
            mounted.struck === mounted.paths.length
          );
        })
        .toBe(true);
      const initialMarkup = await mountedMarkup();
      expect(initialMarkup.paths).toHaveLength(cohort.blocks);
      expect(initialMarkup.placeholders).toBe(0);
      const originalProposalIds = readStruck(
        await proposed.get.modelValue()
      ).ids;
      expect(originalProposalIds.size).toBe(cohort.pendingDeletions);
      const acceptedText = await accepted.get.modelText();
      const proposedText = await proposed.get.modelText();
      expect(acceptedText).toBe('Seed.'.repeat(cohort.blocks));
      expect(proposedText).toBe('Seed.'.repeat(cohort.blocks));
      await proposed.selection.collapse({ path: [0, 0], offset: 0 });
      const warmup = 'w'.repeat(contract.sampling.warmupsPerPass);
      await proposed.type(warmup);
      await expect
        .poll(() => proposed.get.selection())
        .toEqual({
          anchor: { path: [0, 0], offset: warmup.length },
          focus: { path: [0, 0], offset: warmup.length },
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
      expect(finalMarkup.paths).toHaveLength(cohort.blocks);
      expect(finalMarkup.placeholders).toBe(0);
      expect(finalMarkup.struck).toBe(finalMarkup.paths.length);
      const finalProposalIds = readStruck(await proposed.get.modelValue()).ids;
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
