import {
  getAboveNode,
  getNode,
  getParentNode,
  getPluginType,
  isCollapsed,
  PlateEditor,
  TElement,
  TNodeEntry,
  Value,
} from '@udecode/plate-core';
import { Location, Path, Range } from 'slate';
import { ELEMENT_LI } from '../createListPlugin';

/**
 * Returns the nearest li and ul / ol wrapping node entries for a given path (default = selection)
 */
export const getListItemEntry = <V extends Value>(
  editor: PlateEditor<V>,
  { at = editor.selection }: { at?: Location | null } = {}
):
  | { list: TNodeEntry<TElement>; listItem: TNodeEntry<TElement> }
  | undefined => {
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
    const node = getNode(editor, _at) as TElement;
    if (node) {
      const listItem = getAboveNode(editor, {
        at: _at,
        match: { type: liType },
      }) as TNodeEntry<TElement>;

      if (listItem) {
        const list = getParentNode(editor, listItem[1]) as TNodeEntry<TElement>;

        return { list, listItem };
      }
    }
  }
};
