import React from 'react';
import { isNodeInSelection } from 'common/queries/isNodeInSelection';
import { LINK } from 'elements/link/types';
import { useSlate } from 'slate-react';
import { ToolbarButton, ToolbarCustomProps } from 'components/ToolbarButton';
import { insertLink } from '../transforms';

export const ToolbarLink = ({
  typeLink = LINK,
  ...props
}: ToolbarCustomProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isNodeInSelection(editor, typeLink)}
      onMouseDown={(event: Event) => {
        event.preventDefault();

        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        insertLink(editor, url, { typeLink });
      }}
    />
  );
};
