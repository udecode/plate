import type { JSHandle, Page } from '@playwright/test';
import type { Path, TNode } from 'platejs';
import { getAdapter } from './internal/getAdapter';
import type { EditorHandle } from './types';

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

      return node;
    },
    [adapterHandle, editorHandle, path] as const
  );
};
