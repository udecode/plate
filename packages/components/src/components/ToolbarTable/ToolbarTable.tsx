import * as React from 'react';
import {
  getPreventDefaultHandler,
  KEYS_TABLE,
  someNode,
  useEditorMultiOptions,
} from '@udecode/slate-plugins';
import { useSlate } from 'slate-react';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { ToolbarTableProps } from './ToolbarTable.types';

export const ToolbarTable = ({
  transform,
  header,
  ...props
}: ToolbarTableProps) => {
  const options = useEditorMultiOptions(KEYS_TABLE);

  const editor = useSlate();

  return (
    <ToolbarButton
      active={someNode(editor, { match: { type: options.table.type } })}
      onMouseDown={getPreventDefaultHandler(
        transform,
        editor,
        { header },
        options
      )}
      {...props}
    />
  );
};
