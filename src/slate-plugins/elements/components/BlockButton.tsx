import React from 'react';
import { Button } from 'slate-plugins/common/components/Button';
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

export const BlockButton = ({
  format,
  icon,
  command = 'toggle_block',
}: BlockButtonProps) => {
  const editor = useSlate();

  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        editor.exec({ type: command, format });
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};
