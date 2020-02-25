import React from 'react';
import { ToolbarButton } from 'common';
import { ToolbarElementProps } from 'common/types';
import { useSlate } from 'slate-react';
import { isBlockActive } from '../../queries';
import { toggleCode } from '../transforms';
import { CODE } from '../types';

export const ToolbarCode = (props: ToolbarElementProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isBlockActive(editor, CODE)}
      onMouseDown={(event: Event) => {
        event.preventDefault();

        toggleCode(editor);
      }}
    />
  );
};
