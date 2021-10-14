import * as React from 'react';
import {
  CodeBlockInsertOptions,
  getCodeBlockType,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import { getPreventDefaultHandler } from '@udecode/plate-common';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import { ToolbarButtonProps, ToolbarElement } from '@udecode/plate-toolbar';

export const ToolbarCodeBlock = ({
  options,
  ...props
}: ToolbarButtonProps & {
  options?: CodeBlockInsertOptions;
}) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));
  if (!editor) {
    return null;
  }

  return (
    <ToolbarElement
      type={getCodeBlockType(editor)}
      onMouseDown={getPreventDefaultHandler(insertEmptyCodeBlock, editor, {
        insertNodesOptions: { select: true },
        ...options,
      })}
      {...props}
    />
  );
};
