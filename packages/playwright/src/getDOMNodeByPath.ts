import type { ElementHandle, Page } from '@playwright/test';
import type { Path } from 'slate';

import type { EditorHandle } from './types';

import { getNodeByPath } from './getNodeByPath';
import { getAdapter } from './internal/getAdapter';

export const getDOMNodeByPath = async (
  page: Page,
  editorHandle: EditorHandle,
  path: Path
): Promise<ElementHandle> => {
  const nodeHandle = await getNodeByPath(page, editorHandle, path);

  const adapterHandle = await getAdapter(page);

  return page.evaluateHandle(
    ([adapter, editor, node]) => {
      const domNode = adapter.toDOMNode(editor, node);

      if (!domNode)
        throw new Error(`getDOMNodeByPath: DOM node not found at path ${path}`);

      return domNode;
    },
    [adapterHandle, editorHandle, nodeHandle] as const
  );
};
