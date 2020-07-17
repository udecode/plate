import * as React from 'react';
import { useEditor } from 'slate-react';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '../../../components/ToolbarButton';
import { insertImage } from '../transforms';
import { ImagePluginOptions } from '../types';

export const ToolbarImage = ({
  img,
  ...props
}: ToolbarButtonProps & ImagePluginOptions<'type'>) => {
  const editor = useEditor();

  return (
    <ToolbarButton
      onMouseDown={(event) => {
        event.preventDefault();

        const url = window.prompt('Enter the URL of the image:');
        if (!url) return;
        insertImage(editor, url, { img });
      }}
      {...props}
    />
  );
};
