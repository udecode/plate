import { expect } from '@playwright/test';

import { READY_TIMEOUT_MS } from './constants';
import {
  hasSelectionHandle,
  waitForSelectionIfPresent,
} from './selection-handle';
import type { SurfaceTarget } from './surface';
import type { ReadyOptions, PliteBrowserEditorHarness } from './types';

export const waitForReady = async (
  editor: PliteBrowserEditorHarness,
  surface: SurfaceTarget,
  {
    editor: editorState,
    placeholder,
    selector,
    text,
    selection,
    timeoutMs = READY_TIMEOUT_MS,
  }: ReadyOptions
) => {
  if (editorState === 'visible') {
    await expect(editor.root).toBeVisible({ timeout: timeoutMs });
    await expect
      .poll(() => hasSelectionHandle(editor.root), {
        timeout: timeoutMs,
      })
      .toBe(true);
  }

  if (placeholder) {
    await editor.assert.placeholderVisible(placeholder === 'visible');
  }

  if (selector) {
    await surface.locator(selector).first().waitFor({
      state: 'visible',
      timeout: timeoutMs,
    });
  }

  if (text) {
    if (text instanceof RegExp) {
      await expect(editor.root).toContainText(text, {
        timeout: timeoutMs,
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
