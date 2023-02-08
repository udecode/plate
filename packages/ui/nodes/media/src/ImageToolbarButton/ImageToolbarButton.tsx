import React from 'react';
import {
  focusEditor,
  useEventPlateId,
  usePlateEditorRef,
} from '@udecode/plate-core';
import { insertImage } from '@udecode/plate-media';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export interface ImageToolbarButtonProps extends ToolbarButtonProps {
  /**
   * Default onMouseDown is getting the image url by calling this promise before inserting the image.
   */
  getImageUrl?: () => Promise<string>;
}

export const ImageToolbarButton = ({
  id,
  getImageUrl,
  ...props
}: ImageToolbarButtonProps) => {
  const editor = usePlateEditorRef(useEventPlateId(id));

  return (
    <ToolbarButton
      aria-label="Insert image"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();

        let url;
        if (getImageUrl) {
          url = await getImageUrl();
        } else {
          url = window.prompt('Enter the URL of the image:');
        }
        if (!url) return;

        insertImage(editor, url);
        focusEditor(editor);
      }}
      {...props}
    />
  );
};
