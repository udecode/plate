import React from 'react';
import {
  getPreventDefaultHandler,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-core';
import { ELEMENT_UL, getListItemEntry, toggleList } from '@udecode/plate-list';
import {
  BlockToolbarButton,
  ToolbarButtonProps,
} from '@udecode/plate-ui-toolbar';

export const ListToolbarButton = ({
  id,
  type = ELEMENT_UL,
  ...props
}: ToolbarButtonProps & { type?: string }) => {
  const editor = usePlateEditorState(useEventPlateId(id));

  const res = !!editor?.selection && getListItemEntry(editor);

  return (
    <BlockToolbarButton
      active={!!res && res.list[0].type === type}
      type={type}
      onMouseDown={
        editor &&
        getPreventDefaultHandler(toggleList, editor, {
          type,
        })
      }
      {...props}
    />
  );
};
