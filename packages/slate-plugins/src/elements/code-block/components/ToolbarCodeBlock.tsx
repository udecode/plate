import * as React from 'react';
import { useSlate } from 'slate-react';
import { toggleWrapNodes } from '../../../common/transforms';
import { getPreventDefaultHandler } from '../../../common/utils';
import { ToolbarButtonProps } from '../../../components/ToolbarButton';
import { ToolbarElement } from '../../../element/components';
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
