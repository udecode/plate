import React from 'react';
import { useSlate } from 'slate-react';
import { Button, Icon } from 'components/components';
import { isBlockActive } from './queries';

interface Props {
  format: string;
  icon: any;
}

export const BlockButton = ({ format, icon }: Props) => {
  const editor = useSlate();

  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        editor.exec({ type: 'format_block', format });
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};
