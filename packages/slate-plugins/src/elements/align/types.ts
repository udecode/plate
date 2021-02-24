import {
  Deserialize,
  ElementWithAttributes,
  NodeToProps,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

// Data of Element node
export interface AlignNodeData {}
// Element node
export interface AlignNode extends ElementWithAttributes, AlignNodeData {}

export type AlignKeyOption =
  | 'align_left'
  | 'align_center'
  | 'align_justify'
  | 'align_right';

// Plugin options
export type AlignPluginOptionsValues = RenderNodeOptions &
  NodeToProps<AlignNode> &
  Deserialize;
export type AlignPluginOptionsKeys = keyof AlignPluginOptionsValues;
export type AlignPluginOptions<
  Value extends AlignPluginOptionsKeys = AlignPluginOptionsKeys
> = Partial<Record<AlignKeyOption, Pick<AlignPluginOptionsValues, Value>>>;

// renderElement options
export type AlignRenderElementOptionsKeys = AlignPluginOptionsKeys;
export interface AlignRenderElementOptions
  extends AlignPluginOptions<AlignRenderElementOptionsKeys> {}

// deserialize options
export interface AlignDeserializeOptions
  extends AlignPluginOptions<'type' | 'rootProps' | 'deserialize'> {}
