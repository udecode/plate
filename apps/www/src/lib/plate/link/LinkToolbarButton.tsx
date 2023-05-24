import React from 'react';
import {
  getPluginType,
  someNode,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ELEMENT_LINK, triggerFloatingLink } from '@udecode/plate-link';

import {
  ToolbarButtonOld,
  ToolbarButtonProps,
} from '@/plate/toolbar/ToolbarButtonOld';

export interface LinkToolbarButtonProps extends ToolbarButtonProps {
  /**
   * Default onClick is getting the link url by calling this promise before inserting the image.
   */
  getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
}

export function LinkToolbarButton({
  id,
  getLinkUrl,
  ...props
}: LinkToolbarButtonProps) {
  const editor = usePlateEditorState(useEventPlateId(id));

  const type = getPluginType(editor, ELEMENT_LINK);
  const isLink = !!editor?.selection && someNode(editor, { match: { type } });

  return (
    <ToolbarButtonOld
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
}
