import { ElementApi, type Path, PathApi } from '@platejs/slate';
import type { SlateEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { getListTypes } from './getListTypes';

/**
 * Find the highest end list that can be deleted. Its path should be different
 * to diffListPath. If the highest end list 2+ items, return liPath. Get the
 * parent list until:
 *
 * - The list has less than 2 items.
 * - Its path is not equals to diffListPath.
 */
export const getHighestEmptyList = (
  editor: SlateEditor,
  {
    diffListPath,
    liPath,
  }: {
    liPath: Path;
    diffListPath?: Path;
  }
): Path | undefined => {
  const list = editor.api.above({
    at: liPath,
    match: (node) =>
      ElementApi.isElement(node) && getListTypes(editor).includes(node.type),
  });

  if (!list) return;

  const [listNode, listPath] = list;

  if (!diffListPath || !PathApi.equals(listPath, diffListPath)) {
    if (listNode.children.length < 2) {
      const liParent = editor.api.above({
        at: listPath,
        match: (node) => node.type === editor.getType(KEYS.li),
      });

      if (liParent) {
        return (
          getHighestEmptyList(editor, { diffListPath, liPath: liParent[1] }) ||
          listPath
        );
      }
    }

    return liPath;
  }
};
