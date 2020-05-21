import React from 'react';
import { getPreventDefaultHandler } from 'common/utils/getPreventDefaultHandler';
import { ToolbarBlock } from 'element/components';
import { ListType } from 'elements/list/types';
import { useSlate } from 'slate-react';
import { ToolbarCustomProps } from 'components/Toolbar';
import { toggleList } from '../transforms';

export const ToolbarList = ({
  typeList = ListType.UL,
  ...props
}: ToolbarCustomProps) => {
  const editor = useSlate();

  return (
    <ToolbarBlock
      {...props}
      type={typeList}
      onMouseDown={getPreventDefaultHandler(toggleList, editor, {
        ...props,
        typeList,
      })}
    />
  );
};
