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
export interface ItalicNodeData {}
// Text node
export interface ItalicNode extends Text, ItalicNodeData {}

// renderLeaf options given as props
export interface ItalicRenderLeafPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// Leaf props
export interface ItalicLeafProps
  extends RenderLeafProps,
    RenderNodePropsOptions,
    ItalicRenderLeafPropsOptions {
  leaf: ItalicNode;
}

export type ItalicKeyOption = 'italic';

// Plugin options
export type ItalicPluginOptionsValues = RenderNodeOptions &
  RootProps<ItalicRenderLeafPropsOptions> &
  Partial<GetOnHotkeyToggleMarkOptions> &
  Deserialize;
export type ItalicPluginOptionsKeys = keyof ItalicPluginOptionsValues;
export type ItalicPluginOptions<
  Value extends ItalicPluginOptionsKeys = ItalicPluginOptionsKeys
> = Partial<Record<ItalicKeyOption, Pick<ItalicPluginOptionsValues, Value>>>;

// renderLeaf options
export type ItalicRenderLeafOptionsKeys = ItalicPluginOptionsKeys;
export interface ItalicRenderLeafOptions
  extends ItalicPluginOptions<ItalicRenderLeafOptionsKeys> {}

// deserialize options
export interface ItalicDeserializeOptions
  extends ItalicPluginOptions<'type' | 'rootProps' | 'deserialize'> {}
