import * as React from 'react';
import { getPreventDefaultHandler } from '@udecode/plate-common';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import { ELEMENT_UL, toggleList } from '@udecode/plate-list';
import { ToolbarButtonProps, ToolbarElement } from '@udecode/plate-toolbar';

export const ToolbarList = ({
  type = ELEMENT_UL,
  ...props
}: ToolbarButtonProps & { type?: string }) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

  return (
    <ToolbarElement
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
