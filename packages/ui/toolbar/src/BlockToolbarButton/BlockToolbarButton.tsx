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
  active: _active,
  ...props
}: BlockToolbarButtonProps) => {
  const editor = usePlateEditorState(useEventPlateId(id));
  const active =
    _active ?? (!!editor?.selection && someNode(editor, { match: { type } }));

  return (
    <ToolbarButton
      active={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleNodeType(editor, { activeType: type, inactiveType });
        focusEditor(editor);
      }}
      {...props}
    />
  );
};
