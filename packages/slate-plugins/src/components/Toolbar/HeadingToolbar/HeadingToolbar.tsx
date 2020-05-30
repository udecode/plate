import { styled } from '@uifabric/utilities';
import { ToolbarBase } from '../Toolbar';
import {
  ToolbarProps,
  ToolbarStyleProps,
  ToolbarStyles,
} from '../Toolbar.types';
import { getHeadingToolbarStyles } from './HeadingToolbar.styles';

export const HeadingToolbar = styled<
  ToolbarProps,
  ToolbarStyleProps,
  ToolbarStyles
>(ToolbarBase, getHeadingToolbarStyles(), undefined, {
  scope: 'HeadingToolbar',
});
