import type { JSHandle, Page } from '@playwright/test';
import type { TNode } from '@udecode/plate-common';
import type { Path } from 'slate';

import type { EditorHandle } from './types';

import { getAdapter } from './internal/getAdapter';

export const getNodeByPath = async (
  page: Page,
  editorHandle: EditorHandle,
  path: Path
): Promise<JSHandle<TNode>> => {
  const adapterHandle = await getAdapter(page);

  return page.evaluateHandle(
    ([adapter, editor, path]) => {
      const node = adapter.getNode(editor, path);

      if (!node)
        throw new Error(`getNodeByPath: node not found at path ${path}`);

      return node as TNode;
    },
    [adapterHandle, editorHandle, path] as const
  );
};
