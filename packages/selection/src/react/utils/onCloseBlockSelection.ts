import type { OnChange } from '@udecode/plate-common/react';

import type { BlockSelectionConfig } from '../BlockSelectionPlugin';

import {
  blockContextMenuActions,
  blockContextMenuSelectors,
} from '../context-menu';

export const onCloseBlockSelection: OnChange<BlockSelectionConfig> = ({
  api,
  editor,
  getOptions,
}) => {
  if (
    editor.selection &&
    getOptions().isSelecting &&
    !blockContextMenuSelectors.isOpen(editor.id)
  ) {
    api.blockSelection.unselect();
    blockContextMenuActions.hide();
  }
};
