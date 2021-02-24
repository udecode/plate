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
export interface SubscriptNodeData {}
// Text node
export interface SubscriptNode extends Text, SubscriptNodeData {}

// renderLeaf options given as props
export interface SubscriptRenderLeafPropsOptions {}

// Leaf props
export interface SubscriptLeafProps
  extends RenderLeafProps,
    RenderNodePropsOptions,
    SubscriptRenderLeafPropsOptions {
  leaf: SubscriptNode;
}

export type SubscriptKeyOption = 'subscript';

// Plugin options
export type SubscriptPluginOptionsValues = RenderNodeOptions &
  RootProps<SubscriptRenderLeafPropsOptions> &
  Partial<GetOnHotkeyToggleMarkOptions> &
  Deserialize;
export type SubscriptPluginOptionsKeys = keyof SubscriptPluginOptionsValues;
export type SubscriptPluginOptions<
  Value extends SubscriptPluginOptionsKeys = SubscriptPluginOptionsKeys
> = Partial<
  Record<SubscriptKeyOption, Pick<SubscriptPluginOptionsValues, Value>>
>;

// renderLeaf options
export type SubscriptRenderLeafOptionsKeys = SubscriptPluginOptionsKeys;
export interface SubscriptRenderLeafOptions
  extends SubscriptPluginOptions<SubscriptRenderLeafOptionsKeys> {}

// deserialize options
export interface SubscriptDeserializeOptions
  extends SubscriptPluginOptions<'type' | 'rootProps' | 'deserialize'> {}
