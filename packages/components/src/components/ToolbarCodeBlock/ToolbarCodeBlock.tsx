import * as React from 'react';
import {
  CodeBlockInsertOptions,
  ELEMENT_CODE_BLOCK,
  getPluginType,
  getPreventDefaultHandler,
  insertEmptyCodeBlock,
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
  const editor = useSlate();

  return (
    <ToolbarElement
      type={getPluginType(editor, ELEMENT_CODE_BLOCK)}
      onMouseDown={getPreventDefaultHandler(insertEmptyCodeBlock, editor, {
        insertNodesOptions: { select: true },
        ...options,
      })}
      {...props}
    />
  );
};
