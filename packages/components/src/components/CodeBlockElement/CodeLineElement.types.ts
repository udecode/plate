import {
  CodeLineNode,
  HtmlAttributesProps,
  RenderNodePropsOptions,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';

export interface CodeLineElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert CodeLineElement classNames below
}

export interface CodeLineElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert CodeLineElement style props below
}

export interface CodeLineRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    CodeLineElementStyleProps,
    CodeLineElementStyles
  >;
}

// renderElement props
export interface CodeLineElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    CodeLineRenderElementPropsOptions {
  element: CodeLineNode;
}
