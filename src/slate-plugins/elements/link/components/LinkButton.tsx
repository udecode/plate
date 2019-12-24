import React from 'react';
import { Link } from '@material-ui/icons';
import { FormatButton } from 'slate-plugins';
import { useSlate } from 'slate-react';
import { isLinkActive } from '../queries';
import { insertLink } from '../transforms';

export const LinkButton = () => {
  const editor = useSlate();

  return (
    <FormatButton
      active={isLinkActive(editor)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        insertLink(editor, url);
      }}
    >
      <Link />
    </FormatButton>
  );
};
