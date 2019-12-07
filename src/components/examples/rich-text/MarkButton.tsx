import React from 'react';
import { useSlate } from 'slate-react';
import { Button, Icon } from '../../components';
import { isMarkActive } from './rich-text';

export const MarkButton = ({ type, icon }: any) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, type)}
      onMouseDown={(event: any) => {
        event.preventDefault();
        editor.exec({ type: 'toggle_mark', mark: type });
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};
