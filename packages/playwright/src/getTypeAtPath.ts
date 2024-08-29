import type { Page } from '@playwright/test';
import type { Path } from 'slate';

import { isElement } from '@udecode/plate-common';

import type { EditorHandle } from './types';

import { getNodeByPath } from './getNodeByPath';

export const getTypeAtPath = async (
  page: Page,
  editorHandle: EditorHandle,
  path: Path
): Promise<string> => {
  const nodeHandle = await getNodeByPath(page, editorHandle, path);
  const node = await nodeHandle.jsonValue();

  if (isElement(node)) {
    return node.type;
  }

  return 'text';
};
