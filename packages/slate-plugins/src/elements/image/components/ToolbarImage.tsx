import React from 'react';
import { IMAGE } from 'elements/image/types';
import { useEditor } from 'slate-react';
import { ToolbarButton, ToolbarElementProps } from 'components/Toolbar';
import { insertImage } from '../transforms';

export const ToolbarImage = ({
  typeImg = IMAGE,
  ...props
}: ToolbarElementProps) => {
  const editor = useEditor();

  return (
    <ToolbarButton
      {...props}
      onMouseDown={(event: Event) => {
        event.preventDefault();

        const url = window.prompt('Enter the URL of the image:');
        if (!url) return;
        insertImage(editor, url, { typeImg });
      }}
    />
  );
};
