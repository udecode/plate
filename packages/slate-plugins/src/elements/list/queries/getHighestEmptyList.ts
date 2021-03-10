import { getAbove } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Path } from 'slate';
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
  {
    diffListPath,
    liPath,
  }: {
    liPath: Path;
    diffListPath?: Path;
  },
  options: SlatePluginsOptions
): Path | undefined => {
  const { li } = options;

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
          getHighestEmptyList(
            editor,
            { liPath: liParent[1], diffListPath },
            options
          ) || listPath
        );
      }
    }
    return liPath;
  }
};
