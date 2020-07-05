import * as React from 'react';
import { useSlate } from 'slate-react';
import { isNodeInSelection } from '../../../common/queries';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '../../../components/ToolbarButton';
import { insertAlign } from '../transforms';

export const ToolbarAlign = ({ type, ...props }: ToolbarButtonProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={isNodeInSelection(editor, type)}
      onMouseDown={(event) => {
        event.preventDefault();
        insertAlign(editor, { typeAlign: type });
      }}
      {...props}
    />
  );
};
