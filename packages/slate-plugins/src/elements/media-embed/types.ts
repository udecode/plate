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
import {
  StyledComponentStyleProps,
  StyledComponentStyles,
} from '../../components/StyledComponent/StyledComponent.types';

// Data of Element node
export interface MediaEmbedNodeData {
  url: string;
}
// Element node
export interface MediaEmbedNode
  extends ElementWithAttributes,
    MediaEmbedNodeData {}

// renderElement options given as props
export interface MediaEmbedRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    StyledComponentStyleProps,
    StyledComponentStyles
  >;
}

// renderElement props
export interface MediaEmbedElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    MediaEmbedRenderElementPropsOptions {
  element: MediaEmbedNode;
}

export type MediaEmbedKeyOption = 'media_embed';

// Plugin options
export type MediaEmbedPluginOptionsValues = RenderNodeOptions &
  RootProps<MediaEmbedRenderElementPropsOptions> &
  NodeToProps<MediaEmbedNode, MediaEmbedRenderElementPropsOptions> &
  Deserialize;
export type MediaEmbedPluginOptionsKeys = keyof MediaEmbedPluginOptionsValues;
export type MediaEmbedPluginOptions<
  Value extends MediaEmbedPluginOptionsKeys = MediaEmbedPluginOptionsKeys
> = Partial<
  Record<MediaEmbedKeyOption, Pick<MediaEmbedPluginOptionsValues, Value>>
>;

// renderElement options
export type MediaEmbedRenderElementOptionsKeys = MediaEmbedPluginOptionsKeys;
export interface MediaEmbedRenderElementOptions
  extends MediaEmbedPluginOptions<MediaEmbedRenderElementOptionsKeys> {}

// deserialize options
export interface MediaEmbedDeserializeOptions
  extends MediaEmbedPluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface MediaEmbedElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert MediaEmbedElement classNames below
  iframeWrapper?: IStyle;
  iframe?: IStyle;
  input?: IStyle;
}

export interface MediaEmbedElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert MediaEmbedElement style props below
}
