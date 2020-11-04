import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import {
  Deserialize,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '../../common/types/PluginOptions.types';
import { GetOnHotkeyToggleMarkOptions } from '../../common/utils/getOnHotkeyToggleMark';
import { StyledComponentPropsOptions } from '../../components/StyledComponent/StyledComponent.types';

// Data of Text node
export interface HighlightNodeData {}
// Text node
export interface HighlightNode extends Text, HighlightNodeData {}

// renderLeaf options given as props
export interface HighlightRenderLeafPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// Leaf props
export interface HighlightLeafProps
  extends RenderLeafProps,
    RenderNodePropsOptions,
    HighlightRenderLeafPropsOptions {
  leaf: HighlightNode;
}

export type HighlightKeyOption = 'highlight';

// Plugin options
export type HighlightPluginOptionsValues = RenderNodeOptions &
  RootProps<HighlightRenderLeafPropsOptions> &
  Partial<GetOnHotkeyToggleMarkOptions> &
  Deserialize;
export type HighlightPluginOptionsKeys = keyof HighlightPluginOptionsValues;
export type HighlightPluginOptions<
  Value extends HighlightPluginOptionsKeys = HighlightPluginOptionsKeys
> = Partial<
  Record<HighlightKeyOption, Pick<HighlightPluginOptionsValues, Value>>
>;

// renderLeaf options
export type HighlightRenderLeafOptionsKeys = HighlightPluginOptionsKeys;
export interface HighlightRenderLeafOptions
  extends HighlightPluginOptions<HighlightRenderLeafOptionsKeys> {}

// deserialize options
export interface HighlightDeserializeOptions
  extends HighlightPluginOptions<'type' | 'rootProps' | 'deserialize'> {}
