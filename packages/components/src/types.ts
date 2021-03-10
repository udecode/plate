import {
  ElementWithAttributes,
  HtmlAttributesProps,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import {
  classNamesFunction,
  IStyleFunctionOrObject,
} from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';

export interface NodeStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;
}

export interface NodeStyleSet {
  /**
   * Style for the root element.
   */
  root?: IStyle;
}

export type NodeStyles<
  TStyleProps = NodeStyleProps,
  TStyleSet = NodeStyleSet
> = IStyleFunctionOrObject<TStyleProps, TStyleSet>;

export interface ElementProps<
  TElement = Element,
  TStyleProps = NodeStyleProps,
  TStyleSet = NodeStyleSet
> extends Omit<RenderElementProps, 'element'>,
    HtmlAttributesProps,
    NodeStyleProps {
  element: TElement & ElementWithAttributes;

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: NodeStyles<TStyleProps, TStyleSet>;
}

export const getRootClassNames = <
  TStyleProps = NodeStyleProps,
  TStyleSet = NodeStyleSet
>() => classNamesFunction<TStyleProps, TStyleSet>();
