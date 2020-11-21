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
import { StyledComponentPropsOptions } from '../../components/StyledComponent/StyledComponent.types';

// Data of Element node
export interface ParagraphNodeData {}
// Element node
export interface ParagraphNode
  extends ElementWithAttributes,
    ParagraphNodeData {}

// renderElement options given as props
export interface ParagraphRenderElementPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// renderElement props
export interface ParagraphElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    ParagraphRenderElementPropsOptions {
  element: ParagraphNode;
}

export type ParagraphKeyOption = 'p';

// Plugin options
export type ParagraphPluginOptionsValues = RenderNodeOptions &
  RootProps<ParagraphRenderElementPropsOptions> &
  NodeToProps<ParagraphNode, ParagraphRenderElementPropsOptions> &
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
