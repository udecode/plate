import * as React from 'react';
import {
  getPreventDefaultHandler,
  isMarkActive,
  toggleMark,
} from '@udecode/slate-plugins-common';
import { useFocusedEditorRef } from '@udecode/slate-plugins-core';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { ToolbarMarkProps } from './ToolbarMark.types';

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export const ToolbarMark = ({ type, clear, ...props }: ToolbarMarkProps) => {
  const editor = useFocusedEditorRef();

  return (
    <ToolbarButton
      active={editor && isMarkActive(editor, type)}
      onMouseDown={
        editor && getPreventDefaultHandler(toggleMark, editor, type, clear)
      }
      {...props}
    />
  );
};
