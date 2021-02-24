import {
  HtmlAttributesProps,
  LinkNode,
  RenderNodePropsOptions,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { RenderElementProps } from 'slate-react';
import { StyledComponentPropsOptions } from '../StyledComponent/StyledComponent.types';

export interface LinkElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert LinkElement classNames below
}

export interface LinkElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert LinkElement style props below
}

// renderElement options given as props
export interface LinkRenderElementPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// renderElement props
export interface LinkElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    LinkRenderElementPropsOptions {
  element: LinkNode;
}
