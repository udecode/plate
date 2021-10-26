import React from 'react';
import { getPreventDefaultHandler, someNode } from '@udecode/plate-common';
import {
  getPlatePluginType,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/plate-core';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { ToolbarButton } from '@udecode/plate-toolbar';
import { ToolbarTableProps } from './ToolbarTable.types';

export const ToolbarTable = ({
  transform,
  header,
  ...props
}: ToolbarTableProps) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));
  const type = getPlatePluginType(editor, ELEMENT_TABLE);

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
