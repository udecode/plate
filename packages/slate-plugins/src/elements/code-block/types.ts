import {
  Deserialize,
  ElementWithAttributes,
  NodeToProps,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

// Data of Element node
export interface CodeBlockNodeData {}
export interface CodeLineNodeData {}
// Element node
export interface CodeBlockNode
  extends ElementWithAttributes,
    CodeBlockNodeData {}

export interface CodeLineNode extends ElementWithAttributes, CodeLineNodeData {}

export type CodeBlockKeyOption = 'code_block';
export type CodeLineKeyOption = 'code_line';

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

export type CodeLinePluginOptionsValues = RenderNodeOptions &
  NodeToProps<CodeLineNode> &
  Deserialize;
export type CodeLinePluginOptionsKeys = keyof CodeLinePluginOptionsValues;
export type CodeLinePluginOptions<
  Value extends CodeLinePluginOptionsKeys = CodeLinePluginOptionsKeys
> = Partial<
  Record<CodeLineKeyOption, Pick<CodeLinePluginOptionsValues, Value>>
>;

// renderElement options
export type CodeBlockRenderElementOptionsKeys = CodeBlockPluginOptionsKeys;
export interface CodeBlockRenderElementOptions
  extends CodeBlockPluginOptions<CodeBlockRenderElementOptionsKeys> {}

export type CodeLineRenderElementOptionsKeys = CodeLinePluginOptionsKeys;
export interface CodeLineRenderElementOptions
  extends CodeLinePluginOptions<CodeLineRenderElementOptionsKeys> {}

// deserialize options
export interface CodeBlockDeserializeOptions
  extends CodeBlockPluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface CodeLineDeserializeOptions
  extends CodeLinePluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface CodeBlockDecorateOptions
  extends CodeBlockPluginOptions<'type'> {}

export interface CodeBlockOnKeyDownOptions
  extends CodeBlockPluginOptions<'type'> {}

export interface CodeLineOnKeyDownOptions
  extends CodeLinePluginOptions<'type'> {}

export interface CodeBlockOptions extends CodeBlockPluginOptions<'type'> {}

export interface CodeLineOptions extends CodeLinePluginOptions<'type'> {}

export interface WithCodeBlockOptions extends CodeBlockOptions {
  /**
   * Valid children types for code_block, in addition to code_line types.
   */
  validCodeBlockChildrenTypes?: string[];
}

export interface WithCodeLineOptions extends CodeLineOptions {}

export interface CodeBlockNormalizerOptions
  extends Pick<WithCodeBlockOptions, 'validCodeBlockChildrenTypes'> {}

export interface CodeBlockInsertOptions {
  defaultType: string;
  level: number;
}