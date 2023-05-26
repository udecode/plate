import React from 'react';
import {
  focusEditor,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ELEMENT_UL, getListItemEntry } from '@udecode/plate-list';

import { toggleListDemo } from '@/plate/demo/toggleListDemo';
import {
  BlockToolbarButton,
  BlockToolbarButtonProps,
} from '@/plate/toolbar/BlockToolbarButton';

export function ListToolbarButton({
  id,
  nodeType = ELEMENT_UL,
  ...props
}: BlockToolbarButtonProps) {
  const editor = usePlateEditorState(useEventPlateId(id));

  const res = !!editor?.selection && getListItemEntry(editor);

  return (
    <BlockToolbarButton
      pressed={!!res && res.list[0].type === nodeType}
      nodeType={nodeType}
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
