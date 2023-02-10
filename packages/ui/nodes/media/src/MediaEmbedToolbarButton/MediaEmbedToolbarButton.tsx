import React from 'react';
import {
  focusEditor,
  useEventPlateId,
  usePlateEditorRef,
} from '@udecode/plate-core';
import { insertMediaEmbed } from '@udecode/plate-media';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export interface MediaEmbedToolbarButtonProps extends ToolbarButtonProps {
  /**
   * Default onClick is getting the embed url by calling this promise before inserting the embed.
   */
  getEmbedUrl?: () => Promise<string>;
}

export const MediaEmbedToolbarButton = ({
  id,
  getEmbedUrl,
  ...props
}: MediaEmbedToolbarButtonProps) => {
  const editor = usePlateEditorRef(useEventPlateId(id));

  return (
    <ToolbarButton
      aria-label="Insert embed "
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();

        let url;
        if (getEmbedUrl) {
          url = await getEmbedUrl();
        } else {
          url = window.prompt('Enter the URL of the embed:');
        }
        if (!url) return;

        insertMediaEmbed(editor, { url });
        focusEditor(editor);
      }}
      {...props}
    />
  );
};
