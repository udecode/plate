import React from 'react';
import { useSlate } from 'slate-react';
import { ToolbarButton, ToolbarButtonProps } from '../../../common/components';
import { isBlockActive } from '../../queries';
import { deleteTable } from '../transforms';
import { TableType } from '../types';

export const ToolbarDeleteTable = (props: ToolbarButtonProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isBlockActive(editor, TableType.TABLE)}
      disabled={!isBlockActive(editor, TableType.TABLE)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        deleteTable(editor);
      }}
    />
  );
};
