import React from 'react';
import {
  getPluginType,
  getPreventDefaultHandler,
  someNode,
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { ToolbarButton } from '@udecode/plate-ui-toolbar';
import { TableToolbarButtonProps } from './TableToolbarButton.types';

export const TableToolbarButton = withPlateEventProvider(
  ({ id, transform, header, ...props }: TableToolbarButtonProps) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;
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
  }
);
