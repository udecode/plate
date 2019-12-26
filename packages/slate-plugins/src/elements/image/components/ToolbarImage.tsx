import React from 'react';
import { Image } from '@material-ui/icons';
import { ToolbarButton } from 'common';
import { useEditor } from 'slate-react';
import { insertImage } from '../transforms';

export const ToolbarImage = () => {
  const editor = useEditor();

  return (
    <ToolbarButton
      onMouseDown={(event: Event) => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the image:');
        if (!url) return;
        insertImage(editor, url);
      }}
    >
      <Image />
    </ToolbarButton>
  );
};
