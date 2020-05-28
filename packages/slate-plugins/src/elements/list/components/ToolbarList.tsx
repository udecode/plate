import React from 'react';
import { getPreventDefaultHandler } from 'common/utils/getPreventDefaultHandler';
import { ToolbarElement } from 'element/components';
import { ListType } from 'elements/list/types';
import { useSlate } from 'slate-react';
import { ToolbarButtonProps } from 'components/ToolbarButton';
import { toggleList } from '../transforms';

export const ToolbarList = ({
  typeList = ListType.UL,
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
