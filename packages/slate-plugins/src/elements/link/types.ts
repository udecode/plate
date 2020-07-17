import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
import {
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '../../common/types/PluginOptions.types';
import {
  StyledComponentStyleProps,
  StyledComponentStyles,
} from '../../components/StyledComponent/StyledComponent.types';

// Data of Element node
export interface LinkNodeData {
  url: string;
}
// Element node
export interface LinkNode extends Element, LinkNodeData {}

// renderElement options given as props
export interface LinkRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    StyledComponentStyleProps,
    StyledComponentStyles
  >;
}

// renderElement props
export interface LinkElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    LinkRenderElementPropsOptions {
  element: LinkNode;
}

export type LinkKeyOption = 'link';

// Plugin options
export type LinkPluginOptionsValues = RenderNodeOptions &
  RootProps<LinkRenderElementPropsOptions>;
export type LinkPluginOptionsKeys = keyof LinkPluginOptionsValues;
export type LinkPluginOptions<
  Value extends LinkPluginOptionsKeys = LinkPluginOptionsKeys
> = Partial<Record<LinkKeyOption, Pick<LinkPluginOptionsValues, Value>>>;

// renderElement options
export type LinkRenderElementOptionsKeys = LinkPluginOptionsKeys;
export interface LinkRenderElementOptions
  extends LinkPluginOptions<LinkRenderElementOptionsKeys> {}

// deserialize options
export interface LinkDeserializeOptions
  extends LinkPluginOptions<'type' | 'rootProps'> {}

export interface LinkOptions extends LinkPluginOptions<'type'> {}

export interface LinkElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert LinkElement classNames below
}

export interface LinkElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert LinkElement style props below
}
