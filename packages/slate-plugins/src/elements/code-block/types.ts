import {
  Deserialize,
  ElementWithAttributes,
  HtmlAttributesProps,
  NodeToProps,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from "@udecode/slate-plugins-common";
import { IStyle } from "@uifabric/styling";
import { IStyleFunctionOrObject } from "@uifabric/utilities";
import { RenderElementProps } from "slate-react";

// Data of Element node
export interface CodeBlockNodeData {}
// Element node
export interface CodeBlockNode
  extends ElementWithAttributes,
    CodeBlockNodeData {}

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

// renderElement props
export interface CodeBlockElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    CodeBlockRenderElementPropsOptions {
  element: CodeBlockNode;
}

export type CodeBlockKeyOption = "code_block";

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
  extends CodeBlockPluginOptions<"type" | "rootProps" | "deserialize"> {}

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
