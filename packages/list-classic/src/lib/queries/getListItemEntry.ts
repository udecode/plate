import type { BasePlateEditor } from '@platejs/core';
import type { Element, ElementEntry, Location, Path } from '@platejs/plite';
import { RangeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/**
 * Returns the nearest li and ul / ol wrapping node entries for a given path
 * (default = selection)
 */
export const getListItemEntry = (
  editor: BasePlateEditor,
  { at = editor.selection }: { at?: Location | null } = {}
): { list: ElementEntry; listItem: ElementEntry } | undefined => {
  const liType = editor.getType(KEYS.li);

  let _at: Path;

  if (RangeApi.isRange(at) && !RangeApi.isCollapsed(at)) {
    _at = at.focus.path;
  } else if (RangeApi.isRange(at)) {
    _at = at.anchor.path;
  } else {
    _at = at as Path;
  }
  if (_at) {
    const node = editor.api.node<Element>(_at)?.[0];

    if (node) {
      const listItem = editor.api.above<Element>({
        at: _at,
        match: (node) => node.type === liType,
      });

      if (listItem) {
        const list = editor.api.parent<Element>(listItem[1])!;

        return { list, listItem };
      }
    }
  }
};
