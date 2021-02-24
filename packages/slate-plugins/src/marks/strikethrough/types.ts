import {
  Deserialize,
  GetOnHotkeyToggleMarkOptions,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '@udecode/slate-plugins-common';
import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';

// Data of Text node
export interface StrikethroughNodeData {}
// Text node
export interface StrikethroughNode extends Text, StrikethroughNodeData {}

// renderLeaf options given as props
export interface StrikethroughRenderLeafPropsOptions {}

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
