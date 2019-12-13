import React from 'react';
import { useSlate } from 'slate-react';
import { Button, Icon } from '../../components';
import { isFormatActive } from './queries';

export const FormatButton = ({ format, icon, reversed = false }: any) => {
  const editor = useSlate();
  
  return (
    <Button
      reversed={reversed}
      active={isFormatActive(editor, format)}
      onMouseDown={(event: any) => {
        event.preventDefault();
        editor.exec({ type: 'toggle_format', format });
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};
