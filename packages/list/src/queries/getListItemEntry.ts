import {
  getAboveNode,
  getNode,
  getParentNode,
  getPluginType,
  isCollapsed,
  PlateEditor,
  TElement,
  TElementEntry,
  Value,
} from '@udecode/plate-common';
import { Location, Path, Range } from 'slate';

import { ELEMENT_LI } from '../createListPlugin';

/**
 * Returns the nearest li and ul / ol wrapping node entries for a given path (default = selection)
 */
export const getListItemEntry = <V extends Value>(
  editor: PlateEditor<V>,
  { at = editor.selection }: { at?: Location | null } = {}
): { list: TElementEntry; listItem: TElementEntry } | undefined => {
  const liType = getPluginType(editor, ELEMENT_LI);

  let _at: Path;

  if (Range.isRange(at) && !isCollapsed(at)) {
    _at = at.focus.path;
  } else if (Range.isRange(at)) {
    _at = at.anchor.path;
  } else {
    _at = at as Path;
  }

  if (_at) {
    const node = getNode<TElement>(editor, _at);
    if (node) {
      const listItem = getAboveNode<TElement>(editor, {
        at: _at,
        match: { type: liType },
      });

      if (listItem) {
        const list = getParentNode<TElement>(editor, listItem[1])!;

        return { list, listItem };
      }
    }
  }
};
