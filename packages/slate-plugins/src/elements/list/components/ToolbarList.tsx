import React from 'react';
import { createDefaultHandler } from 'common/utils/createDefaultHandler';
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
      onMouseDown={createDefaultHandler(toggleList, editor, {
        ...props,
        typeList,
      })}
    />
  );
};
