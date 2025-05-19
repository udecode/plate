import {
  type ElementEntry,
  type Path,
  type SlateEditor,
  type TElement,
  type TLocation,
  NodeApi,
  RangeApi,
} from '@udecode/plate';

import { BaseListItemPlugin } from '../BaseListPlugin';

/**
 * Returns the nearest li and ul / ol wrapping node entries for a given path
 * (default = selection)
 */
export const getListItemEntry = (
  editor: SlateEditor,
  { at = editor.selection }: { at?: TLocation | null } = {}
): { list: ElementEntry; listItem: ElementEntry } | undefined => {
  const liType = editor.getType(BaseListItemPlugin);

  let _at: Path;

  if (RangeApi.isRange(at) && !RangeApi.isCollapsed(at)) {
    _at = at.focus.path;
  } else if (RangeApi.isRange(at)) {
    _at = at.anchor.path;
  } else {
    _at = at as Path;
  }
  if (_at) {
    const node = NodeApi.get<TElement>(editor, _at);

    if (node) {
      const listItem = editor.api.above<TElement>({
        at: _at,
        match: { type: liType },
      });

      if (listItem) {
        const list = editor.api.parent<TElement>(listItem[1])!;

        return { list, listItem };
      }
    }
  }
};
