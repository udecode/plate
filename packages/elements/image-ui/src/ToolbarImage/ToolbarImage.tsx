import * as React from 'react';
import { useTSlateStatic } from '@udecode/slate-plugins-core';
import { insertImage } from '@udecode/slate-plugins-image';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@udecode/slate-plugins-toolbar';

export interface ToolbarImageProps extends ToolbarButtonProps {
  /**
   * Default onMouseDown is getting the image url by calling this promise before inserting the image.
   */
  getImageUrl?: () => Promise<string>;
}

export const ToolbarImage = ({ getImageUrl, ...props }: ToolbarImageProps) => {
  const editor = useTSlateStatic();

  return (
    <ToolbarButton
      onMouseDown={async (event) => {
        event.preventDefault();

        let url;
        if (getImageUrl) {
          url = await getImageUrl();
        } else {
          url = window.prompt('Enter the URL of the image:');
        }
        if (!url) return;

        insertImage(editor, url);
      }}
      {...props}
    />
  );
};
