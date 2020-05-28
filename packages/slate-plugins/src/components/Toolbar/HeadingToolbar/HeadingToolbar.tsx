import { styled } from '@uifabric/utilities';
import { ToolbarBase } from 'components/Toolbar/Toolbar';
import {
  ToolbarProps,
  ToolbarStyleProps,
  ToolbarStyles,
} from 'components/Toolbar/Toolbar.types';
import { getHeadingToolbarStyles } from './HeadingToolbar.styles';

export const HeadingToolbar = styled<
  ToolbarProps,
  ToolbarStyleProps,
  ToolbarStyles
>(ToolbarBase, getHeadingToolbarStyles(), undefined, {
  scope: 'HeadingToolbar',
});
