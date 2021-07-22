import * as React from 'react';
import {
  getPreventDefaultHandler,
  isMarkActive,
  toggleMark,
} from '@udecode/plate-common';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { ToolbarMarkProps } from './ToolbarMark.types';

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export const ToolbarMark = ({ type, clear, ...props }: ToolbarMarkProps) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

  return (
    <ToolbarButton
      active={!!editor?.selection && isMarkActive(editor, type)}
      onMouseDown={
        editor
          ? getPreventDefaultHandler(toggleMark, editor, type, clear)
          : undefined
      }
      {...props}
    />
  );
};
