import * as React from 'react';
import {
  getPreventDefaultHandler,
  isMarkActive,
  toggleMark,
} from '@udecode/slate-plugins-common';
import { useEditorSlate } from '@udecode/slate-plugins-core';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { ToolbarMarkProps } from './ToolbarMark.types';

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export const ToolbarMark = ({ type, clear, ...props }: ToolbarMarkProps) => {
  const editor = useEditorSlate();

  return (
    <ToolbarButton
      active={isMarkActive(editor, type)}
      onMouseDown={getPreventDefaultHandler(toggleMark, editor, type, clear)}
      {...props}
    />
  );
};
