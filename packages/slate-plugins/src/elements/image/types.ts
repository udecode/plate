import {
  Deserialize,
  ElementWithAttributes,
  HtmlAttributesProps,
  NodeToProps,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '@udecode/slate-plugins-common';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';

// Data of Element node
export interface ImageNodeData {
  url: string;
}
// Element node
export interface ImageNode extends ElementWithAttributes, ImageNodeData {}

// renderElement options given as props
export interface ImageRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ImageElementStyleProps, ImageElementStyles>;
}

// renderElement props
export interface ImageElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    ImageRenderElementPropsOptions {
  element: ImageNode;
}

export type ImageKeyOption = 'img';

// Plugin options
export type ImagePluginOptionsValues = RenderNodeOptions &
  RootProps<ImageRenderElementPropsOptions> &
  NodeToProps<ImageNode, ImageRenderElementPropsOptions> &
  Deserialize;
export type ImagePluginOptionsKeys = keyof ImagePluginOptionsValues;
export type ImagePluginOptions<
  Value extends ImagePluginOptionsKeys = ImagePluginOptionsKeys
> = Partial<Record<ImageKeyOption, Pick<ImagePluginOptionsValues, Value>>>;

// renderElement options
export type ImageRenderElementOptionsKeys = ImagePluginOptionsKeys;
export interface ImageRenderElementOptions
  extends ImagePluginOptions<ImageRenderElementOptionsKeys> {}

// deserialize options
export interface ImageDeserializeOptions
  extends ImagePluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface ImageElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert ImageElement classNames below
  img?: IStyle;
}

export interface ImageElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert ImageElement style props below
  selected?: boolean;
  focused?: boolean;
}
