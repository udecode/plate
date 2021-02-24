import * as React from 'react';
import Tippy, { TippyProps } from '@tippyjs/react'; // optional
import { classNamesFunction, styled } from '@uifabric/utilities';
import { getToolbarButtonStyles } from './ToolbarButton.styles';
import {
  ToolbarButtonProps,
  ToolbarButtonStyleProps,
  ToolbarButtonStyles,
} from './ToolbarButton.types';

const getClassNames = classNamesFunction<
  ToolbarButtonStyleProps,
  ToolbarButtonStyles
>();

export const ToolbarButtonBase = ({
  className,
  styles,
  icon,
  tooltip,
  active,
  onMouseDown,
}: ToolbarButtonProps) => {
  const spanProps = {
    onMouseDown,
  };

  const classNames = getClassNames(styles, {
    className,
    active,
  });

  const tooltipProps: TippyProps = {
    content: '',
    arrow: true,
    offset: [0, 17],
    delay: 0,
    duration: [200, 0],
    hideOnClick: false,
    ...tooltip,
  };

  const button = (
    <span
      data-testid="ToolbarButton"
      className={classNames.root}
      {...spanProps}
    >
      {icon}
    </span>
  );

  return tooltip ? <Tippy {...tooltipProps}>{button}</Tippy> : button;
};

export const ToolbarButton = styled<
  ToolbarButtonProps,
  ToolbarButtonStyleProps,
  ToolbarButtonStyles
>(ToolbarButtonBase, getToolbarButtonStyles, undefined, {
  scope: 'ToolbarButton',
});
