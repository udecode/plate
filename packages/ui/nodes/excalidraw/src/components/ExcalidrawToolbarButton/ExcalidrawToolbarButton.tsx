import React from 'react';
import {
  focusEditor,
  getPluginType,
  someNode,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { ELEMENT_EXCALIDRAW, insertExcalidraw } from '../../index';

export interface ExcalidrawToolbarButtonProps extends ToolbarButtonProps {}

export const ExcalidrawToolbarButton = ({
  id,
  ...props
}: ToolbarButtonProps) => {
  const editor = usePlateEditorState(useEventPlateId(id));

  const type = getPluginType(editor, ELEMENT_EXCALIDRAW);
  const isExcalidraw =
    !!editor?.selection && someNode(editor, { match: { type } });

  return (
    <ToolbarButton
      active={isExcalidraw}
      onMouseDown={async (event: any) => {
        if (!editor) return;

        event.preventDefault();
        event.stopPropagation();

        focusEditor(editor, editor.selection ?? editor.prevSelection!);

        setTimeout(() => {
          insertExcalidraw(editor);
        }, 0);
      }}
      {...props}
    />
  );
};
