import { expect } from '@playwright/test';

import { READY_TIMEOUT_MS } from './constants';
import {
  hasSelectionHandle,
  waitForSelectionIfPresent,
} from './selection-handle';
import type { SurfaceTarget } from './surface';
import type { ReadyOptions, SlateBrowserEditorHarness } from './types';

export const waitForReady = async (
  editor: SlateBrowserEditorHarness,
  surface: SurfaceTarget,
  { editor: editorState, placeholder, selector, text, selection }: ReadyOptions
) => {
  if (editorState === 'visible') {
    await expect(editor.root).toBeVisible({ timeout: READY_TIMEOUT_MS });
    await expect
      .poll(() => hasSelectionHandle(editor.root), {
        timeout: READY_TIMEOUT_MS,
      })
      .toBe(true);
  }

  if (placeholder) {
    await editor.assert.placeholderVisible(placeholder === 'visible');
  }

  if (selector) {
    await surface.locator(selector).first().waitFor({
      state: 'visible',
      timeout: READY_TIMEOUT_MS,
    });
  }

  if (text) {
    if (text instanceof RegExp) {
      await expect(editor.root).toContainText(text, {
        timeout: READY_TIMEOUT_MS,
      });
    } else {
      await editor.assert.text(text);
    }
  }

  if (selection === 'settled') {
    await waitForSelectionIfPresent(editor.root);
  } else if (selection) {
    await editor.assert.selection(selection);
  }
};
