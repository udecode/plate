import {
  Deserialize,
  ElementWithAttributes,
  HtmlAttributesProps,
  NodeToProps,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '@udecode/slate-plugins-common';
import { RenderElementProps } from 'slate-react';

// Data of Element node
export interface ParagraphNodeData {}
// Element node
export interface ParagraphNode
  extends ElementWithAttributes,
    ParagraphNodeData {}

export type ParagraphKeyOption = 'p';

// Plugin options
export type ParagraphPluginOptionsValues = RenderNodeOptions &
  NodeToProps<ParagraphNode> &
  Deserialize;
export type ParagraphPluginOptionsKeys = keyof ParagraphPluginOptionsValues;
export type ParagraphPluginOptions<
  Value extends ParagraphPluginOptionsKeys = ParagraphPluginOptionsKeys
> = Partial<
  Record<ParagraphKeyOption, Pick<ParagraphPluginOptionsValues, Value>>
>;

// renderElement options
export type ParagraphRenderElementOptionsKeys = ParagraphPluginOptionsKeys;
export interface ParagraphRenderElementOptions
  extends ParagraphPluginOptions<ParagraphRenderElementOptionsKeys> {}

// deserialize options
export interface ParagraphDeserializeOptions
  extends ParagraphPluginOptions<'type' | 'rootProps' | 'deserialize'> {}
