import type { Page } from '@playwright/test';
import type { Selection } from 'slate';

import type { EditorHandle } from './types';

export const getSelection = async (
  page: Page,
  editorHandle: EditorHandle
): Promise<Selection> =>
  page.evaluate((editor) => editor.selection, editorHandle);
