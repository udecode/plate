import { expect } from '@playwright/test';

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
import { findBrowserKernelTraceEntry } from './scenario-kernel-trace';
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
  EditorRoot,
  DOMSelectionLocationSnapshot,
  DOMSelectionSnapshotExpectation,
  FocusOwnerSnapshot,
  HtmlNormalizationOptions,
  RenderedDOMShapeExpectation,
  SelectionSnapshotExpectation,
  BrowserEditorHarness,
  BrowserKernelTraceExpectation,
} from './types';

export const createEditorAssertions = (
  root: EditorRoot,
  get: BrowserEditorHarness['get']
): Omit<BrowserEditorHarness['assert'], 'placeholderVisible' | 'text'> => {
  const htmlEquals = async (
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
  };

  return {
    modelBlockText: async (index: number, text: string | null) => {
      await expect.poll(() => get.modelBlockText(index)).toBe(text);
    },
    modelBlockTexts: async (texts: string[]) => {
      await expect.poll(() => get.modelBlockTexts()).toEqual(texts);
    },
    blockTexts: async (texts: string[]) => {
      await expect.poll(() => getBlockTexts(root)).toEqual(texts);
    },
    html: async (
      expectedHtml: string,
      options: HtmlNormalizationOptions = {}
    ) => {
      await htmlEquals(expectedHtml, options);
    },
    htmlContains: async (expectedFragment: string) => {
      await expect
        .poll(() => root.evaluate((el: HTMLElement) => el.innerHTML))
        .toContain(expectedFragment);
    },
    htmlEquals,
    focusOwner: async (expected: FocusOwnerSnapshot['kind']) => {
      await expect
        .poll(async () => {
          const snapshot = await getFocusOwnerSnapshot(root);

          return snapshot.kind;
        })
        .toBe(expected);
    },
    kernelTrace: async (expected: BrowserKernelTraceExpectation) => {
      await expect
        .poll(async () =>
          Boolean(
            findBrowserKernelTraceEntry(await get.kernelTrace(), expected)
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
      selector = '[data-editor-zero-width]'
    ) => {
      await expect.poll(() => get.placeholderShape(selector)).toEqual(expected);
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
  };
};
