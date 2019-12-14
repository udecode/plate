import React from 'react';
import { Button } from 'slate-plugins/common/components/Button';
import { useSlate } from 'slate-react';
import { isMarkActive } from './queries';

interface Props {
  format: string;
  icon: any;
  reversed?: boolean;
}

export const MarkButton = ({ format, icon, reversed = false }: Props) => {
  const editor = useSlate();

  return (
    <Button
      reversed={reversed}
      active={isMarkActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        editor.exec({ type: 'format_text', properties: { [format]: true } });
      }}
    >
      {icon}
    </Button>
  );
};
