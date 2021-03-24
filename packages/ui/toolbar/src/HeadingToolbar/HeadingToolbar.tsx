import * as React from 'react';
import { ClassName, RootStyleSet } from '@udecode/slate-plugins-ui-fluent';
import { styled } from '@uifabric/utilities';
import { ToolbarBase } from '../Toolbar/Toolbar';
import { ToolbarProps } from '../Toolbar/Toolbar.types';
import { getHeadingToolbarStyles } from './HeadingToolbar.styles';

export const HeadingToolbar: React.FunctionComponent<ToolbarProps> = styled<
  ToolbarProps,
  ClassName,
  RootStyleSet
>(ToolbarBase, getHeadingToolbarStyles(), undefined, {
  scope: 'HeadingToolbar',
});
