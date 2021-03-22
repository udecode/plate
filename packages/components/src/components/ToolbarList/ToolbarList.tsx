import * as React from 'react';
import { getPreventDefaultHandler } from '@udecode/slate-plugins-common';
import { ELEMENT_UL, toggleList } from '@udecode/slate-plugins-list';
import { useSlate } from 'slate-react';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';
import { ToolbarElement } from '../ToolbarElement/ToolbarElement';

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
