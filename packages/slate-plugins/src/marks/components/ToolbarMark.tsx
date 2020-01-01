import React from 'react';
import { ToolbarButton } from 'common';
import { ToolbarFormatProps } from 'common/types';
import { useSlate } from 'slate-react';
import { isMarkActive } from '../queries';
import { toggleMark } from '../transforms/toggleMark';

/**
 * Toolbar button to toggle mark.
 */
export const ToolbarMark = ({ format, ...props }: ToolbarFormatProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isMarkActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    />
  );
};
