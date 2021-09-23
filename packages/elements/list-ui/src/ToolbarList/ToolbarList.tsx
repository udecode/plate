import * as React from 'react';
import { getPreventDefaultHandler } from '@udecode/plate-common';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import { ELEMENT_UL, getListItemEntry, toggleList } from '@udecode/plate-list';
import { ToolbarButtonProps, ToolbarElement } from '@udecode/plate-toolbar';

export const ToolbarList = ({
  type = ELEMENT_UL,
  ...props
}: ToolbarButtonProps & { type?: string }) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

  const res = !!editor?.selection && getListItemEntry(editor);

  return (
    <ToolbarElement
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
