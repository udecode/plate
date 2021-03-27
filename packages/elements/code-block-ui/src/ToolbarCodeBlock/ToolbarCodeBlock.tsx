import * as React from 'react';
import {
  CodeBlockInsertOptions,
  ELEMENT_CODE_BLOCK,
  insertEmptyCodeBlock,
} from '@udecode/slate-plugins-code-block';
import { getPreventDefaultHandler } from '@udecode/slate-plugins-common';
import { getSlatePluginType, useTSlate } from '@udecode/slate-plugins-core';
import {
  ToolbarButtonProps,
  ToolbarElement,
} from '@udecode/slate-plugins-toolbar';

export const ToolbarCodeBlock = ({
  options,
  ...props
}: ToolbarButtonProps & {
  options?: CodeBlockInsertOptions;
}) => {
  const editor = useTSlate();

  return (
    <ToolbarElement
      type={getSlatePluginType(editor, ELEMENT_CODE_BLOCK)}
      onMouseDown={getPreventDefaultHandler(insertEmptyCodeBlock, editor, {
        insertNodesOptions: { select: true },
        ...options,
      })}
      {...props}
    />
  );
};
