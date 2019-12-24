import React from 'react';
import { FormatButton, toggleList } from 'slate-plugins';
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

export const BlockButton = ({ format, icon }: BlockButtonProps) => {
  const editor = useSlate();

  return (
    <FormatButton
      active={isBlockActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        editor.toggleBlock(format);
      }}
    >
      <Icon>{icon}</Icon>
    </FormatButton>
  );
};

export const ListButton = ({ format, icon }: BlockButtonProps) => {
  const editor = useSlate();

  return (
    <FormatButton
      active={isBlockActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        toggleList(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </FormatButton>
  );
};
