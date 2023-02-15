import React from 'react';
import {
  focusEditor,
  isMarkActive,
  toggleMark,
  useEventPlateId,
  usePlateEditorState,
  Value,
} from '@udecode/plate-core';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { MarkToolbarButtonProps } from './MarkToolbarButton.types';

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export const MarkToolbarButton = <V extends Value>({
  id,
  type,
  clear,
  ...props
}: MarkToolbarButtonProps<V>) => {
  const editor = usePlateEditorState(useEventPlateId(id));

  return (
    <ToolbarButton
      active={!!editor?.selection && isMarkActive(editor, type!)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleMark(editor, { key: type!, clear });
        setTimeout(() => {
          focusEditor(editor, editor.selection ?? editor.prevSelection!);
        }, 0);
      }}
      {...props}
    />
  );
};
