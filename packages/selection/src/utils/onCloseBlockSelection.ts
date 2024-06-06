import type { PlateEditor, Value } from '@udecode/plate-common/server';

import {
  blockSelectionActions,
  blockSelectionSelectors,
} from '../blockSelectionStore';
import {
  blockContextMenuActions,
  blockContextMenuSelectors,
} from '../context-menu';

export const onCloseBlockSelection =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ) =>
  () => {
    if (
      editor.selection &&
      blockSelectionSelectors.isSelecting() &&
      !blockContextMenuSelectors.isOpen(editor.id)
    ) {
      blockSelectionActions.unselect();
      blockContextMenuActions.hide();
    }
  };
