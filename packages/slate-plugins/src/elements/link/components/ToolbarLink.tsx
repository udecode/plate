import React from 'react';
import { ToolbarButton } from 'common';
import { ToolbarCustomProps } from 'common/types';
import { useSlate } from 'slate-react';
import { isLinkActive } from '../queries';
import { insertLink } from '../transforms';

export const ToolbarLink = ({ typeLink, ...props }: ToolbarCustomProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isLinkActive(editor, { typeLink })}
      onMouseDown={(event: Event) => {
        event.preventDefault();

        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        insertLink(editor, url, { typeLink });
      }}
    />
  );
};
