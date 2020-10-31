import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import {
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '../../common/types/PluginOptions.types';
import { GetOnHotkeyToggleMarkOptions } from '../../common/utils/getOnHotkeyToggleMark';
import { StyledComponentPropsOptions } from '../../components/StyledComponent/StyledComponent.types';

// Data of Text node
export interface SearchHighlightNodeData {}
// Text node
export interface SearchHighlightNode extends Text, SearchHighlightNodeData {}

// renderLeaf options given as props
export interface SearchHighlightRenderLeafPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

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
