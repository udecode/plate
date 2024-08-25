import { useEditorPlugin } from '@udecode/plate-common/react';

import { BlockContextMenuPlugin } from '../BlockContextMenuPlugin';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const useBlockMenuItemsState = () => {
  const { api, editor, useOption } = useEditorPlugin(BlockSelectionPlugin);
  const blockContextMenu = useEditorPlugin(BlockContextMenuPlugin);
  const isOpen = blockContextMenu.useOption('isOpen', editor.id);
  const selectedIds = useOption('selectedIds');

  const selectedBlocks = api.blockSelection.getSelectedBlocks();

  return {
    isOpen,
    selectedBlocks,
    selectedIds,
  };
};

export const useBlockMenuItems = () => {
  return {};
};
