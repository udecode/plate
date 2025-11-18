import type { Page } from '@playwright/test';
import type { Path } from 'platejs';

import { ElementApi } from 'platejs';
import { getNodeByPath } from './getNodeByPath';
import type { EditorHandle } from './types';

export const getTypeAtPath = async (
  page: Page,
  editorHandle: EditorHandle,
  path: Path
): Promise<string> => {
  const nodeHandle = await getNodeByPath(page, editorHandle, path);
  const node = await nodeHandle.jsonValue();

  if (ElementApi.isElement(node)) {
    return node.type;
  }

  return 'text';
};
