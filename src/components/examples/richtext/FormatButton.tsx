import React from 'react';
import { useSlate } from 'slate-react';
import { FormatElement } from 'components/examples/richtext/FormatElement';
import { Button, Icon } from '../../components';

export const FormatButton = ({ format, icon }: any) => {
  const editor = useSlate();
  return (
    <Button
      active={FormatElement.isFormatActive(editor, format)}
      onMouseDown={(event: any) => {
        event.preventDefault();
        editor.exec({ type: 'toggle_format', format });
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};
