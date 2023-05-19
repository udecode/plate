import { PlateEditor, Value } from '@udecode/plate-common';
import {
  blockSelectionActions,
  blockSelectionSelectors,
} from './blockSelectionStore';

export const onChangeBlockSelection =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ) =>
  () => {
    if (editor.selection && blockSelectionSelectors.isSelecting()) {
      blockSelectionActions.unselect();
    }
  };
