import { RenderNodeProps } from '@udecode/slate-plugins-core';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';

// Props for node styles
export interface NodeStyleProps extends Pick<RenderNodeProps, 'className'> {}

// Node styles
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

export interface StyledNodeProps<
  TStyleProps = NodeStyleProps,
  TStyleSet = NodeStyleSet
> extends RenderNodeProps {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: NodeStyles<TStyleProps, TStyleSet>;

  as?: any;
}
