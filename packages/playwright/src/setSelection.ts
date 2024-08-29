import type { Page } from '@playwright/test';
import type { Location } from 'slate';

import type { EditorHandle } from './types';

export const setSelection = async (
  page: Page,
  editorHandle: EditorHandle,
  at: Location
) => {
  await page.evaluate(
    ([editor, at]) => {
      const range = editor.range(at);
      console.log(range);
      editor.setSelection(range);
    },
    [editorHandle, at] as const
  );

  await page.waitForTimeout(200);
};
