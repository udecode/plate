import React from 'react';
import { createDefaultHandler } from 'common/utils/createDefaultHandler';
import { useSlate } from 'slate-react';
import { ToolbarBlockProps, ToolbarButton } from 'components/Toolbar';
import { isMarkActive } from '../queries';
import { toggleMark } from '../transforms';

/**
 * Toolbar button to toggle mark.
 */
export const ToolbarMark = ({ type, clear, ...props }: ToolbarBlockProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isMarkActive(editor, type)}
      onMouseDown={createDefaultHandler(toggleMark, editor, type, clear)}
    />
  );
};
