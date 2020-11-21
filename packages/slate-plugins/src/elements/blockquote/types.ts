import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';
import {
  Deserialize,
  ElementWithAttributes,
  HtmlAttributesProps,
  NodeToProps,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '../../common/types/PluginOptions.types';

// Data of Element node
export interface BlockquoteNodeData {}

// Element node
export interface BlockquoteNode
  extends ElementWithAttributes,
    BlockquoteNodeData {}

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

export type BlockquoteKeyOption = 'blockquote';

// Plugin options
export type BlockquotePluginOptionsValues = RenderNodeOptions &
  RootProps<BlockquoteRenderElementPropsOptions> &
  NodeToProps<BlockquoteNode, BlockquoteRenderElementPropsOptions> &
  Deserialize;
export type BlockquotePluginOptionsKeys = keyof BlockquotePluginOptionsValues;
export type BlockquotePluginOptions<
  Value extends BlockquotePluginOptionsKeys = BlockquotePluginOptionsKeys
> = Partial<
  Record<BlockquoteKeyOption, Pick<BlockquotePluginOptionsValues, Value>>
>;

// renderElement options
export type BlockquoteRenderElementOptionsKeys = BlockquotePluginOptionsKeys;
export interface BlockquoteRenderElementOptions
  extends BlockquotePluginOptions<BlockquoteRenderElementOptionsKeys> {}

// deserialize options
export interface BlockquoteDeserializeOptions
  extends BlockquotePluginOptions<'type' | 'rootProps' | 'deserialize'> {}

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
