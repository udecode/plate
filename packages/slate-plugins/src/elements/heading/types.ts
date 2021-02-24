import {
  Deserialize,
  ElementWithAttributes,
  NodeToProps,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

// Data of Element node
export interface HeadingNodeData {}
// Element node
export interface HeadingNode extends ElementWithAttributes, HeadingNodeData {}

export interface HeadingLevelsOption {
  /**
   * Heading levels supported from 1 to `levels`
   */
  levels?: number;
}

export type HeadingKeyOption = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

// Plugin options
export type HeadingPluginOptionsValues = RenderNodeOptions &
  NodeToProps<HeadingNode> &
  Deserialize;
export type HeadingPluginOptionsKeys = keyof HeadingPluginOptionsValues;
export type HeadingPluginOptions<
  Value extends HeadingPluginOptionsKeys = HeadingPluginOptionsKeys
> = Partial<Record<HeadingKeyOption, Pick<HeadingPluginOptionsValues, Value>>> &
  HeadingLevelsOption;

// renderElement options
export type HeadingRenderElementOptionsKeys = HeadingPluginOptionsKeys;
export interface HeadingRenderElementOptions
  extends HeadingPluginOptions<HeadingRenderElementOptionsKeys>,
    HeadingLevelsOption {}

// deserialize options
export interface HeadingDeserializeOptions
  extends HeadingPluginOptions<'type' | 'rootProps' | 'deserialize'>,
    HeadingLevelsOption {}
