import * as React from 'react';
import {
  ELEMENT_UL,
  getPreventDefaultHandler,
  toggleList,
} from '@udecode/slate-plugins';
import { useSlate } from 'slate-react';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';
import { ToolbarElement } from '../ToolbarElement/ToolbarElement';

export const ToolbarList = ({
  typeList = ELEMENT_UL,
  ...props
}: ToolbarButtonProps) => {
  const editor = useSlate();

  return (
    <ToolbarElement
      type={typeList}
      onMouseDown={getPreventDefaultHandler(toggleList, editor, {
        typeList,
      })}
      {...props}
    />
  );
};
