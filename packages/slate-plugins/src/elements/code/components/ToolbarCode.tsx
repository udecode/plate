import React from 'react';
import { isNodeInSelection } from 'common/queries';
import { toggleWrapNodes } from 'common/transforms/toggleWrapNodes';
import { getPreventDefaultHandler } from 'common/utils/getPreventDefaultHandler';
import { useSlate } from 'slate-react';
import { ToolbarButton, ToolbarElementProps } from 'components/Toolbar';
import { CODE } from '../types';

export const ToolbarCode = ({
  typeCode = CODE,
  ...props
}: ToolbarElementProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isNodeInSelection(editor, typeCode)}
      onMouseDown={getPreventDefaultHandler(toggleWrapNodes, editor, typeCode)}
    />
  );
};
