import React from 'react';
import { isNodeInSelection } from 'common/queries';
import { toggleWrapNodes } from 'common/transforms/toggleWrapNodes';
import { getPreventDefaultHandler } from 'common/utils/getPreventDefaultHandler';
import { useSlate } from 'slate-react';
import { ToolbarButton, ToolbarElementProps } from 'components/Toolbar';
import { CODE_BLOCK } from '../types';

export const ToolbarCodeBlock = ({
  typeCodeBlock = CODE_BLOCK,
  ...props
}: ToolbarElementProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isNodeInSelection(editor, typeCodeBlock)}
      onMouseDown={getPreventDefaultHandler(
        toggleWrapNodes,
        editor,
        typeCodeBlock
      )}
    />
  );
};
