import * as React from 'react';
import {
  getPreventDefaultHandler,
  isNodeTypeIn,
  setDefaults,
} from '@udecode/slate-plugins-common';
import { useSlate } from 'slate-react';
import { ToolbarButton } from '../../../../components/ToolbarButton/ToolbarButton';
import { DEFAULTS_TABLE } from '../../defaults';
import { ToolbarTableProps } from './ToolbarTable.types';

export const ToolbarTable = ({ transform, ...props }: ToolbarTableProps) => {
  const { table } = setDefaults(props, DEFAULTS_TABLE);

  const editor = useSlate();

  return (
    <ToolbarButton
      active={isNodeTypeIn(editor, table.type)}
      onMouseDown={getPreventDefaultHandler(transform, editor, props)}
      {...props}
    />
  );
};
