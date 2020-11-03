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
export interface StrikethroughNodeData {}
// Text node
export interface StrikethroughNode extends Text, StrikethroughNodeData {}

// renderLeaf options given as props
export interface StrikethroughRenderLeafPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// Leaf props
export interface StrikethroughLeafProps
  extends RenderLeafProps,
    RenderNodePropsOptions,
    StrikethroughRenderLeafPropsOptions {
  leaf: StrikethroughNode;
}

export type StrikethroughKeyOption = 'strikethrough';

// Plugin options
export type StrikethroughPluginOptionsValues = RenderNodeOptions &
  RootProps<StrikethroughRenderLeafPropsOptions> &
  Partial<GetOnHotkeyToggleMarkOptions> &
  Deserialize;
export type StrikethroughPluginOptionsKeys = keyof StrikethroughPluginOptionsValues;
export type StrikethroughPluginOptions<
  Value extends StrikethroughPluginOptionsKeys = StrikethroughPluginOptionsKeys
> = Partial<
  Record<StrikethroughKeyOption, Pick<StrikethroughPluginOptionsValues, Value>>
>;

// renderLeaf options
export type StrikethroughRenderLeafOptionsKeys = StrikethroughPluginOptionsKeys;
export interface StrikethroughRenderLeafOptions
  extends StrikethroughPluginOptions<StrikethroughRenderLeafOptionsKeys> {}

// deserialize options
export interface StrikethroughDeserializeOptions
  extends StrikethroughPluginOptions<'type' | 'rootProps' | 'deserialize'> {}
