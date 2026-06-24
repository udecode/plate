import type { Page } from '@playwright/test';
import type { Location } from '@platejs/plite';

import type { EditorHandle } from './types';

export const setSelection = async (
  page: Page,
  editorHandle: EditorHandle,
  at: Location
) => {
  await page.evaluate(
    ([editor, at]) => {
      const range = editor.api.range(at)!;
      editor.update((tx) => {
        tx.selection.set(range);
      });
    },
    [editorHandle, at] as const
  );

  await page.waitForTimeout(200);
};
