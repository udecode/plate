import React from 'react';
import {
  getPreventDefaultHandler,
  someNode,
  toggleNodeType,
  usePlateEditorState,
  withEditor,
} from '@udecode/plate-core';
import { ToolbarButton } from '../ToolbarButton';
import { BlockToolbarButtonProps } from './BlockToolbarButton.types';

/**
 * Toolbar button to toggle the type of elements in selection.
 */
export const BlockToolbarButton = withEditor(
  ({ type, inactiveType, active, ...props }: BlockToolbarButtonProps) => {
    const editor = usePlateEditorState()!;

    return (
      <ToolbarButton
        active={
          active ??
          (!!editor?.selection && someNode(editor, { match: { type } }))
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
  }
);
