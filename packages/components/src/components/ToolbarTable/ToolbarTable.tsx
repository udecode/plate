import * as React from 'react';
import {
  getPreventDefaultHandler,
  someNode,
} from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { ELEMENT_TABLE } from '@udecode/slate-plugins-table';
import { useSlate } from 'slate-react';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { ToolbarTableProps } from './ToolbarTable.types';

export const ToolbarTable = ({
  transform,
  header,
  ...props
}: ToolbarTableProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={someNode(editor, {
        match: { type: getPluginType(editor, ELEMENT_TABLE) },
      })}
      onMouseDown={getPreventDefaultHandler(transform, editor, { header })}
      {...props}
    />
  );
};
