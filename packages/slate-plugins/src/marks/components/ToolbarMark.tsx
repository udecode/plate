import React from 'react';
import { ToolbarButton } from 'common';
import { useSlate } from 'slate-react';
import { isMarkActive } from '../queries';
import { toggleMark } from '../transforms/toggleMark';

interface Props {
  format: string;
  icon: any;
  reversed?: boolean;
}

/**
 * Toolbar button to toggle mark.
 */
export const ToolbarMark = ({ format, icon, reversed = false }: Props) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      reversed={reversed}
      active={isMarkActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </ToolbarButton>
  );
};
