import React from 'react';
import {
  CodeBlockInsertOptions,
  ELEMENT_CODE_BLOCK,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import {
  focusEditor,
  getPluginType,
  useEventPlateId,
  usePlateEditorState,
  Value,
} from '@udecode/plate-common';
import {
  BlockToolbarButton,
  ToolbarButtonProps,
} from '@udecode/plate-ui-toolbar';

export function CodeBlockToolbarButton<V extends Value>({
  id,
  options,
  ...props
}: ToolbarButtonProps & {
  options?: CodeBlockInsertOptions<V>;
}) {
  const editor = usePlateEditorState(useEventPlateId(id));

  return (
    <BlockToolbarButton
      tooltip={{ content: 'Code Block' }}
      type={getPluginType(editor, ELEMENT_CODE_BLOCK)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        insertEmptyCodeBlock(editor, {
          insertNodesOptions: { select: true },
          ...options,
        });

        focusEditor(editor);
      }}
      {...props}
    />
  );
}
