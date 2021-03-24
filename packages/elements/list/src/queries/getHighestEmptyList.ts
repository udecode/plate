import { getAbove } from '@udecode/slate-plugins-common';
import { getPluginType, SPEditor } from '@udecode/slate-plugins-core';
import { Path } from 'slate';
import { ELEMENT_LI } from '../defaults';
import { getListTypes } from './getListTypes';

/**
 * Find the highest end list that can be deleted.
 * Its path should be different to diffListPath.
 * If the highest end list 2+ items, return liPath.
 * Get the parent list until:
 * - the list has less than 2 items.
 * - its path is not equals to diffListPath.
 */
export const getHighestEmptyList = (
  editor: SPEditor,
  {
    diffListPath,
    liPath,
  }: {
    liPath: Path;
    diffListPath?: Path;
  }
): Path | undefined => {
  const list = getAbove(editor, {
    at: liPath,
    match: { type: getListTypes(editor) },
  });
  if (!list) return;
  const [listNode, listPath] = list;

  if (!diffListPath || !Path.equals(listPath, diffListPath)) {
    if (listNode.children.length < 2) {
      const liParent = getAbove(editor, {
        at: listPath,
        match: { type: getPluginType(editor, ELEMENT_LI) },
      });

      if (liParent) {
        return (
          getHighestEmptyList(editor, { liPath: liParent[1], diffListPath }) ||
          listPath
        );
      }
    }
    return liPath;
  }
};
