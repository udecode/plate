import React from 'react';
import { useSlate } from 'slate-react';
import { Button, Icon } from '../../components';
import { isBlockActive } from './rich-text';

export const BlockButton = ({ type, icon }: any) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, type)}
      onMouseDown={(event: any) => {
        event.preventDefault();
        editor.exec({ type: 'toggle_block', block: type });
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};
