import React from 'react';
import {
  someNode,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ELEMENT_LINK, triggerFloatingLink } from '@udecode/plate-link';

import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';

export function LinkToolbarButton(props: ToolbarButtonProps) {
  const editor = usePlateEditorState(useEventPlateId());

  const type = ELEMENT_LINK;
  const isLink = !!editor?.selection && someNode(editor, { match: { type } });

  return (
    <ToolbarButton
      tooltip="Link"
      pressed={isLink}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        triggerFloatingLink(editor, { focused: true });
      }}
      {...props}
    />
  );
}
