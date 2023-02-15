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
      tooltip={{ content: 'Excalidraw' }}
      active={isExcalidraw}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        insertExcalidraw(editor);
        focusEditor(editor);
      }}
      {...props}
    />
  );
};
