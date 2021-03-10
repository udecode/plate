import * as React from 'react';
import {
  CodeBlockInsertOptions,
  getPreventDefaultHandler,
  insertEmptyCodeBlock,
  KEYS_CODE_BLOCK,
  useEditorMultiOptions,
} from '@udecode/slate-plugins';
import { useSlate } from 'slate-react';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';
import { ToolbarElement } from '../ToolbarElement/ToolbarElement';

export const ToolbarCodeBlock = ({
  options,
  ...props
}: ToolbarButtonProps & {
  options?: CodeBlockInsertOptions;
}) => {
  const pluginOptions = useEditorMultiOptions(KEYS_CODE_BLOCK);

  const editor = useSlate();

  return (
    <ToolbarElement
      type={pluginOptions.code_block.type}
      onMouseDown={getPreventDefaultHandler(
        insertEmptyCodeBlock,
        editor,
        { insertNodesOptions: { select: true }, ...options },
        pluginOptions
      )}
      {...props}
    />
  );
};
