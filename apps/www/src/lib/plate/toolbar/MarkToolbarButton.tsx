import React from 'react';
import {
  focusEditor,
  isMarkActive,
  toggleMark,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';

import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';

export interface MarkToolbarButtonProps extends ToolbarButtonProps {
  nodeType: string;
  clear?: string | string[];
}

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export function MarkToolbarButton({
  id,
  clear,
  nodeType,
  ...props
}: MarkToolbarButtonProps) {
  const editor = usePlateEditorState(useEventPlateId(id));

  const pressed = !!editor?.selection && isMarkActive(editor, nodeType);

  return (
    <ToolbarButton
      pressed={pressed}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleMark(editor, { key: nodeType, clear });
        focusEditor(editor);
      }}
      {...props}
    />
  );
}
