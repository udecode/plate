import React from 'react';
import {
  focusEditor,
  getPluginType,
  someNode,
  useEventPlateId,
  usePlateEditorState,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { ToolbarButton } from '@udecode/plate-ui-toolbar';
import { TableToolbarButtonProps } from './TableToolbarButton.types';

export const TableToolbarButton = <V extends Value>({
  id,
  transform,
  header,
  ...props
}: TableToolbarButtonProps<V>) => {
  const editor = usePlateEditorState<V>(useEventPlateId(id));
  const type = getPluginType(editor, ELEMENT_TABLE);
  const isLink = !!editor?.selection && someNode(editor, { match: { type } });

  return (
    <ToolbarButton
      tooltip={{ content: 'Table' }}
      aria-label="Table"
      active={isLink}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        transform(editor, { header });

        focusEditor(editor);
      }}
      {...props}
    />
  );
};
