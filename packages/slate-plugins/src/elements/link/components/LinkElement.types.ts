import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { LinkRenderElementProps } from '../types';

export interface LinkElementProps extends LinkRenderElementProps {
  /**
   * Additional class name to provide on the root element, in addition to the slate-LinkElement class.
   */
  className?: string;

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<LinkElementStyleProps, LinkElementStyles>;

  // Insert LinkElement props below
}

export interface LinkElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert LinkElement style props below
}

export interface LinkElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert LinkElement classNames below
}
