import React from 'react';
import { useSlate } from 'slate-react';
import { Button, Icon } from 'components/components';
import { isLinkActive } from './queries';

export const LinkButton = () => {
  const editor = useSlate();
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        editor.exec({ type: 'insert_link', url });
      }}
    >
      <Icon>link</Icon>
    </Button>
  );
};
