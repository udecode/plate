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
export interface KbdNodeData {}
// Text node
export interface KbdNode extends Text, KbdNodeData {}

// renderLeaf options given as props
export interface KbdRenderLeafPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// Leaf props
export interface KbdLeafProps
  extends RenderLeafProps,
    RenderNodePropsOptions,
    KbdRenderLeafPropsOptions {
  leaf: KbdNode;
}

export type KbdKeyOption = 'kbd';

// Plugin options
export type KbdPluginOptionsValues = RenderNodeOptions &
  RootProps<KbdRenderLeafPropsOptions> &
  Partial<GetOnHotkeyToggleMarkOptions> &
  Deserialize;
export type KbdPluginOptionsKeys = keyof KbdPluginOptionsValues;
export type KbdPluginOptions<
  Value extends KbdPluginOptionsKeys = KbdPluginOptionsKeys
> = Partial<Record<KbdKeyOption, Pick<KbdPluginOptionsValues, Value>>>;

// renderLeaf options
export type KbdRenderLeafOptionsKeys = KbdPluginOptionsKeys;
export interface KbdRenderLeafOptions
  extends KbdPluginOptions<KbdRenderLeafOptionsKeys> {}

// deserialize options
export interface KbdDeserializeOptions
  extends KbdPluginOptions<'type' | 'rootProps' | 'deserialize'> {}
