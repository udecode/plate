import React from 'react';
import {
  focusEditor,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ELEMENT_UL } from '@udecode/plate-list';

import { Icons } from '@/components/icons';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';
import { someListDemo } from '@/plate/demo/someListDemo';
import { toggleListDemo } from '@/plate/demo/toggleListDemo';

export function ListToolbarButton({
  nodeType = ELEMENT_UL,
  ...props
}: ToolbarButtonProps & { nodeType?: string }) {
  const editor = usePlateEditorState(useEventPlateId());

  return (
    <ToolbarButton
      tooltip={nodeType === ELEMENT_UL ? 'Bulleted List' : 'Numbered List'}
      pressed={someListDemo(editor, nodeType)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleListDemo(editor, nodeType);
        focusEditor(editor);
      }}
      {...props}
    >
      {nodeType === ELEMENT_UL ? <Icons.ul /> : <Icons.ol />}
    </ToolbarButton>
  );
}
