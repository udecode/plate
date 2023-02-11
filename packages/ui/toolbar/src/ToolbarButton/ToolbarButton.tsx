import React from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
import clsx from 'clsx';
import { getToolbarButtonStyles } from './ToolbarButton.styles';
import { ToolbarButtonProps } from './ToolbarButton.types';

export const ToolbarButton = (props: ToolbarButtonProps) => {
  const {
    id,
    active: _active,
    icon,
    tooltip,
    className,
    actionHandler = 'onClick',
    onClick,
    ...buttonProps
  } = props;

  const tooltipProps: TippyProps = {
    content: '',
    offset: [0, 0],
    arrow: false,
    delay: 500,
    duration: [200, 0],
    hideOnClick: false,
    ...tooltip,
  };

  const { root, active } = getToolbarButtonStyles(props);

  // this can replace onClick by onMouseDown
  buttonProps[actionHandler] = onClick;

  const button = (
    <button
      type="button"
      data-testid="ToolbarButton"
      css={root.css}
      className={clsx(root.className, active?.className, className)}
      {...buttonProps}
    >
      {icon}
    </button>
  );

  return tooltip ? <Tippy {...tooltipProps}>{button}</Tippy> : button;
};
