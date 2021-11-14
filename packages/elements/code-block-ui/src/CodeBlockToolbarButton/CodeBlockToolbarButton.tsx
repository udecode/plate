import React from 'react';
import {
  CodeBlockInsertOptions,
  getCodeBlockType,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import { getPreventDefaultHandler } from '@udecode/plate-common';
import { usePlateEditorState } from '@udecode/plate-core';
import { BlockToolbarButton, ToolbarButtonProps } from '@udecode/plate-toolbar';

export const CodeBlockToolbarButton = ({
  options,
  ...props
}: ToolbarButtonProps & {
  options?: CodeBlockInsertOptions;
}) => {
  const editor = usePlateEditorState()!;
  if (!editor) {
    return null;
  }

  return (
    <BlockToolbarButton
      type={getCodeBlockType(editor)}
      onMouseDown={getPreventDefaultHandler(insertEmptyCodeBlock, editor, {
        insertNodesOptions: { select: true },
        ...options,
      })}
      {...props}
    />
  );
};
