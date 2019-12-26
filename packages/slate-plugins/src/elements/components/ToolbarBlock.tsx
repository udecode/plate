import React from 'react';
import { ToolbarButton } from 'common';
import { toggleList } from 'elements/list';
import { useSlate } from 'slate-react';
import styled from 'styled-components';
import { isBlockActive } from '../queries';

export interface BlockButtonProps {
  format: string;
  icon: any;
  command?: string;
}

const Icon = styled.span`
  font-size: 18px;
`;

export const ToolbarBlock = ({ format, icon }: BlockButtonProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={isBlockActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        editor.toggleBlock(format);
      }}
    >
      <Icon>{icon}</Icon>
    </ToolbarButton>
  );
};

export const ToolbarList = ({ format, icon }: BlockButtonProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={isBlockActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        toggleList(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </ToolbarButton>
  );
};
