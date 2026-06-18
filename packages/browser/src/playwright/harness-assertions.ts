import { expect, type Locator } from '@playwright/test';
import type { PlaceholderShape } from '../browser/zero-width';
import {
  assertCaretVisibleInScrollableParent,
  assertNoVisibleCaretInRoot,
} from './caret-visibility';
import { takeDisplayedSelectionSnapshotForRoot } from './displayed-selection';
import {
  assertNoUnexpectedZeroWidthBreaks,
  assertRenderedBlockText,
  assertRenderedDOMShape,
} from './dom-shape';
import { getBlockTexts, normalizeHtml } from './dom-text';
import { findSlateBrowserKernelTraceEntry } from './scenario-kernel-trace';
import { getFocusOwnerSnapshot } from './selection-geometry';
import {
  assertCollapsedModelDOMSelectionExpectation,
  assertDOMCaretExpectation,
  assertDOMSelectionExpectation,
  assertSelectionExpectation,
  takeDOMSelectionLocationSnapshotForRoot,
} from './selection-snapshots';
import type {
  CollapsedModelDOMSelectionExpectation,
  DOMSelectionLocationSnapshot,
  DOMSelectionSnapshotExpectation,
  FocusOwnerSnapshot,
  HtmlNormalizationOptions,
  RenderedDOMShapeExpectation,
  SelectionSnapshotExpectation,
  SlateBrowserEditorHarness,
  SlateBrowserKernelTraceExpectation,
} from './types';

export const createEditorHarnessAssertions = ({
  getHarness,
  root,
}: {
  getHarness: () => SlateBrowserEditorHarness;
  root: Locator;
}): SlateBrowserEditorHarness['assert'] => ({
  text: async (text: RegExp | string) => {
    await expect(root).toContainText(text);
  },
  modelBlockText: async (index: number, text: string | null) => {
    await expect.poll(() => getHarness().get.modelBlockText(index)).toBe(text);
  },
  modelBlockTexts: async (texts: string[]) => {
    await expect.poll(() => getHarness().get.modelBlockTexts()).toEqual(texts);
  },
  blockTexts: async (texts: string[]) => {
    await expect.poll(() => getBlockTexts(root)).toEqual(texts);
  },
  html: async (
    expectedHtml: string,
    options: HtmlNormalizationOptions = {}
  ) => {
    await getHarness().assert.htmlEquals(expectedHtml, options);
  },
  htmlContains: async (expectedFragment: string) => {
    await expect
      .poll(() => root.evaluate((el: HTMLElement) => el.innerHTML))
      .toContain(expectedFragment);
  },
  htmlEquals: async (
    expectedHtml: string,
    options: HtmlNormalizationOptions = {}
  ) => {
    await expect
      .poll(async () => {
        const actual = await root.evaluate((el: HTMLElement) => el.innerHTML);

        return {
          actual: await normalizeHtml(root, actual, options),
          expected: await normalizeHtml(root, expectedHtml, options),
        };
      })
      .toEqual({
        actual: await normalizeHtml(root, expectedHtml, options),
        expected: await normalizeHtml(root, expectedHtml, options),
      });
  },
  focusOwner: async (expected: FocusOwnerSnapshot['kind']) => {
    await expect
      .poll(async () => (await getFocusOwnerSnapshot(root)).kind)
      .toBe(expected);
  },
  kernelTrace: async (expected: SlateBrowserKernelTraceExpectation) => {
    await expect
      .poll(async () =>
        Boolean(
          findSlateBrowserKernelTraceEntry(
            await getHarness().get.kernelTrace(),
            expected
          )
        )
      )
      .toBe(true);
  },
  selection: async (expected: SelectionSnapshotExpectation) => {
    await assertSelectionExpectation(root, expected);
  },
  collapsedModelDOMSelection: async (
    expected: CollapsedModelDOMSelectionExpectation
  ) => {
    await assertCollapsedModelDOMSelectionExpectation(root, expected);
  },
  noDoubleSelectionHighlight: async () => {
    await expect
      .poll(async () => {
        const snapshot = await takeDisplayedSelectionSnapshotForRoot(root);

        return snapshot.doubleHighlighted;
      })
      .toBe(false);
  },
  caretVisibleInScrollableParent: async () => {
    await assertCaretVisibleInScrollableParent(root);
  },
  noVisibleCaretInRoot: async () => {
    await assertNoVisibleCaretInRoot(root);
  },
  domSelection: async (expected: DOMSelectionSnapshotExpectation) => {
    await assertDOMSelectionExpectation(root, expected);
  },
  domCaret: async (expected: { offset: number; text: string }) => {
    await assertDOMCaretExpectation(root, expected);
  },
  domSelectionTarget: async (
    expected: Partial<DOMSelectionLocationSnapshot>
  ) => {
    await expect
      .poll(() => takeDOMSelectionLocationSnapshotForRoot(root))
      .toMatchObject(expected);
  },
  noUnexpectedZeroWidthBreaks: async (blockIndex = 0) => {
    await assertNoUnexpectedZeroWidthBreaks(root, blockIndex);
  },
  placeholderShape: async (
    expected: PlaceholderShape,
    selector = '[data-slate-zero-width]'
  ) => {
    await expect
      .poll(() =>
        root
          .locator(selector)
          .first()
          .evaluate((element: Element) => ({
            hasBr: !!element.querySelector('br'),
            hasFEFF: element.textContent?.includes('\uFEFF') ?? false,
            kind: element.getAttribute('data-slate-zero-width'),
          }))
      )
      .toEqual(expected);
  },
  placeholderVisible: async (visible = true) => {
    const placeholder = root.locator('[data-slate-placeholder="true"]');

    if (visible) {
      await expect(placeholder).toBeVisible();
      return;
    }

    await expect(placeholder).toHaveCount(0);
  },
  renderedBlockText: async (blockIndex: number, text: string) => {
    await assertRenderedBlockText(root, blockIndex, text);
  },
  renderedDOMShape: async (expected: RenderedDOMShapeExpectation) => {
    await assertRenderedDOMShape(
      root,
      expected,
      takeDOMSelectionLocationSnapshotForRoot
    );
  },
});
