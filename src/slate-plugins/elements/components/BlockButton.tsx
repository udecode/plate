import React from 'react';
import { Button } from 'slate-plugins/common/components/Button';
import { useSlate } from 'slate-react';
import styled from 'styled-components';
import { isBlockActive } from '../format/queries';

interface Props {
  format: string;
  icon: any;
}

const Icon = styled.span`
  font-size: 18px;
`;

export const BlockButton = ({ format, icon }: Props) => {
  const editor = useSlate();

  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        editor.exec({ type: 'format_block', format });
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};
