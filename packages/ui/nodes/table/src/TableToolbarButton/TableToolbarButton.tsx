import React from 'react';
import {
  getPluginType,
  getPreventDefaultHandler,
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

  return (
    <ToolbarButton
      active={
        !!editor?.selection &&
        someNode(editor, {
          match: { type },
        })
      }
      onMouseDown={
        !!type && editor
          ? getPreventDefaultHandler(transform, editor, { header })
          : undefined
      }
      {...props}
    />
  );
};
