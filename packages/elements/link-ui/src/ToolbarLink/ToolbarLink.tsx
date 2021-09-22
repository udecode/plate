import * as React from 'react';
import { someNode } from '@udecode/plate-common';
import {
  getPlatePluginType,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/plate-core';
import { ELEMENT_LINK, getAndUpsertLink } from '@udecode/plate-link';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-toolbar';

export interface ToolbarLinkProps extends ToolbarButtonProps {
  /**
   * Default onMouseDown is getting the link url by calling this promise before inserting the image.
   */
  getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
}

export const ToolbarLink = ({ getLinkUrl, ...props }: ToolbarLinkProps) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

  const type = getPlatePluginType(editor, ELEMENT_LINK);
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
