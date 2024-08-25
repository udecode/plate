import { useEditorPlugin } from '@udecode/plate-common/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { useBlockContextMenuSelectors } from './index';

export const useBlockMenuItemsState = () => {
  const { api, editor, useOption } = useEditorPlugin(BlockSelectionPlugin);

  const isOpen = useBlockContextMenuSelectors().isOpen(editor.id);
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
