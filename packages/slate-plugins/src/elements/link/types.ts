import {
  Deserialize,
  ElementWithAttributes,
  NodeToProps,
  RangeBeforeOptions,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

// Data of Element node
export interface LinkNodeData {
  url: string;
}
// Element node
export interface LinkNode extends ElementWithAttributes, LinkNodeData {}

export type LinkKeyOption = 'link';

// Plugin options
export type LinkPluginOptionsValues = RenderNodeOptions &
  NodeToProps<LinkNode> &
  Deserialize & {
    /**
     * Callback to validate an url.
     */
    isUrl?: (text: string) => boolean;
    attribute?: string;
  };
export type LinkPluginOptionsKeys = keyof LinkPluginOptionsValues;
export type LinkPluginOptions<
  Value extends LinkPluginOptionsKeys = LinkPluginOptionsKeys
> = Partial<Record<LinkKeyOption, Pick<LinkPluginOptionsValues, Value>>>;

// renderElement options
export type LinkRenderElementOptionsKeys = LinkPluginOptionsKeys;
export interface LinkRenderElementOptions
  extends LinkPluginOptions<
    'type' | 'component' | 'rootProps' | 'nodeToProps'
  > {}

// deserialize options
export interface LinkDeserializeOptions
  extends LinkPluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface WithLinkOptions extends LinkPluginOptions<'type' | 'isUrl'> {
  /**
   * Allow custom config for rangeBeforeOptions.
   */
  rangeBeforeOptions?: RangeBeforeOptions;
}

export interface LinkOptions extends LinkPluginOptions<'type'> {}
