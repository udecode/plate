import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { ToolbarBase } from '../Toolbar/Toolbar';
import { ToolbarProps, ToolbarStyleProps } from '../Toolbar/Toolbar.types';
import { getHeadingToolbarStyles } from './HeadingToolbar.styles';

export const HeadingToolbar: React.FunctionComponent<ToolbarProps> = styled<
  ToolbarProps,
  ToolbarStyleProps,
  NonNullable<ToolbarProps['styles']>
>(ToolbarBase, getHeadingToolbarStyles(), undefined, {
  scope: 'HeadingToolbar',
});
