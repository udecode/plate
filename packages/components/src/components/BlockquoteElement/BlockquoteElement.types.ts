import {
  BlockquoteNode,
  HtmlAttributesProps,
  RenderNodePropsOptions,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';

export interface BlockquoteElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert BlockquoteElement classNames below
}

export interface BlockquoteElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert BlockquoteElement style props below
}

// renderElement options given as props
export interface BlockquoteRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    BlockquoteElementStyleProps,
    BlockquoteElementStyles
  >;
}

// renderElement props
export interface BlockquoteElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    BlockquoteRenderElementPropsOptions {
  element: BlockquoteNode;
}
