// renderElement options given as props
import {
  HtmlAttributesProps,
  ParagraphNode,
  RenderNodePropsOptions,
} from '@udecode/slate-plugins';
import { RenderElementProps } from 'slate-react';
import { StyledComponentPropsOptions } from '../StyledComponent/StyledComponent.types';

export interface ParagraphRenderElementPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// renderElement props
export interface ParagraphElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    ParagraphRenderElementPropsOptions {
  element: ParagraphNode;
}
