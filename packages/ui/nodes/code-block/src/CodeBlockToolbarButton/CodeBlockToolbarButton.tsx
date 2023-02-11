import React from 'react';
import {
  CodeBlockInsertOptions,
  ELEMENT_CODE_BLOCK,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import {
  focusEditor,
  getPluginType,
  getPreventDefaultHandler,
  useEventPlateId,
  usePlateEditorState,
  Value,
} from '@udecode/plate-core';
import {
  BlockToolbarButton,
  ToolbarButtonProps,
} from '@udecode/plate-ui-toolbar';

export const CodeBlockToolbarButton = <V extends Value>({
  id,
  options,
  ...props
}: ToolbarButtonProps & {
  options?: CodeBlockInsertOptions<V>;
}) => {
  const editor = usePlateEditorState(useEventPlateId(id));

  return (
    <BlockToolbarButton
      aria-label="Insert code block"
      type={getPluginType(editor, ELEMENT_CODE_BLOCK)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        getPreventDefaultHandler(insertEmptyCodeBlock, editor, {
          insertNodesOptions: { select: true },
          ...options,
        });
        focusEditor(editor);
      }}
      {...props}
    />
  );
};
