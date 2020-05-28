import React from 'react';
import { IMAGE } from 'elements/image/types';
import { useEditor } from 'slate-react';
import { ToolbarButton, ToolbarButtonProps } from 'components/ToolbarButton';
import { insertImage } from '../transforms';

export const ToolbarImage = ({
  typeImg = IMAGE,
  ...props
}: ToolbarButtonProps) => {
  const editor = useEditor();

  return (
    <ToolbarButton
      onMouseDown={(event) => {
        event.preventDefault();

        const url = window.prompt('Enter the URL of the image:');
        if (!url) return;
        insertImage(editor, url, { typeImg });
      }}
      {...props}
    />
  );
};
