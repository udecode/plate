import React from 'react';
import {
  focusEditor,
  getPluginType,
  someNode,
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ELEMENT_LINK, triggerFloatingLink } from '@udecode/plate-link';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export interface LinkToolbarButtonProps extends ToolbarButtonProps {
  /**
   * Default onMouseDown is getting the link url by calling this promise before inserting the image.
   */
  getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
}

export const LinkToolbarButton = withPlateEventProvider(
  ({ id, getLinkUrl, ...props }: LinkToolbarButtonProps) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;

    const type = getPluginType(editor, ELEMENT_LINK);
    const isLink = !!editor?.selection && someNode(editor, { match: { type } });

    return (
      <ToolbarButton
        active={isLink}
        onMouseDown={async (event) => {
          if (!editor) return;

          event.preventDefault();
          event.stopPropagation();

          focusEditor(editor, editor.selection ?? editor.prevSelection!);

          setTimeout(() => {
            triggerFloatingLink(editor, { focused: true });
          }, 0);
        }}
        {...props}
      />
    );
  }
);
