import {
  GetOnHotkeyToggleMarkOptions,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '@udecode/slate-plugins-common';
import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';

// Data of Text node
export interface SearchHighlightNodeData {}
// Text node
export interface SearchHighlightNode extends Text, SearchHighlightNodeData {}

// renderLeaf options given as props
export interface SearchHighlightRenderLeafPropsOptions {}

// Leaf props
export interface SearchHighlightLeafProps
  extends RenderLeafProps,
    RenderNodePropsOptions,
    SearchHighlightRenderLeafPropsOptions {
  leaf: SearchHighlightNode;
}

export type SearchHighlightKeyOption = 'search_highlight';

// Plugin options
export type SearchHighlightPluginOptionsValues = RenderNodeOptions &
  RootProps<SearchHighlightRenderLeafPropsOptions> &
  Partial<GetOnHotkeyToggleMarkOptions>;
export type SearchHighlightPluginOptionsKeys = keyof SearchHighlightPluginOptionsValues;
export type SearchHighlightPluginOptions<
  Value extends SearchHighlightPluginOptionsKeys = SearchHighlightPluginOptionsKeys
> = Partial<
  Record<
    SearchHighlightKeyOption,
    Pick<SearchHighlightPluginOptionsValues, Value>
  >
>;

// renderLeaf options
export type SearchHighlightRenderLeafOptionsKeys = SearchHighlightPluginOptionsKeys;
export interface SearchHighlightRenderLeafOptions
  extends SearchHighlightPluginOptions<SearchHighlightRenderLeafOptionsKeys> {}

// deserialize options
export interface SearchHighlightDeserializeOptions
  extends SearchHighlightPluginOptions<'type' | 'rootProps'> {}

export interface SearchHighlightDecorateOptions
  extends SearchHighlightPluginOptions<'type'> {
  /**
   * Searching text to highlight
   */
  search: string;
}
