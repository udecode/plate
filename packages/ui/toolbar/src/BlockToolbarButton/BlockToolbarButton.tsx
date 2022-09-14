import React from 'react';
import {
  getPreventDefaultHandler,
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

  return (
    <ToolbarButton
      active={
        active ?? (!!editor?.selection && someNode(editor, { match: { type } }))
      }
      onMouseDown={
        editor &&
        getPreventDefaultHandler(toggleNodeType, editor, {
          activeType: type,
          inactiveType,
        })
      }
      {...props}
    />
  );
};
