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
export interface BoldNodeData {}
// Text node
export interface BoldNode extends Text, BoldNodeData {}

// renderLeaf options given as props
export interface BoldRenderLeafPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// Leaf props
export interface BoldLeafProps
  extends RenderLeafProps,
    RenderNodePropsOptions,
    BoldRenderLeafPropsOptions {
  leaf: BoldNode;
}

export type BoldKeyOption = 'bold';

// Plugin options
export type BoldPluginOptionsValues = RenderNodeOptions &
  RootProps<BoldRenderLeafPropsOptions> &
  Partial<GetOnHotkeyToggleMarkOptions> &
  Deserialize;
export type BoldPluginOptionsKeys = keyof BoldPluginOptionsValues;
export type BoldPluginOptions<
  Value extends BoldPluginOptionsKeys = BoldPluginOptionsKeys
> = Partial<Record<BoldKeyOption, Pick<BoldPluginOptionsValues, Value>>>;

// renderLeaf options
export type BoldRenderLeafOptionsKeys = BoldPluginOptionsKeys;
export interface BoldRenderLeafOptions
  extends BoldPluginOptions<BoldRenderLeafOptionsKeys> {}

// deserialize options
export interface BoldDeserializeOptions
  extends BoldPluginOptions<'type' | 'rootProps' | 'deserialize'> {}
