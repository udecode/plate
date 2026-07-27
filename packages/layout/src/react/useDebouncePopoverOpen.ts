import {
  useEditorReadOnly,
  useEditorSelector,
  useElementSelected,
} from '@platejs/core/react';

export const useDebouncePopoverOpen = () => {
  const readOnly = useEditorReadOnly();
  const selected = useElementSelected();

  const selectionCollapsed = useEditorSelector((editor) =>
    editor.read.selection.isCollapsed()
  );

  return !readOnly && selected && selectionCollapsed;
};
