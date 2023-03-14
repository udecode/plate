import React from 'react';
import {
  getPluginType,
  someNode,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ELEMENT_LINK, triggerFloatingLink } from '@udecode/plate-link';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export interface LinkToolbarButtonProps extends ToolbarButtonProps {
  /**
   * Default onClick is getting the link url by calling this promise before inserting the image.
   */
  getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
}

export const LinkToolbarButton = ({
  id,
  getLinkUrl,
  ...props
}: LinkToolbarButtonProps) => {
  const editor = usePlateEditorState(useEventPlateId(id));

  const type = getPluginType(editor, ELEMENT_LINK);
  const isLink = !!editor?.selection && someNode(editor, { match: { type } });

  return (
    <ToolbarButton
      tooltip={{ content: 'Link' }}
      active={isLink}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        triggerFloatingLink(editor, { focused: true });
      }}
      {...props}
    />
  );
};
