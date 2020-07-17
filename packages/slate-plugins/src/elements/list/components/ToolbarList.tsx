import * as React from 'react';
import { useSlate } from 'slate-react';
import { getPreventDefaultHandler } from '../../../common/utils/getPreventDefaultHandler';
import { ToolbarButtonProps } from '../../../components/ToolbarButton/ToolbarButton.types';
import { ToolbarElement } from '../../../components/ToolbarElement/ToolbarElement';
import { ELEMENT_UL } from '../defaults';
import { toggleList } from '../transforms/toggleList';

export const ToolbarList = ({
  typeList = ELEMENT_UL,
  ...props
}: ToolbarButtonProps) => {
  const editor = useSlate();

  return (
    <ToolbarElement
      type={typeList}
      onMouseDown={getPreventDefaultHandler(toggleList, editor, {
        ...props,
        typeList,
      })}
      {...props}
    />
  );
};
