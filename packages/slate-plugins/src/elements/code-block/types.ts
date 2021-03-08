import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';
import {
  Deserialize,
  ElementWithAttributes,
  HtmlAttributesProps,
  NodeToProps,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '../../common/types/PluginOptions.types';

// Data of Element node
export interface CodeBlockNodeData {}
export interface CodeLineNodeData {}
// Element node
export interface CodeBlockNode
  extends ElementWithAttributes,
    CodeBlockNodeData {}

export interface CodeLineNode extends ElementWithAttributes, CodeLineNodeData {}

// renderElement options given as props
export interface CodeBlockRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    CodeBlockElementStyleProps,
    CodeBlockElementStyles
  >;
}

export interface CodeLineRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    CodeLineElementStyleProps,
    CodeLineElementStyles
  >;
}

// renderElement props
export interface CodeBlockElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    CodeBlockRenderElementPropsOptions {
  element: CodeBlockNode;
}

// renderElement props
export interface CodeLineElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    CodeLineRenderElementPropsOptions {
  element: CodeLineNode;
}

export type CodeBlockKeyOption = 'code_block';
export type CodeLineKeyOption = 'code_line';

// Plugin options
export type CodeBlockPluginOptionsValues = RenderNodeOptions &
  RootProps<CodeBlockRenderElementPropsOptions> &
  NodeToProps<CodeBlockNode, CodeBlockRenderElementPropsOptions> &
  Deserialize;
export type CodeBlockPluginOptionsKeys = keyof CodeBlockPluginOptionsValues;
export type CodeBlockPluginOptions<
  Value extends CodeBlockPluginOptionsKeys = CodeBlockPluginOptionsKeys
> = Partial<
  Record<CodeBlockKeyOption, Pick<CodeBlockPluginOptionsValues, Value>>
>;

export type CodeLinePluginOptionsValues = RenderNodeOptions &
  RootProps<CodeLineRenderElementPropsOptions> &
  NodeToProps<CodeLineNode, CodeLineRenderElementPropsOptions> &
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

export interface CodeBlockInsertOptions {
  /**
   * @default 'p'
   */
  defaultType?: string;

  /**
   * @default 1
   */
  level?: number;
}

export interface CodeBlockElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert CodeBlockElement classNames below
}

export interface CodeBlockElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert CodeBlockElement style props below
}

export interface CodeLineElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert CodeLineElement classNames below
}

export interface CodeLineElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert CodeLineElement style props below
}

export interface WithCodeBlockOptions extends CodeBlockOptions {
  /**
   * Valid children types for code_block, in addition to code_line types.
   */
  validCodeBlockChildrenTypes?: string[];
}

export interface WithCodeLineOptions extends CodeLineOptions {}

export interface CodeBlockNormalizerOptions
  extends Pick<WithCodeBlockOptions, 'validCodeBlockChildrenTypes'> {}
