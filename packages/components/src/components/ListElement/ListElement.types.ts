// renderElement options given as props
import {
  HtmlAttributesProps,
  ListNode,
  RenderNodePropsOptions,
} from '@udecode/slate-plugins';
import { RenderElementProps } from 'slate-react';
import { StyledComponentPropsOptions } from '../StyledComponent/StyledComponent.types';

export interface ListRenderElementPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// renderElement props
export interface ListElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    ListRenderElementPropsOptions {
  element: ListNode;
}
