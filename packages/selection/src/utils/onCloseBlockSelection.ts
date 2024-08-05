import type { OnChange } from '@udecode/plate-common';

import {
  blockSelectionActions,
  blockSelectionSelectors,
} from '../blockSelectionStore';
import {
  blockContextMenuActions,
  blockContextMenuSelectors,
} from '../context-menu';

export const onCloseBlockSelection: OnChange = ({ editor }) => {
  if (
    editor.selection &&
    blockSelectionSelectors.isSelecting() &&
    !blockContextMenuSelectors.isOpen(editor.id)
  ) {
    blockSelectionActions.unselect();
    blockContextMenuActions.hide();
  }
};
