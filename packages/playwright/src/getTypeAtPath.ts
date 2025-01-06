import type { Page } from '@playwright/test';
import type { Path } from '@udecode/plate';

import { ElementApi } from '@udecode/plate';

import type { EditorHandle } from './types';

import { getNodeByPath } from './getNodeByPath';

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
