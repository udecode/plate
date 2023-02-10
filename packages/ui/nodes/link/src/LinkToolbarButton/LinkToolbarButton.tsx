import React from 'react';
import {
  focusEditor,
  getPluginType,
  someNode,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-core';
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
      aria-label="Insert link"
      active={isLink}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        focusEditor(editor, editor.selection ?? editor.prevSelection!);

        setTimeout(() => {
          triggerFloatingLink(editor, { focused: true });
        }, 0);
      }}
      {...props}
    />
  );
};
