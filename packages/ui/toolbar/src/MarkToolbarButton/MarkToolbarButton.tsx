import React from 'react';
import {
  getPreventDefaultHandler,
  isMarkActive,
  toggleMark,
  usePlateEditorState,
} from '@udecode/plate-core';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { MarkToolbarButtonProps } from './MarkToolbarButton.types';

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export const MarkToolbarButton = ({
  type,
  clear,
  ...props
}: MarkToolbarButtonProps) => {
  const editor = usePlateEditorState()!;

  return (
    <ToolbarButton
      active={!!editor?.selection && isMarkActive(editor, type!)}
      onMouseDown={
        editor
          ? getPreventDefaultHandler(toggleMark, editor, { key: type, clear })
          : undefined
      }
      {...props}
    />
  );
};
