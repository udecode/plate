import * as React from 'react';
import {
  getPreventDefaultHandler,
  someNode,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/slate-plugins-core';
import { ELEMENT_TABLE } from '@udecode/slate-plugins-table';
import { ToolbarButton } from '@udecode/slate-plugins-toolbar';
import { ToolbarTableProps } from './ToolbarTable.types';

export const ToolbarTable = ({
  transform,
  header,
  ...props
}: ToolbarTableProps) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));
  const type = getSlatePluginType(editor, ELEMENT_TABLE);

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
