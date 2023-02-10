import React from 'react';
import {
  focusEditor,
  someNode,
  toggleNodeType,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-core';
import { ToolbarButton } from '../ToolbarButton';
import { BlockToolbarButtonProps } from './BlockToolbarButton.types';

/**
 * Toolbar button to toggle the type of elements in selection.
 */
export const BlockToolbarButton = ({
  id,
  type,
  inactiveType,
  active,
  ...props
}: BlockToolbarButtonProps) => {
  const editor = usePlateEditorState(useEventPlateId(id));
  const isLink = !!editor?.selection && someNode(editor, { match: { type } });

  return (
    <ToolbarButton
      aria-label="Toggle block type"
      active={isLink}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleNodeType(editor, { inactiveType });
        focusEditor(editor);
      }}
      {...props}
    />
  );
};
