import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { ToolbarBase } from '../Toolbar';
import {
  ToolbarProps,
  ToolbarStyleProps,
  ToolbarStyles,
} from '../Toolbar.types';
import { getHeadingToolbarStyles } from './HeadingToolbar.styles';

export const HeadingToolbar: React.FunctionComponent<ToolbarProps> = styled<
  ToolbarProps,
  ToolbarStyleProps,
  ToolbarStyles
>(ToolbarBase, getHeadingToolbarStyles(), undefined, {
  scope: 'HeadingToolbar',
});
