import * as React from 'react';
import {
  getPreventDefaultHandler,
  someNode,
} from '@udecode/slate-plugins-common';
import { getSlatePluginType, useTSlate } from '@udecode/slate-plugins-core';
import { ELEMENT_TABLE } from '@udecode/slate-plugins-table';
import { ToolbarButton } from '@udecode/slate-plugins-toolbar';
import { ToolbarTableProps } from './ToolbarTable.types';

export const ToolbarTable = ({
  transform,
  header,
  ...props
}: ToolbarTableProps) => {
  const editor = useTSlate();

  return (
    <ToolbarButton
      active={someNode(editor, {
        match: { type: getSlatePluginType(editor, ELEMENT_TABLE) },
      })}
      onMouseDown={getPreventDefaultHandler(transform, editor, { header })}
      {...props}
    />
  );
};
