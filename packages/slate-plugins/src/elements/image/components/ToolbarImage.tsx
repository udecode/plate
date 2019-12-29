import React from 'react';
import { ToolbarButton } from 'common';
import { ToolbarElementProps } from 'common/types';
import { useEditor } from 'slate-react';
import { insertImage } from '../transforms';

export const ToolbarImage = (props: ToolbarElementProps) => {
  const editor = useEditor();

  return (
    <ToolbarButton
      {...props}
      onClick={(event: Event) => {
        event.preventDefault();

        const url = window.prompt('Enter the URL of the image:');
        if (!url) return;
        insertImage(editor, url);
      }}
    />
  );
};
