import React from 'react';
import {
  focusEditor,
  getPluginType,
  PlateEditor,
  someNode,
  useEventPlateId,
  usePlateEditorState,
  Value,
} from '@udecode/plate-common';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export interface TableToolbarButtonProps<V extends Value>
  extends ToolbarButtonProps {
  header?: boolean;
  transform: (editor: PlateEditor<V>, options: { header?: boolean }) => void;
}

export const TableToolbarButton = <V extends Value>({
  id,
  transform,
  header,
  ...props
}: TableToolbarButtonProps<V>) => {
  const editor = usePlateEditorState<V>(useEventPlateId(id));
  const type = getPluginType(editor, ELEMENT_TABLE);
  const active = !!editor?.selection && someNode(editor, { match: { type } });

  return (
    <ToolbarButton
      active={active}
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
