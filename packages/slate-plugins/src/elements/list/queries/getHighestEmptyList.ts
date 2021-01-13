import { Editor, Path } from 'slate';
import { getAbove } from '../../../common/queries/getAbove';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';
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
  editor: Editor,
  liPath: Path,
  diffListPath?: Path,
  options?: ListOptions
): Path | undefined => {
  const { li } = setDefaults(options, DEFAULTS_LIST);

  const list = getAbove(editor, {
    at: liPath,
    match: { type: getListTypes(options) },
  });
  if (!list) return;
  const [listNode, listPath] = list;

  if (!diffListPath || !Path.equals(listPath, diffListPath)) {
    if (listNode.children.length < 2) {
      const liParent = getAbove(editor, {
        at: listPath,
        match: { type: li.type },
      });

      if (liParent) {
        return (
          getHighestEmptyList(editor, liParent[1], diffListPath, options) ||
          listPath
        );
      }
    }
    return liPath;
  }
};
