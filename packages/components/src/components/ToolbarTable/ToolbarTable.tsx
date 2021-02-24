import * as React from 'react';
import {
  DEFAULTS_TABLE,
  getPreventDefaultHandler,
  setDefaults,
  someNode,
} from '@udecode/slate-plugins';
import { useSlate } from 'slate-react';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { ToolbarTableProps } from './ToolbarTable.types';

export const ToolbarTable = ({ transform, ...props }: ToolbarTableProps) => {
  const { table } = setDefaults(props, DEFAULTS_TABLE);

  const editor = useSlate();

  return (
    <ToolbarButton
      active={someNode(editor, { match: { type: table.type } })}
      onMouseDown={getPreventDefaultHandler(transform, editor, props)}
      {...props}
    />
  );
};
