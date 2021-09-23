import * as React from 'react';
import {
  getPreventDefaultHandler,
  someNode,
  toggleNodeType,
} from '@udecode/plate-common';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import { ToolbarButton } from '../ToolbarButton';
import { ToolbarElementProps } from './ToolbarElement.types';

/**
 * Toolbar button to toggle the type of elements in selection.
 */
export const ToolbarElement = ({
  type,
  inactiveType,
  active,
  ...props
}: ToolbarElementProps) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

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
