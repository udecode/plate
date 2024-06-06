import { useEditorRef } from '@udecode/plate-common';

import { useBlockContextMenuSelectors } from '.';
import { useBlockSelectionSelectors } from '../blockSelectionStore';
import { getSelectedBlocks } from '../queries';

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
