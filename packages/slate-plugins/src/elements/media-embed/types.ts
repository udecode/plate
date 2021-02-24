import {
  Deserialize,
  ElementWithAttributes,
  NodeToProps,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

// Data of Element node
export interface MediaEmbedNodeData {
  url: string;
}
// Element node
export interface MediaEmbedNode
  extends ElementWithAttributes,
    MediaEmbedNodeData {}

export type MediaEmbedKeyOption = 'media_embed';

// Plugin options
export type MediaEmbedPluginOptionsValues = RenderNodeOptions &
  NodeToProps<MediaEmbedNode> &
  Deserialize;
export type MediaEmbedPluginOptionsKeys = keyof MediaEmbedPluginOptionsValues;
export type MediaEmbedPluginOptions<
  Value extends MediaEmbedPluginOptionsKeys = MediaEmbedPluginOptionsKeys
> = Partial<
  Record<MediaEmbedKeyOption, Pick<MediaEmbedPluginOptionsValues, Value>>
>;

// renderElement options
export type MediaEmbedRenderElementOptionsKeys = MediaEmbedPluginOptionsKeys;
export interface MediaEmbedRenderElementOptions
  extends MediaEmbedPluginOptions<MediaEmbedRenderElementOptionsKeys> {}

// deserialize options
export interface MediaEmbedDeserializeOptions
  extends MediaEmbedPluginOptions<'type' | 'rootProps' | 'deserialize'> {}
