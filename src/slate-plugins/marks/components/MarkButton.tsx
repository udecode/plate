import React from 'react';
import { FormatButton } from 'slate-plugins';
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
export const MarkButton = ({ format, icon, reversed = false }: Props) => {
  const editor = useSlate();

  return (
    <FormatButton
      reversed={reversed}
      active={isMarkActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </FormatButton>
  );
};
