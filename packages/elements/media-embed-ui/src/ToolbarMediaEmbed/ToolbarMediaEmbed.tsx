import * as React from 'react';
import { useEventEditorId, useStoreEditorRef } from '@udecode/plate-core';
import { insertMediaEmbed } from '@udecode/plate-media-embed';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-toolbar';

export interface ToolbarMediaEmbedProps extends ToolbarButtonProps {
  /**
   * Default onMouseDown is getting the embed url by calling this promise before inserting the embed.
   */
  getEmbedUrl?: () => Promise<string>;
}

export const ToolbarMediaEmbed = ({
  getEmbedUrl,
  ...props
}: ToolbarMediaEmbedProps) => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

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
