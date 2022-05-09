import React from 'react';
import {
  CodeBlockInsertOptions,
  ELEMENT_CODE_BLOCK,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import {
  getPluginType,
  getPreventDefaultHandler,
  useEventPlateId,
  usePlateEditorState,
  Value,
  withPlateEventProvider,
} from '@udecode/plate-core';
import {
  BlockToolbarButton,
  ToolbarButtonProps,
} from '@udecode/plate-ui-toolbar';

export const CodeBlockToolbarButton = withPlateEventProvider(
  <V extends Value>({
    id,
    options,
    ...props
  }: ToolbarButtonProps & {
    options?: CodeBlockInsertOptions<V>;
  }) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;
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
