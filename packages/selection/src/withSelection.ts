import type { PlateEditor, Value } from '@udecode/plate-common/server';

import { blockSelectionActions } from './blockSelectionStore';

export const withSelection = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  (editor as any).addSelectedRow = blockSelectionActions.addSelectedRow;

  return editor;
};
