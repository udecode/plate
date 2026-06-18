import { expect } from '@playwright/test';

import type {
  SlateBrowserEditorHarness,
  SlateBrowserSelectionContractExpectation,
} from './types';

/** Assert model, DOM, native, and visual selection expectations. */
export const assertSlateBrowserSelectionContract = async (
  harness: SlateBrowserEditorHarness,
  expected: SlateBrowserSelectionContractExpectation
) => {
  if (expected.selection) {
    await harness.assert.selection(expected.selection);
  }

  if (expected.selectedText !== undefined) {
    await expect
      .poll(() => harness.get.selectedText())
      .toBe(expected.selectedText);
  }

  if (expected.domSelection) {
    await harness.assert.domSelection(expected.domSelection);
  }

  if (expected.domSelectionTarget) {
    await harness.assert.domSelectionTarget(expected.domSelectionTarget);
  }

  if (expected.hasVisibleSelection !== undefined) {
    await expect
      .poll(
        async () => (await harness.selection.displayed()).hasVisibleSelection
      )
      .toBe(expected.hasVisibleSelection);
  }

  if (expected.hasVisibleEditorSelection !== undefined) {
    await expect
      .poll(
        async () =>
          (await harness.selection.displayed()).hasVisibleEditorSelection
      )
      .toBe(expected.hasVisibleEditorSelection);
  }

  if (expected.noDoubleSelectionHighlight) {
    await harness.assert.noDoubleSelectionHighlight();
  }
};
