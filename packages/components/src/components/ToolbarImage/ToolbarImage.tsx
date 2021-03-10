import * as React from 'react';
import {
  ELEMENT_IMAGE,
  insertImage,
  useEditorOptions,
} from '@udecode/slate-plugins';
import { useEditor } from 'slate-react';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export interface ToolbarImageProps extends ToolbarButtonProps {
  /**
   * Default onMouseDown is getting the image url by calling this promise before inserting the image.
   */
  getImageUrl?: () => Promise<string>;
}

export const ToolbarImage = ({ getImageUrl, ...props }: ToolbarImageProps) => {
  const options = useEditorOptions(ELEMENT_IMAGE);

  const editor = useEditor();

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

        insertImage(editor, url, { img: options });
      }}
      {...props}
    />
  );
};
