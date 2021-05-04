import * as React from 'react';
import { getPreventDefaultHandler } from '@udecode/slate-plugins-common';
import {
  useEditorState,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/slate-plugins-core';
import { ELEMENT_UL, toggleList } from '@udecode/slate-plugins-list';
import {
  ToolbarButtonProps,
  ToolbarElement,
} from '@udecode/slate-plugins-toolbar';

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
