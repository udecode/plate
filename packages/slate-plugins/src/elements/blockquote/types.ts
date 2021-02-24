import {
  Deserialize,
  ElementWithAttributes,
  NodeToProps,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

// Data of Element node
export interface BlockquoteNodeData {}

// Element node
export interface BlockquoteNode
  extends ElementWithAttributes,
    BlockquoteNodeData {}

export type BlockquoteKeyOption = 'blockquote';

// Plugin options
export type BlockquotePluginOptionsValues = RenderNodeOptions &
  NodeToProps<BlockquoteNode> &
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
