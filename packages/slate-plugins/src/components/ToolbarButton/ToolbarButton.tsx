import React from 'react';
import Tippy, { TippyProps } from '@tippyjs/react'; // optional
import styled from 'styled-components';
import {
  ButtonStyleProps,
  ToolbarButtonProps,
} from 'components/ToolbarButton/types';

const Button = styled.span<ButtonStyleProps>`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 30px;
  height: 30px;
  user-select: none;
  cursor: pointer;
  vertical-align: middle;
  color: ${({ active, reversed }) => {
    if (active) {
      if (reversed) return 'white';
      return 'black';
    }
  }};

  svg {
    display: block;
    width: 20px;
    height: 20px;
  }
`;

export const ToolbarButton = ({
  icon,
  reversed = false,
  tooltip = {},
  ...props
}: ToolbarButtonProps) => {
  const tooltipProps: TippyProps = {
    content: '',
    arrow: true,
    offset: [0, 10],
    delay: 0,
    duration: [200, 0],
    hideOnClick: false,
    ...tooltip,
  };

  const button = (
    <Button {...props} reversed={reversed}>
      {icon}
    </Button>
  );

  return tooltip ? <Tippy {...tooltipProps}>{button}</Tippy> : button;
};
