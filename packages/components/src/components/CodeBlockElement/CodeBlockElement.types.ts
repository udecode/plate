import {
  CodeBlockNode,
  HtmlAttributesProps,
  RenderNodePropsOptions,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';

export interface CodeBlockElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert CodeBlockElement classNames below
}

export interface CodeBlockElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert CodeBlockElement style props below
}

// renderElement options given as props
export interface CodeBlockRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    CodeBlockElementStyleProps,
    CodeBlockElementStyles
  >;
}

// renderElement props
export interface CodeBlockElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    CodeBlockRenderElementPropsOptions {
  element: CodeBlockNode;
}
