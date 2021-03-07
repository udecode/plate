import * as React from 'react';
import {
  CodeBlockOptions,
  CodeLineOptions,
  DEFAULTS_CODE_BLOCK,
  getPreventDefaultHandler,
  insertCodeBlock,
  setDefaults,
} from '@udecode/slate-plugins';
import { useSlate } from 'slate-react';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';
import { ToolbarElement } from '../ToolbarElement/ToolbarElement';

export const ToolbarCodeBlock = ({
  options,
  ...props
}: ToolbarButtonProps & { options: CodeBlockOptions & CodeLineOptions }) => {
  const { code_block } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  const editor = useSlate();

  return (
    <ToolbarElement
      type={code_block.type}
      onMouseDown={getPreventDefaultHandler(
        insertCodeBlock,
        editor,
        { select: true },
        options
      )}
      {...props}
    />
  );
};
