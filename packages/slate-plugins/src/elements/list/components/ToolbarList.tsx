import React from 'react';
import { ToolbarFormatProps } from 'common/types';
import { ToolbarBlock } from 'elements/components';
import { useSlate } from 'slate-react';
import { toggleList } from '../transforms';

export const ToolbarList = (props: ToolbarFormatProps) => {
  const editor = useSlate();
  const { format } = props;

  return (
    <ToolbarBlock
      {...props}
      onClick={(event: Event) => {
        event.preventDefault();
        toggleList(editor, format);
      }}
    />
  );
};
