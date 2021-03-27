import * as React from 'react';
import Tippy, { TippyProps } from '@tippyjs/react'; // optional
import {
  getRootClassNames,
  RootStyleSet,
} from '@udecode/slate-plugins-ui-fluent';
import { styled } from '@uifabric/utilities';
import { getToolbarButtonStyles } from './ToolbarButton.styles';
import {
  ToolbarButtonProps,
  ToolbarButtonStyleProps,
} from './ToolbarButton.types';

const getClassNames = getRootClassNames<
  ToolbarButtonStyleProps,
  RootStyleSet
>();

export const ToolbarButtonBase = ({
  className,
  styles,
  icon,
  tooltip,
  active,
  onMouseDown,
  as: Tag = 'span',
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
    <Tag data-testid="ToolbarButton" className={classNames.root} {...spanProps}>
      {icon}
    </Tag>
  );

  return tooltip ? <Tippy {...tooltipProps}>{button}</Tippy> : button;
};

export const ToolbarButton = styled<
  ToolbarButtonProps,
  ToolbarButtonStyleProps,
  RootStyleSet
>(ToolbarButtonBase, getToolbarButtonStyles, undefined, {
  scope: 'ToolbarButton',
});
