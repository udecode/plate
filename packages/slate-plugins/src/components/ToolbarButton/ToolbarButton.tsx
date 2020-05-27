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

  width: 28px;
  height: 24px;
  user-select: none;
  cursor: pointer;
  vertical-align: middle;

  svg {
    display: block;
    width: 20px;
    height: 20px;
  }
`;

export const ToolbarButton = ({
  icon,
  theme = 'dark',
  tooltip,
  active,
  ...props
}: ToolbarButtonProps) => {
  const tooltipProps: TippyProps = {
    content: '',
    arrow: true,
    offset: [0, 17],
    delay: 0,
    duration: [200, 0],
    hideOnClick: false,
    ...tooltip,
  };

  let className = 'slate-ToolbarButton';
  if (active) className += ' slate-ToolbarButton-active';

  const button = (
    <Button {...props} theme={theme} className={className}>
      {icon}
    </Button>
  );

  return tooltip ? <Tippy {...tooltipProps}>{button}</Tippy> : button;
};
