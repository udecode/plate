import * as React from 'react';
import { getPreventDefaultHandler } from '@udecode/slate-plugins-common';
import { useEditorState } from '@udecode/slate-plugins-core';
import { ELEMENT_UL, toggleList } from '@udecode/slate-plugins-list';
import {
  ToolbarButtonProps,
  ToolbarElement,
} from '@udecode/slate-plugins-toolbar';

export const ToolbarList = ({
  type = ELEMENT_UL,
  ...props
}: ToolbarButtonProps & { type?: string }) => {
  const editor = useEditorState();

  return (
    <ToolbarElement
      type={type}
      onMouseDown={getPreventDefaultHandler(toggleList, editor, {
        type,
      })}
      {...props}
    />
  );
};
