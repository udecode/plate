import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps, RenderLeafProps } from 'slate-react';
import {
  HtmlAttributesProps,
  RenderNodePropsOptions,
} from '../../common/types/PluginOptions.types';

export interface StyledComponentPropsOptions extends RenderNodePropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    StyledComponentStyleProps,
    StyledComponentStyles
  >;

  htmlAttributes?: { [key: string]: any };

  children?: any;
}

export interface StyledElementProps
  extends Omit<StyledComponentProps, 'children'>,
    HtmlAttributesProps,
    RenderElementProps {}

export interface StyledLeafProps
  extends Omit<StyledComponentProps, 'children'>,
    RenderLeafProps {}

export interface StyledComponentProps extends StyledComponentPropsOptions {}

export interface StyledComponentStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert StyledComponent style props below
}

export interface StyledComponentStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert StyledComponent classNames below
}
