import * as React from 'react';
import { useSlate } from 'slate-react';
import { isNodeInSelection } from '../../../common/queries';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '../../../components/ToolbarButton';
import { insertLink } from '../transforms';
import { LINK } from '../types';

export const ToolbarLink = ({
  typeLink = LINK,
  ...props
}: ToolbarButtonProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={isNodeInSelection(editor, typeLink)}
      onMouseDown={(event) => {
        event.preventDefault();

        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        insertLink(editor, url, { typeLink });
      }}
      {...props}
    />
  );
};
