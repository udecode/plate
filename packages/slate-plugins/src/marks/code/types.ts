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
export interface CodeNodeData {}
// Text node
export interface CodeNode extends Text, CodeNodeData {}

// renderLeaf options given as props
export interface CodeRenderLeafPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// Leaf props
export interface CodeLeafProps
  extends RenderLeafProps,
    RenderNodePropsOptions,
    CodeRenderLeafPropsOptions {
  leaf: CodeNode;
}

export type CodeKeyOption = 'code';

// Plugin options
export type CodePluginOptionsValues = RenderNodeOptions &
  RootProps<CodeRenderLeafPropsOptions> &
  Partial<GetOnHotkeyToggleMarkOptions> &
  Deserialize;
export type CodePluginOptionsKeys = keyof CodePluginOptionsValues;
export type CodePluginOptions<
  Value extends CodePluginOptionsKeys = CodePluginOptionsKeys
> = Partial<Record<CodeKeyOption, Pick<CodePluginOptionsValues, Value>>>;

// renderLeaf options
export type CodeRenderLeafOptionsKeys = CodePluginOptionsKeys;
export interface CodeRenderLeafOptions
  extends CodePluginOptions<CodeRenderLeafOptionsKeys> {}

// deserialize options
export interface CodeDeserializeOptions
  extends CodePluginOptions<'type' | 'rootProps' | 'deserialize'> {}
