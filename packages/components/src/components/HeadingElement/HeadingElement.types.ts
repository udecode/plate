// renderElement options given as props
import {
  HeadingNode,
  HtmlAttributesProps,
  RenderNodePropsOptions,
} from '@udecode/slate-plugins';
import { RenderElementProps } from 'slate-react';
import { StyledComponentPropsOptions } from '../StyledComponent/StyledComponent.types';

export interface HeadingRenderElementPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {
  baseFontSize?: number;
}

// renderElement props
export interface HeadingElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    HeadingRenderElementPropsOptions {
  element: HeadingNode;
}
