import * as React from 'react';
import {
  CodeBlockInsertOptions,
  ELEMENT_CODE_BLOCK,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import { getPreventDefaultHandler } from '@udecode/plate-common';
import {
  getPlatePluginType,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/plate-core';
import { ToolbarButtonProps, ToolbarElement } from '@udecode/plate-toolbar';

export const ToolbarCodeBlock = ({
  options,
  ...props
}: ToolbarButtonProps & {
  options?: CodeBlockInsertOptions;
}) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

  return (
    <ToolbarElement
      type={getPlatePluginType(editor, ELEMENT_CODE_BLOCK)}
      onMouseDown={
        editor &&
        getPreventDefaultHandler(insertEmptyCodeBlock, editor, {
          insertNodesOptions: { select: true },
          ...options,
        })
      }
      {...props}
    />
  );
};
