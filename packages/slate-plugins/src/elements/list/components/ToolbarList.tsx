import * as React from 'react';
import { useSlate } from 'slate-react';
import { getPreventDefaultHandler } from '../../../common/utils';
import { ToolbarButtonProps } from '../../../components/ToolbarButton';
import { ToolbarElement } from '../../../element/components';
import { toggleList } from '../transforms';
import { ListType } from '../types';

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
