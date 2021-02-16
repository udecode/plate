import * as React from 'react';
import { useEditor } from 'slate-react';
import { ToolbarButton } from '../../../components/ToolbarButton/ToolbarButton';
import { ToolbarButtonProps } from '../../../components/ToolbarButton/ToolbarButton.types';
import { insertImage } from '../transforms/insertImage';
import { ImagePluginOptions } from '../types';

export const ToolbarImage = ({
  img,
  ...props
}: ToolbarButtonProps &
  ImagePluginOptions<'type'> &
  ImagePluginOptions<'rootProps'>) => {
  const editor = useEditor();

  return (
    <ToolbarButton
      onMouseDown={async (event) => {
        event.preventDefault();
        let url;
        if (img?.rootProps?.getImageUrl != null) {
          url = await img.rootProps.getImageUrl();
        } else {
          url = window.prompt('Enter the URL of the image:');
        }
        if (!url) return;
        insertImage(editor, url, { img });
      }}
      {...props}
    />
  );
};
