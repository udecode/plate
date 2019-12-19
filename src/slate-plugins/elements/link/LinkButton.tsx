import React from 'react';
import { Link } from '@material-ui/icons';
import { Button } from 'slate-plugins/common/components/Button';
import { useSlate } from 'slate-react';
import { isLinkActive } from './queries';
import { insertLink } from './transforms';

export const LinkButton = () => {
  const editor = useSlate();

  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        insertLink(editor, url);
      }}
    >
      <Link />
    </Button>
  );
};
