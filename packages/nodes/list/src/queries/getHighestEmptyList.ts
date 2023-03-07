import {
  getAboveNode,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { Path } from 'slate';
import { ELEMENT_LI } from '../createListPlugin';
import { getListTypes } from './getListTypes';

/**
 * Find the highest end list that can be deleted.
 * Its path should be different to diffListPath.
 * If the highest end list 2+ items, return liPath.
 * Get the parent list until:
 * - the list has less than 2 items.
 * - its path is not equals to diffListPath.
 */
export const getHighestEmptyList = <V extends Value>(
  editor: PlateEditor<V>,
  {
    diffListPath,
    liPath,
  }: {
    liPath: Path;
    diffListPath?: Path;
  }
): Path | undefined => {
  const list = getAboveNode(editor, {
    at: liPath,
    match: { type: getListTypes(editor) },
  });
  if (!list) return;
  const [listNode, listPath] = list;

  if (!diffListPath || !Path.equals(listPath, diffListPath)) {
    if (listNode.children.length < 2) {
      const liParent = getAboveNode(editor, {
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
