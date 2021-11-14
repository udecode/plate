import React from 'react';
import { usePlateEditorRef } from '@udecode/plate-core';
import { insertMediaEmbed } from '@udecode/plate-media-embed';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-toolbar';

export interface MediaEmbedToolbarButtonProps extends ToolbarButtonProps {
  /**
   * Default onMouseDown is getting the embed url by calling this promise before inserting the embed.
   */
  getEmbedUrl?: () => Promise<string>;
}

export const MediaEmbedToolbarButton = ({
  getEmbedUrl,
  ...props
}: MediaEmbedToolbarButtonProps) => {
  const editor = usePlateEditorRef()!;

  return (
    <ToolbarButton
      onMouseDown={async (event) => {
        if (!editor) return;

        event.preventDefault();

        let url;
        if (getEmbedUrl) {
          url = await getEmbedUrl();
        } else {
          url = window.prompt('Enter the URL of the embed:');
        }
        if (!url) return;

        insertMediaEmbed(editor, { url });
      }}
      {...props}
    />
  );
};
