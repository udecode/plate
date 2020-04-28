import React from 'react';
import { ToolbarButton } from 'common';
import { ToolbarBlockProps } from 'common/types';
import { useSlate } from 'slate-react';
import { isMarkActive } from '../queries';
import { clearMark, toggleMark } from '../transforms';

/**
 * Toolbar button to toggle mark.
 */
export const ToolbarMark = ({ type, clear, ...props }: ToolbarBlockProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isMarkActive(editor, type)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        if (clear) {
          clearMark(editor, clear);
        }
        toggleMark(editor, type);
      }}
    />
  );
};
