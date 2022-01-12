import React from 'react';
import {
  CodeBlockInsertOptions,
  ELEMENT_CODE_BLOCK,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import {
  getPluginType,
  getPreventDefaultHandler,
  usePlateEditorState,
  withEditor,
} from '@udecode/plate-core';
import {
  BlockToolbarButton,
  ToolbarButtonProps,
} from '@udecode/plate-ui-toolbar';

export const CodeBlockToolbarButton = withEditor(
  ({
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
        type={getPluginType(editor, ELEMENT_CODE_BLOCK)}
        onMouseDown={getPreventDefaultHandler(insertEmptyCodeBlock, editor, {
          insertNodesOptions: { select: true },
          ...options,
        })}
        {...props}
      />
    );
  }
);
