import React from 'react';
import { toggleWrapNodes } from 'common/transforms/toggleWrapNodes';
import { getPreventDefaultHandler } from 'common/utils/getPreventDefaultHandler';
import { ToolbarElement } from 'element/components';
import { useSlate } from 'slate-react';
import { ToolbarButtonProps } from 'components/ToolbarButton';
import { CODE_BLOCK } from '../types';

export const ToolbarCodeBlock = ({
  typeCodeBlock = CODE_BLOCK,
  ...props
}: ToolbarButtonProps) => {
  const editor = useSlate();

  return (
    <ToolbarElement
      type={typeCodeBlock}
      onMouseDown={getPreventDefaultHandler(
        toggleWrapNodes,
        editor,
        typeCodeBlock
      )}
      {...props}
    />
  );
};
