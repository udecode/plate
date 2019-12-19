import React from 'react';
import { Button } from 'slate-plugins/common/components/Button';
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
    <Button
      reversed={reversed}
      active={isMarkActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </Button>
  );
};
