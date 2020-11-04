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
export interface UnderlineNodeData {}
// Text node
export interface UnderlineNode extends Text, UnderlineNodeData {}

// renderLeaf options given as props
export interface UnderlineRenderLeafPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// Leaf props
export interface UnderlineLeafProps
  extends RenderLeafProps,
    RenderNodePropsOptions,
    UnderlineRenderLeafPropsOptions {
  leaf: UnderlineNode;
}

export type UnderlineKeyOption = 'underline';

// Plugin options
export type UnderlinePluginOptionsValues = RenderNodeOptions &
  RootProps<UnderlineRenderLeafPropsOptions> &
  Partial<GetOnHotkeyToggleMarkOptions> &
  Deserialize;
export type UnderlinePluginOptionsKeys = keyof UnderlinePluginOptionsValues;
export type UnderlinePluginOptions<
  Value extends UnderlinePluginOptionsKeys = UnderlinePluginOptionsKeys
> = Partial<
  Record<UnderlineKeyOption, Pick<UnderlinePluginOptionsValues, Value>>
>;

// renderLeaf options
export type UnderlineRenderLeafOptionsKeys = UnderlinePluginOptionsKeys;
export interface UnderlineRenderLeafOptions
  extends UnderlinePluginOptions<UnderlineRenderLeafOptionsKeys> {}

// deserialize options
export interface UnderlineDeserializeOptions
  extends UnderlinePluginOptions<'type' | 'rootProps' | 'deserialize'> {}
