import type { Page } from '@playwright/test';
import type { Path } from 'slate';

import type { EditorHandle } from './types';

import { getDOMNodeByPath } from './getDOMNodeByPath';

export const clickAtPath = async (
  page: Page,
  editorHandle: EditorHandle,
  path: Path
) => {
  const domNode = await getDOMNodeByPath(page, editorHandle, path);
  await domNode.click();
};
