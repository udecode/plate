// renderElement options given as props
import {
  AlignNode,
  HtmlAttributesProps,
  RenderNodePropsOptions,
} from '@udecode/slate-plugins';
import { RenderElementProps } from 'slate-react';
import { StyledComponentPropsOptions } from '../StyledComponent/StyledComponent.types';

export interface AlignRenderElementPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// renderElement props
export interface AlignElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    AlignRenderElementPropsOptions {
  element: AlignNode;
}
