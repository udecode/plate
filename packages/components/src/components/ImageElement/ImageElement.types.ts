import {
  HtmlAttributesProps,
  ImageNode,
  RenderNodePropsOptions,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';

export interface ImageElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert ImageElement classNames below
  img?: IStyle;
}

export interface ImageElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert ImageElement style props below
  selected?: boolean;
  focused?: boolean;
}

// renderElement options given as props
export interface ImageRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ImageElementStyleProps, ImageElementStyles>;
}

// renderElement props
export interface ImageElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    ImageRenderElementPropsOptions {
  element: ImageNode;
}
