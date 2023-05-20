import React from 'react';
import {
  focusEditor,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ELEMENT_UL, getListItemEntry, toggleList } from '@udecode/plate-list';
import { BlockToolbarButton } from '../toolbar/BlockToolbarButton';
import { ToolbarButtonProps } from '../toolbar/ToolbarButton';

export function ListToolbarButton({
  id,
  type = ELEMENT_UL,
  ...props
}: ToolbarButtonProps & { type?: string }) {
  const editor = usePlateEditorState(useEventPlateId(id));

  const res = !!editor?.selection && getListItemEntry(editor);

  return (
    <BlockToolbarButton
      active={!!res && res.list[0].type === type}
      type={type}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleList(editor, { type });
        focusEditor(editor);
      }}
      {...props}
    />
  );
}
