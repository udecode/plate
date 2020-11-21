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
import {
  StyledComponentStyleProps,
  StyledComponentStyles,
} from '../../components/StyledComponent/StyledComponent.types';

// Data of Element node
export interface HeadingNodeData {}
// Element node
export interface HeadingNode extends ElementWithAttributes, HeadingNodeData {}

// renderElement options given as props
export interface HeadingRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    StyledComponentStyleProps,
    StyledComponentStyles
  >;

  baseFontSize?: number;
}

// renderElement props
export interface HeadingElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    HeadingRenderElementPropsOptions {
  element: HeadingNode;
}

export interface HeadingLevelsOption {
  /**
   * Heading levels supported from 1 to `levels`
   */
  levels?: number;
}

export type HeadingKeyOption = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

// Plugin options
export type HeadingPluginOptionsValues = RenderNodeOptions &
  RootProps<HeadingRenderElementPropsOptions> &
  NodeToProps<HeadingNode, HeadingRenderElementPropsOptions> &
  Deserialize;
export type HeadingPluginOptionsKeys = keyof HeadingPluginOptionsValues;
export type HeadingPluginOptions<
  Value extends HeadingPluginOptionsKeys = HeadingPluginOptionsKeys
> = Partial<Record<HeadingKeyOption, Pick<HeadingPluginOptionsValues, Value>>> &
  HeadingLevelsOption;

// renderElement options
export type HeadingRenderElementOptionsKeys = HeadingPluginOptionsKeys;
export interface HeadingRenderElementOptions
  extends HeadingPluginOptions<HeadingRenderElementOptionsKeys>,
    HeadingLevelsOption {}

// deserialize options
export interface HeadingDeserializeOptions
  extends HeadingPluginOptions<'type' | 'rootProps' | 'deserialize'>,
    HeadingLevelsOption {}
