import { useEditorRef } from '@udecode/plate-common';

import { useBlockSelectionSelectors } from '../blockSelectionStore';
import { KEY_BLOCK_SELECTION } from '../createBlockSelectionPlugin';

export const useBlockSelected = (id?: string) => {
  const editor = useEditorRef();

  // check if block selection is enabled
  const hasBlockSelection = editor.plugins.find(
    (item) => item.key === KEY_BLOCK_SELECTION
  );

  return useBlockSelectionSelectors().isSelected(id) && hasBlockSelection;
};

export const useHasBlockSelected = () => {
  return useBlockSelectionSelectors().selectedIds().size > 0;
};
