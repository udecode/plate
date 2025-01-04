import { useEditorSelector } from '@udecode/plate-common/react';
import { useReadOnly, useSelected } from 'slate-react';

export const useDebouncePopoverOpen = () => {
  const readOnly = useReadOnly();
  const selected = useSelected();

  const selectionCollapsed = useEditorSelector(
    (editor) => editor.api.isCollapsed(),
    []
  );

  // TODO:should add debounce
  return !readOnly && selected && selectionCollapsed;
};
