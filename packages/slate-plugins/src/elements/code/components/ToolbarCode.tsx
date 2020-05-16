import React from 'react';
import { isNodeInSelection } from 'common/queries';
import { useSlate } from 'slate-react';
import { ToolbarButton, ToolbarElementProps } from 'components/Toolbar';
import { toggleCode } from '../transforms';
import { CODE } from '../types';

export const ToolbarCode = ({
  typeCode = CODE,
  ...props
}: ToolbarElementProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isNodeInSelection(editor, typeCode)}
      onMouseDown={(event: Event) => {
        event.preventDefault();

        toggleCode(editor, { typeCode });
      }}
    />
  );
};
