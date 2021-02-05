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
export interface CodeBlockLineNodeData {}
// Element node
export interface CodeBlockNode
  extends ElementWithAttributes,
    CodeBlockNodeData {}

export interface CodeBlockLineNode
  extends ElementWithAttributes,
    CodeBlockLineNodeData {}

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

export interface CodeBlockLineRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    CodeBlockLineElementStyleProps,
    CodeBlockLineElementStyles
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
export interface CodeBlockLineElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    CodeBlockLineRenderElementPropsOptions {
  element: CodeBlockLineNode;
}

export type CodeBlockKeyOption = 'code_block';
export type CodeBlockLineKeyOption = 'code_block_line';

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

// renderElement options
export type CodeBlockRenderElementOptionsKeys = CodeBlockPluginOptionsKeys;
export interface CodeBlockRenderElementOptions
  extends CodeBlockPluginOptions<CodeBlockRenderElementOptionsKeys> {}

// deserialize options
export interface CodeBlockDeserializeOptions
  extends CodeBlockPluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface CodeBlockDecorateOptions
  extends CodeBlockPluginOptions<'type'> {}

export interface CodeBlockOnKeyDownOptions
  extends CodeBlockPluginOptions<'type'> {}

export interface CodeBlockOptions extends CodeBlockPluginOptions<'type'> {}

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

export interface CodeBlockLineElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert CodeBlockLineElement classNames below
}

export interface CodeBlockLineElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert CodeBlockLineElement style props below
}
