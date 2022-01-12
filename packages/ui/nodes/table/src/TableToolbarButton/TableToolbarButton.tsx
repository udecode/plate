import React from 'react';
import {
  getPluginType,
  getPreventDefaultHandler,
  someNode,
  usePlateEditorState,
  withEditor,
} from '@udecode/plate-core';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { ToolbarButton } from '@udecode/plate-ui-toolbar';
import { TableToolbarButtonProps } from './TableToolbarButton.types';

export const TableToolbarButton = withEditor(
  ({ transform, header, ...props }: TableToolbarButtonProps) => {
    const editor = usePlateEditorState()!;
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
