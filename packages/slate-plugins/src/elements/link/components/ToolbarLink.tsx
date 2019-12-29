import React from 'react';
import { ToolbarButton } from 'common';
import { ToolbarElementProps } from 'common/types';
import { useSlate } from 'slate-react';
import { isLinkActive } from '../queries';
import { insertLink } from '../transforms';

export const ToolbarLink = (props: ToolbarElementProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isLinkActive(editor)}
      onClick={(event: Event) => {
        event.preventDefault();

        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        insertLink(editor, url);
      }}
    />
  );
};
