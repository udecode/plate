import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  active?: boolean;
  reversed?: boolean;
  onClick: (event: any) => void;
}

const Button = styled.span<ButtonProps>`
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
