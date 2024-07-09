import type { PlateEditor, Value } from '@udecode/plate-common/server';

import { blockSelectionStore } from './blockSelectionStore';

export const withSelection = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  (editor as any).blockSelectionStore = blockSelectionStore;

  return editor;
};
