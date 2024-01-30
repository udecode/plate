import { PlateEditor, TNodeEntry, Value } from '@udecode/plate-common';
import last from 'lodash/last';

import { getEnclosingToggleIds } from './getEnclosingToggleIds';

export const getLastEntryEnclosedInToggle = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  toggleId: string
): TNodeEntry | undefined => {
  const entriesInToggle = editor.children
    .map((node, index) => [node, [index]] as TNodeEntry)
    .filter(([node]) => {
      return getEnclosingToggleIds(editor.children, node.id).includes(toggleId);
    });
  return last(entriesInToggle);
};
