import {
  Deserialize,
  ElementWithAttributes,
  NodeToProps,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

export const ListHotkey = {
  TAB: 'Tab',
  ENTER: 'Enter',
  DELETE_BACKWARD: 'Backspace',
};

// Data of Element node
export interface ListNodeData {}
// Element node
export interface ListNode extends ElementWithAttributes, ListNodeData {}

export type ListKeyOption = 'ul' | 'ol' | 'li' | 'p';

// Plugin options
export type ListPluginOptionsValues = RenderNodeOptions &
  NodeToProps<ListNode> &
  Deserialize;
export type ListPluginOptionsKeys = keyof ListPluginOptionsValues;
export type ListPluginOptions<
  Value extends ListPluginOptionsKeys = ListPluginOptionsKeys
> = Partial<Record<ListKeyOption, Pick<ListPluginOptionsValues, Value>>>;

// renderElement options
export type ListRenderElementOptionsKeys = ListPluginOptionsKeys;
export interface ListRenderElementOptions
  extends ListPluginOptions<ListRenderElementOptionsKeys> {}

// deserialize options
export interface ListDeserializeOptions
  extends ListPluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface ListOnKeyDownOptions extends ListPluginOptions<'type'> {}
export interface ListOptions extends ListPluginOptions<'type'> {}

export interface WithListOptions extends ListOptions {
  /**
   * Valid children types for list items, in addition to p and ul types.
   */
  validLiChildrenTypes?: string[];
}

export interface ListNormalizerOptions
  extends Pick<WithListOptions, 'validLiChildrenTypes'> {}
