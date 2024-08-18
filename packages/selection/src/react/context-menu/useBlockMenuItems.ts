import { useEditorRef } from '@udecode/plate-common/react';

import { useBlockSelectionSelectors } from '../blockSelectionStore';
import { getSelectedBlocks } from '../queries';
import { useBlockContextMenuSelectors } from './index';

export const useBlockMenuItemsState = () => {
  const editor = useEditorRef();

  const isOpen = useBlockContextMenuSelectors().isOpen(editor.id);
  const selectedIds = useBlockSelectionSelectors().selectedIds();

  const selectedBlocks = getSelectedBlocks(editor);

  return {
    isOpen,
    selectedBlocks,
    selectedIds,
  };
};

export const useBlockMenuItems = () => {
  return {};
};
