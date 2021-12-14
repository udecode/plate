import React from 'react';
import {
  getPluginType,
  someNode,
  usePlateEditorState,
} from '@udecode/plate-core';
import { ELEMENT_LINK, getAndUpsertLink } from '@udecode/plate-link';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export interface LinkToolbarButtonProps extends ToolbarButtonProps {
  /**
   * Default onMouseDown is getting the link url by calling this promise before inserting the image.
   */
  getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
}

export const LinkToolbarButton = ({
  getLinkUrl,
  ...props
}: LinkToolbarButtonProps) => {
  const editor = usePlateEditorState()!;

  const type = getPluginType(editor, ELEMENT_LINK);
  const isLink = !!editor?.selection && someNode(editor, { match: { type } });

  return (
    <ToolbarButton
      active={isLink}
      onMouseDown={async (event) => {
        if (!editor) return;

        event.preventDefault();
        getAndUpsertLink(editor, getLinkUrl);
      }}
      {...props}
    />
  );
};
