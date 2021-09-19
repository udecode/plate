import * as React from 'react';
import { useEventEditorId, useStoreEditorRef } from '@udecode/plate-core';
import { insertImage } from '@udecode/plate-image';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-toolbar';

export interface ToolbarImageProps extends ToolbarButtonProps {
  /**
   * Default onMouseDown is getting the image url by calling this promise before inserting the image.
   */
  getImageUrl?: () => Promise<string>;
}

export const ToolbarImage = ({
  getImageUrl,
  onClick,
  count,
  ...props
}: ToolbarImageProps) => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <ToolbarButton
      onMouseDown={async (event) => {
        if (!editor) return;

        event.preventDefault();

        let url;
        if (getImageUrl) {
          url = await getImageUrl();
        } else {
          // TODO: replace this with image upload thing
          console.log('i am here');
          console.log('onClick', onClick);
          console.log('count', count);
          console.log('props', props);
          return <div onClick={onClick()}>Click me {count}</div>;
        }
        if (!url) return;

        insertImage(editor, url);
      }}
      {...props}
    />
  );
};
