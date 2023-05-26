import React from 'react';
import {
  focusEditor,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ELEMENT_UL } from '@udecode/plate-list';

import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';
import { someListDemo } from '@/plate/demo/someListDemo';
import { toggleListDemo } from '@/plate/demo/toggleListDemo';

export function ListToolbarButton({
  id,
  nodeType = ELEMENT_UL,
  ...props
}: ToolbarButtonProps & { nodeType?: string }) {
  const editor = usePlateEditorState(useEventPlateId(id));

  return (
    <ToolbarButton
      pressed={someListDemo(editor, nodeType)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleListDemo(editor, nodeType);
        focusEditor(editor);
      }}
      {...props}
    />
  );
}
