import {
  Deserialize,
  ElementWithAttributes,
  NodeToProps,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

// Data of Element node
export interface CodeBlockNodeData {}
// Element node
export interface CodeBlockNode
  extends ElementWithAttributes,
    CodeBlockNodeData {}

export type CodeBlockKeyOption = 'code_block';

// Plugin options
export type CodeBlockPluginOptionsValues = RenderNodeOptions &
  NodeToProps<CodeBlockNode> &
  Deserialize;
export type CodeBlockPluginOptionsKeys = keyof CodeBlockPluginOptionsValues;
export type CodeBlockPluginOptions<
  Value extends CodeBlockPluginOptionsKeys = CodeBlockPluginOptionsKeys
> = Partial<
  Record<CodeBlockKeyOption, Pick<CodeBlockPluginOptionsValues, Value>>
>;

// renderElement options
export type CodeBlockRenderElementOptionsKeys = CodeBlockPluginOptionsKeys;
export interface CodeBlockRenderElementOptions
  extends CodeBlockPluginOptions<CodeBlockRenderElementOptionsKeys> {}

// deserialize options
export interface CodeBlockDeserializeOptions
  extends CodeBlockPluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface CodeBlockDecorateOptions
  extends CodeBlockPluginOptions<'type'> {}
