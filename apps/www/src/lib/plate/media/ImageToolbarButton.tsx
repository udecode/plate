import React from 'react';
import {
  focusEditor,
  useEventPlateId,
  usePlateEditorRef,
} from '@udecode/plate-common';
import { insertImage } from '@udecode/plate-media';

import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';

export interface ImageToolbarButtonProps extends ToolbarButtonProps {
  /**
   * Default onClick is getting the image url by calling this promise before inserting the image.
   */
  getImageUrl?: () => Promise<string>;
}

export function ImageToolbarButton({
  id,
  getImageUrl,
  ...props
}: ImageToolbarButtonProps) {
  const editor = usePlateEditorRef(useEventPlateId(id));

  return (
    <ToolbarButton
      tooltip="Image"
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
}
