import React from 'react';
import {
  focusEditor,
  isMarkActive,
  toggleMark,
  ToggleMarkPlugin,
  useEventPlateId,
  usePlateEditorState,
  WithPlatePlugin,
} from '@udecode/plate-common';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '../ToolbarButton/ToolbarButton';

export interface MarkToolbarButtonProps
  extends ToolbarButtonProps,
    Pick<WithPlatePlugin, 'type'>,
    Pick<ToggleMarkPlugin, 'clear'> {}

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export function MarkToolbarButton({
  id,
  type,
  clear,
  ...props
}: MarkToolbarButtonProps) {
  const editor = usePlateEditorState(useEventPlateId(id));

  return (
    <ToolbarButton
      active={!!editor?.selection && isMarkActive(editor, type!)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleMark(editor, { key: type!, clear });
        focusEditor(editor);
      }}
      {...props}
    />
  );
}
