import * as React from 'react';
import { getPreventDefaultHandler } from '@udecode/slate-plugins-common';
import { ELEMENT_UL, toggleList } from '@udecode/slate-plugins-list';
import {
  ToolbarButtonProps,
  ToolbarElement,
} from '@udecode/slate-plugins-toolbar';
import { useSlate } from 'slate-react';

export const ToolbarList = ({
  type = ELEMENT_UL,
  ...props
}: ToolbarButtonProps & { type?: string }) => {
  const editor = useSlate();

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
