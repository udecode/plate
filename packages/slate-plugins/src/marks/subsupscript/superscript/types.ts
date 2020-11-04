import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import {
  Deserialize,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '../../../common/types/PluginOptions.types';
import { GetOnHotkeyToggleMarkOptions } from '../../../common/utils/getOnHotkeyToggleMark';
import { StyledComponentPropsOptions } from '../../../components/StyledComponent/StyledComponent.types';

// Data of Text node
export interface SuperscriptNodeData {}
// Text node
export interface SuperscriptNode extends Text, SuperscriptNodeData {}

// renderLeaf options given as props
export interface SuperscriptRenderLeafPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// Leaf props
export interface SuperscriptLeafProps
  extends RenderLeafProps,
    RenderNodePropsOptions,
    SuperscriptRenderLeafPropsOptions {
  leaf: SuperscriptNode;
}

export type SuperscriptKeyOption = 'superscript';

// Plugin options
export type SuperscriptPluginOptionsValues = RenderNodeOptions &
  RootProps<SuperscriptRenderLeafPropsOptions> &
  Partial<GetOnHotkeyToggleMarkOptions> &
  Deserialize;
export type SuperscriptPluginOptionsKeys = keyof SuperscriptPluginOptionsValues;
export type SuperscriptPluginOptions<
  Value extends SuperscriptPluginOptionsKeys = SuperscriptPluginOptionsKeys
> = Partial<
  Record<SuperscriptKeyOption, Pick<SuperscriptPluginOptionsValues, Value>>
>;

// renderLeaf options
export type SuperscriptRenderLeafOptionsKeys = SuperscriptPluginOptionsKeys;
export interface SuperscriptRenderLeafOptions
  extends SuperscriptPluginOptions<SuperscriptRenderLeafOptionsKeys> {}

// deserialize options
export interface SuperscriptDeserializeOptions
  extends SuperscriptPluginOptions<'type' | 'rootProps' | 'deserialize'> {}
