import type { Page } from '@playwright/test';
import type { Path } from 'platejs';
import { getDOMNodeByPath } from './getDOMNodeByPath';
import type { EditorHandle } from './types';

export const clickAtPath = async (
  page: Page,
  editorHandle: EditorHandle,
  path: Path
) => {
  const domNode = await getDOMNodeByPath(page, editorHandle, path);
  await domNode.click();
};
