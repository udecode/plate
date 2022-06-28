import React from 'react';
import Tippy, { TippyProps } from '@tippyjs/react'; // optional
import clsx from 'clsx';
import { getToolbarButtonStyles } from './ToolbarButton.styles';
import { ToolbarButtonProps } from './ToolbarButton.types';

export const ToolbarButton = (props: ToolbarButtonProps) => {
  const { icon, tooltip, onMouseDown } = props;

  const spanProps = {
    onMouseDown,
  };

  const tooltipProps: TippyProps = {
    content: '',
    arrow: true,
    offset: [0, 17],
    delay: 0,
    duration: [200, 0],
    hideOnClick: false,
    ...tooltip,
  };

  const { root, active } = getToolbarButtonStyles(props);

  const button = (
    <span
      data-testid="ToolbarButton"
      css={root.css}
      className={clsx(root.className, active?.className)}
      {...spanProps}
    >
      {icon}
    </span>
  );

  return tooltip ? <Tippy {...tooltipProps}>{button}</Tippy> : button;
};
