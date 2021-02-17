import * as React from 'react';
import { useSlate } from 'slate-react';
import { getPreventDefaultHandler } from '../../../common/utils/getPreventDefaultHandler';
import { ToolbarButtonProps } from '../../../components/ToolbarButton/ToolbarButton.types';
import { ToolbarElement } from '../../../components/ToolbarElement/ToolbarElement';
import { ELEMENT_CODE_BLOCK } from '../defaults';
import { toggleCodeBlock } from '../transforms/toggleCodeBlock';

export const ToolbarCodeBlock = ({
  typeCodeBlock = ELEMENT_CODE_BLOCK,
  ...props
}: ToolbarButtonProps) => {
  const editor = useSlate();

  return (
    <ToolbarElement
      type={typeCodeBlock}
      onMouseDown={getPreventDefaultHandler(toggleCodeBlock, editor, {
        ...props,
        typeCodeBlock,
      })}
      {...props}
    />
  );
};
