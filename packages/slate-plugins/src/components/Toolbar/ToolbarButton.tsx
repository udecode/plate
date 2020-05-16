import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  active?: boolean;
  reversed?: boolean;
  onMouseDown?: (event: any) => void;
  [key: string]: any;
}

const Button = styled.span<ButtonProps>`
  user-select: none;
  cursor: pointer;
  color: ${({ active, reversed }) =>
    reversed ? (active ? 'white' : '#aaa') : active ? 'black' : '#ccc'};
`;

export interface ToolbarButtonProps extends ButtonProps {
  icon: any;
}

export const ToolbarButton = ({
  icon,
  reversed = false,
  ...props
}: ToolbarButtonProps) => (
  <Button {...props} reversed={reversed}>
    {icon}
  </Button>
);
