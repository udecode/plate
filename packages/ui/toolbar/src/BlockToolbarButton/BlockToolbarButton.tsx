import React from 'react';
import {
  getPreventDefaultHandler,
  someNode,
  toggleNodeType,
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton } from '../ToolbarButton';
import { BlockToolbarButtonProps } from './BlockToolbarButton.types';

/**
 * Toolbar button to toggle the type of elements in selection.
 */
export const BlockToolbarButton = withPlateEventProvider(
  ({ id, type, inactiveType, active, ...props }: BlockToolbarButtonProps) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;

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
